#!/usr/bin/env python3
import asyncclick as click
import asyncio
import logging
from dotenv import load_dotenv
import os
from pysrc.db.database import Database
from pysrc.observe.log import Logging
from pysrc.db.service import WebPageService, WebPageSummaryService
from pysrc.summarizer.ollama import OllamaClient
from pysrc.summarizer.summarizer import SummarizerService
from pysrc.config.rzconfig import RzConfig

@click.command()
async def main():
    rz_config = RzConfig()
    initialize_logging(rz_config)    
    logging.info("Starting summarizer job")
    await initialize_db(rz_config)
    web_page_service = WebPageService(await Database.get_db_session())  
    web_page_summary_service = WebPageSummaryService(await Database.get_db_session())   
    ollama_client = OllamaClient()
    summarizer_service = SummarizerService(web_page_service, ollama_client, web_page_summary_service)
    await summarizer_service.summarizer_web_pages_for_prefix("https://anthropic.com/research/")

def initialize_logging(rz_config: RzConfig):
    Logging.initialize(rz_config.google_account_file, rz_config.service_name, rz_config.env_name)

async def initialize_db(rz_config: RzConfig):
    Database.initialize(rz_config.db_url)
    await Database.create_tables()
    
def cli():
    return asyncio.run(main())

if __name__ == '__main__':
    cli()