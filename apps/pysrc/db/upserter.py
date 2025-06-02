from typing import TypeVar, Generic, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.inspection import inspect

ModelType = TypeVar('ModelType', bound=DeclarativeBase)

class Upserter(Generic[ModelType]):

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
    
    async def upsert(self, 
                     instance: ModelType) -> ModelType:
        model_class = instance.__class__
        
        # Extract dictionary from instance
        instance_dict = {
            column.key: getattr(instance, column.key)
            for column in inspect(model_class).columns
            if hasattr(instance, column.key) and 
            getattr(instance, column.key) is not None
        }
        
        # Get primary key columns for conflict detection
        primary_key_columns = [
            getattr(model_class, column.key)
            for column in inspect(model_class).primary_key
        ]
        
        # Create and execute the upsert statement
        stmt = pg_insert(model_class).values(instance_dict)
        stmt = stmt.on_conflict_do_update(
            index_elements=primary_key_columns,
            set_=instance_dict
        ).returning(model_class) 
        
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
