from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ...database import get_db
from ...services.health import HealthService
from fastapi import HTTPException, status
from pydantic import BaseModel
from ...services.embedding import EmbeddingService

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

async def get_embedding_service(db: AsyncSession = Depends(get_db)) -> EmbeddingService:
    return EmbeddingService(db)

@router.post("/embeddings")
async def create_embedding(
    request: EmbeddingRequest,
    embedding_service: EmbeddingService = Depends(get_embedding_service)
):
    """
    Create embeddings for the given text
    """
    try:
        embedding = await embedding_service.create_embedding(request.text)
        return {"embedding": embedding}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )