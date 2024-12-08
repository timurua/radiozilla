from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .config import settings
from .container import Container
from .api.v1 import endpoints

app = FastAPI(title=settings.PROJECT_NAME)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create and wire container
container = Container()
container.wire(packages=["backend.api"])

# Include API routes
app.include_router(endpoints.router, prefix=settings.API_V1_STR)

# Mount React static files
app.mount("/", StaticFiles(directory="frontend/build", html=True), name="static")