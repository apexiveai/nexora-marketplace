
from contextlib import asynccontextmanager

from fastapi import FastAPI
from app.models import (
    Seller,
    SellerProfile,
    Product,
    InventoryMovement,
)
from app.core.config import settings
from app.db.session import Base, engine
from fastapi.middleware.cors import CORSMiddleware

# Register all database models
from app.models import Seller

from app.models.product import Product
from app.models.inventory import InventoryMovement

from app.routers.products import router as product_router
from app.routers.sellers import router as seller_router
from app.routers.inventory import router as inventory_router
from app.api.routes.auth import router as auth_router
from app.api.routes.seller_profile import (
    router as seller_profile_router,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.APP_ENV == "development":
        Base.metadata.create_all(bind=engine)

    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="International Multi-Vendor Marketplace API",
    lifespan=lifespan,
    debug=settings.DEBUG,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
    ],
    allow_headers=[
        "Authorization",
        "Content-Type",
    ],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(seller_profile_router)
app.include_router(product_router)
app.include_router(seller_router)
app.include_router(inventory_router)


@app.get("/api/v1/health")
def health():
    return {
        "status": "healthy",
        "service": "NEXORA API",
    }


@app.get("/")
def root():
    return {
        "application": "NEXORA Marketplace",
        "status": "online",
    }

@app.on_event("startup")
def startup():
    # Development bootstrap only.
    # Production database changes should use Alembic migrations.
    if settings.APP_ENV == "development":
        Base.metadata.create_all(bind=engine)

