import time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text as sql_text, select, insert
from sentence_transformers import SentenceTransformer
from ..models.web_page import WebPage
from pywebscraper.store import ScraperStore, ScraperStoreFactory
from pywebscraper.scrape_model import HttpResponse
import logging
from typing import Optional
from pywebscraper.url_normalize import normalized_url_hash
from ..database import get_db_session

class WebPageService:
    _model = None
    
    def __init__(self, session: AsyncSession):
        self.session = session

    async def upsert_web_page(self, web_page: WebPage) -> None:
        async with self.session.begin():
            logging.info(f"Inserting web page for url: {web_page.url}")
            await self.session.merge(web_page)
        

    async def find_web_page_by_url(self, normalized_url: str) -> WebPage|None:
        hash = normalized_url_hash(normalized_url)
        stmt = select(WebPage).where(WebPage.normalized_url_hash == hash)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
class ServiceScraperStore(ScraperStore):     

    async def store_url_response(self, response: HttpResponse) -> None:
        session = await get_db_session()
        try:
            await WebPageService(session).upsert_web_page(WebPage(
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
        finally:
            await session.close()            

    async def load_url_response(self, normalized_url: str) -> Optional[HttpResponse]:
        session = await get_db_session()
        try:
            web_page = await WebPageService(session).find_web_page_by_url(normalized_url)
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
        finally:
            await session.close()

    
def get_scraper_store_factory() -> ScraperStoreFactory:
    class ServiceScraperStoreFactory(ScraperStoreFactory):
        def new_store(self) -> ScraperStore:
            return ServiceScraperStore()
    return ServiceScraperStoreFactory()
