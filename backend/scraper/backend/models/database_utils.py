from sqlalchemy.ext.asyncio import AsyncConnection
from sqlalchemy import text 

async def create_vector_index(conn: AsyncConnection, table_name: str, column_name: str, lists: int):
    sql = text(f"""
        CREATE INDEX IF NOT EXISTS idx_{table_name}_{column_name}_ivfflat 
        ON {table_name} 
        USING ivfflat ({column_name} vector_cosine_ops)
        WITH (lists = {lists});
    """)
    await conn.execute(sql)