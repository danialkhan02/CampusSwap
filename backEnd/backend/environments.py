from enum import Enum
import os

from dotenv import load_dotenv


class ENVIRONMENT(Enum):
    LOCAL = "local"
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "live"


def logging_env():
    load_dotenv()
    env = os.getenv("ENVIRONMENT", None)
    if env is None or env.lower() == ENVIRONMENT.LOCAL.value:
        return "local"
    elif env.lower() == ENVIRONMENT.DEVELOPMENT.value:
        return "development"
    elif env.lower() == ENVIRONMENT.STAGING.value:
        return "staging"
    elif env.lower() == ENVIRONMENT.PRODUCTION.value:
        return "production"
    return "local"
