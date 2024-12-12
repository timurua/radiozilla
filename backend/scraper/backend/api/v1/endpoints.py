from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ...database import get_db
from ...services.health import HealthService
from fastapi import HTTPException, status
from pydantic import BaseModel
from ...services.web_page import WebPageService
import logging
from pydantic import BaseModel
from datetime import datetime
from fastapi import WebSocket
from typing import List
from ...services.web_socket import get_connection_manager, ConnectionManager
from ...services.scraper import ScraperService, ScraperCallback, ScraperUrl
from enum import Enum

router = APIRouter()

async def get_health_service(db: AsyncSession = Depends(get_db)) -> HealthService:
    return HealthService(db)

_scraper_service: ScraperService|None = None

def get_scraper_service(db: AsyncSession = Depends(get_db)) -> ScraperService:
    global _scraper_service
    if not _scraper_service:
        _scraper_service = ScraperService(db)
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

async def get_web_page_service(db: AsyncSession = Depends(get_db)) -> WebPageService:
    return WebPageService(db)

class FAWebPage(BaseModel):
    normalized_url_hash: str
    normalized_url: str
    url: str
    status_code: int
    headers: dict[str, str]
    content: bytes
    content_type: str
    title: str
    visible_text: str
    content_date: datetime
    updated_at: datetime

@router.get("/web-pages")
async def read_web_pages(
    url: str,
    web_page_service: WebPageService = Depends(get_web_page_service)
):
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
            title=web_page.title,
            visible_text=web_page.visible_text,
            content_date=web_page.content_date,
            updated_at=web_page.updated_at
        ) if web_page else {} 
    except Exception as e:
        logging.error(f"Error similar-embeddings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    
class ScraperStartRequest(BaseModel):
    url: str
    max_depth: int = 2

@router.post("/scraper-start")
async def scraper_start(
    request: ScraperStartRequest,
    scraper_service: ScraperService  = Depends(get_scraper_service),
    connection_manager: ConnectionManager  = Depends(get_connection_manager)
):
    class Callback(ScraperCallback):
        def on_log(self, text: str) -> None:
            connection_manager.broadcast(text)
    
    try:
        logging.info(f"Starting scraper for url: {request.url}")
        urls = list(ScraperUrl(url=request.url, max_depth=0))
        await scraper_service.start(urls, request.max_depth, Callback())
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Error scraper-start: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    
@router.post("/scraper-stop")
async def scraper_stop(
    scraper_service: ScraperService  = Depends(get_scraper_service)
):
    try:
        logging.info(f"Stopping scraper")
        await scraper_service.stop()
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Error scraper-start: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )    
    

@router.websocket("/scraper-ws")
async def scraper_websocket_endpoint(websocket: WebSocket, connection_manager: ConnectionManager  = Depends(get_connection_manager)):
    logging.info(f"Creating new socket")
    await connection_manager.connect(websocket)



