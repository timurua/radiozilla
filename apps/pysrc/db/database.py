from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.asyncio import async_sessionmaker

from pysrc.config.rzconfig import RzConfig
from pysrc.utils import asynchelper
from .base import Base
import logging
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

def create_async_db_engine(db_url: str):
    """Create async SQLAlchemy engine"""
    return create_async_engine(
        db_url,
        pool_size=20,         # Increase from default 5
        max_overflow=30,      # Increase from default 10
        pool_timeout=60,      # Increase timeout if needed (default 30)
        pool_pre_ping=True,   # Optional: helps detect stale connections        
        isolation_level='AUTOCOMMIT',  # This is still valid at engine level
        echo=False  # Set to True for SQL query logging
    )

def create_async_session_factory(engine) -> async_sessionmaker[AsyncSession]:
    """Create an async session factory"""
    return async_sessionmaker(
        bind=engine,
        expire_on_commit=False,
        class_=AsyncSession
    )

class Database:
    _engine = None
    _session_factory = None
    
    @classmethod
    def __initialize(cls):  
        logging.info(f"Initializing database with url: {RzConfig.instance().db_url}")
        cls._engine = create_async_db_engine(RzConfig.instance().db_url)
        cls._session_factory = create_async_session_factory(cls._engine)


    @classmethod
    async def get_session(cls) -> AsyncGenerator[AsyncSession, None]:        
        if cls._engine is None:
            await asynchelper.run_task_with_new_executor(
                cls.__initialize
            )
        if cls._session_factory is None:
            raise Exception("Database not initialized")
        
        session = cls._session_factory()
        try:
            yield session
            await session.commit()
        finally:
            await session.close()

    @classmethod
    async def create_tables(cls):
        async with cls._engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        