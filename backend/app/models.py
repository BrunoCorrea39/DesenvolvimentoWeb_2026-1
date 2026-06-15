from datetime import datetime, timezone
from sqlalchemy import Column, Text
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    email: str = Field(index=True, unique=True)
    password_hash: str
    role: str = Field(index=True)
    class_name: str | None = None
    subject: str | None = None


class Project(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    class_id: str = Field(index=True)
    title: str
    subject: str
    content: str = Field(sa_column=Column(Text))
    created_by_id: int | None = Field(default=None, foreign_key="user.id")
    deadline: str | None = None


class Group(SQLModel, table=True):
    __tablename__ = "project_group"

    id: str = Field(primary_key=True)
    project_id: int = Field(foreign_key="project.id", index=True)
    name: str
    members_json: str = Field(sa_column=Column(Text))
    progress: int = 0
    collective_grade: float | None = None


class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    group_id: str = Field(foreign_key="project_group.id", index=True)
    title: str
    description: str = Field(sa_column=Column(Text))
    responsible: str
    status: str = "A Fazer"
    deadline: str = "A combinar"
    grade: float | None = None


class TaskRequest(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    group_id: str = Field(foreign_key="project_group.id", index=True)
    title: str
    description: str = Field(sa_column=Column(Text))
    responsible: str
    status: str = "pendente"


class ChatMessage(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="task.id", index=True)
    sender: str
    text: str = Field(sa_column=Column(Text))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CalendarEvent(SQLModel, table=True):
    __tablename__ = "calendar_event"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    title: str
    date: str = Field(index=True)
    description: str | None = Field(default=None, sa_column=Column(Text))
