from typing import Any, AsyncIterator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pysrc.config.rzconfig import RzConfig
from .api.v1 import endpoints
from pysrc.db.database import Database
from pysrc.observe.log import Logging
from contextlib import asynccontextmanager
from pysrc.config.jobs import Jobs
import logging
import os
from pysrc.db.default_data import create_channels
from pysrc.db.web_page import WebPageChannel
 

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    
    await Jobs.initialize()    
    logging.info(f"Starting apiservice for app: {app.title}")
    logging.info(f"Updating default channels")
    # await create_channels()
    yield 
    
logger = logging.getLogger("apiservice.main")
rz_config = RzConfig.initialize()  

app = FastAPI(title="apiservice" , lifespan=lifespan)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(endpoints.router, prefix="/api/v1")

# Mount React static files
static_director = os.getenv("STATIC_DIR", "ui/dist")
app.mount("/", StaticFiles(directory=static_director, html=True, check_dir=False), name="static")
 
