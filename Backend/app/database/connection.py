from __future__ import annotations
from collections.abc import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import settings


MYSQL_BACKENDS = {"mysql", "mariadb"}


def build_db_connect_args(database_url: str) -> dict[str, int]:
    """Driver connect args for network databases.

    SQLite (tests) has no TCP connection, so timeouts are only applied to
    MySQL/TiDB URLs. Kept as a pure function so it can be tested without
    opening a real connection.
    """

    try:
        backend = make_url(database_url).get_backend_name()
    except Exception:
        return {}

    if backend not in MYSQL_BACKENDS:
        return {}

    return {
        "connect_timeout": settings.db_connect_timeout,
        "read_timeout": settings.db_read_timeout,
        "write_timeout": settings.db_write_timeout,
    }


engine_kwargs = {"pool_pre_ping": True}

connect_args = build_db_connect_args(settings.database_url)

if connect_args:
    engine_kwargs["connect_args"] = connect_args

if settings.production:
    engine_kwargs.update(poolclass=NullPool)
else:
    engine_kwargs.update(pool_recycle=300)

engine = create_engine(settings.database_url, **engine_kwargs)

class Base(DeclarativeBase):
    pass

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@event.listens_for(engine, "connect")
def _sqlite_foreign_keys(dbapi_connection, _connection_record):
    if settings.database_url.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
