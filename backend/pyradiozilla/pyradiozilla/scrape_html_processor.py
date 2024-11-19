import asyncio
import aiohttp
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import Optional, Dict, Any, List, Set

EXCLUDED_EXTENSIONS = (
    '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
    '.pdf', '.zip', '.tar', '.gz', '.mp3', '.mp4', '.avi', '.mov',
    '.wmv', '.wav', '.flv', '.swf', '.exe', '.dmg', '.iso',
    # Add other non-HTML extensions as needed
)

class HtmlContent:
    def __init__(self, canonical_url: str, outgoing_urls: list[str], visible_text: str, sitemap_url: str | None, robots_content: list[str]):
        self.canonical_url = canonical_url
        self.outgoing_urls = outgoing_urls
        self.visible_text = visible_text
        self.sitemap_url = sitemap_url
        self.robots_content = robots_content

class HtmlScraperProcessor:
    def __init__(self, url: str, html: str, visible_text: str | None = None):
        self.url = url
        self.html = html
        self.visible_text = visible_text

    @staticmethod
    def is_excluded_url(href: str) -> bool:
        """Determine if a URL should be excluded based on its scheme or file extension."""
        # Exclude empty hrefs
        href = href.strip()
        if not href:
            return True
        
        # Exclude JavaScript links, mailto links, and fragments
        if href.startswith(('javascript:', 'mailto:', '#')):
            return True
        
        # Exclude URLs with unwanted file extensions
        parsed_href = urlparse(href)
        path = parsed_href.path.lower()
        if any(path.endswith(ext) for ext in EXCLUDED_EXTENSIONS):
            return True
        return False

    def extract(self) -> Optional[HtmlContent]:
        soup = BeautifulSoup(self.html, 'lxml')

        # Determine the canonical URL
        canonical_link = soup.find('link', rel='canonical')
        if canonical_link and canonical_link.get('href'):
            canonical_url = urljoin(self.url, canonical_link['href'])
        else:
            canonical_url = self.url  # Default to the original URL if no canonical link is found
            
        # Extract robots.txt URL from metadata
        robots_meta = soup.find('meta', attrs={'name': 'robots'})
        if robots_meta and robots_meta.get('content'):
            robots_content = robots_meta['content']
            if robots_content:
                robots_content = robots_content.split()
        else:
            robots_content = None
            
        # Extract sitemap URL from metadata
        sitemap_link = soup.find('link', rel='sitemap')
        if sitemap_link and sitemap_link.get('href'):
            sitemap_url = urljoin(self.url, sitemap_link['href'])
        else:
            sitemap_url = None

        # Extract outgoing URLs
        outgoing_urls: Set[str] = set()
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            if self.is_excluded_url(href):
                continue
            absolute_href = urljoin(self.url, href)
            outgoing_urls.add(absolute_href)

        # Remove images from the soup to exclude them from the text
        for img in soup.find_all('img'):
            img.decompose()

        # Extract text content with simple formatting
        text_content = soup.get_text(separator='\n', strip=True)
        
        return HtmlContent(canonical_url, list(outgoing_urls), text_content, sitemap_url, robots_content)
