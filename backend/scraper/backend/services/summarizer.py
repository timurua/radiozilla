import time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text as sql_text, select
from pywebscraper.scraper import Scraper, ScraperConfig, ScraperUrl, ScraperCallback
from pywebscraper.stats import ScraperStats, DomainStats
from urllib.parse import urlparse
from .web_page import get_scraper_store_factory
import logging
from ..models.web_page import WebPageSummary, WebPageChunk
from pywebscraper.url_normalize import normalized_url_hash, normalize_url
from ..services.web_page import WebPageService

logger = logging.getLogger("summarizer_service")

class SummarizerService:
    
    def __init__(self, web_page_service: WebPageService):
        logger.info("Summarizer service initialized")
        self.web_page_service = web_page_service

    async def run(self, url: str) -> WebPageSummary|None:

        web_page = await self.web_page_service.find_web_page_by_url(url)
        if not web_page:
            logger.error(f"Web page not found for url: {url}")
            return None
        
        for chunk in web_page.text_chunks:
            web_page_chunk = WebPageChunk(
                web_page_id = web_page.id,
                content = chunk,
            )
            await self.web_page_service.upsert_web_page_chunk(web_page_chunk)

        return None