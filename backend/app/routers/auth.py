from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import (
    VERIFICATION_CODE_TTL_MINUTES,
    create_access_token,
    generate_verification_code,
    hash_password,
    hash_verification_code,
    seconds_until_resend_allowed,
    verify_password,
)
from app.models.user import User
from app.schemas.user import (
    EmailVerifyRequest,
    ResendCodeRequest,
    Token,
    UserCreate,
    UserOut,
)
from app.services.email import send_verification_email

router = APIRouter(prefix="/auth", tags=["auth"])


def _issue_verification_code(user: User, db: Session) -> None:
    code = generate_verification_code()
    user.verification_code_hash = hash_verification_code(code)
    user.verification_code_expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=VERIFICATION_CODE_TTL_MINUTES
    )
    db.commit()
    send_verification_email(user.email, code)


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing is not None:
        if existing.is_verified:
            raise HTTPException(status_code=400, detail="Email already registered")
        remaining = seconds_until_resend_allowed(existing.verification_code_expires_at)
        if remaining > 0:
            raise HTTPException(
                status_code=429,
                detail=f"Please wait {remaining}s before requesting another code",
            )
        # Abandoned an earlier registration before entering the code (closed
        # the tab, lost the email, etc) — let them restart cleanly rather
        # than getting stuck with no way back to the verify screen.
        existing.hashed_password = hash_password(payload.password)
        existing.full_name = payload.full_name
        db.commit()
        _issue_verification_code(existing, db)
        return existing

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    _issue_verification_code(user, db)
    return user


@router.post("/verify-email", response_model=Token)
def verify_email(payload: EmailVerifyRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    invalid = HTTPException(status_code=400, detail="Invalid or expired code")

    if user is None or user.verification_code_hash is None:
        raise invalid
    if user.verification_code_hash != hash_verification_code(payload.code):
        raise invalid
    if (
        user.verification_code_expires_at is None
        or datetime.now(timezone.utc) > user.verification_code_expires_at
    ):
        raise invalid

    user.is_verified = True
    user.verification_code_hash = None
    user.verification_code_expires_at = None
    db.commit()

    token = create_access_token(subject=str(user.id))
    return Token(access_token=token)


@router.post("/resend-verification")
def resend_verification(payload: ResendCodeRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    # Same response whether or not the account exists/is already verified/
    # on cooldown, so this endpoint can't be used to enumerate registered
    # emails — a request within the cooldown window just silently no-ops.
    if user is not None and not user.is_verified:
        if seconds_until_resend_allowed(user.verification_code_expires_at) == 0:
            _issue_verification_code(user, db)
    return {"detail": "If that email is registered and unverified, a new code was sent."}


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if user is None or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="email_not_verified")

    token = create_access_token(subject=str(user.id))
    return Token(access_token=token)


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
