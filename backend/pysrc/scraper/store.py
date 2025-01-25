from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text as sql_text, select, insert
from ..db.web_page import WebPage
from pyminiscraper.store import ScraperStore, ScraperStoreFactory
from pyminiscraper.model import ScraperWebPage
import logging
from typing import Optional
from pyminiscraper.url import normalized_url_hash
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Callable, Awaitable
from ..db.service import WebPageService
from datetime import datetime

logger = logging.getLogger("scraper_store")

def drop_time_zone(dt: datetime|None) -> datetime|None:
    if dt is None:
        return None
    return dt.replace(tzinfo=None)
       
class ServiceScraperStore(ScraperStore):    

    def __init__(self, get_db_session: Callable[[], Awaitable[AsyncSession]], rerequest_after_hours: int=24):  
        self.get_db_session = get_db_session 
        self.rerequest_after_hours = rerequest_after_hours

    async def store_page(self, response: ScraperWebPage) -> None:
        session = await self.get_db_session()
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
                requested_at = drop_time_zone(response.requested_at),

                metadata_title = response.metadata_title,
                metadata_description = response.metadata_description,
                metadata_image_url = response.metadata_image_url,
                metadata_published_at = drop_time_zone(response.metadata_published_at),

                canonical_url = response.canonical_url,
                outgoing_urls = response.outgoing_urls,
                visible_text = response.visible_text,
                sitemap_urls = response.sitemap_urls,
                feed_urls = response.feed_urls, 
                robots_content = response.robots_content,
                text_chunks = response.text_chunks
            ))
        except Exception as e:
            logger.error(f"Error upserting page from db: {e}")
            return None            
        finally:
            await session.close()            

    async def load_page(self, normalized_url: str) -> Optional[ScraperWebPage]:        
        session = await self.get_db_session()
        try:
            web_page = await WebPageService(session).find_web_page_by_url(normalized_url)
            if web_page is not None:
                if web_page.requested_at and (datetime.now() - web_page.requested_at).total_seconds() > self.rerequest_after_hours * 60 * 60:
                    return None
                
            if web_page:
                return ScraperWebPage(
                    status_code = web_page.status_code,
                    url = web_page.url,
                    normalized_url = web_page.normalized_url,
                    headers = web_page.headers,
                    content = web_page.content,
                    content_type = web_page.content_type,
                    content_charset = web_page.content_charset,
                    requested_at= web_page.requested_at,

                    metadata_title = web_page.metadata_title,
                    metadata_description = web_page.metadata_description,
                    metadata_image_url = web_page.metadata_image_url,
                    metadata_published_at = web_page.metadata_published_at,

                    canonical_url = web_page.canonical_url,
                    outgoing_urls = web_page.outgoing_urls,
                    visible_text = web_page.visible_text,
                    sitemap_urls = web_page.sitemap_urls,
                    feed_urls = web_page.feed_urls,
                    robots_content = web_page.robots_content,
                    text_chunks = web_page.text_chunks
                )
            return None
        except Exception as e:
            logger.error(f"Error loading page from db: {e}")
            return None
        finally:
            await session.close()

    
def get_scraper_store_factory(get_db_session: Callable[[], Awaitable[AsyncSession]]) -> ScraperStoreFactory:    
    class ServiceScraperStoreFactory(ScraperStoreFactory):
        def new_store(self) -> ScraperStore:
            return ServiceScraperStore(get_db_session)
    return ServiceScraperStoreFactory()
