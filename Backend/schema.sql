-- ============================================================
-- AI Model Analysis & Prediction — Supabase schema
-- Paste the WHOLE file into Supabase Dashboard > SQL Editor > Run.
-- Auth itself is Supabase Auth (enable Email provider under
-- Authentication > Providers). Tables below reference auth.users.
-- ============================================================

-- 1) Regression prediction history (every /predict/price call) ----
CREATE TABLE IF NOT EXISTS public.prediction_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  model_name    TEXT NOT NULL DEFAULT 'best_regression_model',
  features      JSONB NOT NULL,
  predicted_price NUMERIC NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Classification history + human feedback (retrain pool) --------
-- used_for_training (SEC-02): a correction must be marked consumed ONLY
-- after successful retraining, so repeats can't consume it indefinitely.
CREATE TABLE IF NOT EXISTS public.classification_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  model_name    TEXT NOT NULL DEFAULT 'best_classification_model',
  features      JSONB NOT NULL,
  predicted_tier TEXT NOT NULL CHECK (predicted_tier IN ('Budget', 'Standard', 'Premium')),
  actual_tier   TEXT CHECK (actual_tier IN ('Budget', 'Standard', 'Premium')),
  used_for_training BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) New price reports (user-submitted actuals -> retrain pool) ----
CREATE TABLE IF NOT EXISTS public.price_feedback (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  features      JSONB NOT NULL,
  actual_price  NUMERIC NOT NULL CHECK (actual_price >= 0),
  predicted_price NUMERIC,
  used_for_training BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) RAG question/answer history -----------------------------------
CREATE TABLE IF NOT EXISTS public.rag_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  question      TEXT NOT NULL,
  answer        TEXT NOT NULL,
  sources       JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Retrain pools live in a NON-API-exposed schema (SEC-01). Plain
-- SECURITY DEFINER views in public would run as owner, bypass table
-- RLS, and be auto-exposed via the Data API to every logged-in user.
-- security_invoker=true is defense-in-depth on top of the private
-- schema + explicit revokes. Requires PostgreSQL 15+.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;
GRANT USAGE ON SCHEMA private TO service_role;

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

REVOKE ALL ON private.v_retrain_regression FROM anon, authenticated, public;
REVOKE ALL ON private.v_retrain_tiers FROM anon, authenticated, public;
GRANT SELECT ON private.v_retrain_regression TO service_role;
GRANT SELECT ON private.v_retrain_tiers TO service_role;

-- Row Level Security: users touch ONLY their own rows --------------
ALTER TABLE public.prediction_history    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_feedback        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_history           ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_select" ON public.prediction_history;
DROP POLICY IF EXISTS "own_insert" ON public.prediction_history;
CREATE POLICY "own_select" ON public.prediction_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON public.prediction_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_select" ON public.classification_history;
DROP POLICY IF EXISTS "own_insert" ON public.classification_history;
DROP POLICY IF EXISTS "own_update" ON public.classification_history;
CREATE POLICY "own_select" ON public.classification_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON public.classification_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update" ON public.classification_history FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_select" ON public.price_feedback;
DROP POLICY IF EXISTS "own_insert" ON public.price_feedback;
DROP POLICY IF EXISTS "own_update" ON public.price_feedback;
CREATE POLICY "own_select" ON public.price_feedback FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON public.price_feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update" ON public.price_feedback FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_select" ON public.rag_history;
DROP POLICY IF EXISTS "own_insert" ON public.rag_history;
CREATE POLICY "own_select" ON public.rag_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON public.rag_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Indexes ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_pred_hist_user   ON public.prediction_history (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clf_hist_user    ON public.classification_history (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_fb_user    ON public.price_feedback (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_fb_retrain ON public.price_feedback (used_for_training) WHERE used_for_training = false;
CREATE INDEX IF NOT EXISTS idx_clf_hist_retrain ON public.classification_history (used_for_training) WHERE used_for_training = false AND actual_tier IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rag_hist_user    ON public.rag_history (user_id, created_at DESC);
