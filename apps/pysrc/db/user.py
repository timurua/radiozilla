from decimal import Decimal
from sqlalchemy import Boolean, Float, Integer, DateTime, event
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import String
from typing import List, Optional
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
    
class Plan(TimestampModel):
    __tablename__ = "plans"

    plan_id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    price_per_month: Mapped[Float] = mapped_column(Float, nullable=True)
    
class Subscription(TimestampModel):
    __tablename__ = "subscriptions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    plan_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
    plan: Mapped[Plan] = relationship(Plan, foreign_keys=[plan_id])
    status: Mapped[str] = mapped_column(String, nullable=True, default=None)    
    stripe_customer_id: Mapped[str] = mapped_column(String, nullable=True, default=None, index=True)
    stripe_product_id: Mapped[str] = mapped_column(String, nullable=True, default=None, index=True)
    stripe_plan_name: Mapped[str] = mapped_column(String, nullable=True, default=None, index=True)
    stripe_subscription_status: Mapped[str] = mapped_column(String, nullable=True, default=None, index=True)
    stripe_subscription_id: Mapped[str] = mapped_column(String, nullable=True, default=None, index=True)
    station_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
    station: Mapped["Station"] = relationship("Station", back_populates="subscriptions")
    admin_user_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
    admin_user: Mapped[User] = relationship(User, foreign_keys=[admin_user_id])    
    admin_user_group_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
    admin_user_group: Mapped[UserGroup] = relationship(UserGroup, foreign_keys=[admin_user_group_id])    
    
        
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
    action: Mapped[str] = mapped_column(String, nullable=False)
    ip_address: Mapped[str] = mapped_column(String, nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)
    

class Channel(TimestampModel):
    __tablename__ = "channels"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=True, default=None)
    description: Mapped[str] = mapped_column(String, nullable=True, default=None)
    image_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=True, default=False)
    web_page_channel_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
    web_page_channel: Mapped[WebPageChannel] = relationship("WebPageChannel", back_populates="channels")
   
class Station(TimestampModel):
    __tablename__ = "stations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=True, default=None)
    description: Mapped[str] = mapped_column(String, nullable=True, default=None)
    image_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=True, default=False)
    admin_user_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
    admin_user: Mapped[User] = relationship("User", foreign_keys=[admin_user_id])
    admin_user_group_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)        
    admin_user_group: Mapped[UserGroup] = relationship("UserGroup", foreign_keys=[admin_user_group_id])
    listener_user_group_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
    listener_user_group: Mapped[UserGroup] = relationship("UserGroup", foreign_keys=[listener_user_group_id])
    channels: Mapped[List[Channel]] = relationship("Channel", back_populates="stations")