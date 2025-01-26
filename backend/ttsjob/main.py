#!/usr/bin/env python3
import asyncclick as click
import asyncio
import logging
import os
from pysrc.db.database import Database
from pysrc.observe.log import Logging
from pysrc.db.service import WebPageSummaryService
from pysrc.db.web_page import WebPageSummary
import ffmpeg # type: ignore
from pysrc.dfs.dfs import MinioClient
from pysrc.config.rzconfig import RzConfig
import soundfile as sf  # type: ignore
from pysrc.utils.parallel import ParallelTaskManager
from pysrc.process.runner import ProcessRunner

@click.command()
async def main():
    initialize_logging(RzConfig.instance())    
    logging.info("Starting TTS job")
    await initialize_db(RzConfig.instance())
    web_page_summary_service = WebPageSummaryService(await Database.get_db_session())
    upsert_web_page_summary_service = WebPageSummaryService(await Database.get_db_session())
    normalized_urls = []
    async def collect_urls(web_page_summary: WebPageSummary):
        normalized_urls.append(web_page_summary.normalized_url)
    await web_page_summary_service.find_web_page_summaries_without_audio(collect_urls)
    logging.info(f"Found {len(normalized_urls)} summaries without audio")
    parallel = ParallelTaskManager(max_concurrent_tasks=2)
    
    async def process_web_page_summary(normalized_url: str):
        web_page_summary = await web_page_summary_service.find_web_page_summary_by_url(normalized_url)
        logging.info(f"Processing summary for URL: {normalized_url}")
        if web_page_summary:
            updated_web_page_summary = await run_tts_job(web_page_summary)
            await upsert_web_page_summary_service.update_web_page_summary(updated_web_page_summary)
            
            
    for normalized_url in normalized_urls:
        parallel.submit_task(process_web_page_summary(normalized_url))
        
    await parallel.wait_all()
        

      
def convert_wav_to_m4a(input_wav_path, output_m4a_path) -> bool:
    try:
        (
            ffmpeg
            .input(input_wav_path)
            .output(output_m4a_path, codec='aac', audio_bitrate='128k')
            .overwrite_output()
            .run()
        )
        logging.info(f"Conversion successful: {output_m4a_path}")
        return True
    except Exception as e:
        logging.error(f"An error occurred during conversion: {str(e)}", exc_info=True)
        
    return False
        
# async def run_tts_job(tts: TTS, web_page_summary: WebPageSummary) -> WebPageSummary:    
#     summarized_text = web_page_summary.summarized_text   
    
#     audio_file_dir = ".generated/audio"
#     audio_file_wav = f"{audio_file_dir}/{web_page_summary.normalized_url_hash}.wav"    
#     audio_filename_m4a  = f"{web_page_summary.normalized_url_hash}.m4a"
#     audio_file_m4a = f"{audio_file_dir}/{audio_filename_m4a}"    
    
#     os.makedirs(audio_file_dir, exist_ok=True)    
    
#     tts.tts_to_file(
#         text=summarized_text,
#         file_path=audio_file_wav,
#         speaker_wav="resources/audio/LJ025-0076.wav",
#         language="en"
#     )   

#     duration = 0
#     try:
#         f = sf.SoundFile(audio_file_wav)
#         duration = int(f.frames / f.samplerate)
#     except Exception as e:
#         logging.error(f"Error occurred while deducing the duration: {e}")
    
#     loop = asyncio.get_event_loop()
#     success = await loop.run_in_executor(None, convert_wav_to_m4a, audio_file_wav, audio_file_m4a)
#     if not success:
#         raise RuntimeError(f"Failed to convert audio file {audio_file_wav} to {audio_file_m4a}")


#     minio_client = MinioClient(RzConfig.instance().minio_endpoint, RzConfig.instance().minio_access_key, RzConfig.instance().minio_secret_key)
#     await minio_client.upload_file(RzConfig.instance().minio_bucket, audio_file_m4a, audio_filename_m4a)    
#     summarized_text_audio_url = minio_client.get_presigned_url(RzConfig.instance().minio_bucket, audio_filename_m4a)
#     logging.info(f"Uploaded audio file to MinIO: {summarized_text_audio_url}")
#     return WebPageSummary(
#         normalized_url_hash = web_page_summary.normalized_url_hash,
#         normalized_url = web_page_summary.normalized_url,
#         title = web_page_summary.title,
#         description = web_page_summary.description,
#         image_url = web_page_summary.image_url,
#         published_at = web_page_summary.published_at,
#         text = web_page_summary.text,
#         summarized_text = web_page_summary.summarized_text,
#         summarized_text_audio_url = summarized_text_audio_url,
#         summarized_text_audio_duration_seconds = duration
#     )        
                            

async def run_tts_job(web_page_summary: WebPageSummary) -> WebPageSummary:    
    summarized_text = web_page_summary.summarized_text
    text_file = f"/app/audio/{web_page_summary.normalized_url_hash}.txt"
    with open(text_file, "w", encoding="utf-8") as f:
        f.write(summarized_text)

    audio_file_wav = f"/app/audio/{web_page_summary.normalized_url_hash}.wav"
    audio_filename_m4a  = f"{web_page_summary.normalized_url_hash}.m4a"
    audio_file_m4a = f"/app/audio/{audio_filename_m4a}"
    

    runner = ProcessRunner(command=[
        "/usr/local/bin/python", 
        "/opt/fish-speech/tools/run_cli.py",
        "--reference-audio-file", 
        "/app/audio_refs/LJ025-0076.wav", 
        "--reference-text-file", 
        "/app/audio_refs/LJ025-0076.txt", 
        "--text-file", 
        f"{text_file}", 
        "--audio-file", 
        f"{audio_file_wav}" ], 
        timeout_minutes=15, 
        cwd="/opt/fish-speech")
        
    try:
        await runner.run()
    except Exception as e:
        logging.error(f"Error occurred: {e}")

    duration = 0
    try:
        f = sf.SoundFile(audio_file_wav)
        duration = int(f.frames / f.samplerate)
    except Exception as e:
        logging.error(f"Error occurred while deducing the duration: {e}")
    
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, convert_wav_to_m4a, audio_file_wav, audio_file_m4a)

    minio_client = MinioClient(RzConfig.instance().minio_endpoint, RzConfig.instance().minio_access_key, RzConfig.instance().minio_secret_key)
    await minio_client.upload_file(RzConfig.instance().minio_bucket, audio_file_m4a, audio_filename_m4a)
    summarized_text_audio_url = minio_client.get_presigned_url(RzConfig.instance().minio_bucket, audio_filename_m4a)
    logging.info(f"Uploaded audio file to MinIO: {summarized_text_audio_url}")
    return WebPageSummary(
        normalized_url_hash = web_page_summary.normalized_url_hash,
        normalized_url = web_page_summary.normalized_url,
        title = web_page_summary.title,
        description = web_page_summary.description,
        image_url = web_page_summary.image_url,
        published_at = web_page_summary.published_at,
        text = web_page_summary.text,
        summarized_text = web_page_summary.summarized_text,
        summarized_text_audio_url = summarized_text_audio_url,
        summarized_text_audio_duration_seconds = duration
    )


def initialize_logging(rz_config: RzConfig):
    Logging.initialize(rz_config.google_account_file, rz_config.service_name, rz_config.env_name)

async def initialize_db(rz_config: RzConfig):
    Database.initialize(rz_config.db_url)
    await Database.create_tables()
    
def cli():
    return asyncio.run(main())

if __name__ == '__main__':
    cli()