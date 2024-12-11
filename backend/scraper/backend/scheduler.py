from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import asyncio
from .services.scraper import ScraperService

class ScraperScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        
    async def start(self):
        """Start the scheduler"""
        if not self.scheduler.running:
            self.scheduler.start()
            self.scheduler.add_job(
                self.scraper_task,
                trigger=CronTrigger.from_crontab("0 * * * *"),
                id="scraper_task",
                replace_existing=True
            )


    
    async def stop(self):
        """Stop the scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()

    async def scraper_task(self):
        """Task that runs periodically"""
        print(f"Periodic task executed at: {datetime.now()}")
        # Simulate some async work
        await asyncio.sleep(1)
    
