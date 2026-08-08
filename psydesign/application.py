"""FastAPI application factory and HTTP boundary."""

from __future__ import annotations

import logging
import os
import uuid
from collections.abc import AsyncIterator, Iterator
from contextlib import asynccontextmanager
from pathlib import Path
from typing import cast

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from starlette.middleware.trustedhost import TrustedHostMiddleware

from psydesign.config import PROJECT_ROOT, Settings
from psydesign.database import Database, History
from psydesign.i18n import template_context, translations
from psydesign.providers import AIProvider, DemoProvider, OpenAIProvider, ProviderError
from psydesign.rate_limit import InMemoryRateLimiter
from psydesign.schemas import (
    BrandReport,
    BrandRequest,
    ChatRequest,
    ChatResponse,
    DeleteResponse,
    GenerateBrandResponse,
    HealthResponse,
    HistoryItemResponse,
    Language,
    Mode,
    StatusResponse,
    TTSRequest,
)
from psydesign.security import (
    BrowserSecurityMiddleware,
    SessionCodec,
    load_or_create_session_secret,
)

logger = logging.getLogger("psydesign")

_IMAGE_TYPES = {
    ("image/png", ".png"),
    ("image/jpeg", ".jpg"),
    ("image/webp", ".webp"),
    ("image/svg+xml", ".svg"),
}
_AUDIO_TYPES = {"audio/mpeg", "audio/wav"}


def _provider_for(settings: Settings) -> AIProvider:
    if settings.mode == "demo":
        return DemoProvider()
    key = settings.openai_api_key
    if key is None:  # The Settings validator normally makes this unreachable.
        raise RuntimeError("OpenAI mode is not configured")
    return OpenAIProvider(api_key=key.get_secret_value())


def _safe_history_item(item: History) -> HistoryItemResponse | None:
    try:
        analysis = BrandReport.model_validate_json(item.analysis)
        language = cast(Language, item.language)
        if language not in {"en", "es", "fr", "hi", "zh", "ar"}:
            return None
        mode: Mode = "openai" if item.mode == "openai" else "demo"
        return HistoryItemResponse(
            id=item.id,
            description=item.description,
            analysis=analysis,
            logo_url=f"/api/history/{item.id}/logo",
            language=language,
            created_at=item.created_at,
            mode=mode,
        )
    except (TypeError, ValueError):
        logger.warning("Ignored an invalid history record (id=%s)", item.id)
        return None


def _safe_logo_path(generated_dir: Path, filename: str) -> Path | None:
    if not filename or Path(filename).name != filename:
        return None
    root = generated_dir.resolve()
    candidate = (root / filename).resolve()
    if candidate.parent != root:
        return None
    return candidate


def _persist_logo(settings: Settings, content: bytes, media_type: str, suffix: str) -> str:
    normalized_suffix = suffix.lower()
    if (media_type, normalized_suffix) not in _IMAGE_TYPES:
        raise ProviderError("Unsupported generated image type")
    if not content or len(content) > settings.max_logo_bytes:
        raise ProviderError("Generated image size is invalid")
    if media_type == "image/svg+xml":
        lowered = content.lower()
        if b"<svg" not in lowered[:500] or any(
            marker in lowered for marker in (b"<script", b"javascript:", b"onload=", b"onerror=")
        ):
            raise ProviderError("Generated vector image is invalid")

    settings.generated_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{normalized_suffix}"
    destination = settings.generated_dir / filename
    temporary = settings.generated_dir / f".{filename}.tmp"
    descriptor = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try:
        with os.fdopen(descriptor, "wb") as output:
            output.write(content)
        os.replace(temporary, destination)
    except Exception:
        temporary.unlink(missing_ok=True)
        raise
    return filename


def _remove_logo(generated_dir: Path, filename: str) -> None:
    logo_path = _safe_logo_path(generated_dir, filename)
    if logo_path is None:
        return
    try:
        logo_path.unlink(missing_ok=True)
    except OSError:
        logger.warning("Could not remove a generated logo after its database record was deleted")


def create_app(
    settings: Settings | None = None,
    provider: AIProvider | None = None,
) -> FastAPI:
    """Create an isolated PsyDesign AI application instance."""

    active_settings = settings or Settings.from_env()
    database = Database(active_settings.database_path)
    provider_impl = provider or _provider_for(active_settings)
    limiter = InMemoryRateLimiter(active_settings.rate_limit_window_seconds)
    active_mode = provider_impl.mode

    @asynccontextmanager
    async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
        yield
        database.dispose()

    app = FastAPI(
        title="PsyDesign AI",
        version="0.1.0",
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
        lifespan=lifespan,
    )
    app.state.settings = active_settings
    app.state.database = database
    app.state.provider = provider_impl
    app.state.rate_limiter = limiter

    session_codec = SessionCodec(load_or_create_session_secret(active_settings))
    app.add_middleware(
        BrowserSecurityMiddleware,
        settings=active_settings,
        codec=session_codec,
    )
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=list(active_settings.allowed_hosts))

    static_dir = PROJECT_ROOT / "static"
    templates_dir = PROJECT_ROOT / "templates"
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    templates = Jinja2Templates(directory=templates_dir)

    def get_database_session() -> Iterator[Session]:
        yield from database.session()

    def enforce_rate_limit(request: Request, action: str, limit: int) -> None:
        client = request.client.host if request.client else "unknown"
        allowed, retry_after = limiter.check(client, action, limit)
        if not allowed:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please wait before trying again.",
                headers={"Retry-After": str(retry_after)},
            )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        _request: Request, exception: RequestValidationError
    ) -> JSONResponse:
        errors = [
            {"location": list(error.get("loc", ())), "type": error.get("type", "invalid")}
            for error in exception.errors()
        ]
        return JSONResponse(
            status_code=422,
            content={"detail": "Request validation failed.", "errors": errors},
        )

    @app.exception_handler(Exception)
    async def unexpected_error_handler(request: Request, _exception: Exception) -> JSONResponse:
        request_id = getattr(request.state, "request_id", "unavailable")
        logger.error("Unhandled application error (request_id=%s)", request_id)
        return JSONResponse(
            status_code=500,
            content={"detail": "An unexpected server error occurred.", "request_id": request_id},
        )

    @app.get("/", response_class=HTMLResponse)
    async def read_root(request: Request, lang: str = "en") -> Response:
        context = template_context(lang)
        context.update(
            {
                "request": request,
                "mode": active_mode,
                "demo_mode": active_mode == "demo",
                "translations": translations,
            }
        )
        return templates.TemplateResponse(
            request=request,
            name="dashboard.html",
            context=context,
        )

    @app.get("/healthz", response_model=HealthResponse)
    async def health() -> HealthResponse:
        try:
            healthy = database.healthy()
        except SQLAlchemyError:
            healthy = False
        if not healthy:
            raise HTTPException(status_code=503, detail="Service is not ready.")
        return HealthResponse(status="ok")

    @app.get("/api/status", response_model=StatusResponse)
    async def status() -> StatusResponse:
        return StatusResponse(status="ready", mode=active_mode)

    @app.post(
        "/api/generate-brand",
        response_model=GenerateBrandResponse,
        status_code=201,
    )
    async def generate_brand(
        payload: BrandRequest,
        request: Request,
        db: Session = Depends(get_database_session),
    ) -> GenerateBrandResponse:
        enforce_rate_limit(request, "generate", active_settings.generate_rate_limit)
        try:
            result = await provider_impl.generate_brand(payload.description, payload.language)
            filename = _persist_logo(
                active_settings,
                result.logo_bytes,
                result.logo_media_type,
                result.logo_suffix,
            )
        except ProviderError:
            logger.warning(
                "Brand provider failed (request_id=%s)",
                getattr(request.state, "request_id", "unavailable"),
            )
            raise HTTPException(
                status_code=503,
                detail="Brand generation is temporarily unavailable.",
            ) from None
        except OSError:
            logger.error(
                "Generated asset could not be stored (request_id=%s)",
                getattr(request.state, "request_id", "unavailable"),
            )
            raise HTTPException(
                status_code=500, detail="The generated asset could not be saved."
            ) from None

        history = History(
            session_id=request.state.session_id,
            description=payload.description,
            analysis=result.analysis.model_dump_json(),
            logo_filename=filename,
            logo_media_type=result.logo_media_type,
            language=payload.language,
            mode=active_mode,
        )
        try:
            db.add(history)
            db.commit()
            db.refresh(history)
        except SQLAlchemyError:
            db.rollback()
            _remove_logo(active_settings.generated_dir, filename)
            logger.error(
                "Generated brand could not be persisted (request_id=%s)",
                getattr(request.state, "request_id", "unavailable"),
            )
            raise HTTPException(status_code=500, detail="The brand could not be saved.") from None

        return GenerateBrandResponse(
            id=history.id,
            analysis=result.analysis,
            logo_url=f"/api/history/{history.id}/logo",
            mode=active_mode,
        )

    @app.get("/api/history", response_model=list[HistoryItemResponse])
    async def get_history(
        request: Request, db: Session = Depends(get_database_session)
    ) -> list[HistoryItemResponse]:
        items = db.scalars(
            select(History)
            .where(History.session_id == request.state.session_id)
            .order_by(History.created_at.desc(), History.id.desc())
            .limit(50)
        ).all()
        results: list[HistoryItemResponse] = []
        for item in items:
            parsed = _safe_history_item(item)
            if parsed is not None:
                results.append(parsed)
        return results

    @app.delete("/api/history/{item_id}", response_model=DeleteResponse)
    async def delete_history(
        item_id: int, request: Request, db: Session = Depends(get_database_session)
    ) -> DeleteResponse:
        if item_id < 1:
            raise HTTPException(status_code=404, detail="History item not found.")
        item = db.scalar(
            select(History).where(
                History.id == item_id,
                History.session_id == request.state.session_id,
            )
        )
        if item is None:
            raise HTTPException(status_code=404, detail="History item not found.")
        filename = item.logo_filename
        try:
            db.delete(item)
            db.commit()
        except SQLAlchemyError:
            db.rollback()
            logger.error(
                "History deletion failed (request_id=%s)",
                getattr(request.state, "request_id", "unavailable"),
            )
            raise HTTPException(
                status_code=500, detail="The history item could not be deleted."
            ) from None
        _remove_logo(active_settings.generated_dir, filename)
        return DeleteResponse(message="Item deleted successfully")

    @app.get("/api/history/{item_id}/logo", response_class=FileResponse)
    async def get_logo(
        item_id: int, request: Request, db: Session = Depends(get_database_session)
    ) -> FileResponse:
        if item_id < 1:
            raise HTTPException(status_code=404, detail="Logo not found.")
        item = db.scalar(
            select(History).where(
                History.id == item_id,
                History.session_id == request.state.session_id,
            )
        )
        if item is None:
            raise HTTPException(status_code=404, detail="Logo not found.")
        logo_path = _safe_logo_path(active_settings.generated_dir, item.logo_filename)
        if logo_path is None or not logo_path.is_file():
            raise HTTPException(status_code=404, detail="Logo not found.")
        return FileResponse(
            path=logo_path,
            media_type=item.logo_media_type,
            headers={"Cache-Control": "private, max-age=3600"},
        )

    @app.post("/api/chat-with-persona", response_model=ChatResponse)
    async def chat_with_persona(payload: ChatRequest, request: Request) -> ChatResponse:
        enforce_rate_limit(request, "chat", active_settings.chat_rate_limit)
        try:
            reply = await provider_impl.chat(payload.analysis, payload.message, payload.language)
        except ProviderError:
            logger.warning(
                "Chat provider failed (request_id=%s)",
                getattr(request.state, "request_id", "unavailable"),
            )
            raise HTTPException(
                status_code=503, detail="Persona chat is temporarily unavailable."
            ) from None
        return ChatResponse(reply=reply, mode=active_mode)

    @app.post("/api/tts")
    async def text_to_speech(payload: TTSRequest, request: Request) -> Response:
        enforce_rate_limit(request, "tts", active_settings.tts_rate_limit)
        try:
            audio = await provider_impl.synthesize(payload.text)
        except ProviderError:
            logger.warning(
                "Speech provider failed (request_id=%s)",
                getattr(request.state, "request_id", "unavailable"),
            )
            raise HTTPException(
                status_code=503, detail="Speech synthesis is temporarily unavailable."
            ) from None
        if (
            audio.media_type not in _AUDIO_TYPES
            or not audio.content
            or len(audio.content) > active_settings.max_audio_bytes
        ):
            logger.warning("Speech provider returned an invalid audio asset")
            raise HTTPException(
                status_code=503, detail="Speech synthesis is temporarily unavailable."
            )
        return Response(content=audio.content, media_type=audio.media_type)

    return app
