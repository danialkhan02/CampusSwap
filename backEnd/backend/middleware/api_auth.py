import os

import rollbar
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException
from fastapi.requests import Request
from backend.stytch_client import StytchClient
from backend.constants import BACKEND_ID_STYTCH_KEY


async def stytch_authentication(request: Request, call_next):
    # Allow access to documentation endpoints without authentication
    if request.url.path in ["/docs", "/redoc", "/openapi.json"]:
        return await call_next(request)

    try:
        resp = StytchClient.sessions.authenticate(
            session_token=request.headers.get("x-session-token"),
        )
        if resp.status_code == 200:
            # Add user bypasses metadata
            if BACKEND_ID_STYTCH_KEY not in resp.user.trusted_metadata:
                return await call_next(request)
            else:
                request.state.user_id = resp.user.trusted_metadata[BACKEND_ID_STYTCH_KEY]
                return await call_next(request)
        else:
            rollbar.report_message(resp.error_message, "error", resp)
            raise HTTPException(detail=f"Invalid Stytch Auth {resp.error_message}", status_code=resp.status_code)
    except Exception as exc:
        rollbar.report_message(str(exc), "error")
        raise HTTPException(detail=f"Error authenticating with stytch: {str(exc)}", status_code=500)
