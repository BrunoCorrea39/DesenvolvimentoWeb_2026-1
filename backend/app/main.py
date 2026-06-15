from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from .config import FRONTEND_ORIGINS
from .database import create_db_and_tables, engine
from .routers import auth, calendar, projects
from .services import seed_database


app = FastAPI(title="ProjetAí API", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()
    with Session(engine) as session:
        seed_database(session)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


app.include_router(auth.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(calendar.router, prefix="/api")
