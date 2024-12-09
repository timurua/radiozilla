from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncConnection
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy import text 
from .config import settings
from .models.base import Base

engine = create_async_engine(settings.DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def create_vector_index(conn: AsyncConnection, table_name: str, column_name: str, lists: int):
    sql = text(f"""
        CREATE INDEX IF NOT EXISTS idx_{table_name}_{column_name}_ivfflat 
        ON {table_name} 
        USING ivfflat ({column_name} vector_cosine_ops)
        WITH (lists = {lists});
    """)
    await conn.execute(sql)
    
async def init_db():
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)
        await create_vector_index(conn, "embeddings", "embedding", 100)

