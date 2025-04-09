import pickle
from sqlalchemy import Integer, DateTime, event,LargeBinary, Boolean, Any, Tuple
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import String
from typing import List, Dict, Optional
from datetime import datetime
from .base import TimestampModel
from pyminiscraper.url import normalized_url_hash, normalize_url
from enum import Enum
from dataclasses import dataclass, asdict

class WebPageSeedType(str, Enum):
    HTML = "HTML"
    SITEMAP = "SITEMAP"
    FEED = "FEED"
    
@dataclass
class WebPageSeed:
    url: str
    type: WebPageSeedType
    
    def to_dict(self):
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: dict):
        return cls(**data)
    
def web_page_seed_from_dict(data: list[dict[str, str]]) -> list[WebPageSeed]:
    return [WebPageSeed.from_dict(d) for d in data]

def web_page_seed_to_dict(data: list[WebPageSeed]) -> list[dict[str, str]]:
    return [d.to_dict() for d in data]
    
    
    

class WebPageChannel(TimestampModel):
    __tablename__ = "web_page_channels"

    normalized_url_hash: Mapped[str] = mapped_column(String(32), primary_key=True)    
    url: Mapped[str] = mapped_column(String)
    normalized_url: Mapped[str] = mapped_column(String)    
    name: Mapped[str] = mapped_column(String, nullable=True, default=None)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True, default=None)
    image_url: Mapped[Optional[str]] = mapped_column(String, nullable=True, default=None)
    enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    
    scraper_seeds: Mapped[List[Dict[str, str]]] = mapped_column(JSONB, nullable=True, default=None)
    include_path_patterns: Mapped[List[str]] = mapped_column(JSONB, nullable=True, default=None)
    exclude_path_patterns: Mapped[List[str]] = mapped_column(JSONB, nullable=True, default=None)
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
        
class TtsVoice(TimestampModel):
    __tablename__ = "tts_voice"
    
    id: Mapped[str] = mapped_column(String, primary_key=True)
    wav_file: Mapped[str] = mapped_column(String)
    txt_file: Mapped[str] = mapped_column(String)    
    
class WebImage(TimestampModel):
    __tablename__ = "web_images"
    
    normalized_url_hash: Mapped[str] = mapped_column(String(32), primary_key=True)  # SHA-256 hash as primary key    
    normalized_url: Mapped[str] = mapped_column(String)
    url: Mapped[str] = mapped_column(String)
        
    width: Mapped[int] = mapped_column(Integer, primary_key=True)
    height: Mapped[int] = mapped_column(Integer, primary_key=True)    

    source_width: Mapped[int] = mapped_column(Integer)
    source_height: Mapped[int] = mapped_column(Integer)
    
    image_bytes: Mapped[bytes] = mapped_column(LargeBinary, default=None)
    

# Automatically set hash when content is modified
@event.listens_for(WebImage.url, 'set')
def web_image_set_content_hash(target: WebImage, value, oldvalue, initiator):
    target.normalized_url = normalize_url(value)
    target.normalized_url_hash = normalized_url_hash(target.normalized_url)

# Set hash before insert/update
@event.listens_for(WebImage, 'before_insert')
@event.listens_for(WebImage, 'before_update')
def web_image_ensure_hash(mapper, connection, target: WebImage):
    if target.url:
        target.normalized_url = normalize_url(target.url)
        target.normalized_url_hash = normalized_url_hash(target.normalized_url) 

@dataclass
class WebPageContent:
    url: str
    normalized_url_hash: str
    normalized_url: str
    status_code: int
    headers: dict[str, str] | None
    content: bytes | None
    content_type: str | None
    content_charset: str | None
    requested_at: datetime | None
    
    metadata_title: Optional[str]
    metadata_description: Optional[str]
    metadata_image_url: Optional[str]
    metadata_published_at: Optional[datetime]

    canonical_url: str | None
    outgoing_urls: List[str] | None 
    visible_text: str | None
    sitemap_urls: List[str] | None
    feed_urls: List[str] | None
    robots_content: List[str] | None
    text_chunks: List[str] | None

    def to_bytes(self) -> bytes:
        return pickle.dumps(self)
    
    @classmethod
    def from_bytes(cls, data: bytes) -> "WebPageContent":
        return pickle.loads(data)


class WebPage(TimestampModel):
    __tablename__ = "web_pages"
    
    normalized_url_hash: Mapped[str] = mapped_column(String(32), primary_key=True)  # SHA-256 hash as primary key
    normalized_url: Mapped[str] = mapped_column(String)
    url: Mapped[str] = mapped_column(String)
    status_code: Mapped[int] = mapped_column(Integer)
    requested_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)
    channel_normalized_url_hash: Mapped[str] = mapped_column(String(32))    
    
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
        
class WebPageJobState(Enum):
    NEED_SCRAPING = 0
    SCRAPED_NEED_SUMMARIZING = 1
    SUMMARIZED_NEED_TTSING = 2
    TTSED_NEED_PUBLISHING = 3        
    PUBLISHED = 4
    NEED_UNPUBLISHING = 5
    UNPUBLISHED = 6


def is_state_good_for_publishing(state: "WebPageJobState") -> bool:
    return state != WebPageJobState.NEED_UNPUBLISHING and state != WebPageJobState.UNPUBLISHED
        
class WebPageJob(TimestampModel):
    __tablename__ = "web_page_jobs"
    
    normalized_url_hash: Mapped[str] = mapped_column(String(32), primary_key=True)
    normalized_url: Mapped[str] = mapped_column(String)    
    state: Mapped[WebPageJobState] = mapped_column(nullable=False)
    context: Mapped[Dict[str, str]] = mapped_column(JSONB, nullable=False, default={})       
    
    
# Automatically set hash when content is modified
@event.listens_for(WebPageJob.normalized_url, 'set')
def web_page_job_set_content_hash(target: WebPageJob, value, oldvalue, initiator):
    target.normalized_url_hash = normalized_url_hash(value)

# Set hash before insert/update
@event.listens_for(WebPageJob, 'before_insert')
@event.listens_for(WebPageJob, 'before_update')
def web_page_job_ensure_hash(mapper, connection, target: WebPageJob):
    if target.normalized_url:
        target.normalized_url_hash = normalized_url_hash(target.normalized_url)        


class WebPageSummary(TimestampModel):
    __tablename__ = "web_page_summaries"
    
    normalized_url_hash: Mapped[str] = mapped_column(String(32), primary_key=True)
    normalized_url: Mapped[str] = mapped_column(String)
    
    channel_normalized_url_hash: Mapped[str] = mapped_column(String(32))

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
    
