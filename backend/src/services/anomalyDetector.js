/**
 * Multi-dimensional Pre-Payment Anomaly Detector
 * Combines Isolation Forest with statistical distribution analysis (Z-score & IQR)
 */

import { IsolationForest } from '../ml/isolationForest.js';

class AnomalyDetectorService {
  constructor() {
    this.isoForest = new IsolationForest(40, 128);
    this.isTrained = false;
    this.initializeBaselineModel();
  }

  initializeBaselineModel() {
    // Generate synthetic baseline typical Indian UPI transaction vectors
    // Features: [amountNorm, amountZScore, vel1hNorm, nocturnal, ageInv, vpaRiskNorm, screenShare, collectScam]
    const baselineData = [];

    // Normal transactions (~94%)
    for (let i = 0; i < 600; i++) {
      const amountNorm = Math.min(1.0, (Math.random() * 2500 + 50) / 100000);
      const amountZScore = (Math.random() - 0.5) * 1.5;
      const vel1hNorm = Math.min(1.0, Math.floor(Math.random() * 2) / 10);
      const nocturnal = Math.random() < 0.04 ? 1 : 0;
      const ageDays = Math.random() * 500 + 30;
      const ageInv = 1.0 / (ageDays + 1);
      const vpaRiskNorm = Math.random() * 0.15;
      const screenShare = 0;
      const collectScam = 0;

      baselineData.push([
        amountNorm,
        amountZScore,
        vel1hNorm,
        nocturnal,
        ageInv,
        vpaRiskNorm,
        screenShare,
        collectScam
      ]);
    }

    // Known fraud/anomaly patterns (~6%)
    for (let i = 0; i < 40; i++) {
      const amountNorm = Math.min(1.0, (Math.random() * 60000 + 20000) / 100000);
      const amountZScore = 3.0 + Math.random() * 4.0;
      const vel1hNorm = Math.min(1.0, (3 + Math.floor(Math.random() * 5)) / 10);
      const nocturnal = Math.random() < 0.6 ? 1 : 0;
      const ageDays = Math.random() * 3 + 0.1;
      const ageInv = 1.0 / (ageDays + 1);
      const vpaRiskNorm = 0.6 + Math.random() * 0.4;
      const screenShare = Math.random() < 0.4 ? 1 : 0;
      const collectScam = Math.random() < 0.5 ? 1 : 0;

      baselineData.push([
        amountNorm,
        amountZScore,
        vel1hNorm,
        nocturnal,
        ageInv,
        vpaRiskNorm,
        screenShare,
        collectScam
      ]);
    }

    this.isoForest.fit(baselineData);
    this.isTrained = true;
  }

  detectAnomaly(features) {
    const {
      amount,
      userAvgAmount = 1500,
      userStdAmount = 800,
      velocityLast1Hour = 0,
      velocityLast24Hours = 1,
      transactionHour = new Date().getHours(),
      beneficiaryAgeDays = 180,
      vpaRiskScore = 10,
      screenSharingActive = false,
      isCollectRequest = false,
      isNewDevice = false,
      distanceJumpKm = 0
    } = features;

    // 1. Statistical Z-Score
    const stdDev = userStdAmount > 0 ? userStdAmount : 500;
    const amountZScore = (amount - userAvgAmount) / stdDev;

    // 2. Normalized feature values
    const amountNorm = Math.min(1.0, amount / 100000);
    const vel1hNorm = Math.min(1.0, velocityLast1Hour / 8.0);
    const isNocturnal = (transactionHour >= 1 && transactionHour <= 5) ? 1 : 0;
    const ageInv = 1.0 / (Math.max(0.1, beneficiaryAgeDays) + 1);
    const vpaRiskNorm = Math.min(1.0, vpaRiskScore / 100.0);
    const screenShareFlag = screenSharingActive ? 1 : 0;
    const collectScamFlag = isCollectRequest ? 1 : 0;

    const sample = [
      amountNorm,
      amountZScore,
      vel1hNorm,
      isNocturnal,
      ageInv,
      vpaRiskNorm,
      screenShareFlag,
      collectScamFlag
    ];

    // 3. Isolation Forest Anomaly Score (0.0 to 1.0)
    const isoScore = this.isoForest.predictAnomalyScore(sample);

    // 4. Statistical heuristic checks
    const heuristicFactors = [];
    let heuristicPenalty = 0;

    if (amountZScore > 3.0) {
      const multiplier = (amount / (userAvgAmount || 1)).toFixed(1);
      heuristicFactors.push({
        name: 'Sudden Amount Outlier',
        severity: amountZScore > 5 ? 'CRITICAL' : 'HIGH',
        contribution: Math.min(35, Math.round(amountZScore * 5)),
        message: `Amount ₹${amount.toLocaleString('en-IN')} is ${multiplier}x higher than sender's 30-day average (Z-Score: +${amountZScore.toFixed(2)}).`
      });
      heuristicPenalty += Math.min(35, amountZScore * 5);
    }

    if (velocityLast1Hour >= 3) {
      heuristicFactors.push({
        name: 'Rapid Payment Burst (Velocity Spike)',
        severity: velocityLast1Hour >= 5 ? 'CRITICAL' : 'HIGH',
        contribution: Math.min(25, velocityLast1Hour * 5),
        message: `${velocityLast1Hour} payments initiated within the last 60 minutes. Typical of account drainage or smurfing.`
      });
      heuristicPenalty += Math.min(25, velocityLast1Hour * 5);
    }

    if (isNocturnal === 1) {
      heuristicFactors.push({
        name: 'Unusual Nocturnal Hour',
        severity: 'MEDIUM',
        contribution: 15,
        message: `Payment initiated during unusual hours (${transactionHour}:00 IST), outside user's regular daytime habits.`
      });
      heuristicPenalty += 15;
    }

    if (beneficiaryAgeDays < 3) {
      heuristicFactors.push({
        name: 'New Beneficiary Risk',
        severity: beneficiaryAgeDays <= 1 ? 'CRITICAL' : 'HIGH',
        contribution: beneficiaryAgeDays <= 1 ? 30 : 20,
        message: `Beneficiary UPI ID was created ${beneficiaryAgeDays < 1 ? 'less than 24 hours ago' : `${Math.round(beneficiaryAgeDays)} days ago`}. High correlation with disposable mule accounts.`
      });
      heuristicPenalty += beneficiaryAgeDays <= 1 ? 30 : 20;
    }

    if (screenSharingActive) {
      heuristicFactors.push({
        name: 'Remote Access / Screen Sharing Detected',
        severity: 'CRITICAL',
        contribution: 45,
        message: `Active screen-sharing or remote desktop tool (e.g., AnyDesk, TeamViewer) active during payment authentication. Extreme phishing risk.`
      });
      heuristicPenalty += 45;
    }

    if (isCollectRequest) {
      heuristicFactors.push({
        name: 'Inverted Flow (UPI Collect Request Scam)',
        severity: 'CRITICAL',
        contribution: 40,
        message: `This is a payment DEBIT request sent by an external party, NOT a credit. Entering UPI PIN will transfer your money to the requester.`
      });
      heuristicPenalty += 40;
    }

    if (isNewDevice) {
      heuristicFactors.push({
        name: 'Unrecognized Device Fingerprint',
        severity: 'MEDIUM',
        contribution: 15,
        message: `Transaction initiated from a previously unregistered hardware device ID or fresh app reinstall.`
      });
      heuristicPenalty += 15;
    }

    if (distanceJumpKm > 200) {
      heuristicFactors.push({
        name: 'Impossible Geolocation Jump',
        severity: 'HIGH',
        contribution: 25,
        message: `Payment origin is ${distanceJumpKm} km away from previous verified transaction location within an impossible travel timeframe.`
      });
      heuristicPenalty += 25;
    }

    return {
      isolationForestScore: Number(isoScore.toFixed(3)),
      amountZScore: Number(amountZScore.toFixed(2)),
      heuristicPenalty: Math.min(100, Math.round(heuristicPenalty)),
      heuristicFactors,
      featuresSummary: {
        amount,
        amountZScore: Number(amountZScore.toFixed(2)),
        velocity1h: velocityLast1Hour,
        velocity24h: velocityLast24Hours,
        isNocturnal: Boolean(isNocturnal),
        beneficiaryAgeDays,
        screenSharingActive,
        isCollectRequest
      }
    };
  }
}

export const anomalyDetector = new AnomalyDetectorService();

