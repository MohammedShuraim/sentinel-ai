from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def get_user_by_google_sub(db: Session, google_sub: str) -> User | None:
    return db.query(User).filter(User.google_sub == google_sub).first()


def create_user(db: Session, user: UserCreate):
    db_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=get_password_hash(user.password),
        auth_provider="email",
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def get_or_create_google_user(
    db: Session,
    *,
    email: str,
    full_name: str,
    google_sub: str,
    profile_picture: str | None,
) -> User:
    user = get_user_by_google_sub(db, google_sub)

    if user is not None:
        return user

    user = get_user_by_email(db, email)

    if user is not None:
        user.google_sub = google_sub
        user.profile_picture = profile_picture
        if user.auth_provider != "email":
            user.auth_provider = "google"
        db.commit()
        db.refresh(user)
        return user

    user = User(
        email=email,
        full_name=full_name,
        hashed_password=None,
        auth_provider="google",
        google_sub=google_sub,
        profile_picture=profile_picture,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)

    if user is None:
        return None

    if user.hashed_password is None:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user
