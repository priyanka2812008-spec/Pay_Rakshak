/**
 * Explainability Engine
 * Translates ML scores, statistical anomalies, and rule evaluations
 * into transparent, factor-weighted explanations and natural language advisories.
 */

export function generateRiskExplanation(data) {
  const {
    compositeScore,
    vpaAnalysis,
    anomalyResult,
    decisionTier,
    beneficiary,
    sender
  } = data;

  const factors = [];

  // 1. VPA & Impersonation Factors
  if (vpaAnalysis.isImpersonation) {
    factors.push({
      category: 'VPA Intelligence',
      title: 'Brand Impersonation & Typo-Squatting',
      severity: 'CRITICAL',
      weight: 35,
      impact: '+35 pts',
      description: vpaAnalysis.explanation,
      recommendation: 'Do NOT authorize. Verified companies never request funds via personal or masked PSP handles.'
    });
  } else if (vpaAnalysis.matchedKeywords.length > 0) {
    factors.push({
      category: 'VPA Intelligence',
      title: 'Scam Phishing Keywords in UPI ID',
      severity: 'HIGH',
      weight: 20,
      impact: `+${Math.min(30, vpaAnalysis.matchedKeywords.length * 15)} pts`,
      description: `Target UPI handle contains flagged scam triggers: [${vpaAnalysis.matchedKeywords.join(', ')}].`,
      recommendation: 'Verify official contact numbers on the merchant\'s verified website before proceeding.'
    });
  } else if (!vpaAnalysis.isLegitPspHandle) {
    factors.push({
      category: 'VPA Intelligence',
      title: 'Unregistered / Exotic PSP Handle',
      severity: 'MEDIUM',
      weight: 12,
      impact: '+15 pts',
      description: vpaAnalysis.explanation,
      recommendation: 'Check whether your bank supports routing to this PSP handle.'
    });
  } else {
    factors.push({
      category: 'VPA Intelligence',
      title: 'Handle Authenticity',
      severity: 'SAFE',
      weight: 0,
      impact: '0 pts',
      description: `UPI ID is structured correctly with recognized PSP handle (@${vpaAnalysis.handle}).`,
      recommendation: null
    });
  }

  // 2. Anomaly & Heuristic Factors
  if (anomalyResult.heuristicFactors && anomalyResult.heuristicFactors.length > 0) {
    anomalyResult.heuristicFactors.forEach(factor => {
      factors.push({
        category: 'Behavioral & Context',
        title: factor.name,
        severity: factor.severity,
        weight: factor.contribution,
        impact: `+${factor.contribution} pts`,
        description: factor.message,
        recommendation: getRecommendationForFactor(factor.name)
      });
    });
  }

  // 3. Beneficiary History & Dispute Ratio
  if (beneficiary) {
    if (beneficiary.disputeCount && beneficiary.disputeCount > 0) {
      factors.push({
        category: 'Reputation System',
        title: 'Reported Cybercrime Incidents',
        severity: beneficiary.disputeCount > 3 ? 'CRITICAL' : 'HIGH',
        weight: 30,
        impact: `+${Math.min(40, beneficiary.disputeCount * 12)} pts`,
        description: `This recipient has been reported for suspicious activities or fraudulent claims ${beneficiary.disputeCount} time(s) across Indian PSP networks.`,
        recommendation: 'High risk of irreversible fund loss. Immediate hold advised.'
      });
    }

    if (beneficiary.isMulePattern) {
      factors.push({
        category: 'Mule Detection',
        title: 'Mule Account Flow Signature',
        severity: 'CRITICAL',
        weight: 40,
        impact: '+40 pts',
        description: 'Account receives rapid sequential deposits from multiple unrelated senders and immediately transfers out funds.',
        recommendation: 'Flagged by I4C (Indian Cyber Crime Coordination Centre) heuristics.'
      });
    }
  }

  // Generate Executive Summary
  let summary = '';
  switch (decisionTier) {
    case 'BLOCK':
      summary = `DANGER: This transaction exhibits high-confidence fraud indicators (Risk Score: ${compositeScore}/100). The recipient handle, sudden behavioral deviation, or active threat vectors suggest an ongoing scam attempt. Money movement is halted to safeguard funds.`;
      break;
    case 'VERIFY':
      summary = `CAUTION REQUIRED: Significant anomalies detected (Risk Score: ${compositeScore}/100). A combination of unverified beneficiary age, velocity spikes, or abnormal transaction sum requires mandatory stepped identity verification before authorization.`;
      break;
    case 'WARN':
      summary = `ADVISORY: Moderate deviations observed (Risk Score: ${compositeScore}/100). The transaction differs slightly from regular behavioral baselines or targets a newly added contact. Please review beneficiary details carefully.`;
      break;
    case 'ALLOW':
    default:
      summary = `SAFE TO PROCEED: Risk parameters within safe operational thresholds (Risk Score: ${compositeScore}/100). Beneficiary history is reputable and amount matches standard baseline patterns.`;
      break;
  }

  return {
    compositeScore,
    decisionTier,
    summary,
    factorsCount: factors.length,
    factors,
    topRiskDriver: factors.find(f => f.severity === 'CRITICAL' || f.severity === 'HIGH') || null
  };
}

function getRecommendationForFactor(factorName) {
  switch (factorName) {
    case 'Remote Access / Screen Sharing Detected':
      return 'Disconnect any active phone call, AnyDesk, or TeamViewer app immediately. Legitimate bank support will never ask to view your screen.';
    case 'Inverted Flow (UPI Collect Request Scam)':
      return 'DO NOT ENTER YOUR UPI PIN. Remember: You only enter UPI PIN to SEND money, never to receive a refund or lottery prize.';
    case 'Sudden Amount Outlier':
      return 'Confirm recipient bank account details or contact the beneficiary via trusted known phone number.';
    case 'Rapid Payment Burst (Velocity Spike)':
      return 'Pause successive payments. Rapid transfers may trigger bank safety hold for 24 hours.';
    case 'New Beneficiary Risk':
      return 'Send a nominal test transfer (e.g., ₹1) first if dealing with an unknown seller.';
    case 'Unusual Nocturnal Hour':
      return 'Consider scheduling large transfers during standard daytime banking hours.';
    default:
      return 'Verify details before proceeding.';
  }
}

