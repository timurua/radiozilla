import time
from pyminiscraper.scraper import Scraper, ScraperConfig, ScraperUrl
from pyminiscraper.config import ScraperConfig, ScraperCallback
from pyminiscraper.stats import ScraperStats
import logging

class ScraperService:
    _scraper: Scraper|None = None
    
    def __init__(self) -> None:
        self._start_time = time.time()
        self._version = "1.0.0"
        logging.info("Scraper service initialized")

    async def run(self, seed_urls: list[ScraperUrl], callback: ScraperCallback) -> ScraperStats | None:

        await self.stop(callback)

        ScraperService._scraper = Scraper(
            ScraperConfig(
                seed_urls=seed_urls,
                max_parallel_requests=16,
                use_headless_browser=False,                
                callback=callback,
            ),
        )
        try:
            scraper_stats = await ScraperService._scraper.run()
            return scraper_stats
        except:
            return None
    

    async def stop(self, callback: ScraperCallback) -> None:
        if not ScraperService._scraper:
            return
        
        await callback.on_log("Stopping scraper")
        if ScraperService._scraper:
            await ScraperService._scraper.stop()

        ScraperService._scraper = None


