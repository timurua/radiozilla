import asyncclick as click
import asyncio
from pyminiscraper.scraper import Scraper, ScraperConfig, ScraperUrl, ScraperUrlType
from pysrc.db.database import Database
from pysrc.db.service import WebPageChannelService
from pysrc.db.web_page import WebPageChannel, WebPageSeedType, WebPageSeed, web_page_seed_to_dict, web_page_seed_from_dict, WebPage
from pysrc.observe.log import Logging
from pysrc.scraper.store import get_scraper_store_factory
from pysrc.config.rzconfig import RzConfig
from pysrc.utils.parallel import ParallelTaskManager
import json
from pysrc.config.jobs import Jobs

@click.command()
async def main():
    await Jobs.initialize()
    await create_channels()
    await scrape_channels()
    
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

    scraper = Scraper(
        ScraperConfig(
            seed_urls=seed_urls,
            path_filters=channel.scraper_path_filters if channel.scraper_path_filters else [],
            max_parallel_requests=5,
            use_headless_browser=False,
            request_timeout_seconds=30,
            crawl_delay_seconds=1,
            follow_sitemap_links=channel.scraper_follow_sitemap_links,
            follow_feed_links=channel.scraper_follow_feed_links,
            follow_web_page_links=channel.scraper_follow_web_page_links,            
            scraper_store_factory=get_scraper_store_factory(on_web_page=on_web_page),
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
        #         scraper_path_filters=["/blogs/machine-learning/"],
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
        #         scraper_path_filters = ["/blog/"],
        #         scraper_follow_web_page_links=True,
        #         scraper_follow_feed_links=True,
        #         scraper_follow_sitemap_links=True   
        #     )
        # )
        await web_page_channel_service.upsert(
            WebPageChannel(
                url="https://anthropic.com/",
                name="Anthropic",
                description="News from Anthropic",
                image_url="https://anthropic.com/favicon.ico",
                enabled=True,
                scraper_seeds= web_page_seed_to_dict([WebPageSeed("https://anthropic.com/", WebPageSeedType.HTML)]),
                scraper_path_filters = ["/research/", "/news/"],
                scraper_follow_web_page_links=True,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=True   
            )
        )
        await web_page_channel_service.upsert(
            WebPageChannel(
                url="https://deepmind.google/",
                name="News about DeepMind",
                description="News from DeepMind",
                image_url="https://deepmind.google/favicon.ico",
                enabled=True,
                scraper_seeds=web_page_seed_to_dict([
                    WebPageSeed(url="https://deepmind.google/sitemap.xml", type=WebPageSeedType.SITEMAP),
                ]),
                scraper_path_filters = ["/research/"],
                scraper_follow_web_page_links=True,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=True   
            )
        )
        await web_page_channel_service.upsert(
            WebPageChannel(
                url="https://openai.com/",
                name="News about OpenAI",
                description="News from OpenAI",
                image_url="https://openai.com/favicon.ico",
                enabled=True,
                scraper_seeds=web_page_seed_to_dict([
                    WebPageSeed(url="https://openai.com/sitemap.xml/research/", type=WebPageSeedType.SITEMAP),
                ]),
                scraper_path_filters = ["/index/"],
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
        #         scraper_path_filters = ["/research/publications/"],
        #         scraper_follow_web_page_links=True,
        #         scraper_follow_feed_links=True,
        #         scraper_follow_sitemap_links=True   
        #     )
        # )        
        await web_page_channel_service.upsert(
            WebPageChannel(
                url="https://blogs.microsoft.com/",
                name="News about Microsoft AI Blogs",
                description="News from Microsoft AI",
                enabled=True,            
                scraper_seeds=web_page_seed_to_dict([
                    WebPageSeed(url="https://blogs.microsoft.com/sitemap.xml", type=WebPageSeedType.SITEMAP),
                ]),
                scraper_path_filters = ["/blog/2022/", "/blog/2023/", "/blog/2024/", "/blog/2025/"],
                scraper_follow_web_page_links=True,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=True   
            )
        )        
        await web_page_channel_service.upsert(
            WebPageChannel(
                url="https://cohere.com/",
                name="Cohere",
                description="News about Cohere",
                image_url="https://cohere.com/favicon.ico",
                enabled=True,
                scraper_seeds=web_page_seed_to_dict([
                    WebPageSeed(url="https://cohere.com/", type=WebPageSeedType.HTML),
                ]),
                scraper_path_filters = ["/research/papers/", "/blog/"],
                scraper_follow_web_page_links=True,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=True   
            )
        )    
        await web_page_channel_service.upsert(
            WebPageChannel(
                url="https://blog.crewai.com/",
                name="CrewAI",
                description="News about CrewAI",
                image_url="https://www.crewai.com/favicon.ico",
                enabled=True,
                scraper_seeds=web_page_seed_to_dict([
                    WebPageSeed(url="https://blog.crewai.com/", type=WebPageSeedType.HTML),
                ]),
                scraper_path_filters = ["/*/"],
                scraper_follow_web_page_links=True,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=True   
            )
        )    
        await web_page_channel_service.upsert(
            WebPageChannel(
                url="https://scale.com/",
                name="News about Scale AI",
                description="News from Scale AI",
                image_url="https://scale.com/favicon.ico",
                enabled=True,
                scraper_seeds=web_page_seed_to_dict([
                    WebPageSeed(url="https://scale.com/", type=WebPageSeedType.HTML),
                ]),
                scraper_path_filters = ["/research/", "/blog/"],
                scraper_follow_web_page_links=True,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=True   
            )
        )   
        await web_page_channel_service.upsert(
            WebPageChannel(
                url="https://stability.ai/",
                name="News about Stability AI",
                description="News from Stability AI",
                image_url="https://stability.ai/favicon.ico",
                enabled=True,
                scraper_seeds=web_page_seed_to_dict([
                    WebPageSeed(url="https://stability.ai/", type=WebPageSeedType.HTML),
                ]),
                scraper_path_filters = ["/news/"],
                scraper_follow_web_page_links=True,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=True   
            )
        )            
    
    
def cli():
    return asyncio.run(main())

if __name__ == '__main__':
    cli()