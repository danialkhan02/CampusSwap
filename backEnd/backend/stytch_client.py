import os
from dotenv import load_dotenv
from stytch import Client

load_dotenv()

Project_id = "PROJECT_ID"
Secret = "SECRET"
Environment = "ENVIRONMENT"


class StytchClientWrapper(Client):
    def __init__(self, project_env: str, secret_env: str, environment_env: str):

        super().__init__(
            project_id=os.getenv(project_env),
            secret=os.getenv(secret_env),
            environment=os.getenv(environment_env),
        )


StytchClient = StytchClientWrapper(
    project_env=Project_id, secret_env=Secret, environment_env=Environment
)
