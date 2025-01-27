from sqlalchemy import text as sql_text, select, insert
from ..db.web_page import WebPage, WebPageJob, WebPageJobState
from pyminiscraper.store import ScraperStore, ScraperStoreFactory
from pyminiscraper.model import ScraperWebPage
import logging
from typing import Optional
from pyminiscraper.url import normalized_url_hash
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Callable
from ..db.service import WebPageService, WebPageJobService
from ..db.database import Database
from datetime import datetime

logger = logging.getLogger("scraper_store")

def drop_time_zone(dt: datetime|None) -> datetime|None:
    if dt is None:
        return None
    return dt.replace(tzinfo=None)
       
class ServiceScraperStore(ScraperStore):    

    def __init__(self, on_web_page: Callable[[WebPage],None], rerequest_after_hours: int=24*30):  
        self.rerequest_after_hours = rerequest_after_hours
        self._on_web_page = on_web_page

    async def store_page(self, response: ScraperWebPage) -> None:
        async with await Database.get_session() as session:

            web_page = WebPage(
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
            )
            self._on_web_page(web_page)
            await WebPageService(session).upsert(web_page)            
            
            await WebPageJobService(session).upsert(WebPageJob(
                normalized_url = response.normalized_url,
                state = WebPageJobState.SCRAPED_NEED_SUMMARIZING,                
            ))



    async def load_page(self, normalized_url: str) -> Optional[ScraperWebPage]:        
        async with await Database.get_session() as session:
            web_page = await WebPageService(session).find_by_url(normalized_url)            
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

    
def get_scraper_store_factory(on_web_page: Callable[[WebPage],None]) -> ScraperStoreFactory:    
    class ServiceScraperStoreFactory(ScraperStoreFactory):
        def new_store(self) -> ScraperStore:
            return ServiceScraperStore(on_web_page)
    return ServiceScraperStoreFactory()
