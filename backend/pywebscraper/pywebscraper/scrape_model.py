from typing import Dict
from dataclasses import dataclass
from datetime import datetime
from .scrape_hash import generate_url_safe_id
from .url_normalize import normalize_url

class ScraperUrl:
    def __init__(self, url: str, *, no_cache: bool = False, max_depth: int = 16):
        self.url = url
        if url:
            self.normalized_url = normalize_url(
                url)
        else:
            self.normalized_url = ""
        self.no_cache = no_cache
        self.max_depth = max_depth

    @staticmethod
    def create_terminal():
        return ScraperUrl("", max_depth = -1)

    def is_terminal(self):
        return self.max_depth < 0

@dataclass
class HttpResponse:
    """Container for HTTP response data"""
    status_code: int
    url: str
    normalized_url: str
    normalized_url_hash: str
    headers: Dict[str, str] | None
    content: bytes | None
    updated_at: datetime
    visible_text: str | None
    title: str | None
    content_type: str | None
    content_date: datetime | None


    def __init__(self, 
                status_code: int,
                url: str,
                normalized_url: str,
                normalized_url_hash: str | None,
                headers: Dict[str, str] | None,
                content: bytes | None,
                updated_at: datetime | None = None,
                visible_text: str | None = None,
                content_type: str | None = None,
                title: str | None = None,
                content_date: datetime | None = None) -> None:
        self.status_code = status_code
        self.url = url
        self.normalized_url = normalized_url
        self.normalized_url_hash = normalized_url_hash if normalized_url_hash is not None else generate_url_safe_id(normalized_url)
        self.headers = headers
        self.content = content 
        self.visible_text = visible_text
        self.title = title
        self.content_type = content_type
        self.content_date = content_date
        self.updated_at = updated_at if updated_at is not None else datetime.now()