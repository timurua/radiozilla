from sqlalchemy import Boolean, Integer, DateTime, event
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import String
from typing import List
from datetime import datetime

from pysrc.db.web_page import WebPageChannel
from .base import TimestampModel
from pyminiscraper.url import normalized_url_hash
from pysrc.db.base import Base

class FrontendAuthor(TimestampModel):
    __tablename__ = "frontend_authors"

    normalized_url_hash: Mapped[str] = mapped_column(String(32), primary_key=True)  # SHA-256 hash as primary key
    normalized_url: Mapped[str] = mapped_column(String)

    name: Mapped[str] = mapped_column(String, nullable=True, default=None)
    description: Mapped[str] = mapped_column(String, nullable=True, default=None)
    image_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
        
# Automatically set hash when content is modified
@event.listens_for(FrontendAuthor.normalized_url, 'set')
def frontend_author_set_content_hash(target: FrontendAuthor, value, oldvalue, initiator) -> None:
    target.normalized_url_hash = normalized_url_hash(value)

# Set hash before insert/update
@event.listens_for(FrontendAuthor, 'before_insert')
@event.listens_for(FrontendAuthor, 'before_update')
def frontend_author_ensure_hash(mapper, connection, target: FrontendAuthor) -> None:
    if target.normalized_url:
        target.normalized_url_hash = normalized_url_hash(target.normalized_url)

class FrontendChannel(TimestampModel):
    __tablename__ = "frontend_channels"

    normalized_url_hash: Mapped[str] = mapped_column(String(32), primary_key=True)
    normalized_url: Mapped[str] = mapped_column(String)

    name: Mapped[str] = mapped_column(String, nullable=True, default=None)
    description: Mapped[str] = mapped_column(String, nullable=True, default=None)
    image_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    source_urls: Mapped[List[str]] = mapped_column(JSONB, nullable=True, default=None)
        
# Automatically set hash when content is modified
@event.listens_for(FrontendChannel.normalized_url, 'set')
def frontend_channel_set_content_hash(target: FrontendChannel, value, oldvalue, initiator):
    target.normalized_url_hash = normalized_url_hash(value)

# Set hash before insert/update
@event.listens_for(FrontendChannel, 'before_insert')
@event.listens_for(FrontendChannel, 'before_update')
def frontend_channel_ensure_hash(mapper, connection, target: FrontendAuthor):
    if target.normalized_url:
        target.normalized_url_hash = normalized_url_hash(target.normalized_url)

class FrontendAudio(TimestampModel):
    __tablename__ = "frontend_audios"
    
    normalized_url_hash: Mapped[str] = mapped_column(String(32), primary_key=True)
    normalized_url: Mapped[str] = mapped_column(String)
    title: Mapped[str] = mapped_column(String, nullable=True, default=None)
    description: Mapped[str] = mapped_column(String, nullable=True, default=None)
    audio_text: Mapped[str] = mapped_column(String, nullable=True, default=None)
    image_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    audio_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    web_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    author_id: Mapped[str] = mapped_column(String, nullable=True, default=None)
    channel_id: Mapped[str] = mapped_column(String, nullable=True, default=None)
    published_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=True, default=None)
    topics: Mapped[List[str]] = mapped_column(JSONB, nullable=True, default=None)

# Automatically set hash when content is modified
@event.listens_for(FrontendAudio.normalized_url, 'set')
def frontend_audio_set_content_hash(target: FrontendAudio, value, oldvalue, initiator):
    target.normalized_url_hash = normalized_url_hash(value)

# Set hash before insert/update
@event.listens_for(FrontendAudio, 'before_insert')
@event.listens_for(FrontendAudio, 'before_update')
def frontend_audio_ensure_hash(mapper, connection, target: FrontendAudio):
    if target.normalized_url:
        target.normalized_url_hash = normalized_url_hash(target.normalized_url)
        


class FrontendUser(TimestampModel):
    __tablename__ = "frontend_users"    
    user_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    played_audio_ids: Mapped[List[str]] = mapped_column(JSONB, nullable=False, default=list)
    liked_audio_ids: Mapped[List[str]] = mapped_column(JSONB, nullable=False, default=list)
    search_history: Mapped[List[str]] = mapped_column(JSONB, nullable=False, default=list)
    subscribed_channel_ids: Mapped[List[str]] = mapped_column(JSONB, nullable=False, default=list)
    last_active_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)
    user_station_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)

