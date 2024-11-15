import aiohttp
import asyncio

class UrlCache:
    def __init__(self):
        self.cache = {}

    def get(self, url):
        return self.cache.get(url)

    def set(self, url, content):
        self.cache[url] = content

class ScrapeContext:
    def __init__(self):
        self.session = aiohttp.ClientSession()
        self.cache = {}

    async def fetch(self, url):
        if url in self.cache:
            return self.cache[url]
        async with self.session.get(url) as response:
            content = await response.text()
            self.cache[url] = content
            return content

    async def close(self):
        await self.session.close()