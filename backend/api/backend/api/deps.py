from typing import AsyncGenerator
from dependency_injector.wiring import inject, Provide
from ..container import Container
from ..services.base import BaseService

@inject
async def get_base_service(
    service: BaseService = Provide[Container.base_service]
) -> BaseService:
    return service