from typing import Any
import asyncclick as click
import asyncio
import logging
from pysrc.db.database import Database
from pysrc.db.upserter import Upserter
from pysrc.observe.log import Logging
from pysrc.db.service import FrontendAudioService, FrontendImageService, WebImageService, WebPageSummaryService, WebPageChannelService, WebPageJobService, WebPageService
from pysrc.db.web_page import WebPageJobState, WebPageJob
from pysrc.db.user import User, UserGroup, UserGroupInvitation, UserUserGroup, ActivityLog
from pysrc.db.frontend import FrontendAudio, FrontendAuthor, FrontendChannel
from pysrc.config.rzconfig import RzConfig
from pysrc.config.jobs import Jobs

logger = logging.getLogger("dbjob")

@click.command()
async def main() -> None:
    await Jobs.initialize()       
    Database.initialize()
    logger.info("Creating tables")
    await Database.create_tables()
    
    
    
def cli() -> None:
    asyncio.run(main())

if __name__ == '__main__':
    cli()