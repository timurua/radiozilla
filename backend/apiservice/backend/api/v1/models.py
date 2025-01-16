from pydantic import BaseModel
from datetime import datetime

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
    sitemap_url: str|None
    robots_content: list[str]|None
    text_chunks: list[str]|None

class FAWebPageSeed(BaseModel):
    normalized_url_hash: str
    normalized_url: str
    url: str
    max_depth: int
    url_patterns: list[str] | None
    use_headless_browser: bool
    allowed_domains: list[str] | None     

class FADomainStats(BaseModel):
    domain: str
    frequent_subpaths: dict[str, int]

class FAScraperStats(BaseModel):
    initiated_urls_count: int
    requested_urls_count: int
    completed_urls_count: int
    domain_stats: dict[str, FADomainStats]    

class FAFrontendAudioSearchResult(BaseModel):
    normalized_url_hash: str
    similarity_score: float
