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

@click.command()
async def main():

    await initialize_db()
    web_page_service = WebPageService(await Database.get_db_session())  
    web_page_summary_service = WebPageSummaryService(await Database.get_db_session())   
    ollama_client = OllamaClient()
    summarizer_service = SummarizerService(web_page_service, ollama_client, web_page_summary_service)
    await summarizer_service.summarizer_web_pages_for_prefix("https://anthropic.com/research/")

def initialize_logging():
    env_name = os.getenv('ENV_NAME', 'unknown_env')
    google_account_file = os.getenv('GOOGLE_ACCOUNT_FILE', './google_account.json')
    google_account_file = os.path.join(os.path.dirname(__file__), google_account_file)
    service_name = os.getenv('SERVICE_NAME', 'unknown_service')
    Logging.initialize(google_account_file, service_name, env_name)

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