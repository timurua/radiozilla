from typing import List, Optional, Dict, Any
from ..repositories.user_repository import UserRepository
from ..schemas.user import UserCreate, UserResponse, UserUpdate
from ..models.user import User

class UserService:
    def __init__(self, user_repository: UserRepository) -> None:
        self.user_repository = user_repository
    
    def _to_response(self, user: User) -> UserResponse:
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    
    def get_all_users(self) -> List[UserResponse]:
        users = self.user_repository.get_all()
        return [self._to_response(user) for user in users]
    
    def get_user(self, user_id: int) -> Optional[UserResponse]:
        user = self.user_repository.get_by_id(user_id)
        if user:
            return self._to_response(user)
        return None
    
    def create_user(self, data: UserCreate) -> UserResponse:
        user = self.user_repository.create(
            username=data["username"],
            email=data["email"]
        )
        return self._to_response(user)