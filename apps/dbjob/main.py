from typing import Any
import asyncclick as click
import asyncio
import logging
from pysrc.db.database import Database
from pysrc.db.upserter import Upserter
from pysrc.observe.log import Logging
from pysrc.db.service import FrontendAudioService, FrontendImageService, WebImageService, WebPageSummaryService, WebPageChannelService, WebPageJobService, WebPageService
from pysrc.db.web_page import WebPageJobState, WebPageJob
from pysrc.db.frontend import FrontendAudio, FrontendAuthor, FrontendChannel
from pysrc.config.rzconfig import RzConfig
from pyminiscraper.url import normalized_url_hash, normalize_url
from pysrc.utils.parallel import ParallelTaskManager
from pysrc.config.jobs import Jobs

logger = logging.getLogger("dbjob")

radiozilla_author = FrontendAuthor(
    normalized_url= normalized_url_hash('https://www.radiozilla.com/'),
    normalized_url_hash= normalized_url_hash('https://www.radiozilla.com/'),
    name='RadioZilla',
    description='Radiozilla is a podcasting platform that allows you to listen to your favorite AI podcasts.',
    image_url=f"{RzConfig.instance().image_resource_dir}/file-person.svg"
)

async def publish_authors()-> None:
    async for session in Database.get_session():
        await Upserter(session).upsert(radiozilla_author)        
        
        
async def publish_channels()-> None:
    async for session in Database.get_session():
        for channel in await WebPageChannelService(session).find_all():
            frontend_channel = FrontendChannel(
                normalized_url= channel.normalized_url,
                name=channel.name,
                description=channel.description,
                source_urls=[channel.normalized_url],
                image_url=channel.image_url
            )            
            await session.merge(frontend_channel, load=True)           

            
async def publish_audio( normalized_url: str ) -> None:
    
    async for session in Database.get_session():
        logging.info(f"Publishing URL: {normalized_url}")
        web_page_summary = await WebPageSummaryService(session).find_by_url(normalized_url)
        if web_page_summary is None or web_page_summary.title is None:
            logging.info(f"Skipping (no title) processing summary for URL: {normalized_url}")
            return
        web_page_service = WebPageService(session)
        web_page = await web_page_service.find_by_url(web_page_summary.normalized_url)
        if web_page is None:
            logging.info(f"Skipping (no web page) processing summary for URL: {web_page_summary.normalized_url}")
            return
        web_page_content = await web_page_service.get_content(web_page)
        if web_page_content is None:
            logging.info(f"Skipping (no content) processing summary for URL: {web_page_summary.normalized_url}")
            return
        frontend_audio_service = FrontendAudioService(session)
        image_url = None
        
        web_image = await WebImageService(session).find_by_url(web_page_summary.image_url)
        if web_image is not None:
            web_image_content = await WebImageService(session).get_content(web_image)
            if web_image_content is not None:
                image_url = await FrontendImageService().upsert(web_image, web_image_content)

        frontend_audio = FrontendAudio(
            normalized_url=web_page_summary.normalized_url,
            title=web_page_summary.title,        
            audio_text=web_page_summary.summarized_text,
            description=web_page_summary.description,
            image_url=image_url,  
            web_url=web_page_summary.normalized_url,          
            topics=web_page_summary.topics if web_page_summary.topics else [],
            author_id=radiozilla_author.normalized_url_hash,
            channel_id=web_page_summary.channel_normalized_url_hash,
            published_at=web_page_summary.published_at,
            uploaded_at=web_page_summary.uploaded_at,
            audio_url=web_page_summary.summarized_text_audio_url,
        )
        await frontend_audio_service.upsert(frontend_audio)
        
        await WebPageJobService(session).upsert(WebPageJob(
            normalized_url=web_page_summary.normalized_url,
            state=WebPageJobState.PUBLISHED
        ))
        
    
async def unpublish_audio(normalized_url: str) -> None:
    logging.info(f"Unpublishing URL: {normalized_url}")
    async for session in Database.get_session():        
        frontend_audio = await FrontendAudioService(session).get_by_url(normalized_url)
        if frontend_audio is None:
            logging.info(f"Skipping (no audio) unpublishing URL: {normalized_url}")
            return
        await session.delete(frontend_audio)
        await WebPageJobService(session).upsert(WebPageJob(
            normalized_url=normalized_url,
            state=WebPageJobState.UNPUBLISHED
        ))    
    

@click.command()
async def main() -> None:
    await Jobs.initialize()       
    Database.initialize()
    logger.info("Creating tables")
    await Database.create_tables()
    
                
    
def cli() -> None:
    asyncio.run(main())

if __name__ == '__main__':
    cli()