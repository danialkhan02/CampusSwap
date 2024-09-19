import os
from http import HTTPStatus
import json
import rollbar
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException
from fastapi.requests import Request
from starlette.concurrency import iterate_in_threadpool


async def logger(request: Request, call_next):
    response = await call_next(request)
    response_body = [chunk async for chunk in response.body_iterator]
    response.body_iterator = iterate_in_threadpool(iter(response_body))
    response_json = json.loads(response_body[0].decode())
    if response_json.get("error") is not None:
        # Logging logic
        rollbar.report_message(response_json.get("error"), "error", response_json)
        return response
    return response
