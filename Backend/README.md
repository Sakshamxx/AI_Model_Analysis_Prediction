# Backend (FastAPI + Supabase)

## 1. Database — run once
1. Supabase Dashboard → **Authentication > Providers** → enable **Email**.
2. **SQL Editor** → paste the whole `Backend/schema.sql` → Run.
   Creates `prediction_history`, `classification_history`, `price_feedback`,
   `rag_history` + retrain views (`v_retrain_regression`, `v_retrain_tiers`) + RLS.
3. Dashboard → Project Settings → API → copy `JWT Secret` into `.env` as
   `SUPABASE_JWT_SECRET` (URL + anon key already there).

## 2. Run the API (from `Backend/`)
```bash
../env_AI_Model_Analysis/bin/uvicorn main:app --reload --port 8000
```
Health: `GET http://127.0.0.1:8000/health`
Shape helper: `GET /schema/sample-features` (exact 26-feature payload)

## 3. Auth flow
Frontend signs up/signs in with the Supabase anon key directly, then sends
`Authorization: Bearer <access token>` on every call except `/health` and
`/schema/sample-features`. Backend verifies with `SUPABASE_JWT_SECRET`.

## 4. Endpoints (all auth'd unless noted)
| Method | Path | Purpose |
|---|---|---|
| POST | `/predict/price` | regression → logs `prediction_history` |
| POST | `/predict/tier` | tier + probabilities → logs `classification_history` |
| POST | `/feedback/price` | submit real price → `price_feedback` (retrain pool) |
| POST | `/feedback/tier` | correct a tier → sets `actual_tier` (retrain pool) |
| GET | `/history/{predictions,classifications,feedback,rag}` | own rows |
| GET | `/me` | who am I |

> RAG Q&A (`/rag/ask` + engine) is intentionally deferred to the last phase.
> `rag_history` table + history reader already exist in schema/backend.

## 5. Retraining later
```sql
select * from v_retrain_regression;  -- fresh actual prices
select * from v_retrain_tiers;       -- human-corrected tiers
-- after retraining on them:
update price_feedback set used_for_training = true where used_for_training = false;
```
