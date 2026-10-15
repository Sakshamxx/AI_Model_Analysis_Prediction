-- ============================================================
-- Migration 0002: SEC-01 + SEC-02 retrain hardening
-- Run AFTER schema.sql in Supabase Dashboard > SQL Editor.
-- Requires PostgreSQL 15+ (true for all current Supabase projects)
-- for the security_invoker view option.
--
-- SEC-01: public retrain views executed as owner, bypassing table
-- RLS, and were auto-exposed via the Data API. Fix: move pools to a
-- NON-exposed private schema, revoke API roles, keep security_invoker
-- as defense-in-depth, grant SELECT to service_role only.
-- SEC-02: classification feedback had no training-state; add it so
-- retraining cannot consume the same corrections indefinitely.
-- ============================================================

-- SEC-02: training-state flag on classification feedback ------------
ALTER TABLE public.classification_history
  ADD COLUMN IF NOT EXISTS used_for_training BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_clf_hist_retrain
  ON public.classification_history (used_for_training)
  WHERE used_for_training = false AND actual_tier IS NOT NULL;

-- SEC-01: private, non-API-exposed schema for retrain pools ---------
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;
GRANT USAGE ON SCHEMA private TO service_role;

-- Remove the vulnerable public views (no longer API-reachable) ------
DROP VIEW IF EXISTS public.v_retrain_regression;
DROP VIEW IF EXISTS public.v_retrain_tiers;

-- Recreate in private schema. security_invoker=true means even if a
-- grant were ever misconfigured, base-table RLS still applies.
CREATE OR REPLACE VIEW private.v_retrain_regression
WITH (security_invoker = true) AS
SELECT id, user_id, features, actual_price, created_at
FROM public.price_feedback
WHERE used_for_training = false AND actual_price IS NOT NULL;

CREATE OR REPLACE VIEW private.v_retrain_tiers
WITH (security_invoker = true) AS
SELECT id, user_id, features, actual_tier, created_at
FROM public.classification_history
WHERE used_for_training = false AND actual_tier IS NOT NULL;

-- Least privilege: nobody except service_role (server-side) can read -
REVOKE ALL ON private.v_retrain_regression FROM anon, authenticated, public;
REVOKE ALL ON private.v_retrain_tiers FROM anon, authenticated, public;
GRANT SELECT ON private.v_retrain_regression TO service_role;
GRANT SELECT ON private.v_retrain_tiers TO service_role;
