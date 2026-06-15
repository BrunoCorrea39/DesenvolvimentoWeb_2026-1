from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from .config import DATABASE_URL


engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)
    _ensure_schema_upgrades()


def _ensure_schema_upgrades() -> None:
    with engine.begin() as connection:
        columns = [row[1] for row in connection.exec_driver_sql("PRAGMA table_info(project)").fetchall()]
        if columns and "deadline" not in columns:
            connection.exec_driver_sql("ALTER TABLE project ADD COLUMN deadline VARCHAR")


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
