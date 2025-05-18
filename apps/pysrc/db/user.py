from sqlalchemy import Boolean, Integer, DateTime, event
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import String
from typing import List
from datetime import datetime
from .base import Base, TimestampModel
from .web_page import WebPageChannel


class User(TimestampModel):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    firebase_user_id: Mapped[str] = mapped_column(String, index=True, unique=True)
    name: Mapped[str] = mapped_column(String, nullable=True, default=None)
    description: Mapped[str] = mapped_column(String, nullable=True, default=None)
    email: Mapped[str] = mapped_column(String, nullable=True, default=None, index=True)
    image_url: Mapped[str] = mapped_column(String, nullable=True, default=None)    
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    
class UserGroup(TimestampModel):
    __tablename__ = "user_groups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=True, default=None)
    description: Mapped[str] = mapped_column(String, nullable=True, default=None)    
    image_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    users: Mapped[List[User]] = relationship("User", back_populates="user_groups", secondary="user_user_groups")
    
class UserGroupInvitation(TimestampModel):
    __tablename__ = "user_group_invitations"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_group_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
    envitee_email: Mapped[str] = mapped_column(String, nullable=True, default=None, index=True)
    envitee_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None)
    role: Mapped[str] = mapped_column(String, nullable=True, default=None)
    invited_by: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
    invited_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)
    

class UserUserGroup(TimestampModel):
    __tablename__ = "user_user_groups"
    user_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_group_id: Mapped[int] = mapped_column(Integer, primary_key=True)    
    
class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_group_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
    action: Mapped[str] = mapped_column(String, not_null=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, not_null=True, default=func.now())
    
    
    
    
    
