
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_seller
from app.db.session import get_db
from app.models.seller import Seller
from app.schemas.seller_profile import (
    SellerProfileCreate,
    SellerProfileResponse,
    ProfileCompletionResponse,
    SellerProfileOverview,
    PersonalProfileUpdate,
    StoreIdentityUpdate,
    BusinessInformationUpdate,
    RegisteredAddressUpdate,
    LocalizationUpdate,
)
from app.services.seller_profile import (
    get_seller_profile,
    create_seller_profile,
    update_profile_section,
    calculate_completion,
)


router = APIRouter(
    prefix="/api/v1/seller/profile",
    tags=["Seller Profile"],
)


def get_profile_or_404(db: Session, seller: Seller):
    profile = get_seller_profile(db, seller.id)

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Seller profile not created.",
        )

    return profile


@router.post(
    "",
    response_model=SellerProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_profile(
    payload: SellerProfileCreate,
    seller: Seller = Depends(get_current_seller),
    db: Session = Depends(get_db),
):
    try:
        return create_seller_profile(
            db=db,
            seller_id=seller.id,
            store_name=payload.store_name,
            store_slug=payload.store_slug,
        )
    except ValueError as exc:
        raise HTTPException(409, str(exc))


@router.get(
    "",
    response_model=SellerProfileOverview,
)
def get_profile(
    seller: Seller = Depends(get_current_seller),
    db: Session = Depends(get_db),
):
    profile = get_profile_or_404(db, seller)

    return {
        "profile": profile,
        "completion": calculate_completion(profile),
    }


@router.get(
    "/completion",
    response_model=ProfileCompletionResponse,
)
def get_completion(
    seller: Seller = Depends(get_current_seller),
    db: Session = Depends(get_db),
):
    profile = get_profile_or_404(db, seller)

    return calculate_completion(profile)


@router.patch(
    "/personal",
    response_model=SellerProfileResponse,
)
def update_personal(
    payload: PersonalProfileUpdate,
    seller: Seller = Depends(get_current_seller),
    db: Session = Depends(get_db),
):
    return update_section(
        db, seller, payload
    )


@router.patch(
    "/store",
    response_model=SellerProfileResponse,
)
def update_store(
    payload: StoreIdentityUpdate,
    seller: Seller = Depends(get_current_seller),
    db: Session = Depends(get_db),
):
    return update_section(
        db, seller, payload
    )


@router.patch(
    "/business",
    response_model=SellerProfileResponse,
)
def update_business(
    payload: BusinessInformationUpdate,
    seller: Seller = Depends(get_current_seller),
    db: Session = Depends(get_db),
):
    return update_section(
        db, seller, payload
    )


@router.patch(
    "/address",
    response_model=SellerProfileResponse,
)
def update_address(
    payload: RegisteredAddressUpdate,
    seller: Seller = Depends(get_current_seller),
    db: Session = Depends(get_db),
):
    return update_section(
        db, seller, payload
    )


@router.patch(
    "/localization",
    response_model=SellerProfileResponse,
)
def update_localization(
    payload: LocalizationUpdate,
    seller: Seller = Depends(get_current_seller),
    db: Session = Depends(get_db),
):
    return update_section(
        db, seller, payload
    )


def update_section(db, seller, payload):
    get_profile_or_404(db, seller)

    try:
        return update_profile_section(
            db=db,
            seller_id=seller.id,
            payload=payload.model_dump(exclude_unset=True),
        )
    except ValueError as exc:
        raise HTTPException(409, str(exc))
