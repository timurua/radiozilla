from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text as sql_text, select, func
from .web_page import WebPage, WebPageSummary, WebPageChannel, WebPageJob, WebPageJobState
from .frontend import FrontendAudio, FrontendAudioPlay
import logging
from pyminiscraper.url import normalized_url_hash
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Callable, Awaitable
from ..summarizer.texts import EmbeddingService
from dataclasses import dataclass
from sqlalchemy.orm import Mapped
from datetime import datetime

class WebPageChannelService:
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.logger = logging.getLogger("web_page_channel_service")

    async def upsert(self, web_page_channel: WebPageChannel) -> None:
        await self.session.merge(web_page_channel, load=True)
        

    async def find_by_url(self, normalized_url: str) -> WebPageChannel|None:
        hash = normalized_url_hash(normalized_url)
        stmt = select(WebPageChannel).where(WebPageChannel.normalized_url_hash == hash)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def find_all(self) -> list[WebPageChannel]:
        stmt = select(WebPageChannel)
        result = await self.session.scalars(stmt)
        channels = result.all()
        return list(channels)

class WebPageService:
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.logger = logging.getLogger("web_page_service")

    async def upsert(self, web_page: WebPage) -> None:
        await self.session.merge(web_page, load=True)
        

    async def find_by_url(self, normalized_url: str) -> WebPage|None:
        hash = normalized_url_hash(normalized_url)
        stmt = select(WebPage).execution_options(readonly=True).where(WebPage.normalized_url_hash == hash)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
              
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
    
    async def find_similar_for_text(self, text, limit: int = 10, probes: int = 10) -> list[FrontendAudioSearchResult]:
        probes = 10
        text_embeddings = EmbeddingService.calculate_embeddings(text)
        await self.session.execute(sql_text(f"SET LOCAL ivfflat.probes = {probes}"))

        title_similars = await self.select_with_similarity(FrontendAudio.title_embedding_mlml6v2, limit, text_embeddings)
        description_similars = await self.select_with_similarity(FrontendAudio.description_embedding_mlml6v2, limit, text_embeddings)
        audio_text_similars = await self.select_with_similarity(FrontendAudio.audio_text_embedding_mlml6v2, limit, text_embeddings)
        combined = title_similars + description_similars + audio_text_similars
        best_by_hash: dict[str, FrontendAudioSearchResult] = {}
        for item in combined:
            if item.normalized_url_hash not in best_by_hash or item.similarity_score < best_by_hash[item.normalized_url_hash].similarity_score:
                best_by_hash[item.normalized_url_hash] = item

        results = sorted(best_by_hash.values(), key=lambda x: x.similarity_score)
        return results

    async def select_with_similarity(self, column: Mapped[list[float]], limit: int, text_embeddings: list[float]) -> list[FrontendAudioSearchResult]:
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
    
    




