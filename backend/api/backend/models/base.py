from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.sql import func
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import text, String, Float
from sqlalchemy.future import select
from typing import List, Dict, Optional, Any
import json
from datetime import datetime
import numpy as np
from pgvector.sqlalchemy import Vector


class Base(DeclarativeBase):
    pass

class TimestampModel(Base):
    __abstract__ = True

    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Embedding(Base):
    __tablename__ = "embeddings"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    text: Mapped[str] = mapped_column(String)
    embedding: Mapped[list[float]] = mapped_column(Vector(dim=384))
    
