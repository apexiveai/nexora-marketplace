
from uuid import UUID
from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
)


class SellerProfileCreate(BaseModel):
    store_name: str = Field(min_length=2, max_length=150)
    store_slug: str | None = Field(
        default=None, min_length=2, max_length=280
    )


class PersonalProfileUpdate(BaseModel):
    display_name: str | None = Field(
        default=None, max_length=150
    )
    phone: str | None = Field(default=None, max_length=30)
    avatar_url: HttpUrl | None = None


class StoreIdentityUpdate(BaseModel):
    store_name: str | None = Field(
        default=None, min_length=2, max_length=150
    )
    store_slug: str | None = Field(
        default=None, min_length=2, max_length=280
    )
    store_description: str | None = Field(
        default=None, max_length=3000
    )
    logo_url: HttpUrl | None = None
    banner_url: HttpUrl | None = None


class BusinessInformationUpdate(BaseModel):
    business_type: str | None = Field(
        default=None, max_length=50
    )
    legal_business_name: str | None = Field(
        default=None, max_length=255
    )
    registration_number: str | None = Field(
        default=None, max_length=100
    )
    tax_number: str | None = Field(
        default=None, max_length=100
    )
    website: HttpUrl | None = None


class RegisteredAddressUpdate(BaseModel):
    address_line_1: str | None = Field(
        default=None, max_length=255
    )
    address_line_2: str | None = Field(
        default=None, max_length=255
    )
    city: str | None = Field(default=None, max_length=120)
    state_province: str | None = Field(
        default=None, max_length=120
    )
    postal_code: str | None = Field(
        default=None, max_length=30
    )
    country_code: str | None = Field(
        default=None, pattern=r"^[A-Z]{2}$"
    )


class LocalizationUpdate(BaseModel):
    language: str | None = Field(
        default=None, min_length=2, max_length=10
    )
    currency: str | None = Field(
        default=None, pattern=r"^[A-Z]{3}$"
    )
    timezone: str | None = Field(
        default=None, max_length=64
    )
    date_format: str | None = Field(
        default=None, max_length=30
    )


class SellerProfileResponse(BaseModel):
    id: UUID
    seller_id: UUID

    display_name: str | None
    phone: str | None
    avatar_url: str | None

    store_name: str
    store_slug: str | None
    store_description: str | None
    logo_url: str | None
    banner_url: str | None

    business_type: str | None
    legal_business_name: str | None
    registration_number: str | None
    tax_number: str | None
    website: str | None

    address_line_1: str | None
    address_line_2: str | None
    city: str | None
    state_province: str | None
    postal_code: str | None
    country_code: str | None

    language: str
    currency: str
    timezone: str
    date_format: str

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProfileCompletionResponse(BaseModel):
    percentage: int
    completed_fields: int
    total_fields: int
    missing_fields: list[str]
    status: str


class SellerProfileOverview(BaseModel):
    profile: SellerProfileResponse
    completion: ProfileCompletionResponse
