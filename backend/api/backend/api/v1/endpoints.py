from fastapi import APIRouter, Depends
from ..deps import get_base_service
from ...services.base import BaseService
from pydantic import BaseModel

router = APIRouter()

class HealthResponse(BaseModel):
    status: str

@router.get("/health")
async def health_check(
    service: BaseService = Depends(get_base_service)
) -> HealthResponse:
    return HealthResponse(status=service.status)