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

router = APIRouter()

async def get_health_service(db: AsyncSession = Depends(get_db)) -> HealthService:
    return HealthService(db)

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

class EmbeddingRequest(BaseModel):
    text: str

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
async def read_embeddings(
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

