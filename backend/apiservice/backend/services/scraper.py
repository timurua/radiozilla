import time
from sqlalchemy.ext.asyncio import AsyncSession
from pyminiscraper.scraper import Scraper, ScraperConfig, ScraperUrl
from pyminiscraper.config import ScraperConfig, ScraperCallback
from pyminiscraper.stats import ScraperStats, DomainStats
from pysrc.scraper.store import get_scraper_store_factory
from pysrc.db.database import Database


import logging

class ScraperService:
    _scraper: Scraper|None = None
    
    def __init__(self):
        self._start_time = time.time()
        self._version = "1.0.0"
        logging.info("Scraper service initialized")

    async def run(self, scraper_urls: list[ScraperUrl], callback: ScraperCallback, no_cache: bool = False) -> ScraperStats:

        await self.stop(callback)

        scraper_store_factory = get_scraper_store_factory(Database.get_session())        
        
        ScraperService._scraper = Scraper(
            ScraperConfig(
                scraper_urls=scraper_urls,
                max_parallel_requests=16,
                use_headless_browser=False,
                max_queue_size=1024*1024,
                timeout_seconds=30, 
                scraper_store_factory=scraper_store_factory,
                scraper_callback=callback,
                no_cache=no_cache,
            ),
        )
        try:
            return await ScraperService._scraper.run()
        finally:
            await ScraperService._scraper.close()

    async def stop(self, callback: ScraperCallback) -> None:
        if not ScraperService._scraper:
            return
        
        callback.on_log("Stopping scraper")
        if ScraperService._scraper:
            await ScraperService._scraper.stop()

        ScraperService._scraper = None


