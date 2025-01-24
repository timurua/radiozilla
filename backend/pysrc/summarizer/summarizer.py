from sqlalchemy.ext.asyncio import AsyncSession
import logging
from ..db.web_page import WebPageSummary
from pyminiscraper.url import normalized_url_hash, normalize_url
from .ollama import OllamaClient
from .prompts import SummaryConfig, SummaryLength, SummaryTone, SummaryFocus, SummaryPrompt, DateDeductionPrompt
from ..db.service import WebPageService, WebPageSummaryService
from ..db.web_page import WebPage
from ..utils.parallel import ParallelTaskManager
from dateutil.parser import parse

logger = logging.getLogger("summarizer")

class SummarizerService:
    
    def __init__(self, web_page_service: WebPageService, ollama_client: OllamaClient, web_page_summary_service: WebPageSummaryService):
        self.logger = logging.getLogger("summarizer")
        self.web_page_service = web_page_service
        self.web_page_summary_service = web_page_summary_service
        self.ollama_client = ollama_client
        self.logger.info("Summarizer service initialized")


    async def summarizer_web_pages_for_prefix(self, url_prefix: str) -> None:

        self.logger.info("Summarizing web pages for prefix: {url_prefix}")
        normalize_urls = []
        async def add_to_normalize_urls(web_page: WebPage) -> None:
            normalize_urls.append(web_page.normalized_url)

        await self.web_page_service.find_web_pages_by_url_prefix(url_prefix, add_to_normalize_urls)
        manager = ParallelTaskManager[str](max_concurrent_tasks=2)

        for normalized_url in normalize_urls:
            manager.submit_function(self.summarize_web_page(normalized_url))

        await manager.wait_all()

        
    async def summarize_web_page(self, normalized_url: str) -> None: 
        web_page = await self.web_page_service.find_web_page_by_url(normalized_url)
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
        summary = await self.ollama_client.generate(prompt)

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
             
        await self.web_page_summary_service.upsert_web_page_summary(WebPageSummary(
            normalized_url = web_page.normalized_url,
            title = web_page.metadata_title,
            description = web_page.metadata_description,
            image_url = web_page.metadata_image_url,
            published_at = published_at,
            text = web_page.visible_text,
            summarized_text = summary,
            summarized_text_audio_url = None,
        ))       
