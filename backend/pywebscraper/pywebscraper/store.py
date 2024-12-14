from typing import Optional
from .scrape_model import HttpResponse
from abc import ABC, abstractmethod

class ScraperStore(ABC):
        @abstractmethod
        async def store_url_response(self, response: HttpResponse) -> None:
            pass

        @abstractmethod
        async def load_url_response(self, normalized_url: str) -> Optional[HttpResponse]:
            pass

class ScraperStoreFactory(ABC):
    @abstractmethod
    def new_store(self) -> ScraperStore:
        pass        

