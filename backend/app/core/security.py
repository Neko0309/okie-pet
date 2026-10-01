import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings

ALGORITHM = "HS256"
VERIFICATION_CODE_TTL_MINUTES = 15
RESEND_COOLDOWN_SECONDS = 60


def generate_verification_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_verification_code(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def seconds_until_resend_allowed(code_expires_at: datetime | None) -> int:
    """Codes don't separately track when they were issued — derive it from
    their expiry (issued_at = expires_at - TTL) rather than adding a column
    just for this."""
    if code_expires_at is None:
        return 0
    issued_at = code_expires_at - timedelta(minutes=VERIFICATION_CODE_TTL_MINUTES)
    elapsed = (datetime.now(timezone.utc) - issued_at).total_seconds()
    return max(0, int(RESEND_COOLDOWN_SECONDS - elapsed))


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None
