from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.sql import func
from ..database import Base

class TimestampModel(Base):
    __abstract__ = True

    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
