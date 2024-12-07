from dataclasses import dataclass
from typing import Optional

@dataclass
class Config:
    db_url: str = "sqlite:///./database.db"
    debug: bool = True
    secret_key: Optional[str] = None