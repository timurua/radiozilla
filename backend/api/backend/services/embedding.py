import time
import psutil
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

class EmbeddingService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self._start_time = time.time()
        self._version = "1.0.0"

    async def get_similar_embeddings(self, text: str):        
        """Basic health check"""
        db_status = await self._check_database()
        system_status = self._check_system_resources()
        
        overall_status = "healthy"
        if db_status["status"] != "healthy" or system_status["status"] != "healthy":
            overall_status = "unhealthy"
        
        return {
            "status": overall_status,
            "components": {
                "database": db_status["status"],
                "system": system_status["status"]
            },
            "version": self._version,
            "uptime_seconds": time.time() - self._start_time
        }
