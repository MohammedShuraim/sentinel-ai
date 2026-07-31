from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.crud.user import create_user, get_user_by_email
from app.db.dependencies import get_db
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
    # Check if the email already exists
    existing_user = get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    # Create and return the new user
    return create_user(db, user)