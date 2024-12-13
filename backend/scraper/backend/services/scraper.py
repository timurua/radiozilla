import time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text as sql_text, select
from pywebscraper.scrape_store import ScraperStore
from pywebscraper.scraper import Scraper, ScraperConfig, ScraperUrl, ScraperCallback
from pywebscraper.scrape_html_browser import BrowserHtmlScraperFactory
from pywebscraper.scrape_html_http import HttpHtmlScraperFactory
from urllib.parse import urlparse


import logging

class ScraperService:
    _scraper: Scraper|None = None
    _http_html_scraper_factory:HttpHtmlScraperFactory|None  = None
    _browser_html_scraper_factory: BrowserHtmlScraperFactory|None = None

    
    def __init__(self, session: AsyncSession):
        self.session = session
        self._start_time = time.time()
        self._version = "1.0.0"
        logging.info("Scraper service initialized")

    async def start(self, scraper_urls: list[ScraperUrl], store: ScraperStore, callback: ScraperCallback) -> None:

        await self.stop(callback)

        callback.on_log("Starting scraper")
        ScraperService._http_html_scraper_factory = HttpHtmlScraperFactory(scraper_store=store)
        ScraperService._browser_html_scraper_factory = BrowserHtmlScraperFactory(scraper_store=store)
        allowed_domains = list(set(urlparse(url.url).netloc for url in scraper_urls))
        
        ScraperService._scraper = Scraper(
            ScraperConfig(
                scraper_urls=scraper_urls,
                max_parallel_requests=16,
                use_headless_browser=True,
                allowed_domains=allowed_domains,
                max_queue_size=1024*1024,
                timeout_seconds=30, 
                http_html_scraper_factory=ScraperService._http_html_scraper_factory,
                browser_html_scraper_factory=ScraperService._browser_html_scraper_factory,
                scraper_store=store,
                scraper_callback=callback,
            ),
        )
        await ScraperService._scraper.start()

    async def stop(self, callback: ScraperCallback) -> None:
        if not ScraperService._scraper:
            return
        
        callback.on_log("Stopping scraper")
        if ScraperService._scraper:
            await ScraperService._scraper.stop()

        if ScraperService._http_html_scraper_factory:
            await ScraperService._http_html_scraper_factory.close()

        if ScraperService._browser_html_scraper_factory:
            await ScraperService._browser_html_scraper_factory.close()

        ScraperService._scraper = None


