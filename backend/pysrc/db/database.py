from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncConnection
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy import text 
from .base import Base
from .frontend import create_vector_indexes as create_frontend_vector_indexes
from .web_page import create_vector_indexes as create_web_page_vector_indexes

class Database:
    _engine = None
    _AsyncSessionLocal = None

    @classmethod
    def initialize(cls, database_url: str):  
        cls._engine = create_async_engine(database_url, echo=True)
        cls._AsyncSessionLocal = async_sessionmaker(cls._engine, class_=AsyncSession, expire_on_commit=False)

    @classmethod
    async def get_db(cls):
        if not cls._engine:
            cls.initialize()
        async with cls._AsyncSessionLocal() as session:
            try:
                yield session
            finally:
                await session.close()

    @classmethod
    async def get_db_session(cls):
        if not cls._engine:
            cls.initialize()
        async with cls._AsyncSessionLocal() as session:
            return session

    @classmethod
    async def init_db(cls):
        async with cls._engine.begin() as conn:
            # await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            await conn.run_sync(Base.metadata.create_all)
        
        async with cls._engine.begin() as conn:        
            await create_frontend_vector_indexes(conn)
            await create_web_page_vector_indexes(conn)
