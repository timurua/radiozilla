from typing import List, Dict, Union
import aiohttp
from datetime import datetime
from enum import Enum

import xml.etree.ElementTree as ET

class ChangeFrequency(Enum):
    ALWAYS = "always"
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"
    NEVER = "never"

    @classmethod
    def from_str(cls, value: str) -> 'ChangeFrequency':
        try:
            return cls(value.lower())
        except ValueError:
            raise ValueError(f"Invalid change frequency: {value}")

class SitemapUrl:
    def __init__(self, loc: str, lastmod: datetime | None) -> None:
        self.loc = loc
        self.lastmod = lastmod

class PageUrl:
    def __init__(self, loc: str, lastmod: datetime | None, changefreq: ChangeFrequency | None, priority: float | None) -> None:
        self.loc = loc
        self.lastmod = lastmod
        self.changefreq = changefreq
        self.priority = priority        


class SitemapParser:
    def __init__(self, xml_content: str) -> None:
        self.xml_content: str = xml_content
        self.tree: ET.ElementTree = ET.ElementTree(ET.fromstring(xml_content))
        self.root: ET.Element = self.tree.getroot()

    def parse(self) -> list[PageUrl]|list[SitemapUrl]:
        if self.root.tag.endswith('urlset'):
            return self._parse_urlset()
        elif self.root.tag.endswith('sitemapindex'):
            return self._parse_sitemapindex()
        else:
            raise ValueError("Unsupported XML format")

    def _parse_urlset(self) -> List[PageUrl]:
        urls = []
        for url in self.root.findall('url'):
            loc_elem = url.find('loc')
            if loc_elem is None or loc_elem.text is None:
                continue
            loc = loc_elem.text
            lastmod_elem = url.find('lastmod')
            lastmod = lastmod_elem.text if lastmod_elem is not None else None
            if lastmod is not None:
                lastmod_date = datetime.fromisoformat(lastmod.replace('Z', '+00:00'))
            changefreq_elem = url.find(
                'changefreq')
            if changefreq_elem is not None:
                changefreq = ChangeFrequency.from_str(changefreq_elem.text) if changefreq_elem.text is not None else None
            priority_elem = url.find(
                'priority')
            if priority_elem is not None:
                priority = float(priority_elem.text) if priority_elem.text is not None else None
            urls.append(PageUrl(loc, lastmod_date, changefreq, priority))

        return urls

    def _parse_sitemapindex(self) -> List[SitemapUrl]:
        sitemaps = []
        for sitemap in self.root.findall('sitemap'):
            loc_elem = sitemap.find('loc')
            if loc_elem is None or loc_elem.text is None:
                continue
            loc = loc_elem.text
            lastmod_elem = sitemap.find('lastmod')
            lastmod = lastmod_elem.text if lastmod_elem is not None else None
            if lastmod is not None:
                lastmod_date = datetime.fromisoformat(lastmod.replace('Z', '+00:00'))
            sitemaps.append(SitemapUrl(loc, lastmod_date))
        return sitemaps

    @classmethod
    async def download_and_parse(cls, url: str) -> List[Dict[str, str]]:
        """Downloads sitemap from URL and returns parsed result"""
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status != 200:
                    raise ValueError(f"Failed to download sitemap: {
                                     response.status}")
                content = await response.text()
                parser = cls(content)
                return parser.parse()
