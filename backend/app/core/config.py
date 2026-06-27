from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "postgresql+asyncpg://dsprofile:dsprofile@localhost:5432/dsprofile"
    auth_disabled: bool = True
    storage_backend: str = "minio"
    storage_endpoint: str = "http://localhost:9000"
    storage_access_key: str = "minioadmin"
    storage_secret_key: str = "minioadmin"
    storage_bucket: str = "profile-assets"
    unstructured_backend: str = "local"
    unstructured_base_url: str = "http://localhost:8001"
    unstructured_api_key: str = ""
    default_user_id: str = "dev-user"


settings = Settings()
