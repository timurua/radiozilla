from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .config import settings
from .api.v1 import endpoints
from .database import init_db
from contextlib import asynccontextmanager
import logging
from .scheduler import ScraperScheduler

schedule = ScraperScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    schedule.start()
    yield 
    schedule.stop()
    
# Configure the logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

app = FastAPI(title=settings.PROJECT_NAME , lifespan=lifespan)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(endpoints.router, prefix=settings.API_V1_STR)

# Mount React static files
app.mount("/", StaticFiles(directory="ui/dist", html=True), name="static")
 
