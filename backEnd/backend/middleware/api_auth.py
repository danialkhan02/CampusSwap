import os

from fastapi.exceptions import HTTPException
from fastapi.requests import Request
from backend.stytch_client import StytchClient
from backend.constants import BACKEND_ID_STYTCH_KEY


async def stytch_authentication(request: Request, call_next):
    # Allow access to documentation endpoints without authentication
    if request.url.path in ["/docs", "/redoc", "/openapi.json", "/api/v1/products/generate-description", "/api/v1/seller_profiles/92d797ff-5f1a-4107-8468-dc2787ed5a82", "/api/v1/seller_profiles" , "/api/v1/users", "/api/v1/products/fee7afbe-c3bb-4a5b-a16b-dc60d192e2ad/interested/92d797ff-5f1a-4107-8468-dc2787ed5a82","/api/v1/products/lister/92d797ff-5f1a-4107-8468-dc2787ed5a82",  "/api/v1/products/create", "/api/v1/products/fee7afbe-c3bb-4a5b-a16b-dc60d192e2ad", "/api/v1/products/86732b1a-8fff-40e2-95b5-60a497875329", "/api/v1/auth/test-token", "/api/v1/products/list", "/api/v1/products/search"]:
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
            raise HTTPException(detail=f"Invalid Stytch Auth {resp.error_message}", status_code=resp.status_code)
    except Exception as exc:
        raise HTTPException(detail=f"Error authenticating with stytch: {str(exc)}", status_code=500)
