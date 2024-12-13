import asyncio
import aiohttp
from typing import Optional
from .scrape_html_processor import HtmlContent, HtmlScraperProcessor
import logging
from .scrape_store import ScraperStore
from .scrape_model import HttpResponse
from .url_normalize import normalized_url_hash, normalize_url  
from .scrape_model import ScraperUrl


logger = logging.getLogger("scrape_html_http")

class HttpHtmlScraper:
    def __init__(self, client_session: aiohttp.ClientSession, timeout_seconds: int = 30, scraper_store: ScraperStore | None = None):
        self.client_session = client_session
        self.timeout_seconds = timeout_seconds
        self.scraper_store = scraper_store

    async def scrape(self, url: ScraperUrl) -> Optional[HtmlContent]:
        if (not url.no_cache) and self.scraper_store:
            cached_response = await self.scraper_store.load_url_response(url.normalized_url)
            if cached_response and cached_response.content:
                return HtmlScraperProcessor(url.normalized_url, cached_response.content.decode("utf-8")).extract()
    
        try:
            async with self.client_session.get(url.normalized_url) as http_response:
                if not http_response.status == 200:
                    logger.error(f"Error fetching {url}: {http_response.status}")
                    return None
                html_content = await http_response.text()
                if self.scraper_store:
                    cached_response=HttpResponse(
                    status_code=http_response.status,
                    headers={str(k): str(v) for k, v in dict(http_response.headers).items()},
                    content=html_content.encode("utf-8") if html_content is not None else None,
                    url=url.normalized_url,
                    normalized_url=url.normalized_url,
                    normalized_url_hash=normalized_url_hash(url.normalized_url),
                )
                    await self.scraper_store.store_url_response(cached_response)
                
                
        except (aiohttp.ClientError, asyncio.TimeoutError) as e:
            logger.error(f"Error fetching {url}: {e}")
            return None
        except (aiohttp.ClientResponseError, aiohttp.ClientPayloadError) as e:
            logger.error(f"Error receiving response for {url}: {e}")
        except (UnicodeDecodeError) as e:            
            logger.error(f"Error decoding text for {url}: {e}")
            return None

        return HtmlScraperProcessor(url.normalized_url, html_content).extract()


class HttpHtmlScraperFactory:
    def __init__(self, *, timeout_seconds: int = 30, scraper_store: ScraperStore | None = None):
        self.client_session = aiohttp.ClientSession(
            connector=aiohttp.TCPConnector(ssl=False),
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                'AppleWebKit/537.36 (KHTML, like Gecko) '
                'Chrome/115.0.0.0 Safari/537.36'
            })
        self.timeout_seconds = timeout_seconds
        self.scraper_store = scraper_store

    async def close(self) -> None:
        await self.client_session.close()

    def newScraper(self) -> HttpHtmlScraper:
        return HttpHtmlScraper(self.client_session, self.timeout_seconds)

    def returnScraper(self, scraper: HttpHtmlScraper) -> None:
        pass


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
            try:
                scraper_factory = HttpHtmlScraperFactory()
                scraper = scraper_factory.newScraper()
                result = await scraper.scrape(ScraperUrl("http://cnn.com/", no_cache=True))
                if result:
                    print("Canonical URL:", result.canonical_url)
                    print("Outgoing URLs:", result.outgoing_urls)
                    print("Text Content:", result.visible_text)
                    print("Sitemap URL:", result.sitemap_url)
                    print("Robots Content:", result.robots_content)
            finally:
                await scraper_factory.close()

    asyncio.run(main())
