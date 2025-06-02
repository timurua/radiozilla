from .user import Channel
from .web_page import WebPageChannel, WebPageSeedType, WebPageSeed, web_page_seed_to_dict
from .service import ChannelService, WebPageChannelService
from .database import Database

async def create_channel(web_page_channel: WebPageChannel) -> None:
    async for session in Database.get_session():
        web_page_channel_service = WebPageChannelService(session)
        web_page_channel.is_enabled = True
        web_page_channel.is_public = True
        web_page_channel_saved = await web_page_channel_service.find_by_url(web_page_channel.url)
        if not web_page_channel_saved:
            web_page_channel_saved = await web_page_channel_service.upsert(web_page_channel)
        channel_service = ChannelService(session)
        channel = Channel(
            name=web_page_channel.name,
            description=web_page_channel.description,
            image_url=web_page_channel.image_url,
            web_page_channel_id=web_page_channel_saved.id,
            is_public=web_page_channel.is_public,
            is_enabled=web_page_channel.is_enabled
        )
        channel_saved = await channel_service.find_by_web_page_channel_id   (web_page_channel_saved.id)
        if not channel_saved:
            channel_saved = await channel_service.upsert(channel)
        

async def create_channels()->None:
    async for session in Database.get_session():
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
        await create_channel(
            WebPageChannel(
                url="https://anthropic.com/",
                name="News from Anthropic",
                description="News scraped from Anthropic website",
                image_url="https://anthropic.com/favicon.ico",
                is_enabled=True,
                scraper_seeds= web_page_seed_to_dict([WebPageSeed("https://anthropic.com/", WebPageSeedType.HTML)]),
                include_path_patterns = ["/research/", "/news/"],
                exclude_path_patterns = ["/$"],
                scraper_follow_web_page_links=True,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=True   
            )
        )
        await create_channel(
            WebPageChannel(
                url="https://www.llamaindex.ai/",
                name="News from LlamaIndex",
                description="News scraped from LlamaIndex website",
                image_url="https://www.llamaindex.ai/apple-touch-icon.png",
                is_enabled=True,
                scraper_seeds= web_page_seed_to_dict([WebPageSeed("https://www.llamaindex.ai/sitemap.xml", WebPageSeedType.SITEMAP)]),
                include_path_patterns = ["/blog/"],
                exclude_path_patterns = ["/$"],
                scraper_follow_web_page_links=False,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=True   
            )
        )
        await create_channel(
            WebPageChannel(
                url="https://huggingface.co/",
                name="News from Huggingface",
                description="News scraped from Haggingface website",
                image_url="https://huggingface.co/favicon.ico",
                is_enabled=True,
                scraper_seeds= web_page_seed_to_dict([WebPageSeed("https://huggingface.co/blog/feed.xml", WebPageSeedType.FEED)]),
                include_path_patterns = ["/blog/"],
                exclude_path_patterns = ["/$"],
                scraper_follow_web_page_links=False,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=False   
            )
        )                
        await create_channel(
            WebPageChannel(
                url="https://www.palantir.com/",
                name="News from Palantir",
                description="News scraped from Palantir website",
                image_url=None,
                is_enabled=True,
                scraper_seeds= web_page_seed_to_dict([WebPageSeed("https://blog.palantir.com/sitemap/sitemap.xml", WebPageSeedType.SITEMAP)]),
                include_path_patterns = [],
                exclude_path_patterns = ["/tagged/", "/$"],
                scraper_follow_web_page_links=False,
                scraper_follow_feed_links=True,
                scraper_follow_sitemap_links=True   
            )
        )
        await create_channel(
            WebPageChannel(
                url="https://deepmind.google/",
                name="News from DeepMind",
                description="News scraped from DeepMind website",
                image_url="https://deepmind.google/favicon.ico",
                is_enabled=True,
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
        await create_channel(
            WebPageChannel(
                url="https://openai.com/",
                name="News from OpenAI",
                description="News scraped from OpenAI website",
                image_url="https://openai.com/favicon.ico",
                is_enabled=True,
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
        await create_channel(
            WebPageChannel(
                url="https://blogs.microsoft.com/",
                name="News from Microsoft AI",
                description="News scraped from Microsoft AI website",
                is_enabled=True,            
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
        await create_channel(
            WebPageChannel(
                url="https://cohere.com/",
                name="News from Cohere",
                description="News scraped from Cohere website",
                image_url="https://cohere.com/favicon.ico",
                is_enabled=True,
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
        await create_channel(
            WebPageChannel(
                url="https://blog.crewai.com/",
                name="News from CrewAI",
                description="News scraped from CrewAI website",
                image_url="https://www.crewai.com/favicon.ico",
                is_enabled=True,
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
        await create_channel(
            WebPageChannel(
                url="https://scale.com/",
                name="News from Scale AI",
                description="News scraped from Scale AI website",
                image_url="https://scale.com/favicon.ico",
                is_enabled=True,
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
        await create_channel(
            WebPageChannel(
                url="https://stability.ai/",
                name="News from Stability AI",
                description="News scraped from Stabilty AI website",
                image_url="https://stability.ai/favicon.ico",
                is_enabled=True,
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