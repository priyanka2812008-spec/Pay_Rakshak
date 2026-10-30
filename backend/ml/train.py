# pyright: reportMissingImports=false
"""
Pay Rakshak — Machine Learning Service: Model Training
Trains an Isolation Forest model on synthetic & real UPI transaction profiles
Features:
1. amount_norm: Amount normalized to standard range
2. amount_zscore: Deviation from sender 30-day mean
3. velocity_1h: Payment count in last 60 minutes
4. velocity_24h: Payment count in last 24 hours
5. nocturnal_flag: Transaction between 01:00 and 05:00
6. beneficiary_age_inv: 1.0 / (days_registered + 1)
7. vpa_impersonation_score: Levenshtein & keyword match score (0-1)
8. screen_share_flag: Screen sharing / remote app detected (0 or 1)
9. collect_request_flag: Collect request masked as incoming credit (0 or 1)
"""

import os
import pickle
import numpy as np  # type: ignore
import pandas as pd  # type: ignore
from sklearn.ensemble import IsolationForest  # type: ignore

def generate_synthetic_upi_dataset(n_samples=5000, contamination=0.08):
    np.random.seed(42)
    n_normal = int(n_samples * (1 - contamination))
    n_fraud = n_samples - n_normal

    # Normal UPI transactions:
    normal_amounts = np.random.exponential(scale=1200, size=n_normal) + 50
    normal_zscores = np.random.normal(loc=0.0, scale=0.8, size=n_normal)
    normal_vel_1h = np.random.poisson(lam=0.4, size=n_normal)
    normal_vel_24h = np.random.poisson(lam=2.5, size=n_normal)
    normal_nocturnal = np.random.binomial(n=1, p=0.03, size=n_normal)
    normal_age_days = np.random.uniform(30, 1000, size=n_normal)
    normal_beneficiary_age_inv = 1.0 / (normal_age_days + 1)
    normal_vpa_impersonation = np.random.beta(0.5, 10, size=n_normal) * 0.1
    normal_screen_share = np.zeros(n_normal)
    normal_collect = np.random.binomial(n=1, p=0.01, size=n_normal)

    # Fraudulent / Anomaly transactions:
    fraud_amounts = np.random.choice([
        np.random.uniform(25000, 99999, size=n_fraud),
        np.random.uniform(4999, 9999, size=n_fraud) # smurfing / micro-draining
    ])[0]
    fraud_zscores = np.random.uniform(2.5, 8.0, size=n_fraud)
    fraud_vel_1h = np.random.poisson(lam=4.2, size=n_fraud) + 2
    fraud_vel_24h = np.random.poisson(lam=12.0, size=n_fraud)
    fraud_nocturnal = np.random.binomial(n=1, p=0.45, size=n_fraud)
    fraud_age_days = np.random.uniform(0.1, 5, size=n_fraud) # Brand new beneficiary
    fraud_beneficiary_age_inv = 1.0 / (fraud_age_days + 1)
    fraud_vpa_impersonation = np.random.uniform(0.65, 0.98, size=n_fraud) # high similarity to brands
    fraud_screen_share = np.random.binomial(n=1, p=0.35, size=n_fraud)
    fraud_collect = np.random.binomial(n=1, p=0.60, size=n_fraud)

    normal_df = pd.DataFrame({
        'amount_norm': np.clip(normal_amounts / 100000.0, 0, 1),
        'amount_zscore': normal_zscores,
        'velocity_1h': normal_vel_1h,
        'velocity_24h': normal_vel_24h,
        'nocturnal_flag': normal_nocturnal,
        'beneficiary_age_inv': normal_beneficiary_age_inv,
        'vpa_impersonation_score': normal_vpa_impersonation,
        'screen_share_flag': normal_screen_share,
        'collect_request_flag': normal_collect,
        'label': 0
    })

    fraud_df = pd.DataFrame({
        'amount_norm': np.clip(fraud_amounts / 100000.0, 0, 1),
        'amount_zscore': fraud_zscores,
        'velocity_1h': fraud_vel_1h,
        'velocity_24h': fraud_vel_24h,
        'nocturnal_flag': fraud_nocturnal,
        'beneficiary_age_inv': fraud_beneficiary_age_inv,
        'vpa_impersonation_score': fraud_vpa_impersonation,
        'screen_share_flag': fraud_screen_share,
        'collect_request_flag': fraud_collect,
        'label': 1
    })

    df = pd.concat([normal_df, fraud_df]).sample(frac=1.0, random_state=42).reset_index(drop=True)
    return df

def train_and_save():
    print("Generating synthetic UPI transaction dataset...")
    df = generate_synthetic_upi_dataset()
    feature_cols = [
        'amount_norm', 'amount_zscore', 'velocity_1h', 'velocity_24h',
        'nocturnal_flag', 'beneficiary_age_inv', 'vpa_impersonation_score',
        'screen_share_flag', 'collect_request_flag'
    ]
    X = df[feature_cols].values

    print("Fitting Isolation Forest model...")
    iso = IsolationForest(
        n_estimators=100,
        contamination=0.08,
        random_state=42,
        n_jobs=-1
    )
    iso.fit(X)

    output_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(output_dir, 'isolation_forest_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump({'model': iso, 'features': feature_cols}, f)
    
    print(f"Model saved successfully to {model_path}")

if __name__ == '__main__':
    train_and_save()

