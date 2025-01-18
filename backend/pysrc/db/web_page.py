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

class WebPageSeed(TimestampModel):
    __tablename__ = "web_page_seeds"

    normalized_url_hash: Mapped[str] = mapped_column(String(64), primary_key=True)  # SHA-256 hash as primary key
    normalized_url: Mapped[str] = mapped_column(String)
    url: Mapped[str] = mapped_column(String)
    max_depth: Mapped[int] = mapped_column(Integer)
    url_patterns: Mapped[List[str]] = mapped_column(JSONB, nullable=True, default=None)
    use_headless_browser: Mapped[bool] = mapped_column(Boolean, default=False)
    allowed_domains: Mapped[List[str]] = mapped_column(JSONB, nullable=True, default=None)
        
# Automatically set hash when content is modified
@event.listens_for(WebPageSeed.url, 'set')
def set_content_hash(target: WebPageSeed, value, oldvalue, initiator):
    target.normalized_url = normalize_url(value)
    target.normalized_url_hash = normalized_url_hash(target.normalized_url)

# Set hash before insert/update
@event.listens_for(WebPageSeed, 'before_insert')
@event.listens_for(WebPageSeed, 'before_update')
def ensure_hash(mapper, connection, target: WebPageSeed):
    if target.url:
        target.normalized_url = normalize_url(target.url)
        target.normalized_url_hash = normalized_url_hash(target.normalized_url)


class WebPage(TimestampModel):
    __tablename__ = "web_pages"
    
    normalized_url_hash: Mapped[str] = mapped_column(String(64), primary_key=True)  # SHA-256 hash as primary key
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
    robots_content: Mapped[List[str]] = mapped_column(JSONB, nullable=True, default=None)
    text_chunks: Mapped[List[str]] = mapped_column(JSONB, nullable=True, default=None)
    
# Automatically set hash when content is modified
@event.listens_for(WebPage.url, 'set')
def set_content_hash(target: WebPage, value, oldvalue, initiator):
    target.normalized_url = normalize_url(value)
    target.normalized_url_hash = normalized_url_hash(target.normalized_url)

# Set hash before insert/update
@event.listens_for(WebPage, 'before_insert')
@event.listens_for(WebPage, 'before_update')
def ensure_hash(mapper, connection, target: WebPage):
    if target.url:
        target.normalized_url = normalize_url(target.url)
        target.normalized_url_hash = normalized_url_hash(target.normalized_url)


class WebPageSummary(TimestampModel):
    __tablename__ = "web_page_summaries"
    
    normalized_url_hash: Mapped[str] = mapped_column(String(64), primary_key=True)  # SHA-256 hash as primary key
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
def set_content_hash(target: WebPageSummary, value, oldvalue, initiator):
    target.normalized_url_hash = normalized_url_hash(value)

# Set hash before insert/update
@event.listens_for(WebPageSummary, 'before_insert')
@event.listens_for(WebPageSummary, 'before_update')
def ensure_hash(mapper, connection, target: WebPageSummary):
    if target.normalized_url:
        target.normalized_url_hash = normalized_url_hash(target.normalized_url)
    
class WebPageSummarizationRule(TimestampModel):
    __tablename__ = "web_page_summarization_rules"
    
    normalized_url_prefix_hash: Mapped[str] = mapped_column(String(64), primary_key=True)  # SHA-256 hash as primary key
    normalized_url_prefix: Mapped[str] = mapped_column(String)

# Automatically set hash when content is modified
@event.listens_for(WebPageSummarizationRule.normalized_url_prefix, 'set')
def set_content_hash(target: WebPageSummarizationRule, value, oldvalue, initiator):
    target.normalized_url_prefix_hash = normalized_url_hash(value)

# Set hash before insert/update
@event.listens_for(WebPageSummarizationRule, 'before_insert')
@event.listens_for(WebPageSummarizationRule, 'before_update')
def ensure_hash(mapper, connection, target: WebPageSummarizationRule):
    if target.normalized_url_prefix:
        target.normalized_url_prefix_hash = normalized_url_hash(target.normalized_url_prefix)

class WebPageChunk(TimestampModel):
    __tablename__ = "web_page_chunks"
    
    content_hash: Mapped[str] = mapped_column(String(64), primary_key=True)  # SHA-256 hash as primary key
    content: Mapped[str] = mapped_column(String)
    web_page_id: Mapped[str] = mapped_column(String)
    embedding_mlml6v2: Mapped[list[float]] = mapped_column(Vector(dim=384))
    

@event.listens_for(WebPageChunk.content, 'set')
def set_content_hash(target: WebPageChunk, value, oldvalue, initiator):
    target.content_hash = generate_url_safe_id(value)

# Set hash before insert/update
@event.listens_for(WebPageChunk, 'before_insert')
@event.listens_for(WebPageChunk, 'before_update')
def ensure_hash(mapper, connection, target: WebPageSummarizationRule):
    if target.content:
        target.content_hash = generate_url_safe_id(target.content)

async def create_vector_indexes(conn: AsyncConnection):
    await create_vector_index(conn, "web_page_chunks", "embedding_mlml6v2", 100)


