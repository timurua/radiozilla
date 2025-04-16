from typing import Any, AsyncIterator
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
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
static_dir = os.path.abspath(os.getenv("STATIC_DIR", "ui/dist"))
# app.mount("/", StaticFiles(directory=static_director, html=True, check_dir=False), name="static")

# Add a catch-all route for client-side routing
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    if full_path.startswith("api/"):
        # Let API routes handle API requests
        raise HTTPException(status_code=404, detail="API endpoint not found")
    
    # Check if the requested file exists in the static directory
    static_file_path = os.path.abspath(os.path.join(static_dir, full_path))
    if static_file_path.startswith(static_dir) and os.path.isfile(static_file_path):
        return FileResponse(static_file_path)
    
    # If file doesn't exist, serve the React app's index.html for client-side routing
    return FileResponse(f"{static_dir}/index.html")
