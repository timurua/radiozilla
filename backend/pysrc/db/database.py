from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncConnection
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy import text 
from .base import Base
from .frontend import create_vector_indexes as create_frontend_vector_indexes
import logging

class Session:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def __aenter__(self):
        return self.session

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.close()

class Database:
    _engine = None
    _AsyncSessionLocal = None

    @classmethod
    def initialize(cls, database_url: str):  
        logging.info(f"Initializing database with url: {database_url}")
        cls._engine = create_async_engine(database_url, echo=True)
        cls._AsyncSessionLocal = async_sessionmaker(cls._engine, class_=AsyncSession, expire_on_commit=False)

    @classmethod
    async def get_db(cls):
        async with cls._AsyncSessionLocal() as session:
            try:
                yield session
            finally:
                await session.close()

    @classmethod
    async def get_db_session(cls) -> AsyncSession:
        async with cls._AsyncSessionLocal() as session:
            return session
        
    @classmethod
    async def get_session(cls) -> Session:
        return Session(
            await cls.get_db_session()
        )
        
        
    @classmethod
    async def get_with_db_session(cls):
        async with cls._AsyncSessionLocal() as session:
            return session    

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