from typing import Any
from dependency_injector import containers, providers
from .config import Config
from .repositories.user_repository import UserRepository
from .services.user_service import UserService

class Container(containers.DeclarativeContainer):
    config = providers.Singleton(Config)
    
    user_repository = providers.Singleton(
        UserRepository
    )
    
    user_service = providers.Singleton(
        UserService,
        user_repository=user_repository
    )