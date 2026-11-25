
import uuid

from datetime import datetime, timezone

from sqlalchemy import (
    String,
    Text,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class SellerProfile(Base):
    __tablename__ = "seller_profiles"

    __table_args__ = (
        UniqueConstraint(
            "seller_id",
            name="uq_seller_profiles_seller_id",
        ),
        UniqueConstraint(
            "store_slug",
            name="uq_seller_profiles_store_slug",
        ),
        Index("ix_seller_profiles_country", "country_code"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )

    seller_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("sellers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # 01. Personal Profile
    display_name: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    phone: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    avatar_url: Mapped[str | None] = mapped_column(
        String(2048),
        nullable=True,
    )

    # 02. Store Identity
    store_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    store_slug: Mapped[str | None] = mapped_column(
        String(280),
        nullable=True,
    )

    store_description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    logo_url: Mapped[str | None] = mapped_column(
        String(2048),
        nullable=True,
    )

    banner_url: Mapped[str | None] = mapped_column(
        String(2048),
        nullable=True,
    )

    # 03. Business Information
    business_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    legal_business_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    registration_number: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    tax_number: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    website: Mapped[str | None] = mapped_column(
        String(2048),
        nullable=True,
    )

    # 04. Registered Address
    address_line_1: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    address_line_2: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    city: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
    )

    state_province: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
    )

    postal_code: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    country_code: Mapped[str | None] = mapped_column(
        String(2),
        nullable=True,
    )

    # 05. Localization Settings
    language: Mapped[str] = mapped_column(
        String(10),
        default="en",
        nullable=False,
    )

    currency: Mapped[str] = mapped_column(
        String(3),
        default="USD",
        nullable=False,
    )

    timezone: Mapped[str] = mapped_column(
        String(64),
        default="UTC",
        nullable=False,
    )

    date_format: Mapped[str] = mapped_column(
        String(30),
        default="YYYY-MM-DD",
        nullable=False,
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
