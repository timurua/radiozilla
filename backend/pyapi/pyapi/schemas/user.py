from typing import TypedDict, Optional

class UserCreate(TypedDict):
    username: str
    email: str

class UserResponse(TypedDict):
    id: int
    username: str
    email: str

class UserUpdate(TypedDict, total=False):
    username: Optional[str]
    email: Optional[str]