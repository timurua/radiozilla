from aiohttp import web
import asyncclick as click
import asyncio
from pyminiscraper.scraper import Scraper
from pysrc.db.database import Database
from pysrc.db.service import WebPageChannelService, WebPageJobService, WebPageService
from pysrc.db.web_page import WebPageChannel, WebPageContent, WebPageJobState, WebPageSeedType, WebPageSeed, web_page_seed_to_dict, web_page_seed_from_dict, WebPage
from pysrc.observe.log import Logging
from pysrc.scraper.service import ScraperService
from pysrc.scraper.store import ServiceScraperStore
from pysrc.config.rzconfig import RzConfig
from pysrc.utils.parallel import ParallelTaskManager
from pysrc.scraper.utils import convert_seed_type
from pysrc.config.jobs import Jobs
from datetime import datetime
from pysrc.scraper.text import extract_date_from_url
from sqlalchemy import Null
from pyminiscraper.filter import PathFilter
import logging
from pysrc.db.default_data import create_channels

logger = logging.getLogger("scraperjob")

@click.command()
async def main():
    await Jobs.initialize()
    await create_channels()    
    await clean_channels()    
    await scrape_channels()
    await clean_channels()
    
async def scrape_channel(channel: WebPageChannel)->None:
    await ScraperService().scrape_channel(
        channel_normalized_url_hash=channel.normalized_url_hash,
        channel_normalized_url=channel.normalized_url,
        scraper_seeds=web_page_seed_from_dict(channel.scraper_seeds),
        include_path_patterns=channel.include_path_patterns or [],
        exclude_path_patterns=channel.exclude_path_patterns or [],
        scraper_follow_sitemap_links=channel.scraper_follow_sitemap_links,
        scraper_follow_feed_links=channel.scraper_follow_feed_links,
        scraper_follow_web_page_links=channel.scraper_follow_web_page_links,
    )
    
    
async def scrape_channels()->None:
    async with Database.get_session() as session:
        web_page_channel_service = WebPageChannelService(session)
        task_manager = ParallelTaskManager[None](max_concurrent_tasks=5)
                 
        for channel in await web_page_channel_service.find_all():
            task_manager.submit_task(scrape_channel(channel))            
                
        await task_manager.wait_all()

async def clean_channel_web_pages(channel: WebPageChannel)->None:
    async with Database.get_session() as session:
        web_page_job_service = WebPageJobService(session)
        web_page_service = WebPageService(session)
        include_path_filter = PathFilter(channel.include_path_patterns if channel.include_path_patterns else [], True)
        exclude_path_filter = PathFilter(channel.exclude_path_patterns if channel.exclude_path_patterns else [], False)
        web_page_normalized_urls = await web_page_service.find_normalized_urls_by_channel(channel.normalized_url_hash)
        for web_page_normalized_url in web_page_normalized_urls:
            job = await web_page_job_service.find_by_url(web_page_normalized_url)
            if not job:
                continue

            if not include_path_filter.is_passing(job.normalized_url) or exclude_path_filter.is_passing(job.normalized_url):
                if job.state != WebPageJobState.UNPUBLISHED:
                    job.state = WebPageJobState.NEED_UNPUBLISHING
                    await web_page_job_service.upsert(job)
        

async def clean_channels()->None:
    async with Database.get_session() as session:
        web_page_channel_service = WebPageChannelService(session)
        task_manager = ParallelTaskManager[None](max_concurrent_tasks=5)
                 
        for channel in await web_page_channel_service.find_all():
            task_manager.submit_task(clean_channel_web_pages(channel))            
                
        await task_manager.wait_all()        
        
    
def cli():
    return asyncio.run(main())

if __name__ == '__main__':
    cli()