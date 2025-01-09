#!/usr/bin/env python3
import asyncclick as click
import asyncio
import pathlib
import logging
import sys
from pyminiscraper.scraper import Scraper, ScraperConfig, ScraperUrl
from pyminiscraper.store_file import FileStoreFactory
import google.cloud.logging
from google.oauth2 import service_account
import logging
from dotenv import load_dotenv
import os
from pysrc.db.database import Database
from pysrc.logging import Logging
from pysrc.scraper.store import get_scraper_store_factory

@click.command()
async def main():

    await initialize_db()

    scraper = Scraper(
        ScraperConfig(
            scraper_urls=[
                ScraperUrl(
                    "https://www.anthropic.com/news", max_depth=2)
            ],
            max_parallel_requests=100,
            use_headless_browser=True,
            timeout_seconds=30,
            max_requests_per_hour=6*60,
            only_sitemaps=False,
            scraper_store_factory=get_scraper_store_factory(Database.get_db_session),
        ),
    )
    await scraper.run()

def initialize_logging():
    env_name = os.getenv('ENV_NAME', 'unknown_env')
    service_name = os.getenv('SERVICE_NAME', 'unknown_service')
    Logging.initialize('./firebase_credentials.json', service_name, env_name)

async def initialize_db():
    db_url = os.getenv('DB_URL')
    db = Database()
    db.initialize(db_url)
    await db.init_db()
    
def cli():
    load_dotenv()    
    initialize_logging()    
    logging.info("Logging set up")
    """Wrapper function to run async command"""
    return asyncio.run(main())

if __name__ == '__main__':
    cli()