import asyncio
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from scrape_html_processor import HtmlContent, HtmlScraperProcessor
import concurrent.futures
import concurrent

class BrowserHtmlScraperFactory:
    def __init__(self):
        self.drivers = []

    def newScraper(self) -> 'BrowserHtmlScraper':
        if len(self.drivers) == 0:
            options = Options()
            options.add_argument('--headless')
            driver = webdriver.Chrome(options=options)
            self.drivers.append(driver)
        
        return BrowserHtmlScraper(self.drivers.pop())

    def returnScraper(self, scraper: 'BrowserHtmlScraper') -> None:
        self.drivers.append(scraper.driver)

class BrowserHtmlScraper:
    def __init__(self, driver: webdriver.Chrome):
        self.driver = driver
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=64)


    def __enter__(self) -> 'BrowserHtmlScraper':
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        pass

    async def scrape(self, url: str)->HtmlContent:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(self.executor, self.driver.get, url)
        html = await loop.run_in_executor(None, lambda: self.driver.page_source)
        return HtmlScraperProcessor(url, html).extract()
    
    
# Example usage:
if __name__ == "__main__":
    async def main() -> None:
        scraper_factory = BrowserHtmlScraperFactory()
        with scraper_factory.newScraper() as scraper:
            result = await scraper.scrape("http://cnn.com/")
            if result:
                print("Canonical URL:", result.canonical_url)
                print("Outgoing URLs:", result.outgoing_urls)
                print("Text Content:", result.text_content)
                print("Sitemap URL:", result.sitemap_url)
                print("Robots Content:", result.robots_content)
    asyncio.run(main())
