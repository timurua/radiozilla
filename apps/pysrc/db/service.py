from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text as sql_text, select, func

from pysrc.db.user import Audio, AudioContent, Channel
from pysrc.db.upserter import Upserter
from pysrc.config.rzconfig import RzConfig
from pysrc.dfs.dfs import FRONTEND_IMAGES, WEB_IMAGES, WEB_PAGES_CONTENT, DFSClient
from .web_page import WebImageContent, WebPage, WebPageContent, WebPageChannel, WebImage
import logging
from pyminiscraper.url import normalized_url_hash
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Callable, Awaitable, Optional
from ..summarizer.texts import EmbeddingService
from dataclasses import dataclass
from sqlalchemy.orm import Mapped
from datetime import datetime
import pickle
import hashlib
import base64

from sqlalchemy.dialects.postgresql import insert as pg_insert

class ChannelService:
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.logger = logging.getLogger("channel_service")

    async def upsert(self, channel: Channel) -> None:
        await Upserter[Channel](self.session).upsert(channel)
        
    async def find_by_id(self, id: int) -> Channel|None:
        stmt = select(Channel).where(Channel.id == id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def find_by_web_page_channel_id(self, web_page_channel_id: int) -> Channel|None:
        stmt = select(Channel).where(Channel.web_page_channel_id == web_page_channel_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def find_all(self) -> list[Channel]:
        stmt = select(Channel)
        result = await self.session.scalars(stmt)
        channels = result.all()
        return list(channels)


class WebPageChannelService:
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.logger = logging.getLogger("web_page_channel_service")

    async def upsert(self, web_page_channel: WebPageChannel) -> WebPageChannel:
        return await Upserter[WebPageChannel](self.session).upsert(web_page_channel)        

    async def find_by_url(self, normalized_url: str) -> WebPageChannel|None:
        hash = normalized_url_hash(normalized_url)
        return await self.find_by_hash(hash)
    
    async def find_by_url(self, url: str) -> WebPageChannel|None:
        hash = normalized_url_hash(url)
        stmt = select(WebPageChannel).where(WebPageChannel.normalized_url_hash == hash)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def find_by_hash(self, hash: str) -> WebPageChannel|None:
        stmt = select(WebPageChannel).where(WebPageChannel.normalized_url_hash == hash)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def find_all(self) -> list[WebPageChannel]:
        stmt = select(WebPageChannel)
        result = await self.session.scalars(stmt)
        channels = result.all()
        return list(channels)

class WebImageService:
    
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.logger = logging.getLogger("web_page_service")

    async def upsert(self, web_image: WebImage, web_image_content: WebImageContent) -> None:
        await DFSClient(RzConfig.instance()).upload_buffer(
            WEB_IMAGES, 
            web_image.normalized_url_hash,
            web_image_content.to_bytes(),
        )
        await Upserter[WebImage](self.session).upsert(web_image)
        
    async def find_by_url(self, normalized_url: str) -> WebImage|None:
        hash = normalized_url_hash(normalized_url)
        stmt = select(WebImage).execution_options(readonly=True) \
            .where(WebImage.normalized_url_hash == hash)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_content(self, web_image: WebImage) -> WebImageContent:
        dfs_client = DFSClient(RzConfig.instance())
        content = await dfs_client.download_buffer(
            WEB_IMAGES, 
            web_image.normalized_url_hash)
        return WebImageContent.from_bytes(content)   
    
    
class FrontendImageService:
    def __init__(self) -> None:
        self.logger = logging.getLogger("frontend_image_service")

    async def upsert(self, web_image: WebImage, web_image_content: WebImageContent) -> None|str:
        dfs_client = DFSClient(RzConfig.instance())                
        if web_image_content.content is None:
            self.logger.error(f"Web image content is None for {web_image.normalized_url}")
            return None
        sha256_hash = hashlib.sha256(web_image_content.content).digest()
        content_hash_b64 = base64.urlsafe_b64encode(sha256_hash).decode('ascii').rstrip('=')
        self.logger.info(f"Generated content hash: {content_hash_b64}")
        
        dfs_client = DFSClient(RzConfig.instance())
        image_url =await dfs_client.upload_buffer(
            FRONTEND_IMAGES,
            content_hash_b64,
            web_image_content.content,
        )
        return image_url
            
        

    
class WebPageService:
    
    def __init__(self, session: AsyncSession)->None:
        self.session = session
        self.logger = logging.getLogger("web_page_service")

    async def upsert(self, web_page: WebPage, web_page_content: WebPageContent) -> None:
        await DFSClient(RzConfig.instance()).upload_buffer(
            WEB_PAGES_CONTENT, 
            web_page.normalized_url_hash,
            web_page_content.to_bytes(),
        )
        await Upserter[WebPage](self.session).upsert(web_page)        
        

    async def find_by_url(self, normalized_url: str) -> WebPage|None:
        hash = normalized_url_hash(normalized_url)
        stmt = select(WebPage).execution_options(readonly=True).where(WebPage.normalized_url_hash == hash)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()    
    
    async def find_by_channel_id(self, channel_id: str, page: int = 0, page_size: int = 20) -> list[WebPage]:
        stmt = select(WebPage).execution_options(readonly=True) \
            .where(WebPage.channel_normalized_url_hash == channel_id) \
            .limit(page_size).offset(page * page_size)
        result = await self.session.scalars(stmt)
        return list(result.all())
    
    async def find_normalized_urls_by_channel(self, channel_normalized_url_hash: str) -> list[str]:
        stmt = select(WebPage.normalized_url).where(WebPage.channel_normalized_url_hash == channel_normalized_url_hash)    
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
    
    async def get_content(self, web_page: WebPage) -> WebPageContent | None:
        try:
            dfs_client = DFSClient(RzConfig.instance())
            content = await dfs_client.download_buffer(
                WEB_PAGES_CONTENT, 
                web_page.normalized_url_hash)
            return WebPageContent.from_bytes(content)
        except Exception as e:
            self.logger.error(f"Failed to get content for {web_page.normalized_url}: {e}")
            return None
    
    async def set_content(self, web_page: WebPage, content: WebPageContent) -> None:
        dfs_client = DFSClient(RzConfig.instance())
        await dfs_client.upload_buffer(
            WEB_PAGES_CONTENT, 
            web_page.normalized_url_hash,
            content.to_bytes(),
        )

   
class AudioContentService:
    _model = None
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.logger = logging.getLogger("audio_job_service")

    async def upsert(self, audio_job: AudioContent) -> None:
        await Upserter[AudioContent](self.session).upsert(audio_job)        
                
    async def find_by_url(self, normalized_url: str) -> AudioContent|None:
        hash = normalized_url_hash(normalized_url)
        stmt = select(AudioContent).execution_options(readonly=True).where(AudioContent.web_page_normalized_url_hash == hash)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    

@dataclass
class FrontendAudioSearchResult:
    normalized_url_hash: str
    similarity_score: float

    
class AudioService:
    _model = None
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.logger = logging.getLogger("audio_service")

    async def upsert(self, audio: Audio) -> None:
        self.logger.info(f"Inserting frontend audio for url: {audio.normalized_url}")            
        await Upserter[FrontendAudio](self.session).upsert(audio)        

    async def update(self, normalized_url_hash: str, modifier: Callable[[Audio], Awaitable[None]]) -> None:
        self.logger.info(f"Updating audio for url: {normalized_url_hash}")
        existing = await self.get_by_url(normalized_url_hash)
        if existing is None:
            raise ValueError(f"Audio not found for url: {normalized_url_hash}")
        
        await modifier(existing)
        await self.session.commit()        

    async def get_by_url(self, url: str) -> Audio|None:
        hash = normalized_url_hash(url)
        stmt = select(Audio).execution_options(readonly=True).where(Audio.web_page_normalized_url_hash == hash)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()        

    async def get(self, normalized_url_hash: str) -> Audio|None:
        return await self.session.get(Audio, normalized_url_hash)
    
    async def select_with_similarity(self, column: Mapped[Optional[list[float]]], limit: int, text_embeddings: list[float]) -> list[FrontendAudioSearchResult]:
        similarity_expr = (
            func.cosine_distance(column, text_embeddings)
        ).label("similarity_score")
        
        stmt = select(
            Audio.web_page_normalized_url_hash,
            similarity_expr
        ).order_by(
            similarity_expr.asc()
        ).limit(int(limit))
        results = await self.session.execute(stmt)
        similarity_results = [
            FrontendAudioSearchResult(
                normalized_url_hash=row.normalized_url_hash,
                similarity_score=row.similarity_score
            )
            for row in results
        ]
        return similarity_results
    

    




