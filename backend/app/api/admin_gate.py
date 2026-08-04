"""Gate for destructive / seed / import admin endpoints.

Local development keeps imports enabled by default (`ENABLE_DATA_IMPORTS=true`).
Production should set `ENABLE_DATA_IMPORTS=false` so publicly reachable EC2
instances cannot seed or mutate master data without an intentional override.
"""

from fastapi import HTTPException, status

from app.core.config import settings


def require_data_imports_enabled() -> None:
    if not settings.ENABLE_DATA_IMPORTS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Data import endpoints are disabled. "
                "Set ENABLE_DATA_IMPORTS=true only for trusted admin environments."
            ),
        )
