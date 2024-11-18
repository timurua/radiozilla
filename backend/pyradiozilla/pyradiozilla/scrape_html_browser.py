import asyncio
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from scrape_html_processor import HtmlContent, HtmlScraperProcessor
import concurrent.futures
import concurrent
import scrape_store
import scrape_model
from typing import Callable

executor = concurrent.futures.ThreadPoolExecutor(max_workers=64)


class BrowserHtmlScraperFactory:
    def __init__(self, *, scraper_store: scrape_store.ScraperStore | None = None):
        self.scraper_store = scraper_store
        self.drivers: list[webdriver.Chrome] = []

    async def close(self) -> None:
        loop = asyncio.get_event_loop()
        for driver in self.drivers:
            loop.run_in_executor(executor, driver.quit)
        self.drivers = []

    async def __aenter__(self) -> 'BrowserHtmlScraperFactory':
        return self

    async def __aexit__(self, exc_type, exc_value, traceback):
        await self.close()

    async def newScraper(self) -> 'BrowserHtmlScraper':
        return BrowserHtmlScraper(await self._getDriver(), self._returnDriver, self.scraper_store)

    async def _getDriver(self) -> webdriver.Chrome:
        if len(self.drivers) == 0:
            chrome_options = Options()

            # Memory-related flags
            chrome_options.add_argument('--memory-model=low')
            chrome_options.add_argument('--disable-dev-shm-usage')  # Overcome limited resource problems
            chrome_options.add_argument('--disable-application-cache')
            # chrome_options.add_argument('--single-process')  # Run Chrome in a single process
            chrome_options.add_argument('--process-per-site')  # Use one process per site
            chrome_options.add_argument('--renderer-process-limit=2')  # Limit renderer processes

            # Disable features to reduce memory
            chrome_options.add_argument('--disable-extensions')  # Disable extensions
            chrome_options.add_argument('--disable-gpu')  # Disable GPU hardware acceleration
            chrome_options.add_argument('--disable-software-rasterizer')
            chrome_options.add_argument('--disable-javascript')  # Only if you don't need JS
            chrome_options.add_argument('--disable-bundled-ppapi-flash')  # Disable Flash

            # Process and thread limits
            chrome_options.add_argument('--js-flags="--max-old-space-size=512"')  # Limit JS heap size
            chrome_options.add_argument('--initial-memory-in-mb=50')  # Initial memory allocation
            chrome_options.add_argument('--max-memory-in-mb=512')  # Maximum memory allocation

            # Performance optimization
            chrome_options.add_argument('--no-sandbox')  # Careful: security implications
            chrome_options.add_argument('--headless')  # Run in headless mode
            chrome_options.add_argument('--disable-plugins')
            chrome_options.add_argument('--disable-images')  # Disable image loading
            chrome_options.add_argument('--blink-settings=imagesEnabled=false')  # Disable images
            driver = webdriver.Chrome(options=chrome_options)
            self.drivers.append(driver)

        return self.drivers.pop()

    def _returnDriver(self, driver: webdriver.Chrome) -> None:
        self.drivers.append(driver)


class BrowserHtmlScraper:
    def __init__(self, driver: webdriver.Chrome, driver_callback: Callable[[webdriver.Chrome], None], scraper_store: scrape_store.ScraperStore | None = None):
        self.driver = driver
        self.driver_callback = driver_callback
        self.scraper_store = scraper_store

    def __enter__(self) -> 'BrowserHtmlScraper':
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.driver_callback(self.driver) 
        return

    async def scrape(self, url: str) -> HtmlContent:
        if self.scraper_store:
            response = await self.scraper_store.load_url_response(url)
            if response:
                return HtmlScraperProcessor(url, response.content.decode("utf-8")).extract()
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(executor, self.driver.get, url)
        html = await loop.run_in_executor(executor, lambda: self.driver.page_source)
        
        if self.scraper_store:
            response = scrape_model.HttpResponse(
                status_code=200,
                headers={},
                content=html.encode("utf-8"),
                url=url,
                normalized_url=url,
                normalized_url_hash=None,
                updated_at=None
            )
            await self.scraper_store.store_url_response(response)
    
        return HtmlScraperProcessor(url, html).extract()


# Example usage:
if __name__ == "__main__":
    async def main() -> None:
        scraper_factory = BrowserHtmlScraperFactory()
        async with scraper_factory as scraper_factory:
            with await scraper_factory.newScraper() as scraper:
                result = await scraper.scrape("http://cnn.com/")
                if result:
                    print("Canonical URL:", result.canonical_url)
                    print("Outgoing URLs:", result.outgoing_urls)
                    print("Text Content:", result.text_content)
                    print("Sitemap URL:", result.sitemap_url)
                    print("Robots Content:", result.robots_content)
    asyncio.run(main())
