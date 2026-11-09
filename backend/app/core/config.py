from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "Projeto Jovem Protagonista"
    API_V1_PREFIX: str = "/api/v1"

    # PostgreSQL
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "jovem_protagonista_db"
    DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/jovem_protagonista_db"
    )

    # Auth & Security
    SECRET_KEY: str = "dev_secret_key_change_in_production_32bytes_min"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    SECRET_BOARDING_KEY: str = "secret_boarding_hmac_key_for_qr_codes"

    # Business rules
    BOOKING_EXPIRATION_MINUTES: int = 15


settings = Settings()
