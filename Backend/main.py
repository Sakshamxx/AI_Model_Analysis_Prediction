"""FastAPI backend: auth (Supabase JWT) + price/tier prediction from the
trained .pkl models + Supabase history/feedback logging.

(RAG engine deferred to the last phase.)

Run from Backend/:
    ../env_AI_Model_Analysis/bin/uvicorn main:app --reload --port 8000
"""
import os
import pickle
from pathlib import Path
from uuid import UUID

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from auth import get_current_user
from db import user_client

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")


def _resolve(var: str, default: str) -> Path:
    raw = os.environ.get(var, "") or default
    path = Path(raw)
    if path.is_absolute() and path.exists():
        return path
    if not path.is_absolute() and (ROOT / path).exists():
        return ROOT / path
    # fall back: search the usual spots (models move around)
    name = Path(raw).name
    for cand in (ROOT / "Backend" / name, ROOT / "Models" / name, ROOT / name):
        if cand.exists():
            return cand
    return ROOT / path


def _resolve_dir(var: str, default: str) -> Path:
    raw = os.environ.get(var, "") or default
    path = Path(raw)
    if path.is_absolute():
        return path
    cand = ROOT / path
    return cand if cand.exists() else ROOT / default


REG_PATH = _resolve("BEST_REGRESSION_MODEL_PATH", "Backend/best_regression_model.pkl")
CLF_PATH = _resolve("BEST_CLASSIFICATION_MODEL_PATH", "Backend/best_classification_model.pkl")
DATA_PATH = _resolve_dir("DATA_DIR", "Data") / "ai_models_2026.csv"

app = FastAPI(title="AI Model Pricing API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_reg = None
_clf = None
_reg_cols: list = []


def _load():
    global _reg, _clf, _reg_cols
    if _reg is None:
        if not REG_PATH.exists():
            raise HTTPException(503, f"Regression model missing: {REG_PATH}")
        with open(REG_PATH, "rb") as f:
            _reg = pickle.load(f)
        _reg_cols = list(_reg.named_steps["prep"].feature_names_in_)
    if _clf is None:
        if not CLF_PATH.exists():
            raise HTTPException(503, f"Classification model missing: {CLF_PATH}")
        with open(CLF_PATH, "rb") as f:
            _clf = pickle.load(f)
    if DATA_PATH and not DATA_PATH.exists():
        raise HTTPException(503, f"Dataset missing: {DATA_PATH}")


# ---------- schemas ----------
class FeaturesPayload(BaseModel):
    features: dict = Field(description="All 26 training columns; see /schema/sample-features")


class PriceFeedbackPayload(BaseModel):
    features: dict
    actual_price: float = Field(ge=0)
    predicted_price: float | None = None


class TierFeedbackPayload(BaseModel):
    history_id: UUID
    actual_tier: str = Field(pattern="^(Budget|Standard|Premium)$")


# ---------- helpers ----------
def _frame(features: dict, cols: list):
    import pandas as pd

    missing = [c for c in cols if c not in features]
    if missing:
        raise HTTPException(400, f"Missing features: {missing}")
    row = {c: (None if features[c] != features[c] else features[c]) for c in cols}  # NaN -> None
    return pd.DataFrame([row], columns=cols)


def _log(user: dict, table: str, row: dict) -> bool:
    try:
        user_client(user["token"]).table(table).insert({**row, "user_id": user["id"]}).execute()
        return True
    except Exception:
        return False


# ---------- public ----------
@app.get("/health")
def health():
    return {
        "ok": True,
        "regression_model": REG_PATH.exists(),
        "classification_model": CLF_PATH.exists(),
        "dataset": DATA_PATH.exists(),
    }


@app.get("/schema/sample-features")
def sample_features():
    """Example feature payload (ordered exactly as the models expect)."""
    _load()
    import pandas as pd

    df = pd.read_csv(DATA_PATH, nrows=200)
    row = df.iloc[0]  # may contain NaNs -> converted to None below (pipeline imputes)
    return {
        "feature_order": _reg_cols,
        "example": {c: (None if row[c] != row[c] else row[c].item() if hasattr(row[c], "item") else row[c]) for c in _reg_cols},
        "tiers": ["Budget", "Standard", "Premium"],
    }


# ---------- auth'd ----------
@app.get("/me")
def me(user: dict = Depends(get_current_user)):
    return {"id": user["id"], "email": user["email"]}


@app.post("/predict/price")
def predict_price(body: FeaturesPayload, user: dict = Depends(get_current_user)):
    _load()
    price = float(max(_reg.predict(_frame(body.features, _reg_cols))[0], 0.0))
    logged = _log(user, "prediction_history", {
        "model_name": type(_reg.named_steps["model"]).__name__,
        "features": body.features,
        "predicted_price": price,
    })
    return {"predicted_price_per_1m_output_tokens": price, "logged": logged}


@app.post("/predict/tier")
def predict_tier(body: FeaturesPayload, user: dict = Depends(get_current_user)):
    _load()
    frame = _frame(body.features, _reg_cols)
    tier = str(_clf.predict(frame)[0])
    proba = {str(k): float(v) for k, v in zip(_clf.classes_, _clf.predict_proba(frame)[0])}
    logged = _log(user, "classification_history", {
        "model_name": type(_clf.named_steps["model"]).__name__,
        "features": body.features,
        "predicted_tier": tier,
    })
    return {"predicted_tier": tier, "probabilities": proba, "logged": logged}


@app.post("/feedback/price")
def feedback_price(body: PriceFeedbackPayload, user: dict = Depends(get_current_user)):
    _load()
    _frame(body.features, _reg_cols)  # validate shape
    ok = _log(user, "price_feedback", {
        "features": body.features,
        "actual_price": body.actual_price,
        "predicted_price": body.predicted_price,
    })
    if not ok:
        raise HTTPException(502, "Could not store feedback in Supabase")
    return {"stored": True}


@app.post("/feedback/tier")
def feedback_tier(body: TierFeedbackPayload, user: dict = Depends(get_current_user)):
    try:
        (user_client(user["token"]).table("classification_history")
         .update({"actual_tier": body.actual_tier})
         .eq("id", str(body.history_id)).eq("user_id", user["id"]).execute())
    except Exception as exc:
        raise HTTPException(502, f"Could not store tier feedback: {exc}")
    return {"stored": True}


@app.get("/history/{kind}")
def history(kind: str, limit: int = 20, user: dict = Depends(get_current_user)):
    tables = {
        "predictions": "prediction_history",
        "classifications": "classification_history",
        "feedback": "price_feedback",
        "rag": "rag_history",
    }
    if kind not in tables:
        raise HTTPException(400, f"kind must be one of {sorted(tables)}")
    try:
        res = (user_client(user["token"]).table(tables[kind]).select("*")
               .eq("user_id", user["id"]).order("created_at", desc=True)
               .limit(max(1, min(limit, 100))).execute())
    except Exception as exc:
        raise HTTPException(502, f"Supabase read failed: {exc}")
    return {"rows": res.data}
