import time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text as sql_text, select
from sentence_transformers import SentenceTransformer
from ..models.embedding import Embedding
import logging

class EmbeddingService:
    _model = None
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self._start_time = time.time()
        self._version = "1.0.0"
        logging.info("Embedding service initialized")

    async def upsert_embeddings(self, texts: str):
        """Basic health check"""
        lines, embeddings = self.calculate_embeddings(texts)


        result = []
        async with self.session.begin():
            for text, embedding in zip(lines, embeddings):
                embedding_model = Embedding(content=text, embedding=embedding.tolist())
                logging.info(f"Inserting embedding for text: {text}")
                await self.session.merge(embedding_model)
                result.append(embedding_model)

        return result

    def calculate_embeddings(self, texts):
        lines = [line.strip() for line in texts.split('\n') if line.strip()]
        model = self.initialize_model_if_needed()
        embeddings = model.encode(lines)
        return lines,embeddings

    def initialize_model_if_needed(self):
        if not EmbeddingService._model:
            EmbeddingService._model = SentenceTransformer('all-MiniLM-L6-v2')
        model = EmbeddingService._model
        return model
    
    async def find_similar_embeddings(
        self, 
        text: str,
        limit: int = 5,
        probes: int = 10
    ) -> list[Embedding]:
        await self.session.execute(sql_text(f"SET LOCAL ivfflat.probes = {probes}"))

        lines, embeddings = self.calculate_embeddings(text)

        if len(embeddings) == 0:
            return []
        
        stmt = select(Embedding).order_by(
            Embedding.embedding.op("<=>")(embeddings[0].tolist())
        ).limit(limit)
        
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
        
