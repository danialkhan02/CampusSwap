import os
import traceback
from fastapi import FastAPI, status
import rollbar
from fastapi.requests import Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

from backend.api.main import api_app
import uvicorn
from dotenv import load_dotenv
from backend.db_models.connection import init_db
from rollbar.contrib.fastapi import ReporterMiddleware as RollbarMiddleware
from backend.middleware.logging import logger
from backend.environments import logging_env


rollbar.init(
    os.getenv("ROLLBAR_SERVER_ACCESS_TOKEN"),
    environment=logging_env(),
    handler="async",
    enabled=(os.getenv("LOGGING_ENABLED", False) == "True")
)

app = FastAPI()
app.add_middleware(RollbarMiddleware)


@api_app.middleware("http")
async def logging_middleware(request: Request, call_next):
    response = await logger(request, call_next)
    return response


app.mount("/api/v1", api_app)

origin = os.getenv("FRONTEND_URL")
server_url = os.getenv("SERVER_URL", default="127.0.0.1")
server_port = os.getenv("SERVER_PORT")

if origin is None:
    raise ValueError("FRONTEND_URL environment variable not set")

if server_port is None:
    raise ValueError("SERVER_PORT environment variable not set")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.get("/status", status_code=status.HTTP_200_OK)
def read_root():
    return {"message": "OK"}


def start():
    init_db()
    print(f'Logging enabled: {(os.getenv("LOGGING_ENABLED", False) == "True")}')
    if os.getenv("BACKEND_TLS_ENABLED"):
        print("Server running with tls enabled")
        uvicorn.run(
            "backend.main:app",
            host=server_url,
            port=int(server_port),
            reload=True,
            ssl_certfile=os.getenv("BACKEND_TLS_CERT_FILE"),
            ssl_keyfile=os.getenv("BACKEND_TLS_KEY_FILE"),
        )
    else:
        uvicorn.run("backend.main:app", host=server_url, port=int(server_port), reload=True)


if __name__ == "__main__":
    load_dotenv()
    start()
