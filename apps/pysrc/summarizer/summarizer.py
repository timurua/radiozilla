import asyncio
from concurrent.futures import ThreadPoolExecutor
import logging

from .crewai_summarizer import CrewAISummarizer
from ..db.web_page import WebPageJobState, WebPageJob
from ..db.database import Database
from pyminiscraper.url import normalized_url_hash, normalize_url
from .ollama import OllamaClient
from .prompts import SummaryConfig, SummaryLength, SummaryTone, SummaryFocus, SummaryPrompt, DateDeductionPrompt
from ..db.service import WebPageService, WebPageSummaryService, WebPageJobService
from ..utils.parallel import ParallelTaskManager
from dateutil.parser import parse
from datetime import datetime

logger = logging.getLogger("summarizer")

executor = ThreadPoolExecutor(max_workers=4)

class SummarizerService:
    
    def __init__(self, ollama_model: str) -> None:
        self.ollama_model = ollama_model
        self.logger = logging.getLogger("summarizer")        
        self.logger.info("Summarizer service initialized")


    async def summarize_web_pages(self) -> None:

        self.logger.info("Summarizing web pages")
        normalized_urls = []
    
        async for session in Database.get_session():     
            normalized_urls = await WebPageJobService(session).find_with_state(WebPageJobState.SCRAPED_NEED_SUMMARIZING)
                
        manager = ParallelTaskManager[str](max_concurrent_tasks=4)        

        for normalized_url in normalized_urls:
            manager.submit_task(self.summarize_web_page(normalized_url))

        await manager.wait_all()
        
    async def summarize_text_v1(self, text: str) -> str:
        summary_confug = SummaryConfig(
            "English",
            SummaryLength.medium,
            SummaryTone.neutral,
            [SummaryFocus.key_points],
        )

        summary_prompt = SummaryPrompt(
            text,
            summary_confug,
        )

        prompt = summary_prompt.get_prompt()

        return await OllamaClient(model=self.ollama_model).generate(prompt)
    
    async def summarize_text_v2(self, text: str) -> str:
        news_summarizer = CrewAISummarizer(self.ollama_model)
        return await asyncio.get_event_loop().run_in_executor(executor, news_summarizer.generate_summary, text)        

        
    async def summarize_web_page(self, normalized_url: str) -> None: 
        async for session in Database.get_session():
            web_page_summary_service = WebPageSummaryService(session)
            web_page_service = WebPageService(session)
            web_page = await web_page_service.find_by_url(normalized_url)
            if web_page is None:
                self.logger.error(f"Failed to find web page for normalized url: {normalized_url}")
                return
            
            web_page_content = await web_page_service.get_content(web_page)
            if web_page_content is None:
                self.logger.error(f"Failed to find web page content for normalized url: {normalized_url}")
                return
            
            if web_page_content.metadata_title is None:
                self.logger.error(f"Web page has no title: {normalized_url}")
                return
            
            if web_page_content.visible_text is None:
                self.logger.error(f"Web page has no title: {normalized_url}")
                return
            

            self.logger.info(f"Summarizing web page: {web_page.url}")
            
            summary = await self.summarize_text_v2(web_page_content.visible_text)

            published_at = None            
            date_deduction_prompt = DateDeductionPrompt(
                web_page_content.visible_text,
            )
            published_at_text = await OllamaClient(model=self.ollama_model).generate(date_deduction_prompt.get_prompt())
            try:
                parsed_date = parse(published_at_text)
                if parsed_date:
                    if parsed_date > datetime.now():
                        self.logger.warning(f"Deduced date {parsed_date} is in the future, skipping")
                    else:             
                        published_at = parsed_date.replace(tzinfo=None)
                self.logger.info(f"Deduced published at date: {published_at} from text")            
            except Exception as e:
                self.logger.error(f"Failed to deduce published at date from text: {published_at_text}")
                
            if published_at is None:
                published_at = web_page_content.metadata_published_at

            self.logger.info(f"Summarized text: {summary} from text: {web_page_content.visible_text}")
            
            web_page_summary_service = WebPageSummaryService(session)
            await web_page_summary_service.upsert(WebPageSummary(
                normalized_url = web_page.normalized_url,
                channel_normalized_url_hash = web_page.channel_normalized_url_hash,
                title = web_page_content.metadata_title,
                description = web_page_content.metadata_description,
                image_url = web_page_content.metadata_image_url,
                published_at = published_at,
                text = web_page_content.visible_text,
                summarized_text = summary,
                summarized_text_audio_url = None,
            ))    
            await WebPageJobService(session).upsert(WebPageJob(
                normalized_url = web_page.normalized_url,
                state = WebPageJobState.SUMMARIZED_NEED_TTSING,                
            ))   
        
