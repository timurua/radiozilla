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
import numpy as np
from pgvector.sqlalchemy import Vector
import hashlib
from .base import Base

class WebSeed(Base):
    __tablename__ = "web_seeds"
    
    normalized_url_hash: Mapped[str] = mapped_column(String(64), primary_key=True)  # SHA-256 hash as primary key
    url: Mapped[str] = mapped_column(String)
    normalized_url: Mapped[str] = mapped_column(String)

    

    meta: Mapped[Dict[str, Any]] = mapped_column(JSONB)
    content: Mapped[str] = mapped_column(String)
    embedding: Mapped[list[float]] = mapped_column(Vector(dim=384))

    @staticmethod
    def _hash_text(text: str) -> str:
        return hashlib.sha256(text.encode('utf-8')).hexdigest()    
    
# Automatically set hash when content is modified
@event.listens_for(Embedding.content, 'set')
def set_content_hash(target, value, oldvalue, initiator):
    target.content_hash = Embedding._hash_text(value)

# Set hash before insert/update
@event.listens_for(Embedding, 'before_insert')
@event.listens_for(Embedding, 'before_update')
def ensure_hash(mapper, connection, target):
    if target.content and not target.content_hash:
        target.content_hash = Embedding._hash_text(target.content)