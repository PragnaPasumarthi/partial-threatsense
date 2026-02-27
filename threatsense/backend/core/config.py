from pydantic import BaseSettings

class Settings(BaseSettings):
    # SMTP Settings
    SMTP_SERVER: str
    SMTP_PORT: int
    SMTP_USERNAME: str
    SMTP_PASSWORD: str
    SMTP_FROM_EMAIL: str

    # Database Settings
    REDIS_URL: str
    MONGODB_URL: str
    
    # Security
    JWT_SECRET: str
    
    # App Settings
    BASE_URL: str

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
