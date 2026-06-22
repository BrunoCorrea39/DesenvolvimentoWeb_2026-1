# Camada de acesso ao banco: cria o engine SQLModel, gera as tabelas,
# aplica pequenos ajustes de schema e fornece sessoes por requisicao.
# Compativel com SQLite (dev) e PostgreSQL (producao).
from collections.abc import Generator

from sqlalchemy import inspect
from sqlmodel import Session, SQLModel, create_engine

from .config import DATABASE_URL


_is_sqlite = DATABASE_URL.startswith("sqlite")
_connect_args = {"check_same_thread": False} if _is_sqlite else {}

engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=not _is_sqlite,
    connect_args=_connect_args,
)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)
    _ensure_schema_upgrades()


def _ensure_schema_upgrades() -> None:
    _add_column_if_missing("project", "deadline", "VARCHAR")


def _add_column_if_missing(table: str, column: str, column_type: str) -> None:
    inspector = inspect(engine)
    if not inspector.has_table(table):
        return
    existing = [col["name"] for col in inspector.get_columns(table)]
    if column not in existing:
        with engine.begin() as connection:
            connection.exec_driver_sql(
                f"ALTER TABLE {table} ADD COLUMN {column} {column_type}"
            )


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
