from typing import List, Optional, Type
from ..models.user import User
from ..database import db, T

class Repository[M: Type[T]]:
    def __init__(self, model: Type[M]) -> None:
        self.model = model

class UserRepository(Repository[User]):
    def __init__(self) -> None:
        super().__init__(User)
    
    def get_all(self) -> List[User]:
        return self.model.query.all()
    
    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.model.query.get(user_id)
    
    def create(self, username: str, email: str) -> User:
        user = User(username=username, email=email)
        db.session.add(user)
        db.session.commit()
        return user
