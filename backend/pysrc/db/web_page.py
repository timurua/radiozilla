from sqlalchemy import Integer, DateTime, event,LargeBinary, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import String
from sqlalchemy.future import select
from typing import List, Dict
from datetime import datetime
from .base import TimestampModel
from pyminiscraper.url import normalized_url_hash, normalize_url
from pyminiscraper.hash import generate_url_safe_id
from pgvector.sqlalchemy import Vector
from sqlalchemy.ext.asyncio import AsyncConnection
from .database_utils import create_vector_index
from enum import Enum
from sqlalchemy.orm import DeclarativeBase

class WebPageSeedType(Enum):
    WEB_PAGE = "WEB_PAGE"
    SITEMAP = "SITEMAP"
    FEED = "FEED"

class WebPageSeed(DeclarativeBase):
    url: Mapped[str]
    type: Mapped[WebPageSeedType]
    
class WebPageChannel(TimestampModel):
    __tablename__ = "web_page_channels"

    normalized_url_hash: Mapped[str] = mapped_column(String(32), primary_key=True)    
    normalized_url: Mapped[str] = mapped_column(String)
    channel_normalized_url_hash: Mapped[str] = mapped_column(String(32), primary_key=True)  # SHA-256 hash as primary key
    channel_normalized_url: Mapped[str] = mapped_column(String)    
    name: Mapped[str] = mapped_column(String, nullable=True, default=None)
    description: Mapped[str] = mapped_column(String, nullable=True, default=None)
    image_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    
    scraper_seeds: Mapped[List[WebPageSeed]] = mapped_column(JSONB, nullable=True, default=None)
    scraper_path_filters: Mapped[List[str]] = mapped_column(String, nullable=True, default=None)
    scraper_follow_web_page_links: Mapped[bool] = mapped_column(Boolean, default=False)
    scraper_follow_feed_links: Mapped[bool] = mapped_column(Boolean, default=True)
    scraper_follow_sitemap_links: Mapped[bool] = mapped_column(Boolean, default=True)
        
# Automatically set hash when content is modified
@event.listens_for(WebPageChannel.url, 'set')
def web_page_channel_set_content_hash(target: WebPageChannel, value, oldvalue, initiator):
    target.normalized_url = normalize_url(value)
    target.normalized_url_hash = normalized_url_hash(target.normalized_url)

# Set hash before insert/update
@event.listens_for(WebPageChannel, 'before_insert')
@event.listens_for(WebPageChannel, 'before_update')
def web_page_channel_ensure_hash(mapper, connection, target: WebPageChannel):
    if target.url:
        target.normalized_url = normalize_url(target.url)
        target.normalized_url_hash = normalized_url_hash(target.normalized_url)
        


class WebPage(TimestampModel):
    __tablename__ = "web_pages"
    
    normalized_url_hash: Mapped[str] = mapped_column(String(32), primary_key=True)  # SHA-256 hash as primary key
    normalized_url: Mapped[str] = mapped_column(String)
    url: Mapped[str] = mapped_column(String)
    status_code: Mapped[int] = mapped_column(Integer)
    headers: Mapped[Dict[str, str]] = mapped_column(JSONB, nullable=True, default=None)
    content: Mapped[bytes] = mapped_column(LargeBinary, nullable=True, default=None)
    content_type: Mapped[str] = mapped_column(String, nullable=True, default=None)
    content_charset: Mapped[str] = mapped_column(String, nullable=True, default=None)
    requested_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)
    
    metadata_title: Mapped[str] = mapped_column(String, nullable=True, default=None)
    metadata_description: Mapped[str] = mapped_column(String, nullable=True, default=None)
    metadata_image_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    metadata_published_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)

    canonical_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    outgoing_urls: Mapped[List[str]] = mapped_column(JSONB, nullable=True, default=None)
    visible_text: Mapped[str] = mapped_column(String, nullable=True, default=None)
    sitemap_urls: Mapped[List[str]] = mapped_column(JSONB, nullable=True, default=None)
    feed_urls: Mapped[List[str]] = mapped_column(JSONB, nullable=True, default=None)
    robots_content: Mapped[List[str]] = mapped_column(JSONB, nullable=True, default=None)
    text_chunks: Mapped[List[str]] = mapped_column(JSONB, nullable=True, default=None)
    
# Automatically set hash when content is modified
@event.listens_for(WebPage.url, 'set')
def web_page_set_content_hash(target: WebPage, value, oldvalue, initiator):
    target.normalized_url = normalize_url(value)
    target.normalized_url_hash = normalized_url_hash(target.normalized_url)

# Set hash before insert/update
@event.listens_for(WebPage, 'before_insert')
@event.listens_for(WebPage, 'before_update')
def web_page_ensure_hash(mapper, connection, target: WebPage):
    if target.url:
        target.normalized_url = normalize_url(target.url)
        target.normalized_url_hash = normalized_url_hash(target.normalized_url)


class WebPageSummary(TimestampModel):
    __tablename__ = "web_page_summaries"
    
    normalized_url_hash: Mapped[str] = mapped_column(String(32), primary_key=True)  # SHA-256 hash as primary key
    normalized_url: Mapped[str] = mapped_column(String)

    title: Mapped[str] = mapped_column(String, nullable=True, default=None)
    description: Mapped[str] = mapped_column(String, nullable=True, default=None)
    image_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    published_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)
    text: Mapped[str] = mapped_column(String, nullable=True, default=None)
    summarized_text: Mapped[str] = mapped_column(String, nullable=True, default=None) 
    summarized_text_audio_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    summarized_text_audio_duration_seconds: Mapped[int] = mapped_column(Integer, nullable=True, default=None)
    topics: Mapped[List[str]] = mapped_column(JSONB, nullable=True, default=None)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)


# Automatically set hash when content is modified
@event.listens_for(WebPageSummary.normalized_url, 'set')
def web_page_summary_set_content_hash(target: WebPageSummary, value, oldvalue, initiator):
    target.normalized_url_hash = normalized_url_hash(value)

# Set hash before insert/update
@event.listens_for(WebPageSummary, 'before_insert')
@event.listens_for(WebPageSummary, 'before_update')
def web_page_summary_ensure_hash(mapper, connection, target: WebPageSummary):
    if target.normalized_url:
        target.normalized_url_hash = normalized_url_hash(target.normalized_url)
    
