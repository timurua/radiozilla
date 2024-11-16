import asyncio
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from scrape_html_processor import HtmlContent, HtmlScraperProcessor

class BrowserHtmlScraper:
    def __init__(self, driver: webdriver.Chrome):
        self.driver = driver

    async def scrape(self, url)->HtmlContent:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.driver.get, url)
        html = await loop.run_in_executor(None, lambda: self.driver.page_source)
        return HtmlScraperProcessor(url, html).extract()
    
    
# Example usage:
if __name__ == "__main__":
    async def main() -> None:
        options = Options()
        options.add_argument('--headless')
        driver = webdriver.Chrome(options=options)
        scraper = BrowserHtmlScraper(driver=driver)
        result = await scraper.scrape("https://www.anthropic.com/news")
        if result:
            print("Canonical URL:", result.canonical_url)
            print("Outgoing URLs:", result.outgoing_urls)
            print("Text Content:", result.text_content)
            print("Sitemap URL:", result.sitemap_url)
            print("Robots Content:", result.robots_content)

    asyncio.run(main())
