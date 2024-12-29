import extruct
import requests
from w3lib.html import get_base_url
from typing import Dict, Optional
from datetime import datetime
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from .model import ScraperWebPage
from dateutil import parser

class PageMetadata:
    def __init__(self, title: str| None = None, description: str|None = None, image: str|None = None, published_at: Optional[datetime] = None)->None:
        self.title = title
        self.description = description
        self.image_url = image
        self.published_at = published_at

class PageMetadataExtractor:
    def __init__(self, url: str, content: str, soup: BeautifulSoup) -> None:
        self.url = url
        self.content = content
        self.soup = soup
        self.base_url = get_base_url(self.content, self.url)
        self.metadata = self._extract_all_metadata()

    def _extract_all_metadata(self) -> dict:
        return extruct.extract(
            self.content,
            base_url=self.base_url,
            uniform=True,
            syntaxes=['opengraph', 'json-ld', 'microdata']
        )

    def get_title(self) -> str:
        """Extract title with fallbacks"""
        # Try OpenGraph
        for item in self.metadata.get('opengraph', []):
            if 'og:title' in item:
                return item['og:title']

        # Try JSON-LD
        for item in self.metadata.get('json-ld', []):
            if 'name' in item:
                return item['name']
            if 'headline' in item:
                return item['headline']

        # Fallback to HTML title tag
        title_tag = self.soup.find('title')
        if title_tag:
            return title_tag.string.strip()

        return ''

    def get_description(self) -> str:
        """Extract description with fallbacks"""
        # Try OpenGraph
        for item in self.metadata.get('opengraph', []):
            if 'og:description' in item:
                return item['og:description']

        # Try JSON-LD
        for item in self.metadata.get('json-ld', []):
            if 'description' in item:
                return item['description']

        # Fallback to meta description
        meta_desc = self.soup.find('meta', attrs={'name': 'description'})
        if meta_desc:
            return meta_desc.get('content', '').strip()

        return ''

    def get_image(self) -> str:
        """Extract main image URL with fallbacks"""
        # Try OpenGraph
        for item in self.metadata.get('opengraph', []):
            if 'og:image' in item:
                return urljoin(self.base_url, item['og:image'])

        # Try JSON-LD
        for item in self.metadata.get('json-ld', []):
            if 'image' in item:
                image = item['image']
                if isinstance(image, list):
                    image = image[0]
                if isinstance(image, str):
                    return urljoin(self.base_url, image)
                if isinstance(image, dict) and 'url' in image:
                    return urljoin(self.base_url, image['url'])

        # Fallback to first significant image
        first_img = self.soup.find('img', attrs={'src': True})
        if first_img:
            return urljoin(self.base_url, first_img['src'])

        return ''

    def get_published_date_string(self) -> Optional[str]:
        """Extract publication date with fallbacks"""
        # Try JSON-LD
        for item in self.metadata.get('json-ld', []):
            for date_field in ['datePublished', 'dateCreated', 'dateModified']:
                if date_field in item:
                    return item[date_field]

        # Try OpenGraph
        for item in self.metadata.get('opengraph', []):
            if 'article:published_time' in item:
                return item['article:published_time']

        # Try meta tags
        meta_date = self.soup.find('meta', attrs={'property': 'article:published_time'})
        if meta_date:
            return meta_date.get('content')

        return None
    
    def get_published_date(self) -> Optional[datetime]:
        """Extract publication date as a datetime object"""
        date_string = self.get_published_date_string()
        if date_string:
            return parser.parse(date_string)
        return None

    def get_all_metadata(self) -> PageMetadata:
        """Get all key metadata fields as a Metadata object"""
        return PageMetadata(
            title=self.get_title(),
            description=self.get_description(),
            image=self.get_image(),
            published_at=self.get_published_date()
        )
