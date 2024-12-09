import time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text as sql_text
from sentence_transformers import SentenceTransformer
from ..models.embedding import Embedding
import logging


class EmbeddingService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self._start_time = time.time()
        self._version = "1.0.0"
        logging.info("Embedding service initialized")

    async def fetch_embedding(self, texts: str):
        """Basic health check"""
        lines = [line.strip() for line in texts.split('\n') if line.strip()]
        model = SentenceTransformer('all-MiniLM-L6-v2')
        embeddings = model.encode(lines)

        async with self.session.begin():
            for text, embedding in zip(lines, embeddings):
                embedding_model = Embedding(content=text, embedding=embedding.tolist())
                logging.info(f"Inserting embedding for text: {text}")
                await self.session.merge(embedding_model)

        result = []
        for text, embedding in zip(lines, embeddings):
            result.append({
                "text": text,
                "embedding": embedding.tolist()
            })

        

        return {"embeddings": result}
