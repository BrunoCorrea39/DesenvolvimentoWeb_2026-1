from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class UserPublic(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    class_name: Optional[str] = None
    subject: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class TaskStatusUpdate(BaseModel):
    status: Optional[str] = None


class TaskUpdate(BaseModel):
    responsavel: Optional[str] = None
    nota: Optional[float] = None


class TaskCreate(BaseModel):
    titulo: str = Field(min_length=2)
    descricao: str = "Inclusão manual do professor."
    responsavel: str = Field(min_length=2)
    prazo: str = "A combinar"


class TaskRequestCreate(BaseModel):
    titulo: str = Field(min_length=2)
    descricao: str = Field(min_length=2)
    responsavel: str = Field(min_length=2)


class ResolveTaskRequest(BaseModel):
    aprovar: bool


class GroupGradeUpdate(BaseModel):
    notaColetiva: float = Field(ge=0, le=10)


class AIProjectCreate(BaseModel):
    turmaId: str
    titulo: str = Field(min_length=2)
    conteudo: str = Field(min_length=5)
    numeroGrupos: int = Field(default=1, ge=1, le=20)
    prazo: Optional[str] = None


class ChatCreate(BaseModel):
    message: str = Field(min_length=1)


class CalendarEventCreate(BaseModel):
    title: str = Field(min_length=1)
    date: str = Field(min_length=10)
    description: Optional[str] = None


class CalendarEventPublic(BaseModel):
    id: int
    title: str
    date: str
    description: Optional[str] = None
