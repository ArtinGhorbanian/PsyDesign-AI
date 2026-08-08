"""Environment-backed, secret-safe application configuration."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, SecretStr, field_validator, model_validator

PROJECT_ROOT = Path(__file__).resolve().parents[1]


def _environment_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    normalized = value.strip().lower()
    if normalized in {"1", "true", "yes", "on"}:
        return True
    if normalized in {"0", "false", "no", "off"}:
        return False
    raise ValueError(f"{name} must be a boolean value")


def _environment_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None:
        return default
    try:
        return int(value)
    except ValueError as exc:
        raise ValueError(f"{name} must be an integer") from exc


class Settings(BaseModel):
    """Validated runtime settings.

    Demo mode is deliberately the default even if an OpenAI key happens to be
    present in the process environment. A paid provider must be enabled with an
    explicit ``PSYDESIGN_MODE=openai`` choice.
    """

    model_config = ConfigDict(extra="forbid", frozen=True, strict=True)

    mode: Literal["demo", "openai"] = "demo"
    openai_api_key: SecretStr | None = None
    database_path: Path = PROJECT_ROOT / "brand_history.db"
    generated_dir: Path = PROJECT_ROOT / "data" / "generated"
    session_secret: SecretStr | None = None
    session_cookie_name: str = "psydesign_session"
    session_max_age_seconds: int = Field(default=2_592_000, ge=300, le=31_536_000)
    cookie_secure: bool = False
    allowed_hosts: tuple[str, ...] = ("127.0.0.1", "localhost", "testserver", "[::1]")
    rate_limit_window_seconds: int = Field(default=60, ge=1, le=3600)
    generate_rate_limit: int = Field(default=6, ge=1, le=1000)
    chat_rate_limit: int = Field(default=30, ge=1, le=5000)
    tts_rate_limit: int = Field(default=20, ge=1, le=5000)
    max_logo_bytes: int = Field(default=20 * 1024 * 1024, ge=1024, le=50 * 1024 * 1024)
    max_audio_bytes: int = Field(default=12 * 1024 * 1024, ge=1024, le=30 * 1024 * 1024)

    @field_validator("session_cookie_name")
    @classmethod
    def validate_cookie_name(cls, value: str) -> str:
        if not value or not value.isascii() or not value.replace("_", "").isalnum():
            raise ValueError(
                "session_cookie_name must contain only letters, numbers, and underscores"
            )
        return value

    @field_validator("allowed_hosts")
    @classmethod
    def validate_hosts(cls, value: tuple[str, ...]) -> tuple[str, ...]:
        cleaned = tuple(host.strip().lower() for host in value if host.strip())
        if not cleaned:
            raise ValueError("allowed_hosts cannot be empty")
        if any("/" in host or "://" in host for host in cleaned):
            raise ValueError("allowed_hosts entries must be host names, not URLs")
        return cleaned

    @model_validator(mode="after")
    def require_openai_key(self) -> Settings:
        if self.mode == "openai" and self.openai_api_key is None:
            raise ValueError("OPENAI_API_KEY is required when PSYDESIGN_MODE=openai")
        if self.session_secret is not None and len(self.session_secret.get_secret_value()) < 32:
            raise ValueError("PSYDESIGN_SESSION_SECRET must contain at least 32 characters")
        return self

    @classmethod
    def from_env(cls) -> Settings:
        """Build settings from the process environment without logging values."""

        raw_mode = os.getenv("PSYDESIGN_MODE", "demo").strip().lower()
        if raw_mode == "demo":
            mode: Literal["demo", "openai"] = "demo"
        elif raw_mode == "openai":
            mode = "openai"
        else:
            raise ValueError("PSYDESIGN_MODE must be either 'demo' or 'openai'")
        raw_key = os.getenv("OPENAI_API_KEY")
        if raw_key is not None and raw_key.strip() in {"", "YOUR_OPENAI_API_KEY_HERE"}:
            raw_key = None
        raw_secret = os.getenv("PSYDESIGN_SESSION_SECRET")
        raw_hosts = os.getenv("PSYDESIGN_ALLOWED_HOSTS", "127.0.0.1,localhost,testserver,[::1]")

        return cls(
            mode=mode,
            openai_api_key=SecretStr(raw_key) if raw_key else None,
            database_path=Path(
                os.getenv("PSYDESIGN_DATABASE_PATH", str(PROJECT_ROOT / "brand_history.db"))
            ).expanduser(),
            generated_dir=Path(
                os.getenv("PSYDESIGN_GENERATED_DIR", str(PROJECT_ROOT / "data" / "generated"))
            ).expanduser(),
            session_secret=SecretStr(raw_secret) if raw_secret else None,
            session_cookie_name=os.getenv("PSYDESIGN_SESSION_COOKIE", "psydesign_session"),
            session_max_age_seconds=_environment_int("PSYDESIGN_SESSION_MAX_AGE", 2_592_000),
            cookie_secure=_environment_bool("PSYDESIGN_COOKIE_SECURE", False),
            allowed_hosts=tuple(part.strip() for part in raw_hosts.split(",") if part.strip()),
            rate_limit_window_seconds=_environment_int("PSYDESIGN_RATE_WINDOW", 60),
            generate_rate_limit=_environment_int("PSYDESIGN_GENERATE_RATE_LIMIT", 6),
            chat_rate_limit=_environment_int("PSYDESIGN_CHAT_RATE_LIMIT", 30),
            tts_rate_limit=_environment_int("PSYDESIGN_TTS_RATE_LIMIT", 20),
        )
