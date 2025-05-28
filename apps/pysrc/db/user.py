from sqlalchemy import Boolean, Float, Integer, DateTime, Index
from sqlalchemy.dialects.postgresql.json import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String
from typing import List, Optional
from datetime import datetime
from .base import Base, TimestampModel

class User(TimestampModel):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    firebase_user_id: Mapped[str] = mapped_column(String, index=True, unique=True)
    name: Mapped[str] = mapped_column(String, nullable=True, default=None)
    description: Mapped[str] = mapped_column(String, nullable=True, default=None)
    email: Mapped[str] = mapped_column(String, nullable=True, default=None, index=True)
    image_url: Mapped[str] = mapped_column(String, nullable=True, default=None)    
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    
class UserPermission(TimestampModel):
    __tablename__ = "user_permissions"
    user_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True, primary_key=True)
    permission_target_name: Mapped[str] = mapped_column(String, nullable=True, default=None, index=True, primary_key=True)
    permission_target_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True, primary_key=True)
    permission: Mapped[str] = mapped_column(String, nullable=True, default=None, primary_key=True)
    Index("ix_user_permissions_user_id_permission_target_name_permission_target_id_permission", user_id, permission_target_name, permission_target_id, permission)
    Index("ix_user_permissions_permission_target_name_permission_target_id_permission", permission_target_name, permission_target_id, permission, user_id)
    
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
    status: Mapped[str] = mapped_column(String, nullable=True, default=None)    
    stripe_customer_id: Mapped[str] = mapped_column(String, nullable=True, default=None, index=True)
    stripe_product_id: Mapped[str] = mapped_column(String, nullable=True, default=None, index=True)
    stripe_plan_name: Mapped[str] = mapped_column(String, nullable=True, default=None, index=True)
    stripe_subscription_status: Mapped[str] = mapped_column(String, nullable=True, default=None, index=True)
    stripe_subscription_id: Mapped[str] = mapped_column(String, nullable=True, default=None, index=True)
    station_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
          
class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
    action: Mapped[str] = mapped_column(String, nullable=False)
    ip_address: Mapped[str] = mapped_column(String, nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)
    
class Audio(TimestampModel):
    __tablename__ = "audios"    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)    
    channel_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
    title: Mapped[str] = mapped_column(String, nullable=True, default=None)
    description: Mapped[str] = mapped_column(String, nullable=True, default=None)
    audio_text: Mapped[str] = mapped_column(String, nullable=True, default=None)
    url: Mapped[str] = mapped_column(String)
    image_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    audio_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    web_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    author_id: Mapped[str] = mapped_column(String, nullable=True, default=None)
    channel_id: Mapped[str] = mapped_column(String, nullable=True, default=None)
    published_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=True, default=None)
    topics: Mapped[List[str]] = mapped_column(JSONB, nullable=True, default=None)

class Channel(TimestampModel):
    __tablename__ = "channels"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=True, default=None)
    description: Mapped[str] = mapped_column(String, nullable=True, default=None)
    image_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=True, default=False)
    web_page_channel_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
   
class Station(TimestampModel):
    __tablename__ = "stations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=True, default=None)
    description: Mapped[str] = mapped_column(String, nullable=True, default=None)
    image_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=True, default=False)
    
class StationChannels(TimestampModel):
    __tablename__ = "station_channels"    
    station_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True, primary_key=True)
    channel_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True, primary_key=True)
    
    Index("ix_station_channels_station_id_channel_id", station_id, channel_id)
    Index("ix_station_channels_channel_id_station_id", channel_id, station_id)
