from datetime import datetime
import feedparser
import bs4
import html

class RssEntry:
    def __init__(self, title: str, description: str, link: str, published_date: datetime) -> None:
        self.title = title
        self.description = description
        self.link = link
        self.published_date = published_date



class RssScraper:
    def __init__(self, feed_url: str) -> None:        
        self.feed_url = feed_url
        
        
    def __clean_html(self, content: str)-> str:
        soup = bs4.BeautifulSoup(content, "html.parser")
        text = soup.get_text()
        clean_text = html.unescape(text).strip()
        return clean_text

    def parse(self)-> list[RssEntry]:
        feed = feedparser.parse(self.feed_url)
        # Step 2: Extract Feed Entries and Process Data
        result = []
        for entry in feed.entries:
            # Parse date and normalize it
            published_date = datetime(*entry.published_parsed[:6])
            title = self.__clean_html(entry.title if entry.title else "")
            description = self.__clean_html(entry.description if entry.description else "")
            link = entry.link if entry.link else ""
            result.append(RssEntry(
                title, description, link, published_date))
        return result
