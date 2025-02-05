from sqlalchemy import text as sql_text, select, insert

from pysrc.scraper.image import thumbnailed_image_height, thumbnailed_image_width
from ..db.web_page import WebPage, WebPageJob, WebPageJobState, WebImage
from pyminiscraper.model import ScraperWebPage, ScraperUrl
from pyminiscraper.config import ScraperCallback, ScraperContext
import logging
from typing import Optional, override
from pyminiscraper.url import normalized_url_hash
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Callable
from ..db.service import WebPageService, WebPageJobService, WebImageService
from ..db.database import Database
from datetime import datetime
from ..db.web_page import is_state_good_for_publishing
from .minhash import MinHasher
import asyncio
import concurrent.futures
from PIL import Image, ImageOps
import io

logger = logging.getLogger("scraper_store")

def drop_time_zone(dt: datetime|None) -> datetime|None:
    if dt is None:
        return None
    return dt.replace(tzinfo=None)

def compute_similarity(existing_web_page: WebPage, new_web_page: WebPage)-> float:
    min_hasher = MinHasher(num_permutations=256)
    existing_signature = min_hasher.compute_signature(existing_web_page.content.decode("utf-8"))
    new_signature = min_hasher.compute_signature(new_web_page.content.decode("utf-8"))
    return MinHasher.estimate_similarity(existing_signature, new_signature)
       
class ServiceScraperStore(ScraperCallback):

    def __init__(self, on_web_page: Callable[[WebPage],None]|None, rerequest_after_hours: int=24*30):  
        self.rerequest_after_hours = rerequest_after_hours
        self._on_web_page = on_web_page        


    @override
    async def on_web_page(self, context: ScraperContext, request: ScraperUrl, response: ScraperWebPage) -> None:
        async with Database.get_session() as session:            
            
            existing_web_page_job = await WebPageJobService(session).find_by_url(response.normalized_url)
            if existing_web_page_job is not None and not is_state_good_for_publishing(existing_web_page_job.state):
                return
            
            existing_web_page = await WebPageService(session).find_by_url(response.normalized_url)
            
            new_web_page = WebPage(
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
            if self._on_web_page:
                self._on_web_page(new_web_page)
            
            if existing_web_page is None:
                await WebPageService(session).upsert(new_web_page)
                await WebPageJobService(session).upsert(WebPageJob(
                        normalized_url = response.normalized_url,
                        state = WebPageJobState.SCRAPED_NEED_SUMMARIZING,                
                    ))
                if response.metadata_image_url:
                    await self.request_and_store_image(session, context, response.metadata_image_url)                
                return
            
            similarity = compute_similarity(existing_web_page, new_web_page)
                
            if similarity < 0.8:
                await WebPageService(session).upsert(new_web_page)                
                await WebPageJobService(session).upsert(WebPageJob(
                    normalized_url = response.normalized_url,
                    state = WebPageJobState.SCRAPED_NEED_SUMMARIZING,                
                ))
                if response.metadata_image_url:
                    await self.request_and_store_image(session, context, response.metadata_image_url)
                
    async def request_and_store_image(self, session: AsyncSession, context: ScraperContext, url: str) -> None:
        try:            
            async with context.do_request(url) as http_response:
                if not http_response.status == 200:
                    logger.error(f"Error fetching image: {url}: {http_response.status}")
                    raise Exception(f"Error fetching image: {url}: {http_response.status}")
                
                img_bytes = await http_response.read()
                if img_bytes is None:
                    logger.error(f"Error fetching image: {url}: No content")
                    raise Exception(f"Error fetching image: {url}: No content")
                
                img_file = Image.open(io.BytesIO(img_bytes))
                img = img_file.convert("RGBA")            
                thumbnail = ImageOps.fit(img, (thumbnailed_image_width, thumbnailed_image_height), Image.Resampling.LANCZOS)            
                output_io = io.BytesIO()
                thumbnail.save(output_io, format="PNG")
                
                await WebImageService(session).upsert(
                    WebImage(
                        url=url,                        
                        width=thumbnailed_image_width,
                        height=thumbnailed_image_height,
                        source_width = img.size[0],
                        source_height = img.size[1],
                        image_bytes = output_io.getvalue()
                    ))
                
        except Exception as e: 
            logger.info(f"Failed to store image: {url}")        
        

    @override
    async def load_web_page_from_cache(self, normalized_url: str) -> Optional[ScraperWebPage]:        
        async with Database.get_session() as session:
            web_page = await WebPageService(session).find_by_url(normalized_url)            
            if web_page is not None:
                if web_page.requested_at and (datetime.now() - web_page.requested_at).total_seconds() > self.rerequest_after_hours * 60 * 60:
                    return None
                
            if web_page is None:
                return None
            
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
