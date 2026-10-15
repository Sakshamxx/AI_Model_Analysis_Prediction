"""Privileged retrain-pool export (SERVER-SIDE ONLY).

Reads private.v_retrain_regression / private.v_retrain_tiers with the
SUPABASE_SERVICE_ROLE_KEY. Never expose this key to clients.

Safe consumption flow (SEC-02: mark consumed ONLY after training):
  1. python retrain_export.py export      # writes retrain_*.csv
  2. retrain the .pkl models on those CSVs (notebooks)
  3. python retrain_export.py mark-used  # flips used_for_training ONLY
     for rows that were exported (ids stored in retrain_exported_ids.json)

Run from Backend/ with the project venv on PATH.
"""
import argparse
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IDS_FILE = Path(__file__).resolve().parent / "retrain_exported_ids.json"

try:
    from dotenv import load_dotenv

    load_dotenv(ROOT / ".env")
except ImportError:  # dotenv optional; env may already be set
    pass


def _service_client():
    from supabase import create_client

    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        sys.exit("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (server-side .env only).")
    return create_client(url, key)


def cmd_export(args) -> int:
    # NOTE: PostgREST only exposes the `public` schema, so the privileged
    # export reads the base tables directly as service_role (RLS bypassed
    # server-side) with the SAME filters as private.v_retrain_*.
    # The private views serve the equivalent SQL-Editor retraining flow.
    client = _service_client()
    reg = (
        client.table("price_feedback").select("id,user_id,features,actual_price,created_at")
        .eq("used_for_training", False).not_.is_("actual_price", "null")
        .execute().data or []
    )
    tiers = (
        client.table("classification_history").select("id,user_id,features,actual_tier,created_at")
        .eq("used_for_training", False).not_.is_("actual_tier", "null")
        .execute().data or []
    )
    import csv

    for name, rows, fields in (
        ("retrain_regression.csv", reg, ["id", "user_id", "features", "actual_price", "created_at"]),
        ("retrain_tiers.csv", tiers, ["id", "user_id", "features", "actual_tier", "created_at"]),
    ):
        with open(ROOT / name, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
            writer.writeheader()
            for row in rows:
                row = dict(row)
                if isinstance(row.get("features"), (dict, list)):
                    row["features"] = json.dumps(row["features"])
                writer.writerow({k: row.get(k) for k in fields})
        print(f"wrote {name}: {len(rows)} rows")
    IDS_FILE.write_text(json.dumps({
        "regression_ids": [r["id"] for r in reg],
        "tier_ids": [r["id"] for r in tiers],
    }))
    print("Run training on the CSVs, then: python retrain_export.py mark-used")
    return 0


def cmd_mark_used(args) -> int:
    if not IDS_FILE.exists():
        sys.exit("No export record found. Run 'export' first, train, then mark-used.")
    ids = json.loads(IDS_FILE.read_text())
    client = _service_client()
    for table, key in (("price_feedback", "regression_ids"), ("classification_history", "tier_ids")):
        batch = ids.get(key, [])
        for i in range(0, len(batch), 100):
            chunk = batch[i : i + 100]
            if chunk:
                client.table(table).update({"used_for_training": True}).in_("id", chunk).execute()
        print(f"{table}: marked {len(batch)} rows consumed")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Export retrain pools (service role only).")
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("export", help="dump unconsumed pools to CSV (does NOT mark consumed)")
    sub.add_parser("mark-used", help="mark exported rows consumed AFTER successful training")
    args = parser.parse_args()
    return cmd_mark_used(args) if args.cmd == "mark-used" else cmd_export(args)


if __name__ == "__main__":
    raise SystemExit(main())
