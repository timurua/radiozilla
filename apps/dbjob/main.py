from typing import Any
import asyncclick as click
import asyncio
import logging
from pysrc.db.default_data import create_channels
from pysrc.db.database import Database
from pysrc.db.upserter import Upserter
from pysrc.observe.log import Logging
from pysrc.db.service import AudioService, FrontendImageService, WebImageService, WebPageChannelService, WebPageJobService, WebPageService
from pysrc.db.web_page import WebPageJobState, WebPageJob
from pysrc.db.user import User, UserPermission, ActivityLog, Plan
from pysrc.config.rzconfig import RzConfig
from pysrc.config.jobs import Jobs

logger = logging.getLogger("dbjob")

async def add_plan(plan_id: str, name: str, description: str, price_per_month) -> Plan:
    async for session in Database.get_session():
        plan = Plan(
            plan_id=plan_id,
            name=name,
            description=description,
            price_per_month=price_per_month
        )
        await Upserter(session).upsert(plan)
        return plan

async def add_plans() -> None:
    """Add plans to the database."""
    await add_plan("free", "Free Plan", "Free plan with limited features", 0.0)
    await add_plan("personal", "Personal Plan", "Base plan with advanced features", 0.99)
    await add_plan("plus", "Pro Plan", "Pro plan with advanced features", 9.99)


@click.command()
async def main() -> None:
    await Jobs.initialize()       
    Database.initialize()
    logger.info("Creating tables")
    await Database.create_tables()
    await add_plans()
    await create_channels()        
    logger.info("Database job completed successfully.")
       
    
    
def cli() -> None:
    asyncio.run(main())

if __name__ == '__main__':
    cli()