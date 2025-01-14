import time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text as sql_text, select, insert
from ..db.web_page import WebPage, WebPageSummary
from pyminiscraper.store import ScraperStore, ScraperStoreFactory
from pyminiscraper.model import ScraperWebPage
import logging
from typing import Optional
from pyminiscraper.url import normalized_url_hash
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Callable, Awaitable

class WebPageService:
    _model = None
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.logger = logging.getLogger("web_page_service")

    async def upsert_web_page(self, web_page: WebPage) -> None:
        async with self.session.begin():
            self.logger.info(f"Inserting web page for url: {web_page.url}")
            await self.session.merge(web_page)
        

    async def find_web_page_by_url(self, normalized_url: str) -> WebPage|None:
        hash = normalized_url_hash(normalized_url)
        stmt = select(WebPage).where(WebPage.normalized_url_hash == hash)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def find_web_pages_by_url_prefix(self, url_prefix: str, callback: Callable[[WebPage], Awaitable[None]]) -> None:
        stmt = select(WebPage).where(WebPage.normalized_url.startswith(url_prefix))        
        with await self.session.stream(stmt) as stream:
            async for web_page in stream.scalars():
                await callback(web_page)
    
class WebPageSummaryService:
    _model = None
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.logger = logging.getLogger("web_page_summary_service")

    async def upsert_web_page_summary(self, web_page_summary: WebPageSummary) -> None:
        async with self.session.begin():
            self.logger.info(f"Inserting web page summary for url: {web_page_summary.normalized_url}")
            await self.session.merge(web_page_summary)
        

    async def find_web_page_summary_by_url(self, normalized_url: str) -> WebPageSummary|None:
        hash = normalized_url_hash(normalized_url)
        stmt = select(WebPageSummary).where(WebPageSummary.normalized_url_hash == hash)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def find_web_page_summaries_without_audio(self, callback: Callable[[WebPageSummary], Awaitable[None]]) -> None:
        stmt = select(WebPageSummary).where(WebPageSummary.summarized_text_audio_url == None)
        with await self.session.stream(stmt) as stream:
            async for web_page in stream.scalars():
                await callback(web_page)
    

