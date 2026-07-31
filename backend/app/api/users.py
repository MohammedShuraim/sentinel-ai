from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.crud.user import create_user, get_user_by_email
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserRead

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post("/", response_model=UserRead, status_code=201)
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    return create_user(db, user)


@router.get("/me", response_model=UserRead)
def read_current_user(
    current_user: User = Depends(get_current_user),
):
    return current_user