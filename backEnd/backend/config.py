import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load environment variables first
load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str = f"postgresql+psycopg2://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    LOGGING_ENABLED: bool = os.getenv("LOGGING_ENABLED", "False") == "True"
    ROLLBAR_SERVER_ACCESS_TOKEN: str = os.getenv("ROLLBAR_SERVER_ACCESS_TOKEN", "")
    SERVER_PORT: int = int(os.getenv("SERVER_PORT", "6050"))
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:6041")

settings = Settings()