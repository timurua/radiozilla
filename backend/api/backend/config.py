from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost/db"
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "PyAPI"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()