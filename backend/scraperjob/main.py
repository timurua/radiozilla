import asyncclick as click
import asyncio
from pyminiscraper.scraper import Scraper, ScraperConfig, ScraperUrl
from pysrc.db.database import Database
from pysrc.db.service import WebPageChannelService
from pysrc.db.web_page import WebPageChannel, WebPageSeedType, WebPageSeed
from pysrc.observe.log import Logging
from pysrc.scraper.store import get_scraper_store_factory
from pysrc.config.rzconfig import RzConfig

@click.command()
async def main():
    rz_config = RzConfig()
    initialize_logging(rz_config)
    await initialize_db(rz_config)

    scraper = Scraper(
        ScraperConfig(
            scraper_urls=[
                ScraperUrl(
                    "https://www.anthropic.com/", max_depth=2)
            ],
            max_parallel_requests=5,
            use_headless_browser=False,
            timeout_seconds=30,
            max_requests_per_hour=600*60,
            only_sitemaps=True,
            only_sitemaps=True,
            scraper_store_factory=get_scraper_store_factory(Database.get_db_session),
        ),
    )
    await scraper.run()
    
async def create_channels()->None:
    web_page_channel_service = WebPageChannelService(await Database.get_db_session())
    await web_page_channel_service.upsert_web_page_channel(
        WebPageChannel(
            normalized_url="https://www.anthropic.com/",
            name="Anthropic",
            description="News from Anthropic",
            image_url="https://www.anthropic.com/favicon.ico",
            enabled=True,
            scraper_seeds=[
                WebPageSeed(url="https://www.anthropic.com/", type=WebPageSeedType.WEB_PAGE),
            ],
            scraper_path_filters = ["/research/"],
            scraper_follow_web_page_links=False,
            scraper_follow_feed_links=True,
            scraper_follow_sitemap_links=True   
        )
    )
    await web_page_channel_service.upsert_web_page_channel(
        WebPageChannel(
            normalized_url="https://deepmind.google/",
            name="DeepMind",
            description="News from DeepMind",
            image_url="https://deepmind.google/favicon.ico",
            enabled=True,
            scraper_seeds=[
                WebPageSeed(url="https://deepmind.google/", type=WebPageSeedType.WEB_PAGE),
            ],
            scraper_path_filters = ["/research/"],
            scraper_follow_web_page_links=False,
            scraper_follow_feed_links=True,
            scraper_follow_sitemap_links=True   
        )
    )    
    await web_page_channel_service.upsert_web_page_channel(
        WebPageChannel(
            normalized_url="https://www.openai.com/",
            name="OpenAI",
            description="News from OpenAI",
            image_url="https://www.openai.com/favicon.ico",
            enabled=True,
            scraper_seeds=[
                WebPageSeed(url="https://openai.com/sitemap.xml/research/", type=WebPageSeedType.SITEMAP),
                WebPageSeed(url="https://openai.com/sitemap.xml/stories/", type=WebPageSeedType.SITEMAP),
            ],
            scraper_path_filters = ["/index/"],
            scraper_follow_web_page_links=False,
            scraper_follow_feed_links=True,
            scraper_follow_sitemap_links=True   
        )
    )    
    await web_page_channel_service.upsert_web_page_channel(
        WebPageChannel(
            normalized_url="https://ai.meta.com/",
            name="Meta AI",
            description="News from Meta AI",
            enabled=True,            
            scraper_seeds=[
                WebPageSeed(url="https://ai.meta.com/", type=WebPageSeedType.WEB_PAGE),
            ],
            scraper_path_filters = ["/research/"],
            scraper_follow_web_page_links=False,
            scraper_follow_feed_links=True,
            scraper_follow_sitemap_links=True   
        )
    )        
    await web_page_channel_service.upsert_web_page_channel(
        WebPageChannel(
            normalized_url="https://blogs.microsoft.com/",
            name="Microsoft AI Blogs",
            description="News from Microsoft AI",
            enabled=True,            
            scraper_seeds=[
                WebPageSeed(url="https://blogs.microsoft.com/", type=WebPageSeedType.WEB_PAGE),
            ],
            scraper_follow_web_page_links=False,
            scraper_follow_feed_links=True,
            scraper_follow_sitemap_links=True   
        )
    )        
    await web_page_channel_service.upsert_web_page_channel(
        WebPageChannel(
            normalized_url="https://aws.amazon.com/",
            name="Amazon AWS AI Blogs",
            description="News from Amazon AWS AI Blogs",
            enabled=True,            
            image_url="https://aws.amazon.com/favicon.ico",
            scraper_seeds=[
                WebPageSeed(url="https://aws.amazon.com/", type=WebPageSeedType.WEB_PAGE),
            ],
            scraper_path_filters=["/blogs/machine-learning/"],
            scraper_follow_web_page_links=False,
            scraper_follow_feed_links=True,
            scraper_follow_sitemap_links=True   
        )
    )            
    await web_page_channel_service.upsert_web_page_channel(
        WebPageChannel(
            normalized_url="https://www.cohere.com/",
            name="Cohere",
            description="News from Cohere",
            image_url="https://www.cohere.com/favicon.ico",
            enabled=True,
            scraper_seeds=[
                WebPageSeed(url="https://www.cohere.com/", type=WebPageSeedType.WEB_PAGE),
            ],
            scraper_follow_web_page_links=False,
            scraper_follow_feed_links=True,
            scraper_follow_sitemap_links=True   
        )
    )    
    await web_page_channel_service.upsert_web_page_channel(
        WebPageChannel(
            normalized_url="https://blog.crewai.com/",
            name="CrewAI",
            description="News from CrewAI",
            image_url="https://www.crewai.com/favicon.ico",
            enabled=True,
            scraper_seeds=[
                WebPageSeed(url="https://blog.crewai.com/", type=WebPageSeedType.WEB_PAGE),
            ],
            scraper_follow_web_page_links=False,
            scraper_follow_feed_links=True,
            scraper_follow_sitemap_links=True   
        )
    )    
    await web_page_channel_service.upsert_web_page_channel(
        WebPageChannel(
            normalized_url="https://blogs.nvidia.com/",
            name="NVIDIA",
            description="News from NVIDIA",
            image_url="https://nvidia.com/favicon.ico",
            enabled=True,
            scraper_seeds=[
                WebPageSeed(url="https://blogs.nvidia.com/", type=WebPageSeedType.WEB_PAGE),
            ],
            scraper_follow_web_page_links=False,
            scraper_follow_feed_links=True,
            scraper_follow_sitemap_links=True   
        )
    )
    await web_page_channel_service.upsert_web_page_channel(
        WebPageChannel(
            normalized_url="https://scale.com/",
            name="Scale AI",
            description="News from Scale AI",
            image_url="https://scale.com/favicon.ico",
            enabled=True,
            scraper_seeds=[
                WebPageSeed(url="https://scale.com/", type=WebPageSeedType.WEB_PAGE),
            ],
            scraper_path_filters = ["/blog/"],
            scraper_follow_web_page_links=False,
            scraper_follow_feed_links=True,
            scraper_follow_sitemap_links=True   
        )
    )   
    await web_page_channel_service.upsert_web_page_channel(
        WebPageChannel(
            normalized_url="https://stability.ai/",
            name="Stability AI",
            description="News from Stability AI",
            image_url="https://stability.ai/favicon.ico",
            enabled=True,
            scraper_seeds=[
                WebPageSeed(url="https://stability.ai/", type=WebPageSeedType.WEB_PAGE),
            ],
            scraper_path_filters = ["/news/"],
            scraper_follow_web_page_links=False,
            scraper_follow_feed_links=True,
            scraper_follow_sitemap_links=True   
        )
    )            
             
        

def initialize_logging(rz_config: RzConfig):    
    Logging.initialize(rz_config.google_account_file, rz_config.service_name, rz_config.env_name)

async def initialize_db(config: RzConfig) -> None:
    db = Database()
    db.initialize(config.db_url)
    await db.create_tables()
    
def cli():
    return asyncio.run(main())

if __name__ == '__main__':
    cli()