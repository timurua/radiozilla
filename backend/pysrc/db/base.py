from sqlalchemy import Column, Integer, DateTime, event
from sqlalchemy.sql import func
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import text, String, Float
from sqlalchemy.future import select
from typing import List, Dict, Optional, Any
import json
from datetime import datetime
import hashlib

class Base(DeclarativeBase):
    pass

class TimestampModel(Base):
    __abstract__ = True

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())