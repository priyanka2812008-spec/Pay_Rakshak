# pyright: reportMissingImports=false
"""
Pay Rakshak — Python FastAPI ML Microservice
Provides /predict and /health endpoints for ML-driven Pre-Payment Risk Assessment
"""

import os
import pickle
from typing import List, Optional
import numpy as np  # type: ignore
from fastapi import FastAPI, HTTPException  # type: ignore
from pydantic import BaseModel, Field  # type: ignore

app = FastAPI(
    title="Pay Rakshak ML Service",
    description="Pre-payment UPI anomaly detection using Isolation Forest",
    version="1.0.0"
)

# Load pretrained model if available or train on-the-fly
MODEL_PATH = os.path.join(os.path.dirname(__file__), "isolation_forest_model.pkl")
model_data = None

def get_or_create_model():
    global model_data
    if model_data is not None:
        return model_data

    if os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, "rb") as f:
                model_data = pickle.load(f)
                return model_data
        except Exception as e:
            print(f"Error loading model: {e}")

    # Fallback to local fast training
    from sklearn.ensemble import IsolationForest  # type: ignore
    # Synthetic initialization
    X_init = np.random.normal(loc=0.5, scale=0.2, size=(300, 9))
    iso = IsolationForest(n_estimators=50, contamination=0.08, random_state=42)
    iso.fit(X_init)
    model_data = {
        'model': iso,
        'features': [
            'amount_norm', 'amount_zscore', 'velocity_1h', 'velocity_24h',
            'nocturnal_flag', 'beneficiary_age_inv', 'vpa_impersonation_score',
            'screen_share_flag', 'collect_request_flag'
        ]
    }
    return model_data

class FeatureVector(BaseModel):
    amount_norm: float = Field(..., ge=0.0, le=1.0)
    amount_zscore: float
    velocity_1h: int = Field(..., ge=0)
    velocity_24h: int = Field(..., ge=0)
    nocturnal_flag: int = Field(..., ge=0, le=1)
    beneficiary_age_inv: float = Field(..., ge=0.0, le=1.0)
    vpa_impersonation_score: float = Field(..., ge=0.0, le=1.0)
    screen_share_flag: int = Field(..., ge=0, le=1)
    collect_request_flag: int = Field(..., ge=0, le=1)

class PredictionResponse(BaseModel):
    anomaly_score: float
    is_anomaly: bool
    risk_level: str
    feature_impacts: dict

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "pay-rakshak-ml",
        "engine": "IsolationForest-v1"
    }

@app.post("/predict", response_model=PredictionResponse)
def predict(features: FeatureVector):
    md = get_or_create_model()
    model = md['model']

    feat_array = np.array([[
        features.amount_norm,
        features.amount_zscore,
        features.velocity_1h,
        features.velocity_24h,
        features.nocturnal_flag,
        features.beneficiary_age_inv,
        features.vpa_impersonation_score,
        features.screen_share_flag,
        features.collect_request_flag
    ]])

    # decision_function gives negative values for anomalies, positive for inliers
    raw_score = model.decision_function(feat_array)[0]
    # Map raw_score roughly from [-0.5, 0.5] to [1.0, 0.0]
    anomaly_score = float(np.clip(1.0 / (1.0 + np.exp(raw_score * 8)), 0.0, 1.0))
    is_anomaly = bool(anomaly_score > 0.65)

    risk_level = "LOW"
    if anomaly_score > 0.80:
        risk_level = "CRITICAL"
    elif anomaly_score > 0.60:
        risk_level = "HIGH"
    elif anomaly_score > 0.35:
        risk_level = "MEDIUM"

    feature_impacts = {
        "amount_deviation": float(max(0, features.amount_zscore * 0.15)),
        "beneficiary_freshness": float(features.beneficiary_age_inv * 0.30),
        "vpa_phishing": float(features.vpa_impersonation_score * 0.40),
        "screen_sharing": float(features.screen_share_flag * 0.50),
        "collect_scam": float(features.collect_request_flag * 0.45),
        "velocity_burst": float(min(1.0, features.velocity_1h / 5.0) * 0.25)
    }

    return PredictionResponse(
        anomaly_score=round(anomaly_score, 4),
        is_anomaly=is_anomaly,
        risk_level=risk_level,
        feature_impacts=feature_impacts
    )

if __name__ == "__main__":
    import uvicorn  # type: ignore
    uvicorn.run(app, host="0.0.0.0", port=8000)

