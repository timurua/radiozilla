from httpx import request
from pysrc.scraper.image import thumbnailed_image_height, thumbnailed_image_width
from ..db.web_page import WebImageContent, WebPage, WebPageContent, WebPageJob, WebPageJobState, WebImage
from pyminiscraper.model import ScraperWebPage, ScraperUrl
from pyminiscraper.config import ScraperCallback, ScraperContext
from pyminiscraper.url import normalize_url, normalized_url_hash
import logging
from typing import Awaitable, Optional, override
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Callable
from ..db.service import WebPageService, WebPageJobService, WebImageService
from ..db.database import Database
from datetime import datetime, timezone
from ..db.web_page import is_state_good_for_publishing
from .minhash import MinHasher
import asyncio
import concurrent.futures
from PIL import Image, ImageOps
import io
from datetime import datetime

logger = logging.getLogger("scraper_store")

def drop_time_zone(dt: datetime|None) -> datetime|None:
    """Convert datetime to UTC and drop timezone information."""
    if dt is None:
        return None
    if dt.tzinfo is not None:
        dt = dt.astimezone(timezone.utc)
    return dt.replace(tzinfo=None)

def compute_similarity(existing_web_page: WebPage, existing_web_page_content: WebPageContent, new_web_page: WebPage, new_web_page_content: WebPageContent)-> float:
    min_hasher = MinHasher(num_permutations=256)
    existing_signature = min_hasher.compute_signature((existing_web_page_content.content or b"").decode("utf-8"))
    new_signature = min_hasher.compute_signature((new_web_page_content.content or b"").decode("utf-8"))
    return MinHasher.estimate_similarity(existing_signature, new_signature)

executor = concurrent.futures.ThreadPoolExecutor(max_workers=8)
       
class ServiceScraperStore(ScraperCallback):

    def __init__(self, on_web_page: Callable[[WebPage, WebPageContent], Awaitable[None]]|None = None, rerequest_after_hours: int=24*30) -> None:  
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
                requested_at = drop_time_zone(response.requested_at),
            )

            new_web_page_content = WebPageContent(
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
                await self._on_web_page(new_web_page, new_web_page_content)
            
            if existing_web_page is None:
                await WebPageService(session).upsert(new_web_page, new_web_page_content)
                await WebPageJobService(session).upsert(WebPageJob(
                        normalized_url = response.normalized_url,
                        state = WebPageJobState.SCRAPED_NEED_SUMMARIZING,                
                    ))
                if response.metadata_image_url:
                    await self.request_and_store_image(session, context, response.metadata_image_url)                
                return
            
            existing_web_page_content = await WebPageService(session).get_content(existing_web_page)    
            similarity = await asyncio.get_event_loop().run_in_executor(executor, compute_similarity, existing_web_page, existing_web_page_content, new_web_page, new_web_page_content)
                
            if similarity < 0.8:
                await WebPageService(session).upsert(new_web_page, new_web_page_content)                
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
                now = drop_time_zone(datetime.now(timezone.utc))

                new_web_image = WebImage(
                    url=url,                        
                    width=thumbnailed_image_width,
                    height=thumbnailed_image_height,
                    source_width = img.size[0],
                    source_height = img.size[1],
                    requested_at = now,
                )

                new_web_image_content = WebImageContent(
                    url=url,
                    normalized_url = normalize_url(url),
                    normalized_url_hash = normalized_url_hash(url),
                    content = output_io.getvalue(),
                    content_type = "image/png",
                    width=thumbnailed_image_width,
                    height=thumbnailed_image_height,
                    source_width = img.size[0],
                    source_height = img.size[1],
                    requested_at = now,
                )
                
                await WebImageService(session).upsert(
                    new_web_image, new_web_image_content)
                
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
            
            web_page_content = await WebPageService(session).get_content(web_page)
            if web_page_content is None:
                return None
            
            return ScraperWebPage(
                status_code = web_page.status_code,
                url = web_page.url,
                normalized_url = web_page.normalized_url,
                headers = web_page_content.headers,
                content = web_page_content.content,
                content_type = web_page_content.content_type,
                content_charset = web_page_content.content_charset,
                requested_at= web_page.requested_at,

                metadata_title = web_page_content.metadata_title,
                metadata_description = web_page_content.metadata_description,
                metadata_image_url = web_page_content.metadata_image_url,
                metadata_published_at = web_page_content.metadata_published_at,

                canonical_url = web_page_content.canonical_url,
                outgoing_urls = web_page_content.outgoing_urls,
                visible_text = web_page_content.visible_text,
                sitemap_urls = web_page_content.sitemap_urls,
                feed_urls = web_page_content.feed_urls,
                robots_content = web_page_content.robots_content,
                text_chunks = web_page_content.text_chunks
            )
