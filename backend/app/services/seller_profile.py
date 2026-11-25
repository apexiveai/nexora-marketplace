
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.seller_profile import SellerProfile


PROFILE_FIELDS = {
    "personal": [
        "display_name",
        "phone",
        "avatar_url",
    ],
    "store": [
        "store_name",
        "store_slug",
        "store_description",
        "logo_url",
        "banner_url",
    ],
    "business": [
        "business_type",
        "legal_business_name",
        "registration_number",
        "tax_number",
        "website",
    ],
    "address": [
        "address_line_1",
        "city",
        "state_province",
        "postal_code",
        "country_code",
    ],
    "localization": [
        "language",
        "currency",
        "timezone",
        "date_format",
    ],
}


def calculate_completion(profile: SellerProfile) -> dict:
    required_fields = [
        field
        for fields in PROFILE_FIELDS.values()
        for field in fields
    ]

    completed = [
        field
        for field in required_fields
        if getattr(profile, field, None) is not None
        and str(getattr(profile, field)).strip() != ""
    ]

    missing = [
        field
        for field in required_fields
        if field not in completed
    ]

    total = len(required_fields)
    percentage = round(len(completed) / total * 100)

    if percentage == 100:
        status = "complete"
    elif percentage >= 70:
        status = "almost_complete"
    elif percentage >= 30:
        status = "in_progress"
    else:
        status = "incomplete"

    return {
        "percentage": percentage,
        "completed_fields": len(completed),
        "total_fields": total,
        "missing_fields": missing,
        "status": status,
    }


def get_seller_profile(
    db: Session,
    seller_id,
):
    return db.scalar(
        select(SellerProfile).where(
            SellerProfile.seller_id == seller_id
        )
    )


def create_seller_profile(
    db: Session,
    seller_id,
    store_name: str,
    store_slug: str | None = None,
):
    existing = get_seller_profile(db, seller_id)

    if existing:
        raise ValueError("Seller profile already exists.")

    profile = SellerProfile(
        seller_id=seller_id,
        store_name=store_name,
        store_slug=store_slug,
    )

    db.add(profile)

    try:
        db.commit()
        db.refresh(profile)
    except IntegrityError:
        db.rollback()
        raise ValueError(
            "Store slug is already in use or profile already exists."
        )

    return profile


def update_profile_section(
    db: Session,
    seller_id,
    payload: dict,
):
    profile = get_seller_profile(db, seller_id)

    if not profile:
        raise ValueError("Seller profile not found.")

    allowed_fields = {
        field
        for fields in PROFILE_FIELDS.values()
        for field in fields
    }

    for key, value in payload.items():
        if key in allowed_fields:
            if value is not None:
                value = str(value) if key.endswith("_url") or key == "website" else value

            setattr(profile, key, value)

    try:
        db.commit()
        db.refresh(profile)
    except IntegrityError:
        db.rollback()
        raise ValueError(
            "Store slug is already in use."
        )

    return profile
