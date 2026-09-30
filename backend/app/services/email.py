"""Sends transactional email via Resend's HTTP API.

No API key configured (e.g. local dev) means we're not hooked up to a
real mailbox — just print the code instead of failing, so registration
still works end to end without needing a Resend account.
"""

import requests

from app.core.config import settings

RESEND_API_URL = "https://api.resend.com/emails"


def send_verification_email(to_email: str, code: str) -> None:
    if not settings.resend_api_key:
        print(f"[email:dev] verification code for {to_email}: {code}")
        return

    response = requests.post(
        RESEND_API_URL,
        headers={"Authorization": f"Bearer {settings.resend_api_key}"},
        json={
            "from": settings.email_from,
            "to": [to_email],
            "subject": "Your Okie Pet verification code",
            "html": (
                f"<p>Your verification code is:</p>"
                f"<p style='font-size:28px;font-weight:700;letter-spacing:4px'>{code}</p>"
                f"<p>It expires in 15 minutes.</p>"
            ),
        },
        timeout=10,
    )
    response.raise_for_status()
