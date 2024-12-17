import time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text as sql_text, select
from pywebscraper.scraper import Scraper, ScraperConfig, ScraperUrl, ScraperCallback
from pywebscraper.stats import ScraperStats, DomainStats
from urllib.parse import urlparse
from .web_page import get_scraper_store_factory
import logging
from ..models.frontend import FrontendAuthor, FrontendChannel, FrontendAudio
from pywebscraper.url_normalize import normalized_url_hash, normalize_url
from ..services.web_page import WebPageService

logger = logging.getLogger("summarizer_service")

def get_default_frontend_author() -> FrontendAuthor:
    return FrontendAuthor(
        normalized_url = "https://radiozilla.com",
        name = "Radiozilla Inc",
        description = "Radiozilla author",
        image_url = None,
    )

def get_channel(url: str) -> FrontendChannel:
    normalized_url = normalize_url(url)
    return FrontendChannel( 
        normalized_url = normalized_url,
        name = f"Default author for {normalized_url}",
        description = "Creating content with summarization and audio",
        image_url = None,
    )

class FrontendService:
    
    def __init__(self, session: AsyncSession, web_page_service: WebPageService):
        logger.info("Summarizer service initialized")
        self.session = session
        self.web_page_service = web_page_service

    async def find_default_frontend_author(self) -> FrontendAuthor:
        author = get_default_frontend_author()
        stmt = select(FrontendAuthor).where(FrontendAuthor.normalized_url_hash == author.normalized_url_hash)
        result = await self.session.execute(stmt)
        if result.scalar_one_or_none() is None:
            async with self.session.begin():
                await self.session.merge(author)
        return author
    
    async def find_default_channel(self, url: str) -> FrontendAuthor:
        parsed_url = urlparse(url)
        domain_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
        channel = get_channel(domain_url)
        stmt = select(FrontendChannel).where(FrontendChannel.normalized_url_hash == channel.normalized_url_hash)
        result = await self.session.execute(stmt)
        if result.scalar_one_or_none() is None:
            async with self.session.begin():
                await self.session.merge(channel)
        return channel    

    async def upload(self, url: str) -> None:

        web_page = await self.web_page_service.find_web_page_by_url(url)
        if not web_page:
            logger.error(f"Web page not found for url: {url}")
            return None
        
        frontend_author = await self.find_default_frontend_author()
        frontend_channel = await self.find_default_channel(url)

        

        return None