
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.product import Product
from app.models.inventory import InventoryMovement

router = APIRouter(
    prefix="/api/v1/inventory",
    tags=["Inventory"],
)


class StockAdjustment(BaseModel):
    quantity_delta: int = Field(ne=0)
    reason: str = Field(min_length=3, max_length=255)


@router.post("/{product_id}/adjust")
def adjust_stock(
    product_id: UUID,
    payload: StockAdjustment,
    db: Session = Depends(get_db),
):
    try:
        product = db.query(Product).filter(
            Product.id == product_id
        ).with_for_update().first()

        if not product:
            raise HTTPException(404, "Product not found")

        new_quantity = product.stock_quantity + payload.quantity_delta

        if new_quantity < 0:
            raise HTTPException(409, "Insufficient stock")

        product.stock_quantity = new_quantity

        movement = InventoryMovement(
            product_id=product.id,
            quantity_delta=payload.quantity_delta,
            movement_type=(
                "stock_in" if payload.quantity_delta > 0
                else "stock_out"
            ),
            reason=payload.reason,
        )

        db.add(movement)
        db.commit()

        return {
            "product_id": str(product.id),
            "previous_stock": new_quantity - payload.quantity_delta,
            "current_stock": new_quantity,
            "quantity_changed": payload.quantity_delta,
            "status": "success",
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise
