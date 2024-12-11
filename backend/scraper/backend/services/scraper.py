import time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text as sql_text, select
from sentence_transformers import SentenceTransformer
from pywebscraper.scrape_store import ScraperStore
from pywebscraper.scraper import Scraper, ScraperConfig, ScraperUrl, ScraperPageCache
from pywebscraper.scrape_html_browser import BrowserHtmlScraperFactory
from pywebscraper.scrape_html_http import HttpHtmlScraperFactory

import logging

class ScraperService:
    _model = None
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self._start_time = time.time()
        self._version = "1.0.0"
        logging.info("Scraper service initialized")

    async def scrape(self, store: ScraperStore) -> None:
        async with HttpHtmlScraperFactory(scraper_store=store) as http_html_scraper_factory:
            async with BrowserHtmlScraperFactory(scraper_store=store) as browser_html_scraper_factory:
                scraper = Scraper(
                    ScraperConfig(
                        scraper_urls=[
                            ScraperUrl("https://www.anthropic.com/news", max_depth=2)
                        ],
                        max_parallel_requests=16,
                        use_headless_browser=True,
                        allowed_domains=["anthropic.com"],
                        page_cache=ScraperPageCache(),
                        max_queue_size=1024*1024,
                        timeout_seconds=30, 
                        http_html_scraper_factory=http_html_scraper_factory,
                        browser_html_scraper_factory=browser_html_scraper_factory
                    ),
                )
                await scraper.scrape()


