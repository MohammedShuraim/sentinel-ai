import httpx
from authlib.integrations.httpx_client import OAuth2Client

from app.core.config import settings

GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"
GOOGLE_SCOPES = "openid email profile"


class GoogleOAuthService:
    """Handles Google OAuth authorization and profile retrieval.

    Builds authorization URLs, exchanges codes for tokens, and fetches
    the authenticated Google user profile. Performs no database access
    or JWT creation.
    """

    def __init__(self):
        """Create the Google OAuth service from application settings."""
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = settings.GOOGLE_REDIRECT_URI

    def _client(self) -> OAuth2Client:
        """Create a short-lived Authlib OAuth2 client."""
        return OAuth2Client(
            client_id=self.client_id,
            client_secret=self.client_secret,
            redirect_uri=self.redirect_uri,
            scope=GOOGLE_SCOPES,
        )

    def get_authorization_url(self) -> tuple[str, str]:
        """Build the Google OAuth authorization URL and CSRF state."""
        client = self._client()
        uri, state = client.create_authorization_url(
            GOOGLE_AUTHORIZE_URL,
            access_type="offline",
            prompt="consent",
        )
        return uri, state

    def exchange_code(self, code: str) -> dict:
        """Exchange an authorization code for Google tokens."""
        client = self._client()
        token = client.fetch_token(
            GOOGLE_TOKEN_URL,
            code=code,
        )
        return dict(token)

    def get_user_profile(self, access_token: str) -> dict:
        """Retrieve the authenticated Google user profile."""
        with httpx.Client() as client:
            response = client.get(
                GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            response.raise_for_status()
            return response.json()
