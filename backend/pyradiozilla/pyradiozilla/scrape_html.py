import asyncio
import aiohttp
from aiohttp import ClientError
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import Optional, Dict, Any, List, Set

EXCLUDED_EXTENSIONS = (
    '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
    '.pdf', '.zip', '.tar', '.gz', '.mp3', '.mp4', '.avi', '.mov',
    '.wmv', '.wav', '.flv', '.swf', '.exe', '.dmg', '.iso',
    # Add other non-HTML extensions as needed
)

class HtmlScraper:
    def __init__(self):
        pass

    @staticmethod
    def is_excluded_url(href: str) -> bool:
        """Determine if a URL should be excluded based on its scheme or file extension."""
        # Exclude JavaScript links, mailto links, and fragments
        if href.startswith(('javascript:', 'mailto:', '#')):
            return True
        # Exclude empty hrefs
        if not href.strip():
            return True
        # Exclude URLs with unwanted file extensions
        parsed_href = urlparse(href)
        path = parsed_href.path.lower()
        if any(path.endswith(ext) for ext in EXCLUDED_EXTENSIONS):
            return True
        return False

    async def download_and_extract(self, url: str) -> Optional[Dict[str, Any]]:
        """Asynchronously download a URL's content, extract canonical URL, outgoing links, and text content."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    response.raise_for_status()  # Ensure we notice bad responses
                    html_content = await response.text()
        except (ClientError, asyncio.TimeoutError) as e:
            print(f"Error fetching {url}: {e}")
            return None

        soup = BeautifulSoup(html_content, 'html.parser')

        # Determine the canonical URL
        canonical_link = soup.find('link', rel='canonical')
        if canonical_link and canonical_link.get('href'):
            canonical_url = urljoin(url, canonical_link['href'])
        else:
            canonical_url = url  # Default to the original URL if no canonical link is found
            
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
            sitemap_url = urljoin(url, sitemap_link['href'])
        else:
            sitemap_url = None

        # Extract outgoing URLs
        outgoing_urls: Set[str] = set()
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            if self.is_excluded_url(href):
                continue
            absolute_href = urljoin(url, href)
            outgoing_urls.add(absolute_href)

        # Remove images from the soup to exclude them from the text
        for img in soup.find_all('img'):
            img.decompose()

        # Extract text content with simple formatting
        text_content = soup.get_text(separator='\n', strip=True)

        return {
            'canonical_url': canonical_url,
            'outgoing_urls': list(outgoing_urls),
            'text_content': text_content,
            'sitemap_url': sitemap_url,
        }

# Example usage:
if __name__ == "__main__":
    async def main() -> None:
        scraper = HtmlScraper()
        url_to_process = "https://www.example.com"
        result = await scraper.download_and_extract(url_to_process)
        if result:
            print("Canonical URL:", result['canonical_url'])
            print("Outgoing URLs:", result['outgoing_urls'])
            print("Text Content:", result['text_content'])
            print("Sitemap URL:", result['sitemap_url'])

    asyncio.run(main())
