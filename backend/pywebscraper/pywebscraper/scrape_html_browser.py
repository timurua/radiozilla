import asyncio
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from .scrape_html_processor import HtmlContent, HtmlScraperProcessor
import concurrent.futures
import concurrent
from .scrape_store import ScraperStore
from .scrape_model import HttpResponse
from typing import Callable, Awaitable, Tuple
from selenium import webdriver
from selenium.webdriver.common.by import By

executor = concurrent.futures.ThreadPoolExecutor(max_workers=64)


class BrowserHtmlScraperFactory:
    def __init__(self, *, scraper_store: ScraperStore | None = None):
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

    def newScraper(self) -> 'BrowserHtmlScraper':
        return BrowserHtmlScraper(self._getDriver, self._returnDriver, self.scraper_store)

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
    def __init__(self, driver_get: Callable[[], Awaitable[webdriver.Chrome]], driver_return: Callable[[webdriver.Chrome], None], scraper_store: ScraperStore | None = None):
        self.driver_get = driver_get
        self.driver_return = driver_return
        self.scraper_store = scraper_store

    async def scrape(self, url: str) -> HtmlContent|None:
        if self.scraper_store:
            response = await self.scraper_store.load_url_response(url)
            if response and response.content:
                return HtmlScraperProcessor(url, response.content.decode("utf-8")).extract()
        loop = asyncio.get_event_loop()
        try:
            driver = await self.driver_get()
            await loop.run_in_executor(executor, driver.get, url)
            html = await loop.run_in_executor(executor, lambda: driver.page_source)

            def get_driver_data()-> Tuple[str, str, str]:
                elements = driver.find_elements(By.XPATH, "//*")
                def is_displayed(element):
                    try:
                        return element.is_displayed()
                    except:
                        return False
                    
                elements[:] = filter(lambda element: is_displayed(element), elements)
                visible_text = " ".join([element.text for element in elements])
                html = driver.page_source
                title = driver.title
                return html, visible_text, title
            
            data = await loop.run_in_executor(executor, get_driver_data)
            html = data[0]
            visible_text = data[1]
            title = data[2]
            
        finally:
            if driver:
                self.driver_return(driver)
        
        
        if self.scraper_store:
            response = HttpResponse(
                status_code=200,
                headers={},
                content=html.encode("utf-8"),
                visible_text=visible_text,
                url=url,
                normalized_url=url,
                normalized_url_hash=None,
                updated_at=None
            )
            await self.scraper_store.store_url_response(response)
    
        return HtmlScraperProcessor(url, html, visible_text).extract()
    
# Example usage:
if __name__ == "__main__":
    async def main() -> None:
        scraper_factory = BrowserHtmlScraperFactory()
        async with scraper_factory as scraper_factory:
            scraper = scraper_factory.newScraper()
            result = await scraper.scrape("http://cnn.com/")
            if result:
                print("Canonical URL:", result.canonical_url)
                print("Outgoing URLs:", result.outgoing_urls)
                print("Text Content:", result.visible_text)
                print("Sitemap URL:", result.sitemap_url)
                print("Robots Content:", result.robots_content)
    asyncio.run(main())
