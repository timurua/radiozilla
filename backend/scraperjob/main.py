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

@click.command()
@click.argument('storage_dir', type=click.Path(file_okay=False, dir_okay=True, path_type=pathlib.Path))
async def main(storage_dir: pathlib.Path):
    logging.basicConfig(
        # Set the log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        level=logging.INFO,
        # Define the log format
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),  # Log to standard output
        ]
    )
    storage_dir.mkdir(parents=True, exist_ok=True)
    click.echo(f"Storage directory set to: {storage_dir}")

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
            scraper_store_factory=FileStoreFactory(storage_dir.absolute().as_posix()),
        ),
    )
    await scraper.run()

def setup_logging():

    env_name = os.getenv('ENV_NAME', 'default_env')
    service_name = os.getenv('SERVICE_NAME', 'default_service')
    
    credentials = service_account.Credentials.from_service_account_file(
        './firebase_credentials.json'
    )
    client = google.cloud.logging.Client(credentials=credentials)
    client.setup_logging()    

    class CloudLoggingHandler(logging.Handler):
        def __init__(self, log_name=service_name, labels=None):
            super().__init__()
            self.cloud_logger = client.logger(log_name)
            self.labels = labels or {}

        def emit(self, record):
            msg = self.format(record)
            self.cloud_logger.log_struct({
                'message': msg,
                'severity': record.levelname,
                'labels': {
                    **self.labels,
                    **getattr(record, 'labels', {})
                }
            })

    # Usage
    handler = CloudLoggingHandler(labels={'env': env_name, 'service': service_name})
    logger = logging.getLogger()
    logger.addHandler(handler)

def cli():
    load_dotenv()
    setup_logging()
    logging.info("Logging set up")
    """Wrapper function to run async command"""
    return asyncio.run(main())

if __name__ == '__main__':
    cli()