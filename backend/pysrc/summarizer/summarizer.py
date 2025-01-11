from sqlalchemy.ext.asyncio import AsyncSession
import logging
from ..db.web_page import WebPageSummary
from pyminiscraper.url import normalized_url_hash, normalize_url
from .ollama import OllamaClient
from .prompts import SummaryConfig, SummaryLength, SummaryTone, SummaryFocus, SummaryPrompt
from ..db.service import WebPageService, WebPageSummaryService
from ..db.web_page import WebPage

logger = logging.getLogger("summarizer")

class SummarizerService:
    
    def __init__(self, web_page_service: WebPageService, ollama_client: OllamaClient, web_page_summary_service: WebPageSummaryService):
        self.logger = logging.getLogger("summarizer")
        self.web_page_service = web_page_service
        self.web_page_summary_service = web_page_summary_service
        self.ollama_client = ollama_client
        self.logger.info("Summarizer service initialized")

    async def summarizer_web_pages_for_prefix(self, url_prefix: str) -> WebPageSummary|None:

        self.logger.info("Summarizing web pages for prefix: {url_prefix}")
        web_pages = await self.web_page_service.find_web_pages_by_url_prefix(url_prefix)
        if len(web_pages) == 0:
            logger.error(f"No web pages found for url prefix: {url_prefix}")
            return None
        
        self.logger.info(f"Summarizing {len(web_pages)} web pages")
        
        for web_page in web_pages:            
            await self.summarize_web_page(web_page)
        
    async def summarize_web_page(self, web_page: WebPage) -> None: 
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

        self.logger.info(f"Summarized text: {summary} from text: {web_page.visible_text}")
             
        await self.web_page_summary_service.upsert_web_page_summary(WebPageSummary(
            normalized_url = web_page.normalized_url,
            title = web_page.metadata_title,
            description = web_page.metadata_description,
            image_url = web_page.metadata_image_url,
            published_at = web_page.metadata_published_at,
            text = web_page.visible_text,
            summarized_text = summary,
            summarized_text_audio_url = None,
        ))       
