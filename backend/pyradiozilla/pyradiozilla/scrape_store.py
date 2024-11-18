import asyncpg
import json
from typing import Optional, Dict, Any
import scrape_hash
from scrape_model import HttpResponse
import asyncio
from datetime import datetime


class ScraperStore:
    def __init__(self, dsn: str = "postgresql://myuser:mysecretpassword@localhost:5432/mydatabase"):
        """Initialize ScraperStore with database connection string."""
        self.dsn = dsn
        self._pool = None

    async def _get_pool(self) -> asyncpg.Pool:
        """Get or create connection pool."""
        if self._pool is None:
            self._pool = await asyncpg.create_pool(self.dsn)
        return self._pool

    async def store_url_response(
        self,
        response: HttpResponse,
    ) -> None:
        """Store URL response data in the database."""
        normalized_url_hash = scrape_hash.generate_url_safe_id(
            response.normalized_url)
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            await conn.execute('''
                INSERT INTO http_responses (
                    normalized_url_hash,
                    normalized_url,
                    url,
                    status_code,
                    headers,
                    content,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
                ON CONFLICT (normalized_url_hash) DO UPDATE
                SET normalized_url = $2,
                    url = $3,
                    status_code = $4,
                    headers = $5,
                    content = $6,
                    updated_at = NOW()
            ''', normalized_url_hash, response.normalized_url, response.url, response.status_code, json.dumps(response.headers), response.content)

    async def load_url_response(
        self,
        normalized_url: str
    ) -> Optional[HttpResponse]:
        """Load URL response data from the database."""
        normalized_url_hash = scrape_hash.generate_url_safe_id(
            normalized_url)
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow('''
                SELECT normalized_url_hash, normalized_url, url, status_code, headers, content, updated_at
                FROM http_responses
                WHERE normalized_url_hash = $1
            ''', normalized_url_hash)

        if row is None:
            return None
        
        headers = row['headers']

        return HttpResponse(
            normalized_url_hash=row['normalized_url_hash'],
            normalized_url=row['normalized_url'],
            url=row['url'],
            status_code=row['status_code'],
            headers=json.loads(row['headers']) if headers is not None else None,
            content=row['content'],
            updated_at=row['updated_at']
        )

    async def close(self) -> None:
        """Close the database connection pool."""
        if self._pool is not None:
            await self._pool.close()
            self._pool = None

    async def create_tables(self) -> None:
        """Create required database tables."""
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            await conn.execute('''
                            CREATE TABLE IF NOT EXISTS http_responses (
                                normalized_url_hash TEXT PRIMARY KEY,
                                normalized_url TEXT NOT NULL,
                                url TEXT NOT NULL,
                                status_code INTEGER NOT NULL,
                                headers JSONB,
                                content BYTEA,
                                updated_at TIMESTAMP NOT NULL
                            )
                        ''')


async def main():
    """Test the ScraperStore functionality."""
    store = ScraperStore()
    try:
        await store.create_tables()

        # Example response
        response = HttpResponse(
            normalized_url_hash="test_hash",
            normalized_url="http://example.com",
            url="http://example.com?param=1",
            status_code=200,
            headers={"Content-Type": "text/html"},
            content="Hello, World!".encode("utf-8"),
            updated_at=None
        )

        await store.store_url_response(response)
        loaded = await store.load_url_response("http://example.com")
        print(f"Loaded response: {loaded}")
    finally:
        await store.close()

if __name__ == "__main__":
    asyncio.run(main())
