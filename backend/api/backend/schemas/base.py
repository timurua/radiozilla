from pydantic import BaseModel
from datetime import datetime

class TimestampSchema(BaseModel):
    id: int
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True