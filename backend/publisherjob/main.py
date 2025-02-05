import asyncclick as click
import asyncio
import logging
import os
from pysrc.db.database import Database
from pysrc.observe.log import Logging
from pysrc.db.service import FrontendAudioService, WebImage, WebImageService, WebPageSummaryService, WebPageChannelService, WebPageJobService
from pysrc.db.web_page import WebPageSummary, WebPageChannel, WebPageJobState, WebPageJob
from pysrc.db.frontend import FrontendAudio
from pysrc.config.rzconfig import RzConfig
import ffmpeg # type: ignore
from pysrc.dfs.dfs import MinioClient
import pysrc.fb.rzfb as rzfb
from pyminiscraper.url import normalized_url_hash
from urllib.parse import urlparse
from datetime import datetime
from pysrc.scraper.store import thumbnailed_image_height, thumbnailed_image_width
from pysrc.summarizer.texts import EmbeddingService
from pysrc.utils.parallel import ParallelTaskManager
from pysrc.config.jobs import Jobs
import concurrent

class PublisherContext:
    def __init__(self, rz_author: rzfb.RzAuthor, rz_channels: dict[str, rzfb.RzChannel]):
        self.rz_author = rz_author
        self.rz_channels = rz_channels

executor = concurrent.futures.ThreadPoolExecutor(max_workers=64)

async def publish_firebase_channels(firebase: rzfb.Firebase)-> PublisherContext:
    rz_author = rzfb.RzAuthor(
        id= normalized_url_hash('https://www.radiozilla.com/'),
        name='RadioZilla',
        description='Radiozilla is a podcasting platform that allows you to listen to your favorite AI podcasts.',        
        image=rzfb.Blob(file_path=f"{RzConfig.instance().image_resource_dir}/file-person.svg")
    )
    rz_author.upload_and_save(firebase)    
    channels: dict[str, rzfb.RzChannel] = {}
            
    async with Database.get_session() as session:
        for channel in await WebPageChannelService(session).find_all():
            rz_channel = rzfb.RzChannel(
            id= channel.normalized_url_hash,
            name=channel.name,
            description=channel.description,
            source_urls=[channel.normalized_url],
            image=rzfb.Blob(file_path=f"{RzConfig.instance().image_resource_dir}/rss.svg"),
            image_url=channel.image_url
        )        
        rz_channel.upload_and_save(firebase)
        channels[channel.normalized_url_hash] = rz_channel
    return PublisherContext(rz_author, channels)

async def save_frontend_audio_to_db(                                
                                 web_page_summary: WebPageSummary, 
                                 publisher_context: PublisherContext) -> None:
    
    async with Database.get_session() as session:
        frontend_audio_service = FrontendAudioService(session)

        title_embedding_mlml6v2 = EmbeddingService.calculate_embeddings(web_page_summary.title or "")
        description_embedding_mlml6v2 = EmbeddingService.calculate_embeddings(web_page_summary.description or "")
        audio_text_embedding_mlml6v2 = EmbeddingService.calculate_embeddings(web_page_summary.summarized_text or "")

        frontend_audio = FrontendAudio(
            normalized_url=web_page_summary.normalized_url,
            title=web_page_summary.title,        
            audio_text=web_page_summary.summarized_text,
            description=web_page_summary.description,
            image_url=web_page_summary.image_url,            
            topics=web_page_summary.topics if web_page_summary.topics else [],
            author_id=publisher_context.rz_author.id,
            channel_id=web_page_summary.channel_normalized_url_hash,
            published_at=web_page_summary.published_at,
            uploaded_at=web_page_summary.uploaded_at,
            audio_url=web_page_summary.summarized_text_audio_url,
            title_embedding_mlml6v2=title_embedding_mlml6v2,
            description_embedding_mlml6v2=description_embedding_mlml6v2,
            audio_text_embedding_mlml6v2=audio_text_embedding_mlml6v2
        )
        await frontend_audio_service.upsert(frontend_audio)        
        
        await WebPageJobService(session).upsert(WebPageJob(
            normalized_url=web_page_summary.normalized_url,
            state=WebPageJobState.PUBLISHED
        ))
        
async def publish(normalized_url: str, rz_firebase: rzfb.Firebase, publisher_context: PublisherContext) -> None:
    web_page_summary = None
    web_image = None
    async with Database.get_session() as session:
        web_page_summary = await WebPageSummaryService(session).find_by_url(normalized_url)
        web_image = await WebImageService(session).find_by_url(normalized_url, width=thumbnailed_image_width, height=thumbnailed_image_height)
        
    if web_page_summary is None or web_page_summary.title is None:
        logging.info(f"Skipping (no title) processing summary for URL: {normalized_url}")
        return
    
    logging.info(f"Publishing URL: {normalized_url}")
    await publish_front_end_audio(rz_firebase=rz_firebase, publisher_context=publisher_context, web_page_summary=web_page_summary, web_image=web_image)
    await save_frontend_audio_to_db(web_page_summary=web_page_summary, 
                                publisher_context=publisher_context)        
    
async def unpublish(normalized_url: str, rz_firebase: rzfb.Firebase) -> None:
    hash = normalized_url_hash(normalized_url)        
    rzfb.RzAudio.delete(rz_firebase, hash)    
    async with Database.get_session() as session:
        await WebPageJobService(session).upsert(WebPageJob(
            normalized_url=normalized_url,
            state=WebPageJobState.UNPUBLISHED
        ))
    logging.info(f"Unpublishing URL: {normalized_url}")
    

@click.command()
async def main():
    await Jobs.initialize()
    rz_firebase = rzfb.Firebase(RzConfig.instance().google_account_file)    
    
    normalized_urls_need_publishing = []
    normalized_urls_need_unpublishing = []
    async with Database.get_session() as session:
        normalized_urls_need_publishing = await WebPageJobService(session).find_with_state(WebPageJobState.TTSED_NEED_PUBLISHING)
        normalized_urls_need_unpublishing = await WebPageJobService(session).find_with_state(WebPageJobState.NEED_UNPUBLISHING)      
    
    publisher_context = await publish_firebase_channels(rz_firebase)
    
    task_manager = ParallelTaskManager(4)
    for normalized_url in normalized_urls_need_publishing:
        task_manager.submit_task(publish(normalized_url, rz_firebase, publisher_context))
    for normalized_url in normalized_urls_need_unpublishing:
        task_manager.submit_task(unpublish(normalized_url, rz_firebase))        

    await task_manager.wait_all()
                
def convert_wav_to_m4a(input_wav_path, output_m4a_path):
    try:
        (
            ffmpeg
            .input(input_wav_path)
            .output(output_m4a_path, codec='aac', audio_bitrate='128k')
            .overwrite_output()
            .run()
        )
        logging.info(f"Conversion successful: {output_m4a_path}")
    except ffmpeg.Error as e:
        logging.error(f"An error occurred during conversion: {e.stderr.decode()}")
    except FileNotFoundError:
        logging.error("FFmpeg is not installed or not found in system PATH.")                
                            

async def publish_front_end_audio(rz_firebase: rzfb.Firebase, publisher_context: PublisherContext, web_page_summary: WebPageSummary, web_image: WebImage|None) -> None:    
    url = web_page_summary.summarized_text_audio_url
    if url is None:
        return
    
    parsed_url = urlparse(url)
    path = parsed_url.path
    _, filename = os.path.split(path)

    temp_audio_file = f"{RzConfig.instance().audio_dir}/temp_{filename}"
    try:
        os.remove(temp_audio_file)
    except FileNotFoundError:
        pass
    
    minio_client = MinioClient(RzConfig.instance().minio_endpoint, RzConfig.instance().minio_access_key, RzConfig.instance().minio_secret_key)
    await minio_client.download_file(RzConfig.instance().minio_bucket, filename, temp_audio_file)
    
    rz_audio = rzfb.RzAudio(
        id= normalized_url_hash(web_page_summary.normalized_url),
        name=web_page_summary.title,
        description=web_page_summary.description,
        author_id=publisher_context.rz_author.id,
        channel_id=web_page_summary.channel_normalized_url_hash,
        image=rzfb.PngImage(id=web_image.normalized_url_hash, png_buffer=web_image.image_bytes) if web_image else None,
        image_url=web_page_summary.image_url,
        audio=rzfb.Blob(file_path=temp_audio_file),
        topics=web_page_summary.topics if web_page_summary.topics else [],
        web_url=web_page_summary.normalized_url,  
        duration_seconds=web_page_summary.summarized_text_audio_duration_seconds,
        published_at=web_page_summary.published_at,
        uploaded_at=datetime.now(),
        audio_text=web_page_summary.summarized_text
    )    
        
    await asyncio.get_event_loop().run_in_executor(executor, rz_audio.upload_and_save, rz_firebase)
    
    try:
        os.remove(temp_audio_file)
    except FileNotFoundError:
        pass


def initialize_logging():    
    Logging.initialize(RzConfig.instance().google_account_file, RzConfig.instance().service_name, RzConfig.instance().env_name)

async def initialize_db(config: RzConfig) -> None:
    db = Database()
    db.initialize(config.db_url)
    await db.create_tables()
    
def cli():    
    return asyncio.run(main())

if __name__ == '__main__':
    cli()