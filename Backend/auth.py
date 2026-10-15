"""Bearer-JWT auth against Supabase Auth. Frontend logs in with the
anon key; every backend call carries the user's access token, which we
verify here with SUPABASE_JWT_SECRET."""
import os

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

_bearer = HTTPBearer(auto_error=False)


def _secret() -> str:
    secret = os.environ.get("SUPABASE_JWT_SECRET", "")
    if not secret:
        raise HTTPException(status_code=500, detail="SUPABASE_JWT_SECRET not set")
    return secret


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    if creds is None or not creds.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Login required: send Authorization: Bearer <supabase access token>.",
        )
    try:
        payload = jwt.decode(
            creds.credentials,
            _secret(),
            algorithms=["HS256"],
            audience="authenticated",
            options={"require": ["exp", "sub"]},
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {exc}"
        )
    return {"id": payload["sub"], "email": payload.get("email"), "token": creds.credentials}
