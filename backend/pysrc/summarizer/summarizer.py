from sqlalchemy.ext.asyncio import AsyncSession
import logging
from ..db.web_page import WebPageSummary, WebPageJobState, WebPageJob
from ..db.database import Database
from pyminiscraper.url import normalized_url_hash, normalize_url
from .ollama import OllamaClient
from .prompts import SummaryConfig, SummaryLength, SummaryTone, SummaryFocus, SummaryPrompt, DateDeductionPrompt
from ..db.service import WebPageService, WebPageSummaryService, WebPageJobService
from ..db.web_page import WebPage
from ..utils.parallel import ParallelTaskManager
from dateutil.parser import parse
from .markdown import MarkdownStripper

logger = logging.getLogger("summarizer")

class SummarizerService:
    
    def __init__(self, ollama_client: OllamaClient):
        self.logger = logging.getLogger("summarizer")        
        self.ollama_client = ollama_client
        self.logger.info("Summarizer service initialized")


    async def summarize_web_pages(self) -> None:

        self.logger.info("Summarizing web pages")
        normalized_urls = []
    
        async with Database.get_session() as session:        
            normalized_urls = await WebPageJobService(session).find_with_state(WebPageJobState.SCRAPED_NEED_SUMMARIZING)
                
        manager = ParallelTaskManager[str](max_concurrent_tasks=4)        

        for normalized_url in normalized_urls:
            manager.submit_task(self.summarize_web_page(normalized_url))

        await manager.wait_all()

        
    async def summarize_web_page(self, normalized_url: str) -> None: 
        async with Database.get_session() as session:
            web_page_summary_service = WebPageSummaryService(session)
            web_page_service = WebPageService(session)
            web_page = await web_page_service.find_by_url(normalized_url)
            if web_page is None:
                self.logger.error(f"Failed to find web page for normalized url: {normalized_url}")
                return
            if web_page.metadata_title is None:
                self.logger.error(f"Web page has no title: {normalized_url}")
                return
            self.logger.info(f"Summarizing web page: {web_page.url}")
            summary_confug = SummaryConfig(
                "English",
                SummaryLength.medium,
                SummaryTone.neutral,
                [SummaryFocus.key_points],
            )

            summary_prompt = SummaryPrompt(
                web_page.visible_text,
                summary_confug,
            )

            prompt = summary_prompt.get_prompt()

            summary_with_markdown = await self.ollama_client.generate(prompt)
            summary = MarkdownStripper().strip_all(summary_with_markdown)

            published_at = web_page.metadata_published_at
            if published_at is None:
                date_deduction_prompt = DateDeductionPrompt(
                    web_page.visible_text,
                )
                published_at_text = await self.ollama_client.generate(date_deduction_prompt.get_prompt())
                try:
                    published_at = parse(published_at_text)
                    self.logger.info(f"Deduced published at date: {published_at} from text")            
                except Exception as e:
                    self.logger.error(f"Failed to deduce published at date from text: {published_at_text}")            

            self.logger.info(f"Summarized text: {summary} from text: {web_page.visible_text}")
            
            async with Database.get_session() as session2:
                web_page_summary_service = WebPageSummaryService(session2)
                await web_page_summary_service.upsert(WebPageSummary(
                    normalized_url = web_page.normalized_url,
                    channel_normalized_url_hash = web_page.channel_normalized_url_hash,
                    title = web_page.metadata_title,
                    description = web_page.metadata_description,
                    image_url = web_page.metadata_image_url,
                    published_at = published_at,
                    text = web_page.visible_text,
                    summarized_text = summary,
                    summarized_text_audio_url = None,
                ))    
                await WebPageJobService(session2).upsert(WebPageJob(
                    normalized_url = web_page.normalized_url,
                    state = WebPageJobState.SUMMARIZED_NEED_TTSING,                
                ))   
            
