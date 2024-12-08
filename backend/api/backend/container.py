from dependency_injector import containers, providers
from .services.base import BaseService
from .database import AsyncSessionLocal

class Container(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(packages=["backend.api"])
    
    db = providers.Resource(
        AsyncSessionLocal
    )
    
    base_service = providers.Factory(
        BaseService,
        session=db
    )
