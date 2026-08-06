"""Silent Telegram alerts for watched evaluator logins.

Evaluators never see this — it only notifies the operator's Telegram chat.
"""

from __future__ import annotations

import logging
import threading
from datetime import datetime, timezone

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

DEFAULT_WATCHED_EMAILS = (
    "harisankar@sentellent.com",
    "naga@sentellent.com",
)


def _watched_emails() -> set[str]:
    raw = (settings.EVALUATOR_NOTIFY_EMAILS or "").strip()
    if not raw:
        return {email.lower() for email in DEFAULT_WATCHED_EMAILS}
    return {
        part.strip().lower()
        for part in raw.split(",")
        if part.strip()
    }


def _send_telegram(text: str) -> None:
    token = (settings.TELEGRAM_BOT_TOKEN or "").strip()
    chat_id = (settings.TELEGRAM_CHAT_ID or "").strip()
    if not token or not chat_id:
        return

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    try:
        with httpx.Client(timeout=8.0) as client:
            response = client.post(
                url,
                json={
                    "chat_id": chat_id,
                    "text": text,
                    "disable_web_page_preview": True,
                },
            )
            response.raise_for_status()
    except Exception:
        # Never fail login because of notify issues.
        logger.warning("Telegram login notify failed", exc_info=True)


def notify_evaluator_login_if_watched(
    *,
    email: str,
    full_name: str | None = None,
) -> None:
    """If email is watched, ping Telegram in a background thread."""
    normalized = (email or "").strip().lower()
    if not normalized or normalized not in _watched_emails():
        return

    if not (settings.TELEGRAM_BOT_TOKEN or "").strip():
        return
    if not (settings.TELEGRAM_CHAT_ID or "").strip():
        return

    when = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    name = (full_name or "").strip() or "Evaluator"
    text = (
        "Sentellent login alert\n"
        f"Name: {name}\n"
        f"Email: {normalized}\n"
        f"Time: {when}\n"
        "They opened the app (Google OAuth)."
    )

    thread = threading.Thread(
        target=_send_telegram,
        args=(text,),
        name="telegram-login-notify",
        daemon=True,
    )
    thread.start()
