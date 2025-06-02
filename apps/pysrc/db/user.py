from sqlalchemy import Boolean, Float, Integer, DateTime, Index
from sqlalchemy.dialects.postgresql.json import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String
from typing import List, Optional
from enum import Enum
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
    
class UserPlayerStats(TimestampModel):
    __tablename__ = "user_player_stats"
    user_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    played_audio_ids: Mapped[List[int]] = mapped_column(JSONB, nullable=False, default=list)
    liked_audio_ids: Mapped[List[int]] = mapped_column(JSONB, nullable=False, default=list)
    search_history: Mapped[List[str]] = mapped_column(JSONB, nullable=False, default=list)
    subscribed_channel_ids: Mapped[List[int]] = mapped_column(JSONB, nullable=False, default=list)
    last_active_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)
    
class UserPermission(TimestampModel):
    __tablename__ = "user_permissions"
    user_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True, primary_key=True)
    permission_target_name: Mapped[str] = mapped_column(String, nullable=True, default=None, index=True, primary_key=True)
    permission_target_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True, primary_key=True)
    permission: Mapped[str] = mapped_column(String, nullable=True, default=None, primary_key=True)
    Index("ix_user_permissions_user_id_target_permission", user_id, permission_target_name, permission_target_id, permission)
    Index("ix_user_permissions_target_user_id_permission", permission_target_name, permission_target_id, permission, user_id)
    
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
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    stripe_customer_id: Mapped[str] = mapped_column(String, nullable=True, default=None, index=True)
    stripe_product_id: Mapped[str] = mapped_column(String, nullable=True, default=None, index=True)
    stripe_plan_name: Mapped[str] = mapped_column(String, nullable=True, default=None, index=True)
    stripe_subscription_status: Mapped[str] = mapped_column(String, nullable=True, default=None, index=True)
    stripe_subscription_id: Mapped[str] = mapped_column(String, nullable=True, default=None, index=True)
    max_audios_per_month: Mapped[int] = mapped_column(Integer, nullable=True, default=None)
    max_manual_pages_per_month: Mapped[int] = mapped_column(Integer, nullable=True, default=None)
    max_web_channels: Mapped[int] = mapped_column(Integer, nullable=True, default=None)   
   
class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
    action: Mapped[str] = mapped_column(String, nullable=False)
    ip_address: Mapped[str] = mapped_column(String, nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)
       
class ManualChannel(TimestampModel):
    __tablename__ = "manual_channels"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)    
    subscription_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=True, default=False)
    is_enabled: Mapped[bool] = mapped_column(Boolean, nullable=True, default=True)
    web_page_channel_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True, unique=True)

class Channel(TimestampModel):
    __tablename__ = "channels"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    subscription_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
    name: Mapped[str] = mapped_column(String, nullable=True, default=None)
    description: Mapped[str] = mapped_column(String, nullable=True, default=None)
    image_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=True, default=False)
    is_enabled: Mapped[bool] = mapped_column(Boolean, nullable=True, default=False)
    web_page_channel_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True, unique=True)
    manual_channel_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True, unique=True)
    
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
    
class AudioContentState(Enum):
    NEED_IMPORTING = 0
    IMPORTED_NEED_SUMMARIZING = 1
    SUMMARIZED_NEED_TTSING = 2
    TTSED_VISIBLE = 3        
    HIDDEN = 4

class AudioContent(TimestampModel):
    __tablename__ = "audio_contents"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)    
    
    web_page_normalized_url_hash: Mapped[str] = mapped_column(String(32), nullable=True, default=None, index=True)    
    web_page_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    
    state: Mapped[AudioContentState] = mapped_column(nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=True, default=None)
    description: Mapped[str] = mapped_column(String, nullable=True, default=None)
    image_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    published_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)
    
    audio_url: Mapped[str] = mapped_column(String, nullable=True, default=None)    
    audio_duration_seconds: Mapped[int] = mapped_column(Integer, nullable=True, default=None)
    
    raw_text: Mapped[str] = mapped_column(String, nullable=True, default=None)
    summarized_text: Mapped[str] = mapped_column(String, nullable=True, default=None) 
    summarized_text_audio_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    summarized_topics: Mapped[List[str]] = mapped_column(JSONB, nullable=True, default=None)    
    

class Audio(TimestampModel):
    __tablename__ = "audios"    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    audio_content_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
    web_page_normalized_url_hash: Mapped[str] = mapped_column(String(32), nullable=True, default=None, index=True)    
    channel_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
    title: Mapped[str] = mapped_column(String, nullable=True, default=None)
    description: Mapped[str] = mapped_column(String, nullable=True, default=None)
    audio_text: Mapped[str] = mapped_column(String, nullable=True, default=None)
    url: Mapped[str] = mapped_column(String)
    image_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    audio_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    web_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    source_web_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    source_url: Mapped[str] = mapped_column(String, nullable=True, default=None)
    published_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=True, default=None)
    topics: Mapped[List[str]] = mapped_column(JSONB, nullable=True, default=None)
    
class ChannelAudio(TimestampModel):
    __tablename__ = "channel_audios"    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    channel_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
    audio_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
    audio_content_id: Mapped[int] = mapped_column(Integer, nullable=True, default=None, index=True)
    
    published_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)    
    
    Index("ix_channel_audios_channel_id_audio_id", channel_id, audio_id)
    Index("ix_channel_audios_audio_id_channel_id", audio_id, channel_id)
    