import asyncio
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from scrape_html_processor import HtmlContent, HtmlScraperProcessor
import concurrent.futures
import concurrent

executor = concurrent.futures.ThreadPoolExecutor(max_workers=64)


class BrowserHtmlScraperFactory:
    def __init__(self):
        self.drivers = []

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
        return BrowserHtmlScraper(self)

    async def _getDriver(self) -> webdriver.Chrome:
        if len(self.drivers) == 0:
            options = Options()
            options.add_argument('--headless')
            driver = webdriver.Chrome(options=options)
            self.drivers.append(driver)

        return self.drivers.pop()

    def _returnDriver(self, driver: webdriver.Chrome) -> None:
        self.drivers.append(driver)


class BrowserHtmlScraper:
    def __init__(self, factory: BrowserHtmlScraperFactory):
        self.factory = factory

    async def __aenter__(self) -> 'BrowserHtmlScraper':
        self.driver = await self.factory._getDriver()
        return self

    async def __aexit__(self, exc_type, exc_value, traceback):
        self.factory._returnDriver(self.driver)
        return

    async def scrape(self, url: str) -> HtmlContent:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(executor, self.driver.get, url)
        html = await loop.run_in_executor(executor, lambda: self.driver.page_source)
        return HtmlScraperProcessor(url, html).extract()


# Example usage:
if __name__ == "__main__":
    async def main() -> None:
        scraper_factory = BrowserHtmlScraperFactory()
        async with scraper_factory as scraper_factory:
            async with scraper_factory.newScraper() as scraper:
                result = await scraper.scrape("http://cnn.com/")
                if result:
                    print("Canonical URL:", result.canonical_url)
                    print("Outgoing URLs:", result.outgoing_urls)
                    print("Text Content:", result.text_content)
                    print("Sitemap URL:", result.sitemap_url)
                    print("Robots Content:", result.robots_content)
    asyncio.run(main())
