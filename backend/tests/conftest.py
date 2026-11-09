import pytest


@pytest.fixture(autouse=True)
def setup_test_env(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "testing")
    monkeypatch.setenv(
        "SECRET_KEY", "testing_secret_key_32_characters_long_min"
    )
    monkeypatch.setenv("SECRET_BOARDING_KEY", "testing_boarding_secret_key")
