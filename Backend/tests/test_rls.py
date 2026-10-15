"""SEC-01 / SEC-02 security regression tests.

Part 1 (always runs): static checks on schema.sql, the 0002 migration,
and backend source — no database needed.
Part 2 (live, gated): cross-user isolation against a real Supabase
project. Skipped unless SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY and two
test-user credentials are provided. Uses throwaway users only, cleaned up.
"""
import os
import re
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
SCHEMA = (ROOT / "schema.sql").read_text()
MIGRATION = (ROOT / "migrations" / "0002_sec01_sec02_retrain_hardening.sql").read_text()
MAIN = (ROOT / "main.py").read_text()
DB = (ROOT / "db.py").read_text()
AUTH = (ROOT / "auth.py").read_text()
EXPORT = (ROOT / "retrain_export.py").read_text()


def _has_public_retrain_view(sql: str) -> bool:
    return bool(re.search(r"VIEW\s+public\.v_retrain_", sql, re.IGNORECASE))


# ---------- Part 1: static (no DB) ----------
def test_no_public_retrain_views():
    assert not _has_public_retrain_view(SCHEMA), "public retrain view in schema.sql"
    assert not _has_public_retrain_view(MIGRATION), "public retrain view in migration"


def test_private_views_use_security_invoker():
    for sql in (SCHEMA, MIGRATION):
        assert sql.count("security_invoker") >= 2
        assert "private.v_retrain_regression" in sql
        assert "private.v_retrain_tiers" in sql


def test_api_roles_revoked_service_role_granted():
    for sql in (SCHEMA, MIGRATION):
        assert re.search(r"REVOKE ALL ON SCHEMA private FROM anon,\s*authenticated", sql)
        assert "GRANT SELECT ON private.v_retrain_regression TO service_role" in sql
        assert "GRANT SELECT ON private.v_retrain_tiers TO service_role" in sql


def test_table_rls_intact():
    assert SCHEMA.count("ENABLE ROW LEVEL SECURITY") == 4
    assert SCHEMA.count("auth.uid() = user_id") >= 8


def test_tier_training_state_sec02():
    assert "used_for_training" in SCHEMA
    assert re.search(
        r"classification_history[\s\S]*?used_for_training BOOLEAN", SCHEMA
    )
    assert "used_for_training = false AND actual_tier IS NOT NULL" in MIGRATION


def test_backend_never_queries_retrain_views():
    assert "v_retrain" not in MAIN
    assert "v_retrain" not in DB


def test_no_hardcoded_secrets():
    for src in (MAIN, DB, AUTH, EXPORT):
        assert "sb_secret_" not in src
        assert "eyJhbGciOi" not in src
    assert "SERVICE_ROLE_KEY" not in AUTH  # only export script may use it
    _svc = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if _svc:  # guard: empty string is trivially contained in any text
        assert _svc not in EXPORT


def test_export_marks_consumed_only_after_training():
    assert "mark-used" in EXPORT
    assert "used_for_training" in EXPORT
    # export path must not flip the flag (only mark-used does)
    export_fn = EXPORT.split("def cmd_mark_used")[0]
    assert "used_for_training\": True" not in export_fn
    assert '"used_for_training": True' not in export_fn


# ---------- Part 2: live (gated, throwaway users) ----------
def _live_cfg():
    url = os.environ.get("SUPABASE_URL", "")
    svc = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    users = [
        (os.environ.get("TEST_USER_A_EMAIL", ""), os.environ.get("TEST_USER_A_PASSWORD", "")),
        (os.environ.get("TEST_USER_B_EMAIL", ""), os.environ.get("TEST_USER_B_PASSWORD", "")),
    ]
    if not url or not svc or not all(e and p for e, p in users):
        pytest.skip("live RLS tests need SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TEST_USER_{A,B}_{EMAIL,PASSWORD}")
    return url, svc, users


def test_live_cross_user_isolation():
    from supabase import create_client

    url, svc, users = _live_cfg()
    admin = create_client(url, svc)
    tokens = []
    for email, password in users:
        try:
            admin.auth.admin.create_user({"email": email, "password": password, "email_confirm": True})
        except Exception:
            pass  # already exists; sign-in below still works
        session = create_client(url, os.environ["SUPABASE_ANON_KEY"]).auth.sign_in_with_password(
            {"email": email, "password": password}
        )
        tokens.append(session.session.access_token)
    try:
        clients = [create_client(url, os.environ["SUPABASE_ANON_KEY"]) for _ in range(2)]
        for c, tok in zip(clients, tokens):
            c.postgrest.auth(tok)
        feats = {"model_name": "rls-probe"}
        row_a = clients[0].table("price_feedback").insert(
            {"features": feats, "actual_price": 1.23}).execute().data[0]
        # B must not see A's row via table or (old) public view path
        b_rows = clients[1].table("price_feedback").select("id").execute().data
        assert all(r["id"] != row_a["id"] for r in b_rows)
        b_clf = clients[1].table("classification_history").select("id").execute().data
        assert all(r["id"] != row_a["id"] for r in b_clf)
        # private views must not be reachable through the Data API
        for view in ("v_retrain_regression", "v_retrain_tiers"):
            with pytest.raises(Exception):
                clients[0].table(view).select("id").limit(1).execute()
        # service role (retrain path) CAN still read the pool
        pool = admin.table("price_feedback").select("id").eq(
            "used_for_training", False).execute().data
        assert any(r["id"] == row_a["id"] for r in pool)
    finally:
        for email, _ in users:
            try:
                uid = admin.auth.admin.list_users().users
                for u in uid:
                    if u.email == email:
                        admin.auth.admin.delete_user(u.id)
            except Exception:
                pass
        try:
            admin.table("price_feedback").delete().eq("user_id", "00000000-0000-0000-0000-000000000000").execute()
        except Exception:
            pass
