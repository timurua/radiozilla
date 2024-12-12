import asyncio
from typing import Optional
import logging
from urllib.parse import urlparse
from .scrape_html_http import HttpHtmlScraperFactory
from .scrape_html_browser import BrowserHtmlScraperFactory
from .scrape_model import HttpResponse
import aiohttp
import sys
from .scrape_store import ScraperStore
from .url_normalize import normalize_changing_semantics
from abc import ABC, abstractmethod

logger = logging.getLogger("scraper")

class ScraperUrl:
    def __init__(self, url: str, *, no_cache: bool = False, max_depth: int = 16):
        self.url = url
        if url:
            self.normalized_url = normalize_changing_semantics(
                url)
        else:
            self.normalized_url = ""
        self.no_cache = no_cache
        self.max_depth = max_depth

    @staticmethod
    def create_terminal():
        return ScraperUrl("", max_depth=- 1)

    def is_terminal(self):
        return self.max_depth < 0
    
class ScraperCallback(ABC):
        @abstractmethod
        def on_log(self, text: str) -> None:
            pass



class ScraperPage:
    def __init__(self, url: str, normalized_url: str, status_code: int, content_type: str, outgoing_urls: list[str], text_content: str):
        self.url = url
        self.normalized_url = normalized_url
        self.status_code = status_code
        self.content_type = content_type
        self.outgoing_urls = outgoing_urls
        self.text_content = text_content


class ScraperPageCache:
    async def get(self, url: str) -> Optional[ScraperPage]:
        return None

    async def put(self, page: ScraperPage) -> None:
        return None


class ScraperConfig:
    def __init__(self, *, scraper_urls: list[ScraperUrl],
                 max_parallel_requests: int = 16, allowed_domains: set[str] = set(),
                 page_cache: Optional[ScraperPageCache] = None, max_queue_size: int = 1024*1024,
                 use_headless_browser: bool = False,
                 timeout_seconds: int = 30, max_initiated_urls: int = 64 * 1024,
                 http_html_scraper_factory: HttpHtmlScraperFactory, 
                 browser_html_scraper_factory : BrowserHtmlScraperFactory|None = None,
                 scraper_store: ScraperStore|None = None,
                 scraper_callback: ScraperCallback|None = None):
        self.scraper_urls = scraper_urls
        self.max_parallel_requests = max_parallel_requests
        self.allowed_domains = allowed_domains
        self.allowed_domain_suffixes = set(
            [f".{allowed_domain}" for allowed_domain in allowed_domains])
        self.page_cache = page_cache
        self.max_queue_size = max_queue_size
        self.use_headless_browser = use_headless_browser
        self.timeout_seconds = timeout_seconds
        self.max_initiated_urls = max_initiated_urls
        self.browser_html_scraper_factory = browser_html_scraper_factory
        self.http_html_scraper_factory = http_html_scraper_factory
        self.scraper_store = scraper_store  
        self.scraper_callback = scraper_callback

    def log(self, text: str) -> None:
        logger.info(text)
        if self.scraper_callback:
            self.scraper_callback.on_log(text)
            
class ScraperLoopResult:
    def __init__(self, completed_url_count: int):
        self.completed_urls_count = completed_url_count


class Scraper:
    def __init__(self, config: ScraperConfig):
        self.config = config
        self.initiated_urls: dict[str, ScraperUrl] = {}
        self.initiated_urls_count = 0
        self.completed_urls_count = 0
        self.url_queue: asyncio.Queue[ScraperUrl] = asyncio.Queue(
            maxsize=config.max_queue_size)
        self.pages: dict[str, Optional[ScraperPage]] = {}

    async def start(self):
        for scraper_url in self.config.scraper_urls:
            await self.url_queue.put(scraper_url)

        tasks = []
        for i in range(self.config.max_parallel_requests):
            task = asyncio.create_task(self.scrape_loop(f"Scraper-{i}"))
            tasks.append(task)

    async def scrape_loop(self, name: str) -> ScraperLoopResult:
        completed_urls_count = 0
        while True:
            logging.info(
                f"waiting - looper: {name} i:c={self.initiated_urls_count}:{self.completed_urls_count} URLs")
            scraper_url = await self.url_queue.get()
            if scraper_url.is_terminal():
                logging.info(
                    f"terminating - looper: {name} i:c={self.initiated_urls_count}:{self.completed_urls_count} URLs")
                break

            logging.info(
                f"initiating - {name} i:c={self.initiated_urls_count}:{self.completed_urls_count} url: {scraper_url.normalized_url}")
            page = await self.scrape_url(scraper_url)
            self.pages[scraper_url.normalized_url] = page
            self.completed_urls_count += 1
            completed_urls_count += 1
            logging.info(
                f"completed - {name} i:c={self.initiated_urls_count}:{self.completed_urls_count} url: {scraper_url.normalized_url}, i:c={self.initiated_urls_count}:{self.completed_urls_count}")

            if page is None or len(page.outgoing_urls) == 0 or scraper_url.max_depth <= 0:
                await self.terminate_all_loops_if_needed()
                continue

            for outgoing_url in page.outgoing_urls:
                outgoing_scraper_url = ScraperUrl(
                    outgoing_url, no_cache=False, max_depth=scraper_url.max_depth-1)
                await self.queue_if_allowed(outgoing_scraper_url)

            self.terminate_all_loops_if_needed()

        return ScraperLoopResult(completed_urls_count)

    async def queue_if_allowed(self, outgoing_scraper_url):
        if outgoing_scraper_url.normalized_url in self.initiated_urls:
            return
        if self.is_domain_allowed(outgoing_scraper_url.normalized_url):
            logger.info(f"queueing url i:c={self.initiated_urls_count}:{self.completed_urls_count} - url: {outgoing_scraper_url.normalized_url}")
            self.initiated_urls_count += 1
            self.initiated_urls[outgoing_scraper_url.normalized_url] = outgoing_scraper_url
            await self.url_queue.put(outgoing_scraper_url)

    def is_domain_allowed(self, normalized_url: str) -> bool:
        domain = urlparse(normalized_url).netloc
        if domain in self.config.allowed_domains:
            return True
        for allowed_domain_suffix in self.config.allowed_domain_suffixes:
            if domain.endswith(allowed_domain_suffix):
                return True
        return False

    async def terminate_all_loops_if_needed(self):
        if self.completed_urls_count < self.initiated_urls_count:
            return
        logger.info(f"terminating all loops - i:c={self.initiated_urls_count}:{self.completed_urls_count}")
        for i in range(self.config.max_parallel_requests):
            await self.url_queue.put(ScraperUrl.create_terminal())

    async def scrape_url(self, url: ScraperUrl) -> Optional[ScraperPage]:
        if self.config.use_headless_browser and self.config.browser_html_scraper_factory:
            page = await self.config.browser_html_scraper_factory.newScraper().scrape(url.normalized_url)
        else:
            try:
                scraper = self.config.http_html_scraper_factory.newScraper()
            finally:
                scraper.close()
            with self.config.http_html_scraper_factory.newScraper() as scraper_page_http:
                page = await scraper_page_http.scrape(url.normalized_url)
        return page
    
    async def stop(self) -> None:
        for i in range(self.config.max_parallel_requests):
            await self.url_queue.put(ScraperUrl.create_terminal())
        return


async def main():
    logging.basicConfig(
        # Set the log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        level=logging.INFO,
        # Define the log format
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),  # Log to standard output
        ]
    )
    class InMemoryScraperStore(ScraperStore):
        def __init__(self):
            self.responses = {}
        async def store_url_response(self, response: HttpResponse) -> None:
            self.responses[response.normalized_url] = response
        async def load_url_response(self, normalized_url: str) -> Optional[HttpResponse]:
            return self.responses.get(normalized_url)
        
    store = ScraperStore()
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
            await scraper.start()

if __name__ == "__main__":
    asyncio.run(main())
