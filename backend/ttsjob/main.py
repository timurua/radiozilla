#!/usr/bin/env python3
import asyncclick as click
import asyncio
import logging
from pysrc.db.database import Database
from pysrc.db.service import WebPageSummaryService, WebPageJobService, WebPageChannelService
from pysrc.db.web_page import WebPageSummary, WebPageJobState, WebPageChannel, WebPageJob
import ffmpeg # type: ignore
from pysrc.dfs.dfs import MinioClient
from pysrc.config.rzconfig import RzConfig
import soundfile as sf  # type: ignore
from pysrc.utils.parallel import ParallelTaskManager
from pysrc.process.runner import ProcessRunner
from pysrc.config.jobs import Jobs
from pysrc.summarizer.markdown import MarkdownStripper
from pysrc.utils.numberspeller import NumberTextPreprocessor
from pysrc.utils.latexcleaner import LatexCleaner

@click.command()
async def main():
    await Jobs.initialize()
    
    normalized_urls = []
    async with Database.get_session() as session:
        normalized_urls = await WebPageJobService(session).find_with_state(WebPageJobState.SUMMARIZED_NEED_TTSING)

    parallel = ParallelTaskManager(max_concurrent_tasks=3)
    
    async def process_web_page_summary(normalized_url: str):
        web_page_summary = None
        web_page_channel = None

        async with Database.get_session() as session:
            web_page_summary = await WebPageSummaryService(session).find_by_url(normalized_url)            
            if web_page_summary:
                web_page_channel = await WebPageChannelService(session).find_by_hash(web_page_summary.channel_normalized_url_hash)
        logging.info(f"Processing summary for URL: {normalized_url}")
        if web_page_summary and web_page_channel:
            updated_web_page_summary = await run_tts_job(web_page_summary, web_page_channel)
            async with Database.get_session() as session:
                await WebPageSummaryService(session).upsert(updated_web_page_summary)
                await WebPageJobService(session).upsert(WebPageJob(
                    normalized_url = normalized_url,
                    state = WebPageJobState.TTSED_NEED_PUBLISHING,                
                ))   
                
            
            
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
                            

async def run_tts_job(web_page_summary: WebPageSummary, channel: WebPageChannel) -> WebPageSummary:    
    
    summarized_text = MarkdownStripper().strip_all(web_page_summary.summarized_text)
    summarized_text = f"""{channel.name} 
        {web_page_summary.published_at.strftime("%B %d %Y") if web_page_summary.published_at is not None else ""} 
        {summarized_text} """

    summarized_text = LatexCleaner().clean(summarized_text, "math equation")
    summarized_text = NumberTextPreprocessor().preprocess(summarized_text)
    summarized_text.replace("%", " percent ")

    logging.warning(f"Summarized text: {web_page_summary.summarized_text}")
    logging.warning(f"TTS text: {summarized_text}")

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
        duration = int(f.frames / f.samplerate) # type: ignore[attr-defined] 
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
    
def cli():
    return asyncio.run(main())

if __name__ == '__main__':
    cli()