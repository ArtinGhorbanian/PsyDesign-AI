"""SQLite persistence with a narrow session-scoped repository boundary."""

from __future__ import annotations

from collections.abc import Iterator
from datetime import datetime
from pathlib import Path
from typing import cast

from sqlalchemy import DateTime, Integer, String, Text, create_engine, event, text
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    pass


class History(Base):
    __tablename__ = "history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[str] = mapped_column(String(64), index=True)
    description: Mapped[str] = mapped_column(String(1200), index=True)
    analysis: Mapped[str] = mapped_column(Text)
    logo_filename: Mapped[str] = mapped_column("logo_url", String(255))
    logo_media_type: Mapped[str] = mapped_column(String(80), default="image/png")
    language: Mapped[str] = mapped_column(String(8))
    mode: Mapped[str] = mapped_column(String(12), default="demo")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class Database:
    """Owns the SQLAlchemy engine and safe schema initialization."""

    def __init__(self, path: Path) -> None:
        self.path = path.resolve()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.engine = create_engine(
            f"sqlite:///{self.path.as_posix()}",
            connect_args={"check_same_thread": False, "timeout": 10},
            pool_pre_ping=True,
        )
        event.listen(self.engine, "connect", self._configure_sqlite)
        self.session_factory = sessionmaker(
            bind=self.engine, autocommit=False, autoflush=False, expire_on_commit=False
        )
        self.initialize()

    @staticmethod
    def _configure_sqlite(dbapi_connection: object, _connection_record: object) -> None:
        cursor = dbapi_connection.cursor()  # type: ignore[attr-defined]
        try:
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.execute("PRAGMA secure_delete=ON")
            cursor.execute("PRAGMA busy_timeout=10000")
        finally:
            cursor.close()

    def initialize(self) -> None:
        Base.metadata.create_all(bind=self.engine)
        self._migrate_legacy_history()

    def _migrate_legacy_history(self) -> None:
        """Add session ownership fields to the original empty history database.

        Any unexpected legacy rows are deliberately assigned an unreachable
        owner rather than being exposed to the first new browser session.
        """

        with self.engine.begin() as connection:
            columns = {
                row[1]
                for row in connection.exec_driver_sql("PRAGMA table_info(history)").fetchall()
            }
            additions = {
                "session_id": "VARCHAR(64)",
                "logo_media_type": "VARCHAR(80) DEFAULT 'image/png'",
                "mode": "VARCHAR(12) DEFAULT 'demo'",
            }
            for column, declaration in additions.items():
                if column not in columns:
                    connection.exec_driver_sql(
                        f"ALTER TABLE history ADD COLUMN {column} {declaration}"
                    )
            connection.exec_driver_sql(
                "UPDATE history SET session_id = 'legacy-unowned-' || id "
                "WHERE session_id IS NULL OR session_id = ''"
            )
            connection.exec_driver_sql(
                "UPDATE history SET logo_media_type = 'image/png' "
                "WHERE logo_media_type IS NULL OR logo_media_type = ''"
            )
            connection.exec_driver_sql(
                "UPDATE history SET mode = 'demo' WHERE mode IS NULL OR mode = ''"
            )
            connection.exec_driver_sql(
                "CREATE INDEX IF NOT EXISTS ix_history_session_id ON history (session_id)"
            )

    def session(self) -> Iterator[Session]:
        database_session = self.session_factory()
        try:
            yield database_session
        finally:
            database_session.close()

    def healthy(self) -> bool:
        with self.engine.connect() as connection:
            result = cast(int, connection.execute(text("SELECT 1")).scalar_one())
            return result == 1

    def dispose(self) -> None:
        self.engine.dispose()
