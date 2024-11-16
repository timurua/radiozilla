import asyncio
import aiohttp
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import Optional, Dict, Any, List, Set
from scrape_html_processor import HtmlContent, HtmlScraperProcessor

class HttpHtmlScraper:
    def __init__(self, url: str, client_session: aiohttp.ClientSession, timeout_seconds: int = 30):
        self.url = url
        self.client_session = aiohttp.ClientSession(
            connector=aiohttp.TCPConnector(ssl=False),
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                'AppleWebKit/537.36 (KHTML, like Gecko) '
                'Chrome/115.0.0.0 Safari/537.36'
            })
        self.timeout_seconds = timeout_seconds

    async def scrape(self) -> Optional[HtmlContent]:
        """Asynchronously download a URL's content, extract canonical URL, outgoing links, and text content."""
        try:
            async with self.client_session.get(self.url) as response:
                response.raise_for_status()  # Ensure we notice bad responses
                html_content = await response.text()
        except (aiohttp.ClientError, asyncio.TimeoutError) as e:
            print(f"Error fetching {self.url}: {e}")
            return None
        
        return HtmlScraperProcessor(self.url, html_content).extract()

# Example usage:
if __name__ == "__main__":
    async def main() -> None:
        async with aiohttp.ClientSession(
            connector=aiohttp.TCPConnector(ssl=False),
            headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                      'AppleWebKit/537.36 (KHTML, like Gecko) '
                      'Chrome/115.0.0.0 Safari/537.36'
            }
        ) as session:
            scraper = HttpHtmlScraper(client_session=session, url="http://cnn.com/")
            result = await scraper.scrape()
            if result:
                print("Canonical URL:", result.canonical_url)
                print("Outgoing URLs:", result.outgoing_urls)
                print("Text Content:", result.text_content)
                print("Sitemap URL:", result.sitemap_url)
                print("Robots Content:", result.robots_content)

    asyncio.run(main())
