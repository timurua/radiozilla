import asyncclick as click
import asyncio
import logging
import os
from pysrc.db.database import Database
from pysrc.observe.log import Logging
from pysrc.db.service import FrontendAudioService, WebPageSummaryService, WebPageChannelService
from pysrc.db.web_page import WebPageSummary, WebPageChannel
from pysrc.db.frontend import FrontendAudio
from pysrc.config.rzconfig import RzConfig
import ffmpeg # type: ignore
from pysrc.dfs.dfs import MinioClient
import pysrc.fb.rzfb as rzfb
from pyminiscraper.url import normalized_url_hash
from urllib.parse import urlparse
from datetime import datetime
from pysrc.summarizer.texts import EmbeddingService
from pysrc.utils.parallel import ParallelTaskManager

class PublisherContext:
    def __init__(self, rz_author: rzfb.RzAuthor, rz_channels: dict[str, rzfb.RzChannel]):
        self.rz_author = rz_author
        self.rz_channels = rz_channels


async def publish_firebase_metadata(rz_config: RzConfig, firebase: rzfb.Firebase, web_page_channel_service: WebPageChannelService)-> PublisherContext:
    rz_author = rzfb.RzAuthor(
        id= normalized_url_hash('https://www.radiozilla.com/'),
        name='RadioZilla',
        description='Radiozilla is a podcasting platform that allows you to listen to your favorite AI podcasts.',        
        image=rzfb.Blob(file_path=f"{rz_config.image_resource_dir}/file-person.svg")
    )
    rz_author.upload_and_save(firebase)
    
    channels: dict[str, rzfb.RzChannel] = {}
    async def process_channel(channel: WebPageChannel):
        rz_channel = rzfb.RzChannel(
            id= channel.normalized_url_hash,
            name=channel.name,
            description=channel.description,
            source_urls=[channel.normalized_url],
            image=rzfb.Blob(file_path=f"{rz_config.image_resource_dir}/rss.svg"),
            image_url=channel.image_url
        )        
        rz_channel.upload_and_save(firebase)
        channels[channel.normalized_url_hash] = rz_channel
            
    await web_page_channel_service.find_all_web_page_channels(process_channel)    
    return PublisherContext(rz_author, channels)

async def publish_frontend_audio(                                
                                 web_page_summary: WebPageSummary, 
                                 publisher_context: PublisherContext) -> None:
    
    async with await Database.get_session() as session:
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
    

@click.command()
async def run_main():
    rz_config = RzConfig()  
    initialize_logging(rz_config)    
    logging.info("Starting publisher job")
    await initialize_db(rz_config)
    rz_firebase = rzfb.Firebase(rz_config.google_account_file)
    web_page_summary_service = WebPageSummaryService(await Database.get_db_session())
    web_page_channel_service = WebPageChannelService(await Database.get_db_session())
    frontend_audio_service = FrontendAudioService(await Database.get_db_session())

    publisher_context = await publish_firebase_metadata(rz_config, rz_firebase, web_page_channel_service)        
    normalized_urls = []
    async def collect_urls(web_page_summary: WebPageSummary):
        normalized_urls.append(web_page_summary.normalized_url)
    await web_page_summary_service.find_all_web_page_summaries(collect_urls)
    task_manager = ParallelTaskManager(4)
    logging.info(f"Found {len(normalized_urls)} summaries without audio")
    for normalized_url in normalized_urls:
        web_page_summary = await web_page_summary_service.find_web_page_summary_by_url(normalized_url)
        if web_page_summary.title is None:
            logging.info(f"Skipping (no title) processing summary for URL: {normalized_url}")
            continue
        logging.info(f"Processing summary for URL: {normalized_url}")
        if web_page_summary:

            async def publish():
                await publish_web_summary(rz_config=rz_config, rz_firebase=rz_firebase, publisher_context=publisher_context, web_page_summary=web_page_summary)            
                await publish_frontend_audio(frontend_audio_service=frontend_audio_service, 
                                            web_page_summary=web_page_summary, 
                                            publisher_context=publisher_context)
                
            task_manager.submit_task(publish())

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
                            

async def publish_web_summary(rz_config: RzConfig, rz_firebase: rzfb.Firebase, publisher_context: PublisherContext, web_page_summary: WebPageSummary) -> None:    
    url = web_page_summary.summarized_text_audio_url
    if url is None:
        return
    
    parsed_url = urlparse(url)
    path = parsed_url.path
    _, filename = os.path.split(path)

    temp_audio_file = f"{rz_config.audio_dir}/temp_{filename}"
    try:
        os.remove(temp_audio_file)
    except FileNotFoundError:
        pass
    
    minio_client = MinioClient(rz_config.minio_endpoint, rz_config.minio_access_key, rz_config.minio_secret_key)
    await minio_client.download_file(rz_config.minio_bucket, filename, temp_audio_file)    

    rz_audio = rzfb.RzAudio(
        id= normalized_url_hash(web_page_summary.normalized_url),
        name=web_page_summary.title,
        description=web_page_summary.description,
        author_id=publisher_context.rz_author.id,
        channel_id=web_page_summary.channel_normalized_url_hash,
        image_url=web_page_summary.image_url,
        audio=rzfb.Blob(file_path=temp_audio_file),
        topics=web_page_summary.topics if web_page_summary.topics else [],
        web_url=web_page_summary.normalized_url,  
        duration_seconds=web_page_summary.summarized_text_audio_duration_seconds,
        published_at=web_page_summary.published_at,
        uploaded_at=datetime.now(),
        audio_text=web_page_summary.summarized_text
    )    
    rz_audio.upload_and_save(rz_firebase)
    try:
        os.remove(temp_audio_file)
    except FileNotFoundError:
        pass


def initialize_logging(rz_config: RzConfig):    
    Logging.initialize(rz_config.google_account_file, rz_config.service_name, rz_config.env_name)

async def initialize_db(config: RzConfig) -> None:
    db = Database()
    db.initialize(config.db_url)
    await db.create_tables()
    
def cli():    
    return asyncio.run(run_main())

if __name__ == '__main__':
    cli()