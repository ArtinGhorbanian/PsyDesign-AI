from __future__ import annotations

import asyncio
import base64
import sqlite3
from pathlib import Path
from types import SimpleNamespace
from typing import Any

import pytest
from fastapi.testclient import TestClient
from pydantic import SecretStr, ValidationError

from psydesign.application import create_app
from psydesign.config import Settings
from psydesign.providers import DemoProvider, OpenAIProvider

DESCRIPTION = "A sustainable coffee studio for young urban makers."


def settings_for(tmp_path: Path, **overrides: Any) -> Settings:
    values: dict[str, Any] = {
        "database_path": tmp_path / "history.db",
        "generated_dir": tmp_path / "generated",
        "session_secret": SecretStr("test-session-secret-that-is-long-enough"),
        "allowed_hosts": ("testserver",),
    }
    values.update(overrides)
    return Settings(**values)


def generate(client: TestClient, description: str = DESCRIPTION) -> dict[str, Any]:
    response = client.post(
        "/api/generate-brand",
        json={"description": description, "language": "en"},
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_demo_mode_health_root_cookie_and_security_headers(tmp_path: Path) -> None:
    with TestClient(create_app(settings_for(tmp_path))) as client:
        root = client.get("/?lang=ar")
        assert root.status_code == 200
        assert 'dir="rtl"' in root.text
        assert "default-src 'self'" in root.headers["content-security-policy"]
        assert "https:" not in root.headers["content-security-policy"]
        assert root.headers["x-frame-options"] == "DENY"
        assert root.headers["x-content-type-options"] == "nosniff"
        cookie = root.headers["set-cookie"].lower()
        assert "httponly" in cookie
        assert "samesite=lax" in cookie

        status = client.get("/api/status")
        assert status.json() == {
            "status": "ready",
            "mode": "demo",
            "persistence": "session-scoped",
        }

        health = client.get("/healthz")
        assert health.status_code == 200
        assert health.json() == {"status": "ok"}


def test_generation_history_logo_and_delete_are_session_scoped(tmp_path: Path) -> None:
    app = create_app(settings_for(tmp_path))
    with TestClient(app) as owner, TestClient(app) as stranger:
        result = generate(owner)
        assert set(result) == {"id", "analysis", "logo_url", "mode"}
        assert result["mode"] == "demo"
        assert result["logo_url"] == f"/api/history/{result['id']}/logo"
        assert isinstance(result["analysis"]["brand_personality"]["values"], list)

        owner_history = owner.get("/api/history")
        assert owner_history.status_code == 200
        assert len(owner_history.json()) == 1
        assert owner_history.json()[0]["analysis"] == result["analysis"]

        assert stranger.get("/api/history").json() == []
        assert stranger.get(result["logo_url"]).status_code == 404
        assert stranger.delete(f"/api/history/{result['id']}").status_code == 404

        logo = owner.get(result["logo_url"])
        assert logo.status_code == 200
        assert logo.headers["content-type"].startswith("image/svg+xml")
        assert logo.content.startswith(b"<svg")

        stored_logos = list(tmp_path.joinpath("generated").glob("*.svg"))
        assert len(stored_logos) == 1
        deleted = owner.delete(f"/api/history/{result['id']}")
        assert deleted.status_code == 200
        assert deleted.json() == {"message": "Item deleted successfully"}
        assert owner.get(result["logo_url"]).status_code == 404
        assert not stored_logos[0].exists()


def test_chat_and_demo_audio_use_the_typed_report(tmp_path: Path) -> None:
    with TestClient(create_app(settings_for(tmp_path))) as client:
        result = generate(client)
        chat = client.post(
            "/api/chat-with-persona",
            json={
                "analysis": result["analysis"],
                "message": "How should this brand launch?",
                "language": "en",
            },
        )
        assert chat.status_code == 200
        assert chat.json()["mode"] == "demo"
        assert chat.json()["reply"]

        legacy_string_payload = client.post(
            "/api/chat-with-persona",
            json={
                "analysis": "{}",
                "message": "How should this brand launch?",
                "language": "en",
            },
        )
        assert legacy_string_payload.status_code == 422

        speech = client.post("/api/tts", json={"text": "Welcome to the brand."})
        assert speech.status_code == 200
        assert speech.headers["content-type"].startswith("audio/wav")
        assert speech.content.startswith(b"RIFF")


@pytest.mark.parametrize(
    "payload",
    [
        {"description": "too short", "language": "en"},
        {"description": DESCRIPTION, "language": "de"},
        {"description": DESCRIPTION, "language": "en", "unexpected": True},
        {"description": "valid concept\x00with a hidden control", "language": "en"},
    ],
)
def test_generation_inputs_are_bounded_and_strict(tmp_path: Path, payload: dict[str, Any]) -> None:
    with TestClient(create_app(settings_for(tmp_path))) as client:
        response = client.post("/api/generate-brand", json=payload)
        assert response.status_code == 422
        assert response.json()["detail"] == "Request validation failed."
        assert "input" not in response.text


def test_same_origin_json_policy_and_removed_proxy(tmp_path: Path) -> None:
    with TestClient(create_app(settings_for(tmp_path))) as client:
        cross_origin = client.post(
            "/api/tts",
            headers={"Origin": "https://attacker.invalid"},
            json={"text": "hello"},
        )
        assert cross_origin.status_code == 403

        form_encoded = client.post(
            "/api/tts",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            content="text=hello",
        )
        assert form_encoded.status_code == 415
        assert client.get("/api/proxy-image?url=https://example.invalid/image").status_code == 404


def test_costly_routes_are_rate_limited_per_client(tmp_path: Path) -> None:
    app = create_app(settings_for(tmp_path, generate_rate_limit=1, rate_limit_window_seconds=60))
    with TestClient(app) as client:
        generate(client)
        limited = client.post(
            "/api/generate-brand",
            json={
                "description": "A second thoughtful brand concept for careful makers.",
                "language": "en",
            },
        )
        assert limited.status_code == 429
        assert int(limited.headers["retry-after"]) >= 1


def test_legacy_empty_database_is_migrated_with_secure_delete(tmp_path: Path) -> None:
    database_path = tmp_path / "legacy.db"
    connection = sqlite3.connect(database_path)
    connection.execute(
        """CREATE TABLE history (
        id INTEGER PRIMARY KEY,
        description VARCHAR,
        analysis TEXT,
        logo_url VARCHAR,
        language VARCHAR,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )"""
    )
    connection.commit()
    connection.close()

    app = create_app(settings_for(tmp_path, database_path=database_path))
    with app.state.database.engine.connect() as migrated:
        columns = {row[1] for row in migrated.exec_driver_sql("PRAGMA table_info(history)")}
        assert {"session_id", "logo_media_type", "mode"}.issubset(columns)
        assert migrated.exec_driver_sql("PRAGMA secure_delete").scalar_one() == 1


def test_settings_require_explicit_openai_mode_and_mask_secrets(tmp_path: Path) -> None:
    demo = settings_for(tmp_path, openai_api_key=SecretStr("sk-not-a-real-key"))
    assert demo.mode == "demo"
    assert "sk-not-a-real-key" not in repr(demo)
    with pytest.raises(ValidationError):
        settings_for(tmp_path, mode="openai", openai_api_key=None)


def test_demo_provider_is_deterministic() -> None:
    provider = DemoProvider()
    first = asyncio.run(provider.generate_brand(DESCRIPTION, "en"))
    second = asyncio.run(provider.generate_brand(DESCRIPTION, "en"))
    assert first.analysis == second.analysis
    assert first.logo_bytes == second.logo_bytes


def test_openai_provider_preserves_models_and_requests_base64_without_network() -> None:
    demo_report = asyncio.run(DemoProvider().generate_brand(DESCRIPTION, "en")).analysis
    completion_calls: list[dict[str, Any]] = []
    image_calls: list[dict[str, Any]] = []
    speech_calls: list[dict[str, Any]] = []

    class Completions:
        async def create(self, **kwargs: Any) -> Any:
            completion_calls.append(kwargs)
            return SimpleNamespace(
                choices=[
                    SimpleNamespace(message=SimpleNamespace(content=demo_report.model_dump_json()))
                ]
            )

    class Images:
        async def generate(self, **kwargs: Any) -> Any:
            image_calls.append(kwargs)
            encoded = base64.b64encode(b"synthetic-png-bytes").decode("ascii")
            return SimpleNamespace(data=[SimpleNamespace(b64_json=encoded)])

    class Speech:
        async def create(self, **kwargs: Any) -> Any:
            speech_calls.append(kwargs)
            return SimpleNamespace(content=b"synthetic-mp3")

    fake_client = SimpleNamespace(
        chat=SimpleNamespace(completions=Completions()),
        images=Images(),
        audio=SimpleNamespace(speech=Speech()),
    )
    provider = OpenAIProvider(client=fake_client)
    generated = asyncio.run(provider.generate_brand(DESCRIPTION, "en"))
    audio = asyncio.run(provider.synthesize("Hello"))

    assert generated.analysis == demo_report
    assert completion_calls[0]["model"] == "gpt-4o"
    assert image_calls[0]["model"] == "dall-e-3"
    assert image_calls[0]["response_format"] == "b64_json"
    assert speech_calls[0]["model"] == "tts-1-hd"
    assert audio.content == b"synthetic-mp3"
