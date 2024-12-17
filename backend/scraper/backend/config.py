from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost/db"
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Scraper"

    MINIO_ROOT_USER: str = "minioadmin"
    MINIO_ROOT_PASSWORD: str = "minioadmin"
    MINIO_ACCESS_KEY_ID: str = "minioaccess"
    MINIO_SECRET_ACCESS_KEY: str = "miniosecret"
    MINIO_BUCKET_NAME: str = "radiozilla"
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_USE_SSL: bool = False

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()