
import uuid

from sqlalchemy import (
    String, Text, Numeric, Integer, Boolean, ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    seller_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sellers.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(255), nullable=False, index=True
    )

    slug: Mapped[str] = mapped_column(
        String(280), unique=True, nullable=False
    )

    sku: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    category: Mapped[str] = mapped_column(
        String(150), nullable=False, index=True
    )

    price: Mapped[float] = mapped_column(
        Numeric(12, 2), nullable=False
    )

    currency: Mapped[str] = mapped_column(
        String(3), default="USD", nullable=False
    )

    stock_quantity: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
