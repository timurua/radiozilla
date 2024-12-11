import time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text as sql_text, select
from sentence_transformers import SentenceTransformer
from ..models.web_page import WebPage
from pywebscraper.scrape_store import ScraperStore
from pywebscraper.scrape_model import HttpResponse
import logging
from typing import Optional
from pywebscraper.url_normalize import normalized_url_hash

class WebPageService:
    _model = None
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self._start_time = time.time()
        self._version = "1.0.0"
        logging.info("Web page service initialized")

    def get_scraper_store(self) -> ScraperStore:
        service = self
        class InMemoryScraperStore(ScraperStore):
            
            async def store_url_response(self, response: HttpResponse) -> None:
                await service.upsert_web_page(WebPage(
                    status_code = response.status_code,
                    url = response.url,
                    normalized_url = response.normalized_url,
                    normalized_url_hash = response.normalized_url_hash,
                    headers = response.headers,
                    content = response.content,
                    updated_at = response.updated_at,
                    visible_text = response.visible_text,
                    title = response.title,
                    content_type = response.content_type,
                    content_date = response.content_date
                ))

            async def load_url_response(self, normalized_url: str) -> Optional[HttpResponse]:
                web_page = await service.find_web_page_by_url(normalized_url)
                if web_page:
                    return HttpResponse(
                        status_code = web_page.status_code,
                        url = web_page.url,
                        normalized_url = web_page.normalized_url,
                        normalized_url_hash = web_page.normalized_url_hash,
                        headers = web_page.headers,
                        content = web_page.content,
                        updated_at = web_page.updated_at,
                        visible_text = web_page.visible_text,
                        title = web_page.title,
                        content_type = web_page.content_type,
                        content_date = web_page.content_date
                    )
                return None
                


    async def upsert_web_page(self, web_page: WebPage) -> None:
        async with self.session.begin():
            logging.info(f"Inserting web page for url: {web_page.url}")
            await self.session.merge(web_page)

    async def find_web_page_by_url(self, normalized_url: str) -> WebPage:
        normalized_url_hash = normalized_url_hash(normalized_url)
        stmt = select(WebPage).where(WebPage.normalized_url_hash == normalized_url_hash)
        result = await self.session.execute(stmt)
        return result.scalar_one()
    
