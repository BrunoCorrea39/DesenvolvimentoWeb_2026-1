from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..auth import get_current_user
from ..database import get_session
from ..models import CalendarEvent, User
from ..schemas import CalendarEventCreate, CalendarEventPublic


router = APIRouter(prefix="/calendar", tags=["calendar"])


def normalize_iso_date(value: str) -> str:
    try:
        return date.fromisoformat(value.strip()).isoformat()
    except (ValueError, AttributeError):
        raise HTTPException(status_code=422, detail="Data inválida. Use o formato AAAA-MM-DD.") from None


@router.get("", response_model=list[CalendarEventPublic])
def list_events(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> list[CalendarEvent]:
    return session.exec(
        select(CalendarEvent)
        .where(CalendarEvent.user_id == user.id)
        .order_by(CalendarEvent.date, CalendarEvent.id)
    ).all()


@router.post("", response_model=CalendarEventPublic)
def create_event(
    payload: CalendarEventCreate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> CalendarEvent:
    event = CalendarEvent(
        user_id=user.id,
        title=payload.title.strip(),
        date=normalize_iso_date(payload.date),
        description=(payload.description or "").strip() or None,
    )
    session.add(event)
    session.commit()
    session.refresh(event)
    return event


@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> dict:
    event = session.get(CalendarEvent, event_id)
    if not event or event.user_id != user.id:
        raise HTTPException(status_code=404, detail="Evento não encontrado.")

    session.delete(event)
    session.commit()
    return {"message": "Evento removido."}
