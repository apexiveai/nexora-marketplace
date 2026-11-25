
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.seller import Seller
from app.schemas.seller import SellerCreate, SellerResponse

router = APIRouter(
    prefix="/api/v1/sellers",
    tags=["Sellers"],
)


@router.post("/", response_model=SellerResponse, status_code=201)
def create_seller(
    payload: SellerCreate,
    db: Session = Depends(get_db),
):
    existing = db.query(Seller).filter(
        Seller.email == str(payload.email)
    ).first()

    if existing:
        raise HTTPException(409, "Seller already exists")

    seller = Seller(
        business_name=payload.business_name,
        email=str(payload.email),
        country_code=payload.country_code,
    )

    db.add(seller)
    db.commit()
    db.refresh(seller)

    return seller


@router.get("/", response_model=list[SellerResponse])
def list_sellers(db: Session = Depends(get_db)):
    return db.query(Seller).order_by(
        Seller.created_at.desc()
    ).all()
