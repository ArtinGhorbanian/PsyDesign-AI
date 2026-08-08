"""Opaque signed sessions, same-origin checks, and browser security headers."""

from __future__ import annotations

import base64
import hashlib
import hmac
import os
import re
import secrets
import uuid
from urllib.parse import urlsplit

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from psydesign.config import Settings

_SESSION_ID = re.compile(r"^[A-Za-z0-9_-]{43}$")


def _base64url(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def load_or_create_session_secret(settings: Settings) -> bytes:
    if settings.session_secret is not None:
        return settings.session_secret.get_secret_value().encode("utf-8")

    settings.generated_dir.mkdir(parents=True, exist_ok=True)
    secret_path = settings.generated_dir / ".session-key"
    try:
        secret = secret_path.read_bytes()
    except FileNotFoundError:
        secret = secrets.token_bytes(32)
        try:
            descriptor = os.open(secret_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        except FileExistsError:
            secret = secret_path.read_bytes()
        else:
            with os.fdopen(descriptor, "wb") as destination:
                destination.write(secret)
    if len(secret) < 32:
        raise RuntimeError("The local session key is invalid; replace it before starting the app")
    return secret


class SessionCodec:
    def __init__(self, secret: bytes) -> None:
        self._secret = secret

    def issue(self) -> tuple[str, str]:
        session_id = _base64url(secrets.token_bytes(32))
        return session_id, self._encode(session_id)

    def decode(self, token: str | None) -> str | None:
        if not token or "." not in token:
            return None
        session_id, signature = token.split(".", 1)
        if not _SESSION_ID.fullmatch(session_id):
            return None
        expected = self._signature(session_id)
        if not hmac.compare_digest(signature, expected):
            return None
        return session_id

    def _encode(self, session_id: str) -> str:
        return f"{session_id}.{self._signature(session_id)}"

    def _signature(self, session_id: str) -> str:
        digest = hmac.new(self._secret, session_id.encode("ascii"), hashlib.sha256).digest()
        return _base64url(digest)


class BrowserSecurityMiddleware(BaseHTTPMiddleware):
    """Establish request identity and apply security policy uniformly."""

    def __init__(self, app: object, settings: Settings, codec: SessionCodec) -> None:
        super().__init__(app)  # type: ignore[arg-type]
        self.settings = settings
        self.codec = codec

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request.state.request_id = uuid.uuid4().hex
        supplied_token = request.cookies.get(self.settings.session_cookie_name)
        session_id = self.codec.decode(supplied_token)
        new_token: str | None = None
        if session_id is None:
            session_id, new_token = self.codec.issue()
        request.state.session_id = session_id

        policy_error = self._policy_error(request)
        if policy_error is not None:
            response: Response = policy_error
        else:
            response = await call_next(request)

        if new_token is not None:
            response.set_cookie(
                self.settings.session_cookie_name,
                new_token,
                max_age=self.settings.session_max_age_seconds,
                httponly=True,
                secure=self.settings.cookie_secure,
                samesite="lax",
                path="/",
            )
        self._set_headers(request, response)
        return response

    def _policy_error(self, request: Request) -> JSONResponse | None:
        if request.method not in {"POST", "PUT", "PATCH", "DELETE"}:
            return None

        fetch_site = request.headers.get("sec-fetch-site", "").lower()
        if fetch_site == "cross-site":
            return JSONResponse({"detail": "Cross-origin request rejected."}, status_code=403)

        origin = request.headers.get("origin")
        host = request.headers.get("host", "").lower()
        if origin:
            parsed = urlsplit(origin)
            if parsed.scheme not in {"http", "https"} or parsed.netloc.lower() != host:
                return JSONResponse({"detail": "Cross-origin request rejected."}, status_code=403)

        if request.method in {"POST", "PUT", "PATCH"} and request.url.path.startswith("/api/"):
            content_type = request.headers.get("content-type", "").split(";", 1)[0].lower()
            if content_type != "application/json":
                return JSONResponse(
                    {"detail": "Content-Type must be application/json."}, status_code=415
                )
        return None

    def _set_headers(self, request: Request, response: Response) -> None:
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = (
            "camera=(), geolocation=(), microphone=(), payment=(), usb=()"
        )
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; "
            "object-src 'none'; script-src 'self'; style-src 'self'; "
            "img-src 'self' data:; font-src 'self'; connect-src 'self'; "
            "media-src 'self' blob:; worker-src 'none'"
        )
        response.headers["X-Request-ID"] = request.state.request_id
        if request.url.path.startswith("/api/") or request.url.path == "/healthz":
            response.headers["Cache-Control"] = "no-store"
        if self.settings.cookie_secure:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
