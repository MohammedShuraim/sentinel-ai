import hmac
import logging

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from starlette.requests import Request

from app.core.config import settings
from app.core.security import create_access_token
from app.crud.user import authenticate_user, get_or_create_google_user
from app.db.dependencies import get_db
from app.schemas.user import Token
from app.services.google_oauth_service import GoogleOAuthService

logger = logging.getLogger(__name__)

OAUTH_STATE_COOKIE = "oauth_state"

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


def _oauth_cookie_secure() -> bool:
    """Use Secure cookies for HTTPS redirect URIs; allow HTTP locally."""
    return settings.GOOGLE_REDIRECT_URI.lower().startswith("https://")


def _set_oauth_state_cookie(response: Response, state: str) -> None:
    response.set_cookie(
        key=OAUTH_STATE_COOKIE,
        value=state,
        httponly=True,
        samesite="lax",
        secure=_oauth_cookie_secure(),
        max_age=600,
        path="/",
    )


def _clear_oauth_state_cookie(response: Response) -> None:
    response.delete_cookie(
        key=OAUTH_STATE_COOKIE,
        path="/",
        httponly=True,
        samesite="lax",
        secure=_oauth_cookie_secure(),
    )


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    db_user = authenticate_user(
        db,
        form_data.username,   # email goes here
        form_data.password,
    )

    if not db_user:
        logger.warning("Login failed for email=%s", form_data.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        {"sub": db_user.email}
    )
    logger.info("Login succeeded for user_id=%s", db_user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/google/login")
def google_login():
    oauth_service = GoogleOAuthService()
    authorization_url, state = oauth_service.get_authorization_url()
    response = RedirectResponse(
        url=authorization_url,
        status_code=status.HTTP_302_FOUND,
    )
    _set_oauth_state_cookie(response, state)
    return response


@router.get("/google/callback")
def google_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: Session = Depends(get_db),
):
    cookie_state = request.cookies.get(OAUTH_STATE_COOKIE)

    if (
        not cookie_state
        or not state
        or not hmac.compare_digest(cookie_state, state)
    ):
        logger.warning("Google OAuth state validation failed")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OAuth state.",
        )

    if error:
        logger.warning("Google OAuth login failed: %s", error)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Google OAuth error: {error}",
        )

    if not code:
        logger.warning("Google OAuth callback missing authorization code")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing authorization code",
        )

    oauth_service = GoogleOAuthService()

    try:
        token_data = oauth_service.exchange_code(code)
        access_token = token_data.get("access_token")

        if not access_token:
            raise ValueError("Google token response did not include access_token")

        profile = oauth_service.get_user_profile(access_token)
    except Exception as exc:
        logger.warning("Google OAuth exchange or profile fetch failed")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to authenticate with Google",
        ) from exc

    google_sub = profile.get("sub")
    email = profile.get("email")
    full_name = profile.get("name") or profile.get("email") or "Google User"
    profile_picture = profile.get("picture")

    if not google_sub or not email:
        logger.warning("Google OAuth profile missing required fields")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google profile is missing required fields",
        )

    db_user = get_or_create_google_user(
        db,
        email=email,
        full_name=full_name,
        google_sub=google_sub,
        profile_picture=profile_picture,
    )

    jwt_token = create_access_token({"sub": db_user.email})
    logger.info("Google login succeeded for user_id=%s", db_user.id)

    redirect = RedirectResponse(
        url=(
            f"{settings.FRONTEND_URL.rstrip('/')}"
            f"/auth/callback?access_token={jwt_token}"
        ),
        status_code=status.HTTP_302_FOUND,
    )
    _clear_oauth_state_cookie(redirect)
    return redirect
