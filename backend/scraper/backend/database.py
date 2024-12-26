from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncConnection
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy import text 
from .config import settings
from .models.base import Base
from .models.frontend import create_vector_indexes as create_frontend_vector_indexes
from .models.web_page import create_vector_indexes as create_web_page_vector_indexes

engine = create_async_engine(settings.DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def get_db_session():
    async with AsyncSessionLocal() as session:
        return session
    
async def init_db():
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)
    
    async with engine.begin() as conn:        
        await create_frontend_vector_indexes(conn)
        await create_web_page_vector_indexes(conn)
        

