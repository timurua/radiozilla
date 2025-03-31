#!/usr/bin/env python3
from typing import Any
import asyncclick as click
import asyncio
from pysrc.summarizer.summarizer import SummarizerService
from pysrc.config.rzconfig import RzConfig
from pysrc.config.jobs import Jobs

@click.command()
async def main() -> None:
    await Jobs.initialize()
    summarizer_service = SummarizerService(RzConfig.instance().ollama_model)
    await summarizer_service.summarize_web_pages()
    
def cli()-> Any:
    return asyncio.run(main())

if __name__ == '__main__':
    cli()