import os
from pathlib import Path

from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parent.parent / ".env")


class Settings:
    app_name: str = os.getenv("APP_NAME", "NYRA-PLUS")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"


settings = Settings()
