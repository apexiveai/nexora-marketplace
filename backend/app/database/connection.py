
# app/database/connection.py

# Backward-compatible database exports.
# All application models now share one SQLAlchemy Base and Engine.

from app.db.session import Base, engine, SessionLocal, get_db

__all__ = [
    "Base",
    "engine",
    "SessionLocal",
    "get_db",
]
