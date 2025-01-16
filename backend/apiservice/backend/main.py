from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pysrc.config.rzconfig import RzConfig
from .api.v1 import endpoints
from pysrc.db.database import Database
from pysrc.observe.log import Logging
from contextlib import asynccontextmanager
import logging

def initialize_logging(rz_config: RzConfig):    
    Logging.initialize(rz_config.google_account_file, rz_config.service_name, rz_config.env_name)

async def initialize_db(config: RzConfig) -> None:
    db = Database()
    db.initialize(config.db_url)
    await db.create_tables()    

@asynccontextmanager
async def lifespan(app: FastAPI):
    rz_config = RzConfig.initialize()  
    initialize_logging(rz_config)    
    logging.info("Starting apiservice")
    await initialize_db(rz_config)
    yield 
    
logger = logging.getLogger("apiservice.main")

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
app.mount("/", StaticFiles(directory="apiservice/ui/dist", html=True), name="static")
 
