from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict

class FAWebPage(BaseModel):
    normalized_url_hash: str
    normalized_url: str
    url: str
    status_code: int
    headers: dict[str, str]|None
    content: bytes|None
    content_type: str|None
    content_charset: str|None

    metadata_title: str|None
    metadata_description: str|None
    metadata_image_url: str|None
    metadata_published_at: datetime|None

    canonical_url: str|None
    outgoing_urls: list[str]|None
    visible_text: str|None
    sitemap_urls: list[str]|None
    robots_content: list[str]|None
    text_chunks: list[str]|None

class FAWebPageChannel(BaseModel):
    normalized_url_hash: str
    normalized_url: str
    url: str
    name: str | None
    description: str | None
    image_url: str | None
    enabled: bool | None
    scraper_seeds: List[Dict[str, str]] | None
    include_path_patterns: List[str] | None
    exclude_path_patterns: List[str] | None
    scraper_follow_web_page_links: bool | None
    scraper_follow_feed_links: bool | None
    scraper_follow_sitemap_links: bool | None

class FADomainStats(BaseModel):
    domain: str
    frequent_subpaths: dict[str, int]

class FAScraperStats(BaseModel):
    queued_urls_count: int
    requested_urls_count: int
    success_urls_count: int
    error_urls_count: int
    skipped_urls_count: int
    domain_stats: Dict[str, FADomainStats]
    

class FAFrontendAudio(BaseModel):
    normalized_url_hash: str
    normalized_url: str
    title: str|None
    description: str|None
    audio_text: str|None
    image_url: str|None
    audio_url: str|None
    author_id: str|None
    channel_id: str|None
    published_at: datetime|None
    uploaded_at: datetime|None
    duration: int|None
    topics: list[str]|None
    similarity_score: float|None = None

    

class FAFrontendAudioSearchResult(BaseModel):
    normalized_url_hash: str
    similarity_score: float

class FAFrontendAudioPlay(BaseModel):
    user_id: str
    audio_id: str
    played_at: datetime
    duration_seconds: int
