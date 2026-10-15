"""Supabase clients. Reads SUPABASE_URL / SUPABASE_ANON_KEY from env."""
import os

from fastapi import HTTPException


def _config():
    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_ANON_KEY", "")
    if not url or not key:
        raise HTTPException(status_code=500, detail="SUPABASE_URL / SUPABASE_ANON_KEY not set")
    return url, key


def anon_client():
    from supabase import create_client

    url, key = _config()
    return create_client(url, key)


def user_client(token: str):
    """Client acting as the logged-in user (RLS enforced to their rows)."""
    client = anon_client()
    client.postgrest.auth(token)
    return client
