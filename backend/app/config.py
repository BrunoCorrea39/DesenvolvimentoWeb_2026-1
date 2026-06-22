# Configuracao central da aplicacao: le variaveis de ambiente e define
# banco de dados, segredos JWT, origens de CORS e parametros da API de IA.
import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'projetai.db'}")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "troque-esta-chave-em-producao")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8

_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
FRONTEND_ORIGINS = [o.strip() for o in os.getenv("FRONTEND_ORIGINS", _default_origins).split(",") if o.strip()]

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5")
ANTHROPIC_VERSION = os.getenv("ANTHROPIC_VERSION", "2023-06-01")
