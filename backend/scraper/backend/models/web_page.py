from sqlalchemy import Integer, DateTime, event,LargeBinary
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import String
from sqlalchemy.future import select
from typing import List, Dict
from datetime import datetime
from .base import Base
from pywebscraper.url_normalize import normalized_url_hash

class WebPageSeed(Base):
    __tablename__ = "web_page_seeds"

    normalized_url_hash: Mapped[str] = mapped_column(String(64), primary_key=True)  # SHA-256 hash as primary key
    normalized_url: Mapped[str] = mapped_column(String)
    url: Mapped[str] = mapped_column(String)
    max_depth: Mapped[int] = mapped_column(Integer)
    url_patterns: Mapped[List[str]] = mapped_column(JSONB, nullable=True, default=None)
        
# Automatically set hash when content is modified
@event.listens_for(WebPageSeed.normalized_url, 'set')
def set_content_hash(target, value, oldvalue, initiator):
    target.normalized_url_hash = normalized_url_hash(value)

# Set hash before insert/update
@event.listens_for(WebPageSeed, 'before_insert')
@event.listens_for(WebPageSeed, 'before_update')
def ensure_hash(mapper, connection, target):
    if target.normalized_url and not target.normalized_url_hash:
        target.normalized_url_hash = normalized_url_hash(target.normalized_url)


class WebPage(Base):
    __tablename__ = "web_pages"
    
    normalized_url_hash: Mapped[str] = mapped_column(String(64), primary_key=True)  # SHA-256 hash as primary key
    normalized_url: Mapped[str] = mapped_column(String)
    url: Mapped[str] = mapped_column(String)
    status_code: Mapped[int] = mapped_column(Integer)
    headers: Mapped[Dict[str, str]] = mapped_column(JSONB, nullable=True, default=None)
    content: Mapped[bytes] = mapped_column(LargeBinary, nullable=True, default=None)
    content_type: Mapped[str] = mapped_column(String, nullable=True, default=None)
    title: Mapped[str] = mapped_column(String, nullable=True, default=None)
    visible_text: Mapped[str] = mapped_column(String, nullable=True, default=None)
    content_date: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=True, default=None)
    
# Automatically set hash when content is modified
@event.listens_for(WebPage.normalized_url, 'set')
def set_content_hash(target, value, oldvalue, initiator):
    target.normalized_url_hash = normalized_url_hash(value)

# Set hash before insert/update
@event.listens_for(WebPage, 'before_insert')
@event.listens_for(WebPage, 'before_update')
def ensure_hash(mapper, connection, target):
    if target.normalized_url and not target.normalized_url_hash:
        target.normalized_url_hash = normalized_url_hash(target.normalized_url)
