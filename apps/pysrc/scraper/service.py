
from typing import Awaitable, Callable
from pysrc.db.web_page import WebPage, WebPageChannel, WebPageContent, WebPageSeed, web_page_seed_from_dict
import logging
from pyminiscraper.scraper import Scraper
from pyminiscraper.model import ScraperUrl
from pyminiscraper.config import ScraperConfig
from pyminiscraper.stats import ScraperStats

from pysrc.scraper.store import ServiceScraperStore
from pysrc.scraper.text import extract_date_from_url
from pysrc.scraper.utils import convert_seed_type

logger = logging.getLogger("scraperservice")

class ScraperService:
    def __init__(self):
        self.__scraper = None

    async def scrape_channel(self, *, 
                            channel_normalized_url_hash: str, 
                            channel_normalized_url: str, 
                            scraper_seeds: list[WebPageSeed], 
                            include_path_patterns: list[str],
                            exclude_path_patterns: list[str],
                            scraper_follow_sitemap_links: bool,
                            scraper_follow_feed_links: bool,
                            scraper_follow_web_page_links: bool,
                            on_web_page_callback: Callable[[WebPage, WebPageContent], Awaitable[None]]|None = None) -> ScraperStats :
        logger.info(f"Scraping channel {channel_normalized_url}")
        seed_urls = [ScraperUrl(
                url=seed.url, 
                type=convert_seed_type(seed.type),  # Convert enum to string value
                max_depth=2
            ) for seed in scraper_seeds]
        
        async def on_web_page(web_page: WebPage, web_page_content: WebPageContent):
            web_page.channel_normalized_url_hash = channel_normalized_url_hash
            url_date = extract_date_from_url(web_page.url)
            if web_page_content.metadata_published_at and abs((web_page_content.metadata_published_at - web_page.requested_at).total_seconds()) < 60 * 60 * 24:
                    web_page_content.metadata_published_at = None
            if url_date:
                web_page_content.metadata_published_at = url_date

            if on_web_page_callback:
                await on_web_page_callback(web_page, web_page_content)
                
        scraper = Scraper(
            ScraperConfig(
                seed_urls=seed_urls,
                include_path_patterns= include_path_patterns or [],
                exclude_path_patterns=exclude_path_patterns or [],
                max_parallel_requests=5,
                use_headless_browser=False,
                request_timeout_seconds=30,
                crawl_delay_seconds=1,
                follow_sitemap_links=scraper_follow_sitemap_links,
                follow_feed_links=scraper_follow_feed_links,
                follow_web_page_links=scraper_follow_web_page_links,            
                callback=ServiceScraperStore(on_web_page=on_web_page),
            ),
        )
        self.__scraper = scraper
        stats = await scraper.run()   
        logger.info(f"Finished scraping channel {channel_normalized_url}")
        return stats
        

    async def stop(self)-> None:
        logger.info("Stopping scraper service")
        if self.__scraper:
            await self.__scraper.stop()
            self.__scraper = None
        else:
            logger.warning("Scraper service not running")
        logger.info("Scraper service stopped")
