from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..auth import create_access_token, get_current_user, verify_password
from ..database import get_session
from ..models import User
from ..schemas import LoginRequest, TokenResponse, UserPublic


router = APIRouter(prefix="/auth", tags=["auth"])


def to_user_public(user: User) -> UserPublic:
    return UserPublic(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        class_name=user.class_name,
        subject=user.subject,
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, session: Session = Depends(get_session)) -> TokenResponse:
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos.")

    return TokenResponse(access_token=create_access_token(user), user=to_user_public(user))


@router.get("/me", response_model=UserPublic)
def me(user: User = Depends(get_current_user)) -> UserPublic:
    return to_user_public(user)
