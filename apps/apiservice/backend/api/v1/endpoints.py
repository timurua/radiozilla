from fastapi import APIRouter, Depends, WebSocket
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...services.health import HealthService
from pysrc.db.database import Database
from fastapi import HTTPException, status
from pysrc.db.service import WebPageService, FrontendAudioService, FrontendAudioPlayService
import logging
from pydantic import BaseModel
from ...services.web_socket import get_connection_manager, ConnectionManager
from ...services.scraper import ScraperService, ScraperCallback, ScraperUrl
import asyncio
from pysrc.db.web_page import WebPageChannel, WebPageSeed
from .models import FAWebPage, FAWebPageChannel, FADomainStats, FAScraperStats, FAFrontendAudioSearchResult, FAFrontendAudio, FAFrontendAudioPlay
from pysrc.db.frontend import FrontendAudioPlay
from datetime import datetime

router = APIRouter()

async def get_health_service(db: AsyncSession = Depends(Database.get_session)) -> HealthService:
    return HealthService(db)

_scraper_service: ScraperService|None = None

def get_scraper_service() -> ScraperService:
    global _scraper_service
    if not _scraper_service:
        _scraper_service = ScraperService()
    return _scraper_service

@router.get("/health")
async def health_check(
    health_service: HealthService = Depends(get_health_service)
):
    """
    Basic health check endpoint
    """
    return await health_service.get_basic_health()

@router.get("/health/detailed")
async def detailed_health_check(
    health_service: HealthService = Depends(get_health_service)
):
    """
    Detailed health check endpoint
    """
    return await health_service.get_detailed_health()

async def get_web_page_service(db: AsyncSession = Depends(Database.get_session)) -> WebPageService:
    return WebPageService(db)

@router.get("/web-pages")
async def read_web_pages(
    url: str,
    web_page_service: WebPageService = Depends(get_web_page_service)
) -> FAWebPage | None:
    try:
        logging.info(f"Finding web page for url: {url}")
        web_page = await web_page_service.find_by_url(url)
        return FAWebPage(
            normalized_url_hash=web_page.normalized_url_hash,
            normalized_url=web_page.normalized_url,
            url=web_page.url,
            status_code=web_page.status_code,
            headers=web_page.headers,
            content=web_page.content,
            content_type=web_page.content_type,
            content_charset=web_page.content_charset,
            metadata_title=web_page.metadata_title,
            metadata_description=web_page.metadata_description,
            metadata_image_url=web_page.metadata_image_url,
            metadata_published_at=web_page.metadata_published_at,
            canonical_url=web_page.canonical_url,
            outgoing_urls=web_page.outgoing_urls,
            visible_text=web_page.visible_text,
            sitemap_urls=web_page.sitemap_urls,
            robots_content=web_page.robots_content,
            text_chunks=web_page.text_chunks
        ) if web_page else None 
    except Exception as e:
        logging.error(f"Error similar-embeddings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    return None
    
class ScraperRunRequest(BaseModel):
    url: str
    max_depth: int

class Callback(ScraperCallback):
        def __init__(self, connection_manager: ConnectionManager) -> None:
            self.connection_manager = connection_manager

        async def on_log(self, text: str) -> None:
            await self.connection_manager.broadcast(text)

@router.post("/scraper-run")
async def scraper_run(
    request: ScraperRunRequest,
    scraper_service: ScraperService  = Depends(get_scraper_service),
    connection_manager: ConnectionManager  = Depends(get_connection_manager)
) -> FAScraperStats | None:
    callback = Callback(connection_manager)
    try:
        logging.info(f"Starting scraper for url: {request.url}")
        urls = [ScraperUrl(url=request.url, max_depth=request.max_depth)]
        scraper_stats = await scraper_service.run(urls, callback)
        return None if scraper_stats is None else FAScraperStats(
            queued_urls_count = scraper_stats.queued_urls_count,
            requested_urls_count = scraper_stats.requested_urls_count,
            success_urls_count = scraper_stats.success_urls_count,
            error_urls_count = scraper_stats.error_urls_count,
            skipped_urls_count = scraper_stats.skipped_urls_count,
            domain_stats={
                domain: FADomainStats(
                    domain=domain,
                    frequent_subpaths=domain_stats.frequent_subpaths
                ) for domain, domain_stats in scraper_stats.domain_stats.items()
            }
        )
    except Exception as e:
        logging.error(f"Error scraper-start: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    
class SummarizerRunRequest(BaseModel):
    url: str
    
@router.post("/summarizer-run")
async def summarizer_run(
    request: SummarizerRunRequest,
    scraper_service: ScraperService  = Depends(get_scraper_service),
    connection_manager: ConnectionManager  = Depends(get_connection_manager)
) -> FAScraperStats | None:
    callback = Callback(connection_manager)
    try:
        logging.info(f"Starting scraper for url: {request.url}")
        seed_urls = [ScraperUrl(url=request.url)]
        scraper_stats = await scraper_service.run(seed_urls, callback)        
        return None if scraper_stats is None else FAScraperStats(
            queued_urls_count = scraper_stats.queued_urls_count,
            requested_urls_count = scraper_stats.requested_urls_count,
            success_urls_count = scraper_stats.success_urls_count,
            error_urls_count = scraper_stats.error_urls_count,
            skipped_urls_count = scraper_stats.skipped_urls_count,    
            domain_stats={
                domain: FADomainStats(
                    domain=domain,
                    frequent_subpaths=domain_stats.frequent_subpaths
                ) for domain, domain_stats in scraper_stats.domain_stats.items()
            }
        )
    except Exception as e:
        logging.error(f"Error scraper-start: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

    
@router.post("/scraper-stop")
async def scraper_stop(
    scraper_service: ScraperService  = Depends(get_scraper_service),
    connection_manager: ConnectionManager  = Depends(get_connection_manager)
):
    try:
        logging.info(f"Stopping scraper")
        await scraper_service.stop(Callback(connection_manager))
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Error scraper-stop: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )    
    

@router.websocket("/scraper-ws")
async def scraper_websocket_endpoint(websocket: WebSocket, connection_manager: ConnectionManager  = Depends(get_connection_manager)):
    logging.info(f"Creating new socket")
    try:
        await connection_manager.connect(websocket)
        while True:
            data = await websocket.receive_text()
            logging.info(f"Received data: {data}")
            # Optionally process the received data here
    except Exception as e:
        logging.error(f"WebSocket error: {str(e)}", exc_info=True)
    finally:
        await connection_manager.disconnect(websocket)
        logging.info("WebSocket connection closed")


@router.get("/web-page-channels")
async def read_web_page_seeds(db: AsyncSession = Depends(Database.get_session)) -> list[FAWebPageChannel]:
    try:
        result = await db.execute(select(WebPageChannel))
        web_page_channels = result.scalars()
        return [
            FAWebPageChannel(
                normalized_url_hash=channel.normalized_url_hash,
                normalized_url=channel.normalized_url,
                url=channel.url,
                name=channel.name,
                description=channel.description,
                image_url=channel.image_url,
                enabled=channel.enabled,                
                scraper_seeds=channel.scraper_seeds,
                include_path_patterns=channel.include_path_patterns,
                exclude_path_patterns=channel.exclude_path_patterns,
                scraper_follow_web_page_links=channel.scraper_follow_web_page_links,
                scraper_follow_feed_links=channel.scraper_follow_feed_links,
                scraper_follow_sitemap_links=channel.scraper_follow_sitemap_links
                    
            ) for channel in web_page_channels
        ]
    except Exception as e:
        logging.error(f"Error reading web page seeds: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    
class UpsertWebPageSeedRequest(BaseModel):
    normalized_url_hash: str
    normalized_url: str
    url: str
    name: str
    description: str | None
    image_url: str | None
    enabled: bool

@router.post("/web-page-channels")
async def upsert_web_page_seed(
    request: UpsertWebPageSeedRequest,
    db: AsyncSession = Depends(Database.get_session)
) -> dict[str, str]:
    try:
        result = await db.execute(select(WebPageChannel).where(WebPageChannel.normalized_url_hash == request.normalized_url_hash))
        web_page_channel = result.scalar_one_or_none()

        if web_page_channel:
            web_page_channel.normalized_url = request.normalized_url
            web_page_channel.url = request.url
            web_page_channel.name = request.name
            web_page_channel.description = request.description
            web_page_channel.image_url = request.image_url
            web_page_channel.enabled = request.enabled
        else:
            web_page_channel = WebPageChannel(
                normalized_url_hash=request.normalized_url_hash,
                normalized_url=request.normalized_url,
                url=request.url,
                name=request.name,
                description=request.description,
                image_url=request.image_url,
                enabled=request.enabled
            )
            db.add(web_page_channel)

        await db.commit()
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Error upserting web page seed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    
@router.post("/frontend-audio-results-similar-for-text")
async def post_frontend_audios_similar_for_text(
    text: str,
    db: AsyncSession = Depends(Database.get_session)
) -> list[FAFrontendAudioSearchResult]:
    try:        
        logging.info(f"Finding similar front end audios for text: {text}")
        frontend_audio_service = FrontendAudioService(db)
        return await frontend_audio_service.find_similar_for_text(text)
    except Exception as e:
        logging.error(f"Error similar-embeddings: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )    

    
@router.get("/frontend-audios-similar-for-text")
async def get_frontend_audios_similar_for_text(
    text: str,
    db: AsyncSession = Depends(Database.get_session)
) -> list[FAFrontendAudio]:
    try:        
        logging.info(f"Finding similar front end audios for text: {text}")
        frontend_audio_service = FrontendAudioService(db)
        frontend_audio_results = await frontend_audio_service.find_similar_for_text(text)
        frontend_audios = []
        for frontend_audio_result in frontend_audio_results:
            frontend_audio = await frontend_audio_service.get(frontend_audio_result.normalized_url_hash)
            if frontend_audio is None:
                continue
            frontend_audios.append(FAFrontendAudio(
                normalized_url_hash=frontend_audio.normalized_url_hash,
                normalized_url=frontend_audio.normalized_url,
                title=frontend_audio.title,
                description=frontend_audio.description,
                audio_text=frontend_audio.audio_text,
                image_url=frontend_audio.image_url,
                audio_url=frontend_audio.audio_url,
                author_id=frontend_audio.author_id,
                channel_id=frontend_audio.channel_id,
                published_at=frontend_audio.published_at,
                uploaded_at=frontend_audio.uploaded_at,
                duration=frontend_audio.duration,
                topics=frontend_audio.topics,
                similarity_score=frontend_audio_result.similarity_score
            ))
        return frontend_audios

    except Exception as e:
        logging.error(f"Error similar-embeddings: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    
@router.get("/frontend-audio-results-similar-for-text")
async def frontend_audio_results_similar_for_text(
    text: str,
    db: AsyncSession = Depends(Database.get_session)
) -> list[FAFrontendAudioSearchResult]:
    try:        
        logging.info(f"Finding similar front end audio results for text: {text}")
        frontend_audio_service = FrontendAudioService(db)
        frontend_audio_results = await frontend_audio_service.find_similar_for_text(text)
        return [FAFrontendAudioSearchResult(
            normalized_url_hash=frontend_audio_result.normalized_url_hash,
            similarity_score=frontend_audio_result.similarity_score
        ) for frontend_audio_result in frontend_audio_results]
    except Exception as e:
        logging.error(f"Error similar-embeddings: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )    
    
@router.get("/frontend-audio-for-url")
async def frontend_audio_for_url(
    url: str,
    db: AsyncSession = Depends(Database.get_session)
) -> FAFrontendAudio | None:
    try:
        logging.info(f"Finding frontend audios for url: {url}")
        frontend_audio = await FrontendAudioService(db).get_by_url(url)
        if not frontend_audio:
            return None
        
        return FAFrontendAudio(
            normalized_url_hash=frontend_audio.normalized_url_hash,
            normalized_url=frontend_audio.normalized_url,
            title=frontend_audio.title,
            description=frontend_audio.description,
            audio_text=frontend_audio.audio_text,
            image_url=frontend_audio.image_url,
            audio_url=frontend_audio.audio_url,
            author_id=frontend_audio.author_id,
            channel_id=frontend_audio.channel_id,
            published_at=frontend_audio.published_at,
            uploaded_at=frontend_audio.uploaded_at,
            duration=frontend_audio.duration,
            topics=frontend_audio.topics,
            similarity_score=None
        )
    except Exception as e:
        logging.error(f"Error similar-embeddings: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.post("/frontend-audio-play")
async def frontend_audio_play(
    user_id: str,
    audio_id: str,
    duration_seconds: int,
    db: AsyncSession = Depends(Database.get_session)
) -> None:
    try:
        logging.info(f"Upserting front end audio play for user: {user_id}, audio: {audio_id}")
        frontend_audio_play_service = FrontendAudioPlayService(db)
        frontend_audio_play = FrontendAudioPlay(
            user_id=user_id,
            audio_id=audio_id,
            duration_seconds=duration_seconds,
            played_at=datetime.now()
        )

        await frontend_audio_play_service.upsert(frontend_audio_play)
        
    except Exception as e:
        logging.error(f"Error upsert front end audio play: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    
@router.get("/frontend-audio-plays-for-user")
async def frontend_audio_plays_for_user(
    user_id: str,
    db: AsyncSession = Depends(Database.get_session)
) -> list[FAFrontendAudioPlay]:
    try:
        logging.info(f"Finding front end audio plays for user: {user_id}")
        frontend_audio_play_service = FrontendAudioPlayService(db)
        return [FAFrontendAudioPlay(
            user_id=frontend_audio_play.user_id,
            audio_id=frontend_audio_play.audio_id,
            played_at=frontend_audio_play.played_at,
            duration_seconds=frontend_audio_play.duration_seconds
        ) for frontend_audio_play in await frontend_audio_play_service.find_all_by_user_id(user_id)]
        
    except Exception as e:
        logging.error(f"Error upsert front end audio play: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )    
