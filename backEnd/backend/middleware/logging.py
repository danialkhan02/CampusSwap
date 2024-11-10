import os
from http import HTTPStatus
import json
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException
from fastapi.requests import Request
from starlette.concurrency import iterate_in_threadpool


async def logger(request: Request, call_next):
    response = await call_next(request)
    
    # Skip logging for documentation endpoints
    if request.url.path in ["/docs", "/redoc", "/openapi.json"]:
        return response

    try:
        response_body = [chunk async for chunk in response.body_iterator]
        response.body_iterator = iterate_in_threadpool(iter(response_body))
        
        # Only try to parse JSON for JSON responses
        if response.headers.get("content-type") == "application/json":
            response_json = json.loads(response_body[0].decode())
            if response_json.get("error") is not None:
                print(response_json.get("error"))

    except Exception as e:
        # Log the error but don't break the response
        print(f"Error in logging middleware: {str(e)}")
    
    return response