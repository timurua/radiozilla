import time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text as sql_text, select, insert
from sentence_transformers import SentenceTransformer
from ..models.web_page import WebPage
from pywebscraper.store import ScraperStore, ScraperStoreFactory
from pywebscraper.model import ScraperWebPage
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

    async def store_page(self, response: ScraperWebPage) -> None:
        session = await get_db_session()
        try:
            await WebPageService(session).upsert_web_page(WebPage(
                status_code = response.status_code,
                url = response.url,
                normalized_url = response.normalized_url,
                normalized_url_hash = response.normalized_url_hash,
                headers = response.headers,
                content = response.content,
                content_type = response.content_type,
                content_charset = response.content_charset,

                metadata_title = response.metadata_title,
                metadata_description = response.metadata_description,
                metadata_image_url = response.metadata_image_url,
                metadata_published_at = response.metadata_published_at,

                canonical_url = response.canonical_url,
                outgoing_urls = response.outgoing_urls,
                visible_text = response.visible_text,
                sitemap_url = response.sitemap_url,
                robots_content = response.robots_content,
                text_chunks = response.text_chunks
            ))
        finally:
            await session.close()            

    async def load_page(self, normalized_url: str) -> Optional[ScraperWebPage]:
        session = await get_db_session()
        try:
            web_page = await WebPageService(session).find_web_page_by_url(normalized_url)
            if web_page:
                return ScraperWebPage(
                    status_code = web_page.status_code,
                    url = web_page.url,
                    normalized_url = web_page.normalized_url,
                    headers = web_page.headers,
                    content = web_page.content,
                    content_type = web_page.content_type,
                    content_charset = web_page.content_charset,

                    metadata_title = web_page.metadata_title,
                    metadata_description = web_page.metadata_description,
                    metadata_image_url = web_page.metadata_image_url,
                    metadata_published_at = web_page.metadata_published_at,

                    canonical_url = web_page.canonical_url,
                    outgoing_urls = web_page.outgoing_urls,
                    visible_text = web_page.visible_text,
                    sitemap_url = web_page.sitemap_url,
                    robots_content = web_page.robots_content,
                    text_chunks = web_page.text_chunks
                )
            return None
        finally:
            await session.close()

    
def get_scraper_store_factory() -> ScraperStoreFactory:
    class ServiceScraperStoreFactory(ScraperStoreFactory):
        def new_store(self) -> ScraperStore:
            return ServiceScraperStore()
    return ServiceScraperStoreFactory()
