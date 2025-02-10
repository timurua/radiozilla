from aiohttp import web
import asyncclick as click
import asyncio
from pyminiscraper.scraper import Scraper, ScraperConfig, ScraperUrl, ScraperUrlType
from pysrc.db.database import Database
from pysrc.db.service import WebPageChannelService, WebPageJobService, WebPageService
from pysrc.db.web_page import WebPageChannel, WebPageJobState, WebPageSeedType, WebPageSeed, web_page_seed_to_dict, web_page_seed_from_dict, WebPage
from pysrc.observe.log import Logging
from pysrc.scraper.store import ServiceScraperStore
from pysrc.config.rzconfig import RzConfig
from pysrc.utils.parallel import ParallelTaskManager
from pysrc.config.jobs import Jobs
from datetime import datetime
from pysrc.scraper.text import extract_date_from_url
from sqlalchemy import Null
from pyminiscraper.filter import PathFilter


@click.command()
async def main():
    await Jobs.initialize()
    await create_channels()    
    await clean_channels()    
    await scrape_channels()
    await clean_channels()
    
def convert_seed_type(seed_type: WebPageSeedType)->ScraperUrlType:
    if seed_type == WebPageSeedType.HTML:
        return ScraperUrlType.HTML
    if seed_type == WebPageSeedType.SITEMAP:
        return ScraperUrlType.SITEMAP
    if seed_type == WebPageSeedType.FEED:
        return ScraperUrlType.FEED
    return ScraperUrlType.HTML
    
async def scrape_channel(channel: WebPageChannel)->None:
    seed_urls = [ScraperUrl(
            url=seed.url, 
            type=convert_seed_type(seed.type),  # Convert enum to string value
            max_depth=2
        ) for seed in web_page_seed_from_dict(channel.scraper_seeds)]
    
    def on_web_page(web_page: WebPage):
        web_page.channel_normalized_url_hash = channel.normalized_url_hash
        url_date = extract_date_from_url(web_page.url)
        if web_page.metadata_published_at and abs((web_page.metadata_published_at - web_page.requested_at).total_seconds()) < 60 * 60 * 24:
                web_page.metadata_published_at = None
        if url_date:
            web_page.metadata_published_at = url_date
            
        

    scraper = Scraper(
        ScraperConfig(
            seed_urls=seed_urls,
            include_path_patterns=channel.include_path_patterns if channel.include_path_patterns else [],
            exclude_path_patterns=channel.exclude_path_patterns if channel.exclude_path_patterns else [],
            max_parallel_requests=5,
            use_headless_browser=False,
            request_timeout_seconds=30,
            crawl_delay_seconds=1,
            follow_sitemap_links=channel.scraper_follow_sitemap_links,
            follow_feed_links=channel.scraper_follow_feed_links,
            follow_web_page_links=channel.scraper_follow_web_page_links,            
            callback=ServiceScraperStore(on_web_page=on_web_page),
        ),
    )
    await scraper.run()    
    
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
    
async def create_channels()->None:
    async with Database.get_session() as session:
        web_page_channel_service = WebPageChannelService(session)
        # await web_page_channel_service.upsert_web_page_channel(
        #     WebPageChannel(
        #         url="https://aws.amazon.com/",
        #         name="Amazon AWS AI Blogs",
        #         description="News from Amazon AWS AI Blogs",
        #         enabled=True,            
        #         image_url="https://aws.amazon.com/favicon.ico",
        #         scraper_seeds= web_page_seed_to_dict([
        #             WebPageSeed(url="https://aws.amazon.com/", type=WebPageSeedType.HTML),
        #         ]),
        #         include_path_patterns=["/blogs/machine-learning/"],
        #         scraper_follow_web_page_links=True,
        #         scraper_follow_feed_links=True,
        #         scraper_follow_sitemap_links=True   
        #     )
        # )            
        # await web_page_channel_service.upsert_web_page_channel(
        #     WebPageChannel(
        #         url="https://blogs.nvidia.com/",
        #         name="NVIDIA",
        #         description="News from NVIDIA",
        #         image_url="https://nvidia.com/favicon.ico",
        #         enabled=True,
        #         scraper_seeds=web_page_seed_to_dict([
        #             WebPageSeed(url="https://blogs.nvidia.com/", type=WebPageSeedType.HTML),
        #         ]),
        #         include_path_patterns = ["/blog/"],
        #         scraper_follow_web_page_links=True,
        #         scraper_follow_feed_links=True,
        #         scraper_follow_sitemap_links=True   
        #     )
        # )
        await web_page_channel_service.upsert(
            WebPageChannel(
                url="https://anthropic.com/",
                name="News about Anthropic",
                description="News scraped from Anthropic website",
                image_url="https://anthropic.com/favicon.ico",
                enabled=True,
                scraper_seeds= web_page_seed_to_dict([WebPageSeed("https://anthropic.com/", WebPageSeedType.HTML)]),
                include_path_patterns = ["/research/", "/news/"],
                exclude_path_patterns = ["/$"],
                scraper_follow_web_page_links=True,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=True   
            )
        )
        await web_page_channel_service.upsert(
            WebPageChannel(
                url="https://www.llamaindex.ai/",
                name="News about LlamaIndex",
                description="News scraped from LlamaIndex website",
                image_url="https://www.llamaindex.ai/apple-touch-icon.png",
                enabled=True,
                scraper_seeds= web_page_seed_to_dict([WebPageSeed("https://www.llamaindex.ai/sitemap.xml", WebPageSeedType.SITEMAP)]),
                include_path_patterns = ["/blog/"],
                exclude_path_patterns = ["/$"],
                scraper_follow_web_page_links=False,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=True   
            )
        )
        await web_page_channel_service.upsert(
            WebPageChannel(
                url="https://huggingface.co/",
                name="News about Huggingface",
                description="News scraped from Haggingface website",
                image_url="https://huggingface.co/favicon.ico",
                enabled=True,
                scraper_seeds= web_page_seed_to_dict([WebPageSeed("https://huggingface.co/blog/feed.xml", WebPageSeedType.FEED)]),
                include_path_patterns = ["/blog/"],
                exclude_path_patterns = ["/$"],
                scraper_follow_web_page_links=False,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=False   
            )
        )                
        await web_page_channel_service.upsert(
            WebPageChannel(
                url="https://www.palantir.com/",
                name="News about Palantir",
                description="News scraped from Palantir website",
                image_url=None,
                enabled=True,
                scraper_seeds= web_page_seed_to_dict([WebPageSeed("https://blog.palantir.com/sitemap/sitemap.xml", WebPageSeedType.SITEMAP)]),
                include_path_patterns = [],
                exclude_path_patterns = ["/tagged/", "/$"],
                scraper_follow_web_page_links=False,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=True   
            )
        )
        await web_page_channel_service.upsert(
            WebPageChannel(
                url="https://deepmind.google/",
                name="News scraped from DeepMind website",
                description="News from DeepMind",
                image_url="https://deepmind.google/favicon.ico",
                enabled=True,
                scraper_seeds=web_page_seed_to_dict([
                    WebPageSeed(url="https://deepmind.google/sitemap.xml", type=WebPageSeedType.SITEMAP),
                ]),
                include_path_patterns = ["/research/"],
                exclude_path_patterns = ["/$"],
                scraper_follow_web_page_links=True,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=True   
            )
        )
        await web_page_channel_service.upsert(
            WebPageChannel(
                url="https://openai.com/",
                name="News about OpenAI",
                description="News scraped from OpenAI website",
                image_url="https://openai.com/favicon.ico",
                enabled=True,
                scraper_seeds=web_page_seed_to_dict([
                    WebPageSeed(url="https://openai.com/sitemap.xml/research/", type=WebPageSeedType.SITEMAP),
                ]),
                include_path_patterns = ["/index/"],
                exclude_path_patterns = ["/$"],
                scraper_follow_web_page_links=True,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=True   
            )
        )    
        # await web_page_channel_service.upsert(
        #     WebPageChannel(
        #         url="https://ai.meta.com/",
        #         name="News about Meta AI",
        #         description="News from Meta AI",
        #         enabled=True,            
        #         scraper_seeds=web_page_seed_to_dict([
        #             WebPageSeed(url="https://ai.meta.com/sitemap.xml", type=WebPageSeedType.SITEMAP),
        #         ]),
        #         include_path_patterns = ["/research/publications/"],
        #         scraper_follow_web_page_links=True,
        #         scraper_follow_feed_links=True,
        #         scraper_follow_sitemap_links=True   
        #     )
        # )        
        await web_page_channel_service.upsert(
            WebPageChannel(
                url="https://blogs.microsoft.com/",
                name="News scraped from Microsoft AI website",
                description="News from Microsoft AI",
                enabled=True,            
                scraper_seeds=web_page_seed_to_dict([
                    WebPageSeed(url="https://blogs.microsoft.com/sitemap.xml", type=WebPageSeedType.SITEMAP),
                ]),
                include_path_patterns = ["/blog/2025/"],
                exclude_path_patterns = ["/$"],
                scraper_follow_web_page_links=True,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=True   
            )
        )        
        await web_page_channel_service.upsert(
            WebPageChannel(
                url="https://cohere.com/",
                name="News scraped from Cohere website",
                description="News about Cohere",
                image_url="https://cohere.com/favicon.ico",
                enabled=True,
                scraper_seeds=web_page_seed_to_dict([
                    WebPageSeed(url="https://cohere.com/", type=WebPageSeedType.HTML),
                ]),
                include_path_patterns = ["/research/papers/", "/blog/"],
                exclude_path_patterns = ["/blog/authors/", "/$"],
                scraper_follow_web_page_links=True,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=True   
            )
        )    
        await web_page_channel_service.upsert(
            WebPageChannel(
                url="https://blog.crewai.com/",
                name="News about CrewAI",
                description="News scraped from CrewAI website",
                image_url="https://www.crewai.com/favicon.ico",
                enabled=True,
                scraper_seeds=web_page_seed_to_dict([
                    WebPageSeed(url="https://blog.crewai.com/", type=WebPageSeedType.HTML),
                ]),
                include_path_patterns = ["/*/"],
                exclude_path_patterns = ["/author/", "/$"],
                scraper_follow_web_page_links=True,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=True   
            )
        )    
        await web_page_channel_service.upsert(
            WebPageChannel(
                url="https://scale.com/",
                name="News about Scale AI",
                description="News scraped from Scale AI website",
                image_url="https://scale.com/favicon.ico",
                enabled=True,
                scraper_seeds=web_page_seed_to_dict([
                    WebPageSeed(url="https://scale.com/", type=WebPageSeedType.HTML),
                ]),
                include_path_patterns = ["/research/", "/blog/"],
                exclude_path_patterns = ["/$"],
                scraper_follow_web_page_links=True,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=True   
            )
        )   
        await web_page_channel_service.upsert(
            WebPageChannel(
                url="https://stability.ai/",
                name="News scraped from Stabilty AI website",
                description="News from Stability AI",
                image_url="https://stability.ai/favicon.ico",
                enabled=True,
                scraper_seeds=web_page_seed_to_dict([
                    WebPageSeed(url="https://stability.ai/", type=WebPageSeedType.HTML),
                ]),
                include_path_patterns = ["/news/"],
                exclude_path_patterns = ["/news/tag/", "/news/category/", "/$"],
                scraper_follow_web_page_links=True,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=True   
            )
        )            
    
    
def cli():
    return asyncio.run(main())

if __name__ == '__main__':
    cli()