from fastapi import APIRouter, Depends, WebSocket
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ...services.health import HealthService
from pysrc.db.database import Database
from fastapi import HTTPException, status
from pysrc.db.service import WebPageService, FrontendAudioService
import logging
from pydantic import BaseModel
from ...services.web_socket import get_connection_manager, ConnectionManager
from ...services.scraper import ScraperService, ScraperCallback, ScraperUrl
import asyncio
from pysrc.db.web_page import WebPageSeed
from .models import FAWebPage, FAWebPageSeed, FADomainStats, FAScraperStats, FAFrontendAudioSearchResult

router = APIRouter()

async def get_health_service(db: AsyncSession = Depends(Database.get_db)) -> HealthService:
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

async def get_web_page_service(db: AsyncSession = Depends(Database.get_db)) -> WebPageService:
    return WebPageService(db)

@router.get("/web-pages")
async def read_web_pages(
    url: str,
    web_page_service: WebPageService = Depends(get_web_page_service)
) -> FAWebPage | None:
    try:
        logging.info(f"Finding web page for url: {url}")
        web_page = await web_page_service.find_web_page_by_url(url)
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
    no_cache: bool

class Callback(ScraperCallback):
        def __init__(self, connection_manager: ConnectionManager):
            self.connection_manager = connection_manager

        def on_log(self, text: str) -> None:
            asyncio.create_task(self.connection_manager.broadcast(text))

@router.post("/scraper-run")
async def scraper_run(
    request: ScraperRunRequest,
    scraper_service: ScraperService  = Depends(get_scraper_service),
    connection_manager: ConnectionManager  = Depends(get_connection_manager)
) -> FAScraperStats:
    callback = Callback(connection_manager)
    try:
        logging.info(f"Starting scraper for url: {request.url}")
        urls = [ScraperUrl(url=request.url, max_depth=request.max_depth, no_cache=True)]
        scraper_stats = await scraper_service.run(urls, callback, no_cache=request.no_cache)
        return FAScraperStats(
            initiated_urls_count=scraper_stats.initiated_urls_count,
            requested_urls_count=scraper_stats.requested_urls_count,
            completed_urls_count=scraper_stats.completed_urls_count,
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
) -> FAScraperStats:
    callback = Callback(connection_manager)
    try:
        logging.info(f"Starting scraper for url: {request.url}")
        urls = [ScraperUrl(url=request.url, max_depth=request.max_depth, no_cache=True)]
        scraper_stats = await scraper_service.run(urls, callback, no_cache=request.no_cache)
        return FAScraperStats(
            initiated_urls_count=scraper_stats.initiated_urls_count,
            requested_urls_count=scraper_stats.requested_urls_count,
            completed_urls_count=scraper_stats.completed_urls_count,
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
    except Exception as e:
        connection_manager.disconnect(websocket)


@router.get("/web-page-seeds")
async def read_web_page_seeds(db: AsyncSession = Depends(Database.get_db)) -> list[FAWebPageSeed]:
    try:
        result = await db.execute(select(WebPageSeed))
        web_page_seeds = result.scalars()
        return [
            FAWebPageSeed(
                normalized_url_hash=seed.normalized_url_hash,
                normalized_url=seed.normalized_url,
                url=seed.url,
                max_depth=seed.max_depth,
                url_patterns=seed.url_patterns,
                use_headless_browser=seed.use_headless_browser,
                allowed_domains=seed.allowed_domains
            ) for seed in web_page_seeds
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
    max_depth: int
    url_patterns: list[str] | None
    use_headless_browser: bool
    allowed_domains: list[str] | None

@router.post("/web-page-seeds")
async def upsert_web_page_seed(
    request: UpsertWebPageSeedRequest,
    db: AsyncSession = Depends(Database.get_db)
):
    try:
        result = await db.execute(select(WebPageSeed).where(WebPageSeed.normalized_url_hash == request.normalized_url_hash))
        web_page_seed = result.scalar_one_or_none()

        if web_page_seed:
            web_page_seed.normalized_url = request.normalized_url
            web_page_seed.url = request.url
            web_page_seed.max_depth = request.max_depth
            web_page_seed.url_patterns = request.url_patterns
            web_page_seed.use_headless_browser = request.use_headless_browser
            web_page_seed.allowed_domains = request.allowed_domains
        else:
            web_page_seed = WebPageSeed(
                normalized_url_hash=request.normalized_url_hash,
                normalized_url=request.normalized_url,
                url=request.url,
                max_depth=request.max_depth,
                url_patterns=request.url_patterns,
                use_headless_browser=request.use_headless_browser,
                allowed_domains=request.allowed_domains
            )
            db.add(web_page_seed)

        await db.commit()
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Error upserting web page seed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    
@router.post("/frontend-audios-similar-for-text")
async def frontend_audios_similar_for_text(
    text: str,
    db: AsyncSession = Depends(Database.get_db)
):
    try:
        logging.info(f"Finding similar front end audios for text: {text}")
        frontend_audio_ids = await FrontendAudioService(db).find_similar_for_text(text)
        return [FAFrontendAudioSearchResult(
            normalized_url_hash=frontend_audio.normalized_url_hash,
            similarity_score=frontend_audio.similarity_score
        ) for frontend_audio in frontend_audio_ids]

    except Exception as e:
        logging.error(f"Error similar-embeddings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    return None
