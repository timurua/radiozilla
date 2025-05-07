from sqlalchemy import Column, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

class TimestampModel(Base):
    __abstract__ = True

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)