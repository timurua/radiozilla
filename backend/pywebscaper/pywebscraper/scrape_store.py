import json
from typing import Optional, Dict, Any
import scrape_hash
from scrape_model import HttpResponse
import asyncio
from datetime import datetime
from abc import ABC, abstractmethod

class ScraperStore(ABC):
        @abstractmethod
        async def store_url_response(self, response: HttpResponse) -> None:
            pass

        @abstractmethod
        async def load_url_response(self, normalized_url: str) -> Optional[HttpResponse]:
            pass

