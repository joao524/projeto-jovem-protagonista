from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Valores padrão aceitos SOMENTE fora de produção.
_INSECURE_DEFAULTS = {
    "SECRET_KEY": "dev_secret_key_change_in_production_32bytes_min",
    "SECRET_BOARDING_KEY": "secret_boarding_hmac_key_for_qr_codes",
    "PAYMENT_WEBHOOK_SECRET": "dev_webhook_secret_key_2026",
}


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
    SECRET_KEY: str = _INSECURE_DEFAULTS["SECRET_KEY"]
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    SECRET_BOARDING_KEY: str = _INSECURE_DEFAULTS["SECRET_BOARDING_KEY"]
    PAYMENT_WEBHOOK_SECRET: str = _INSECURE_DEFAULTS["PAYMENT_WEBHOOK_SECRET"]

    # CORS: lista separada por vírgula das origens autorizadas a chamar a API.
    CORS_ORIGINS: str = (
        "http://localhost:3000,http://127.0.0.1:3000,"
        "http://localhost:5173,http://127.0.0.1:5173"
    )

    # Endpoints de pagamento simulado (confirm-pix / process-card).
    # Úteis para demonstração; SEMPRE desligados em produção.
    PAYMENT_SIMULATION_ENABLED: bool = True

    # Business rules
    BOOKING_EXPIRATION_MINUTES: int = 15

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in {"production", "prod"}

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def payment_simulation_allowed(self) -> bool:
        return self.PAYMENT_SIMULATION_ENABLED and not self.is_production

    @model_validator(mode="after")
    def _validate_production_secrets(self) -> "Settings":
        if not self.is_production:
            return self
        problems = []
        for name, insecure in _INSECURE_DEFAULTS.items():
            value = getattr(self, name)
            if value == insecure or len(value) < 32:
                problems.append(name)
        if "*" in self.cors_origins_list:
            problems.append("CORS_ORIGINS (curinga '*' não permitido)")
        if problems:
            raise ValueError(
                "Configuração insegura para produção. Defina valores fortes "
                f"(>= 32 caracteres) no ambiente para: {', '.join(problems)}"
            )
        return self


settings = Settings()
