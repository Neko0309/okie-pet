from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Okie Pet API"
    environment: str = "development"

    database_url: str = "postgresql://okiepet:okiepet@localhost:5432/okiepet"

    secret_key: str = "change-me-in-.env"
    access_token_expire_minutes: int = 60 * 24

    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    cors_origins: list[str] = ["http://localhost:5173"]


settings = Settings()
