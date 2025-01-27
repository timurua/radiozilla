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
from pysrc.config.jobs import Jobs

@click.command()
async def main():
    await Jobs.initialize()
    ollama_client = OllamaClient(model=RzConfig.instance().ollama_model)
    summarizer_service = SummarizerService(ollama_client)
    await summarizer_service.summarize_web_pages()
    
def cli():
    return asyncio.run(main())

if __name__ == '__main__':
    cli()