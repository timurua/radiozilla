from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text as sql_text, select, func

from pysrc.config.rzconfig import RzConfig
from pysrc.dfs.dfs import WEB_IMAGES, WEB_PAGES_CONTENT, DFSClient
from .web_page import WebImageContent, WebPage, WebPageContent, WebPageSummary, WebPageChannel, WebPageJob, WebPageJobState, WebImage
from .frontend import FrontendAudio, FrontendAudioPlay
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

class WebPageChannelService:
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.logger = logging.getLogger("web_page_channel_service")

    async def upsert(self, web_page_channel: WebPageChannel) -> None:
        await self.session.merge(web_page_channel, load=True)
        

    async def find_by_url(self, normalized_url: str) -> WebPageChannel|None:
        hash = normalized_url_hash(normalized_url)
        return await self.find_by_hash(hash)
    
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
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.logger = logging.getLogger("web_page_service")

    async def upsert(self, web_image: WebImage, web_image_content: WebImageContent) -> None:
        await DFSClient(RzConfig.instance()).upload_buffer(
            WEB_IMAGES, 
            web_image.normalized_url_hash,
            web_image_content.to_bytes(),
        )

        await self.session.merge(web_image, load=True)
        

    async def find_by_url(self, normalized_url: str, *, width: int, height: int) -> WebImage|None:
        hash = normalized_url_hash(normalized_url)
        stmt = select(WebImage).execution_options(readonly=True) \
            .where(WebImage.normalized_url_hash == hash) \
            .where(WebImage.width == width).where(WebImage.height == height) 
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_content(self, web_image: WebImage) -> WebImageContent:
        dfs_client = DFSClient(RzConfig.instance())
        content = await dfs_client.download_buffer(
            WEB_IMAGES, 
            web_image.normalized_url_hash)
        return WebImageContent.from_bytes(content)    
    
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
        await self.session.merge(web_page, load=True)
        

    async def find_by_url(self, normalized_url: str) -> WebPage|None:
        hash = normalized_url_hash(normalized_url)
        stmt = select(WebPage).execution_options(readonly=True).where(WebPage.normalized_url_hash == hash)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()    
    
    async def find_by_channel_id(self, channel_id: str, page: int = 0, page_size: int = 20) -> list[WebPage]:
        async with self.session as session:
            stmt = select(WebPage).execution_options(readonly=True) \
                .where(WebPage.channel_normalized_url_hash == channel_id) \
                .limit(page_size).offset(page * page_size)
            result = await session.scalars(stmt)
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


              
class WebPageJobService:
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.logger = logging.getLogger("web_page_job_service")

    async def upsert(self, entity: WebPageJob) -> None:  
        await self.session.merge(entity, load=True)
        

    async def find_by_url(self, normalized_url: str) -> WebPageJob|None:
        hash = normalized_url_hash(normalized_url)
        stmt = select(WebPageJob).execution_options(readonly=True).where(WebPageJob.normalized_url_hash == hash)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def find_with_state(self, state: WebPageJobState) -> list[str]:
        stmt = select(WebPageJob.normalized_url).where(WebPageJob.state == state)    
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
    
    
class WebPageSummaryService:
    _model = None
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.logger = logging.getLogger("web_page_summary_service")

    async def upsert(self, web_page_summary: WebPageSummary) -> None:
        await self.session.merge(web_page_summary)
                
    async def find_by_url(self, normalized_url: str) -> WebPageSummary|None:
        hash = normalized_url_hash(normalized_url)
        return await self.session.get(WebPageSummary, hash)
    

@dataclass
class FrontendAudioSearchResult:
    normalized_url_hash: str
    similarity_score: float

    
class FrontendAudioService:
    _model = None
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.logger = logging.getLogger("frontend_audio_service")

    async def upsert(self, frontend_audio: FrontendAudio) -> None:
        self.logger.info(f"Inserting frontend audio for url: {frontend_audio.normalized_url}")            
        await self.session.merge(frontend_audio, load=True)
        await self.session.commit()

    async def update(self, normalized_url_hash: str, modifier: Callable[[FrontendAudio], Awaitable[None]]) -> None:
        self.logger.info(f"Updating web page summary for url: {normalized_url_hash}")
        existing = await self.session.get(FrontendAudio, normalized_url_hash)
        if existing is None:
            raise ValueError(f"Frontend Audio not found for url: {normalized_url_hash}")
        
        await modifier(existing)
        await self.session.commit()        

    async def get_by_url(self, url: str) -> FrontendAudio|None:
        hash = normalized_url_hash(url)
        return await self.session.get(FrontendAudio, hash)        

    async def get(self, normalized_url_hash: str) -> FrontendAudio|None:
        return await self.session.get(FrontendAudio, normalized_url_hash)
    
    async def select_with_similarity(self, column: Mapped[Optional[list[float]]], limit: int, text_embeddings: list[float]) -> list[FrontendAudioSearchResult]:
        similarity_expr = (
            func.cosine_distance(column, text_embeddings)
        ).label("similarity_score")
        
        stmt = select(
            FrontendAudio.normalized_url_hash,
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
    
    
class FrontendAudioPlayService:
    _model = None
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.logger = logging.getLogger("frontend_audio_plays_service")

    async def upsert(self, frontend_audio_play: FrontendAudioPlay) -> None:
        self.logger.info(f"Inserting frontend audio play {(frontend_audio_play.user_id, frontend_audio_play.audio_id)}")
        await self.session.merge(frontend_audio_play, load=True)
        await self.session.commit()

    async def update(self, frontend_audio_play: FrontendAudioPlay) -> None:
        self.logger.info(f"Updating frontend audio play {(frontend_audio_play.user_id, frontend_audio_play.audio_id)}")
        existing = await self.session.get(FrontendAudioPlay, (frontend_audio_play.user_id, frontend_audio_play.audio_id))
        if existing is None:
            raise ValueError(f"Frontend Audio not found for url: {normalized_url_hash}")
        
        existing.user_id = frontend_audio_play.user_id
        existing.audio_id = frontend_audio_play.audio_id
        existing.played_at = datetime.now()
        existing.duration_seconds = max(frontend_audio_play.duration_seconds, existing.duration_seconds)        
        await self.session.commit()

    async def find_all_by_user_id(self, user_id: str) -> list[FrontendAudioPlay]:
        stmt = select(FrontendAudioPlay).where(FrontendAudioPlay.user_id == user_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
    
    




