# 🛡️ Pay Rakshak (पे रक्षक)
> ### Stop suspicious payments before the money moves.

[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Express%20%7C%20FastAPI%20%7C%20IsolationForest-blue.svg)](#tech-stack)
[![Platform](https://img.shields.io/badge/Platform-UPI%20%7C%20Digital%20Payments-emerald.svg)](#core-architecture)
[![License](https://img.shields.io/badge/Status-Production--Ready%20Hackathon%20Prototype-cyan.svg)](#)

---

## 🎯 What is Pay Rakshak?

Traditional fraud detection acts **post-transaction**: after your money has left your account, the system classifies it as fraud and you are left to dispute or freeze accounts.

**Pay Rakshak** is a **pre-payment fraud intelligence platform** designed for UPI and digital banking rails. It sits as an ultra-fast (< 15ms) pre-routing hook before UPI PIN authorization:

```text
Payment Initiated
      ↓
Transaction Context (Amount, Category, Velocity)
      ↓
Behavioral & Temporal Profiling (Z-Score, Circadian Habits)
      ↓
VPA & Brand Intelligence (Typo-squatting, Impersonation)
      ↓
Isolation Forest Anomaly Engine (Unsupervised Outlier Isolation)
      ↓
Explainable Risk Factors (SHAP-Decomposed Weights)
      ↓
Dynamic Decision Engine:
┌────────────────────────────────────────────────────────────┐
│ ALLOW (0-29) → WARN (30-59) → VERIFY (60-79) → BLOCK (80-100)│
└────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```text
Payrakshak/
├── backend/                  # Node.js + Express + Embedded Isolation Forest Engine
│   ├── src/
│   │   ├── config/           # Database (MongoDB + In-Memory Fallback)
│   │   ├── controllers/      # Payment inspection & Analytics controllers
│   │   ├── ml/               # Native Mathematical Isolation Forest
│   │   ├── models/           # Transaction, Beneficiary, UserProfile schemas
│   │   ├── routes/           # REST API endpoints
│   │   ├── seed/             # Realistic Indian UPI profiles & scam patterns
│   │   ├── services/
│   │   │   ├── anomalyDetector.js       # Z-score + IQR + Velocity anomalies
│   │   │   ├── dataStore.js             # Unified DAL (Mongo + Memory store)
│   │   │   ├── decisionEngine.js        # 4-tier decision mapping & interventions
│   │   │   ├── explainabilityEngine.js  # Human-readable factor attribution
│   │   │   ├── riskEngine.js            # Core composite scoring pipeline
│   │   │   └── vpaIntelligence.js       # Typo-squatting & Brand impersonation
│   │   └── server.js         # API entrypoint
│   ├── ml/                   # Python FastAPI Microservice (Optional)
│   │   ├── main.py           # FastAPI inference server
│   │   ├── train.py          # Isolation Forest training script
│   │   └── requirements.txt
│   ├── .env.example
│   └── package.json
│
└── frontend/                 # React + Vite + Tailwind CSS + Lucide + Recharts
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx               # Command center telemetry bar
    │   │   ├── Sidebar.jsx              # Navigation & architecture status
    │   │   ├── RiskScoreGauge.jsx       # Glowing dynamic circular score gauge
    │   │   ├── ExplainabilityCard.jsx   # Factor breakdown & SHAP weights
    │   │   └── InterventionModal.jsx    # Stepped MFA, 45s cooling & block modal
    │   ├── pages/
    │   │   ├── SimulatorPage.jsx        # Pre-Payment Risk Inspector (Simulator)
    │   │   ├── LiveMonitorPage.jsx      # Real-time transaction radar stream
    │   │   ├── AnalyticsPage.jsx        # Recharts visual telemetry & heatmaps
    │   │   ├── RulesEnginePage.jsx      # Dynamic policy & threshold tuner
    │   │   ├── ThreatTaxonomyPage.jsx   # Top 6 UPI fraud vector dossiers
    │   │   └── ApiDocsPage.jsx          # Interactive API playground & SDKs
    │   ├── services/
    │   │   └── api.js                   # API client
    │   ├── App.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start Guide

### 1. Run Backend Server

In a new terminal:
```bash
cd backend
npm start
```
The backend starts on `http://localhost:5000`.
- MongoDB is automatically connected if available locally; otherwise, it seamlessly boots into high-performance **Demo Mode** with rich pre-seeded Indian UPI profiles and known scam handles.

### 2. Run Frontend Application

In another terminal:
```bash
cd frontend
npm run dev
```
The frontend starts on `http://localhost:5173`. Open this URL in your web browser.

---

## ⚡ Core Features & Differentiators

### 1. Pre-Payment Execution Gate
Unlike traditional fraud detection systems that flag transactions after money is debited, Pay Rakshak evaluates transactions **before** the user inputs their UPI PIN.

### 2. 4-Tier Adaptive Decision Engine
- **ALLOW (0 - 29)**: Standard clean flow, direct authorization.
- **WARN (30 - 59)**: Cautionary banner requiring explicit checkbox confirmation for unfamiliar payees.
- **VERIFY (60 - 79)**: Enforces a 45-second anti-panic cooling delay, reveals the recipient's true NPCI bank-registered name, and requires biometric re-authentication.
- **BLOCK (80 - 100)**: Hard interception. Stops the transaction before balance deduction, alerts the sender, and auto-generates a National Cyber Crime Reporting Portal (NCRP 1930) incident draft.

### 3. Dynamic Calculation (No Fake Mock Scores)
The risk score recalculates in real-time based on transaction signals:
- **Transaction Amount**: Computes standard deviations ($Z$-score) relative to the sender's 30-day baseline.
- **Beneficiary Freshness**: Flagged if VPA was created $< 24$ hours ago.
- **Velocity**: Payment bursts (e.g. 5 transfers in 1 hour).
- **Time of Day**: Nocturnal spikes (01:00 AM - 05:00 AM IST).
- **Screen Sharing**: Detects AnyDesk, TeamViewer, or remote screen tools active during checkout.
- **UPI Collect Request Scam**: Flags incoming debit requests disguised as cashback or lottery credits.
- **VPA Typo-Squatting**: Detects fraudulent handles mimicking banks (e.g. `sbi.helpline24x7@okhdfcbank`, `paytm-refund-support@okaxis`).

---

## 🛡️ Top Indian UPI Scam Vectors Intercepted

1. **Remote Screen-Sharing App Takeover**: Intercepts AnyDesk / TeamViewer scams where attackers view PIN entry.
2. **UPI "Collect Request" Phishing**: Prevents the classic scam where victims enter PIN believing they are "receiving" money.
3. **VPA Brand Impersonation**: Levenshtein distance detection against fake bank helpline and refund handles.
4. **Mule Account Layering**: Flags fresh accounts receiving rapid sequential inflows then immediately transferring out.
5. **Nocturnal Drainage / SIM Swap**: Halts abnormal transactions initiated while victims are asleep.

---

## 🔌 API Reference

### Pre-Payment Inspection
`POST /api/v1/pre-payment/inspect`

**Request Body:**
```json
{
  "senderUpiId": "ramesh.sharma@okhdfcbank",
  "beneficiaryUpiId": "paytm-refund-support@okaxis",
  "amount": 49500,
  "category": "Refund Processing",
  "velocityLast1Hour": 3,
  "velocityLast24Hours": 5,
  "transactionHour": 15,
  "beneficiaryAgeDays": 0.8,
  "screenSharingActive": true,
  "isCollectRequest": true
}
```

**Response Body:**
```json
{
  "success": true,
  "data": {
    "riskAssessment": {
      "compositeScore": 100,
      "decisionTier": "BLOCK",
      "actionRequired": "EMERGENCY_INTERCEPTION",
      "title": "CRITICAL ATTACK INTERCEPTED"
    },
    "scoresBreakdown": {
      "isolationForestScore": 0.87,
      "vpaRiskScore": 90,
      "amountZScore": 50.1,
      "heuristicPenalty": 100
    },
    "explainability": {
      "summary": "DANGER: This transaction exhibits high-confidence fraud indicators...",
      "factors": [
        {
          "title": "Brand Impersonation & Typo-Squatting",
          "severity": "CRITICAL",
          "impact": "+35 pts"
        },
        {
          "title": "Remote Access / Screen Sharing Detected",
          "severity": "CRITICAL",
          "impact": "+45 pts"
        }
      ]
    }
  }
}
```

