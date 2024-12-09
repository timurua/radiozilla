import time
import psutil
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text as sql_text
from sentence_transformers import SentenceTransformer

class EmbeddingService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self._start_time = time.time()
        self._version = "1.0.0"

    async def create_embeddings(self, texts: str):        
        """Basic health check"""
        lines = [line.strip() for line in texts.split('\n') if line.strip()]
        model = SentenceTransformer('all-MiniLM-L6-v2')
        embeddings = model.encode(lines)

        for text, embedding in zip(lines, embeddings):
            await self.session.execute(
                sql_text("INSERT INTO embeddings (text, embedding) VALUES (:text, :embedding)"),
                {"text": text, "embedding": embedding}
            )

        
        

