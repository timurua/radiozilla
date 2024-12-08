from fastapi import APIRouter, Depends
from ..deps import get_base_service
from ...services.base import BaseService

router = APIRouter()

@router.get("/health")
async def health_check(
    service: BaseService = Depends(get_base_service)
):
    return {"status": "healthy"}