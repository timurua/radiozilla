from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy import text 
from .base import Base
from .frontend import create_vector_indexes as create_frontend_vector_indexes
import logging
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from contextlib import asynccontextmanager
from typing import AsyncGenerator

def create_async_db_engine(db_url: str):
    """Create async SQLAlchemy engine"""
    return create_async_engine(
        db_url,
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
    def initialize(cls, database_url: str):  
        logging.info(f"Initializing database with url: {database_url}")
        cls._engine = create_async_db_engine(database_url)
        cls._session_factory = create_async_session_factory(cls._engine)


    @classmethod
    @asynccontextmanager
    async def get_session(cls) -> AsyncGenerator[AsyncSession, None]:        
        session = cls._session_factory()
        try:
            yield session
            await session.commit()
        finally:
            await session.close()

    @classmethod
    async def create_tables(cls):
        async with cls._engine.begin() as conn:
            try:
                await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            except Exception as e:
                logging.error(f"Error creating extension: {e}")
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            await conn.run_sync(Base.metadata.create_all)
        
        async with cls._engine.begin() as conn:        
            await create_frontend_vector_indexes(conn)
            logging.info("Database tables created")