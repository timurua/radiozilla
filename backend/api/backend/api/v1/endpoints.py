from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ...database import get_db
from ...services.health import HealthService
from fastapi import HTTPException, status
from pydantic import BaseModel
from ...services.embedding import EmbeddingService
import logging
from pydantic import BaseModel

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

async def get_embedding_service(db: AsyncSession = Depends(get_db)) -> EmbeddingService:
    return EmbeddingService(db)

class FAEmbedding(BaseModel):
    content_hash: str
    content: str
    embedding: list[float]

@router.get("/similar-embeddings")
async def fetch_embeddings(
    text: str,
    embedding_service: EmbeddingService = Depends(get_embedding_service)
):
    try:
        logging.info(f"Finding similar embeddings for text: {text}")
        embeddings = await embedding_service.find_similar_embeddings(text)
        logging.info(f"Found {len(embeddings)} similar embeddings")
        return [FAEmbedding(
            content_hash=embedding.content_hash,
            content=embedding.content,
            embedding=embedding.embedding
        ) for embedding in embeddings]  
    except Exception as e:
        logging.error(f"Error similar-embeddings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    
class EmbeddingRequest(BaseModel):
    text: str

@router.post("/embeddings")
async def upsert_embeddings(
    request: EmbeddingRequest,
    embedding_service: EmbeddingService = Depends(get_embedding_service)
):
    try:
        logging.info(f"Upserting embeddings for text: {request.text}")
        embeddings = await embedding_service.upsert_embeddings(request.text)
        logging.info(f"Upserted embeddings: {embeddings}")
        return [FAEmbedding(
            content_hash=embedding.content_hash,
            content=embedding.content,
            embedding=embedding.embedding
        ) for embedding in embeddings]  
    except Exception as e:
        logging.error(f"Error embeddings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )