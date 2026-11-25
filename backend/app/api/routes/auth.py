
import logging

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
import jwt

from app.core.security import verify_password
from app.core.config import settings
from app.core.security import (
    generate_verification_token,
    hash_password,
    hash_token,
)
from app.db.session import get_db
from app.models.seller import Seller
from app.schemas.seller import (
    SellerRegisterRequest,
    SellerRegisterResponse,
)
from app.services.email_service import send_verification_email


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


@router.post("/login", response_model=LoginResponse)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    email = str(payload.email).lower().strip()

    seller = db.scalar(
        select(Seller).where(Seller.email == email)
    )

    if (
        not seller
        or not verify_password(
            payload.password,
            seller.password_hash,
        )
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not seller.is_active:
        raise HTTPException(
            status_code=403,
            detail="Seller account is inactive.",
        )

    if not seller.is_email_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in.",
        )

    expires_in = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

    token = jwt.encode(
        {
            "sub": str(seller.id),
            "type": "access",
            "exp": (
                datetime.now(timezone.utc)
                + timedelta(seconds=expires_in)
            ),
            "iat": datetime.now(timezone.utc),
        },
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )

    return LoginResponse(
        access_token=token,
        expires_in=expires_in,
    )


class VerifyEmailRequest(BaseModel):
    token: str = Field(min_length=20, max_length=200)


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class MessageResponse(BaseModel):
    message: str


def create_verification_url(token: str) -> str:
    return (
        f"{settings.FRONTEND_ORIGIN.rstrip('/')}"
        f"/verify-email?token={token}"
    )


def deliver_verification_email(
    email: str,
    token: str,
) -> bool:
    try:
        send_verification_email(
            recipient=email,
            verification_url=create_verification_url(token),
        )
        return True
    except Exception:
        logger.exception(
            "Verification email delivery failed."
        )
        return False


@router.post(
    "/register",
    response_model=SellerRegisterResponse,
    status_code=201,
)
def register_seller(
    payload: SellerRegisterRequest,
    db: Session = Depends(get_db),
):
    email = str(payload.email).lower().strip()

    existing = db.scalar(
        select(Seller).where(Seller.email == email)
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists.",
        )

    token = generate_verification_token()

    seller = Seller(
        full_name=payload.full_name.strip(),
        email=email,
        store_name=payload.store_name.strip(),
        password_hash=hash_password(payload.password),
        is_active=True,
        is_email_verified=False,
        role="seller",
        verification_token_hash=hash_token(token),
        verification_token_expires_at=(
            datetime.now(timezone.utc)
            + timedelta(hours=24)
        ),
    )

    db.add(seller)

    try:
        db.commit()
        db.refresh(seller)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Unable to create this account.",
        )

    email_sent = deliver_verification_email(
        seller.email,
        token,
    )

    return SellerRegisterResponse(
        message=(
            "Registration successful. "
            + (
                "Please check your email."
                if email_sent
                else "Email delivery is pending. Please request a new verification email."
            )
        ),
        seller_id=str(seller.id),
        email=seller.email,
        is_email_verified=False,
    )


@router.post(
    "/verify-email",
    response_model=MessageResponse,
)
def verify_email(
    payload: VerifyEmailRequest,
    db: Session = Depends(get_db),
):
    token_hash = hash_token(payload.token)

    seller = db.scalar(
        select(Seller)
        .where(
            Seller.verification_token_hash == token_hash
        )
        .with_for_update()
    )

    if not seller:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification link.",
        )

    if seller.is_email_verified:
        return MessageResponse(
            message="Email address is already verified."
        )

    expires_at = seller.verification_token_expires_at

    if (
        expires_at is None
        or expires_at <= datetime.now(timezone.utc)
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification link.",
        )

    seller.is_email_verified = True
    seller.verification_token_hash = None
    seller.verification_token_expires_at = None

    db.commit()

    return MessageResponse(
        message="Your NEXORA email address has been verified."
    )


@router.post(
    "/resend-verification",
    response_model=MessageResponse,
)
def resend_verification(
    payload: ResendVerificationRequest,
    db: Session = Depends(get_db),
):
    email = str(payload.email).lower().strip()

    seller = db.scalar(
        select(Seller)
        .where(Seller.email == email)
        .with_for_update()
    )

    # Use the same response whether or not the account exists.
    generic_message = (
        "If an unverified account exists, "
        "a verification email will be sent."
    )

    if not seller or seller.is_email_verified:
        return MessageResponse(message=generic_message)

    token = generate_verification_token()

    seller.verification_token_hash = hash_token(token)
    seller.verification_token_expires_at = (
        datetime.now(timezone.utc)
        + timedelta(hours=24)
    )

    db.commit()

    deliver_verification_email(
        seller.email,
        token,
    )

    return MessageResponse(message=generic_message)
