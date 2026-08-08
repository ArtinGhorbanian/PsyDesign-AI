"""ASGI entry point for PsyDesign AI.

Application construction lives in :mod:`psydesign.application` so tests and
deployments can provide isolated settings and provider implementations.
"""

from psydesign.application import create_app

app = create_app()

__all__ = ["app", "create_app"]


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=False)
