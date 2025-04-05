from pyminiscraper.scraper import Scraper, ScraperConfig, ScraperUrl, ScraperUrlType
from pysrc.db.web_page import WebPageChannel, WebPageJobState, WebPageSeedType, WebPageSeed, web_page_seed_to_dict, web_page_seed_from_dict, WebPage

def convert_seed_type(seed_type: WebPageSeedType)->ScraperUrlType:
    if seed_type == WebPageSeedType.HTML:
        return ScraperUrlType.HTML
    if seed_type == WebPageSeedType.SITEMAP:
        return ScraperUrlType.SITEMAP
    if seed_type == WebPageSeedType.FEED:
        return ScraperUrlType.FEED
    return ScraperUrlType.HTML
