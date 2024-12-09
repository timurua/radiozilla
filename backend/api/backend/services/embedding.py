import time
import psutil
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

class EmbeddingService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self._start_time = time.time()
        self._version = "1.0.0"

    async def create_embeddings(self, text: str):        
        """Basic health check"""
        lines = [line.strip() for line in text.split('\n') if line.strip()]

