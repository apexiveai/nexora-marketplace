from datetime import datetime
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    HttpUrl,
)


class SellerProfileUpdate(BaseModel):
    business_name: str | None = Field(
        default=None, min_length=2, max_length=255
    )
    store_slug: str | None = Field(
        default=None, min_length=2, max_length=280
    )
    store_description: str | None = Field(
        default=None, max_length=3000
    )
    logo_url: HttpUrl | None = None
    banner_url: HttpUrl | None = None
    phone: str | None = Field(default=None, max_length=30)
    website: HttpUrl | None = None
    country_code: str | None = Field(
        default=None, pattern=r"^[A-Z]{2}$"
    )
    business_address: str | None = Field(
        default=None, max_length=500
    )
    city: str | None = Field(default=None, max_length=120)
    postal_code: str | None = Field(default=None, max_length=30)


class SellerProfileResponse(BaseModel):
    id: UUID
    business_name: str
    store_slug: str
    store_description: str | None = None

    logo_url: str | None = None
    banner_url: str | None = None

    email: EmailStr
    phone: str | None = None
    website: str | None = None

    country_code: str
    business_address: str | None = None
    city: str | None = None
    postal_code: str | None = None

    verification_status: str
    is_active: bool

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SellerCreate(BaseModel):
    business_name: str = Field(min_length=2, max_length=255)
    store_slug: str = Field(min_length=2, max_length=280)
    email: EmailStr
    country_code: str = Field(pattern=r"^[A-Z]{2}$")


class SellerResponse(BaseModel):
    id: UUID
    business_name: str
    store_slug: str
    email: EmailStr
    country_code: str
    verification_status: str | None = None
    is_active: bool = True
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class SellerRegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    store_name: str = Field(min_length=2, max_length=150)
    password: str = Field(min_length=12, max_length=128)


class SellerRegisterResponse(BaseModel):
    message: str
    seller_id: str
    email: str
    is_email_verified: bool