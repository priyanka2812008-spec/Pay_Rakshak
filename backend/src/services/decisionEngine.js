/**
 * Dynamic Decision Engine
 * Maps composite risk score & hard policy triggers to actionable decision tiers:
 * ALLOW (0 - 29) -> WARN (30 - 59) -> VERIFY (60 - 79) -> HOLD/BLOCK (80 - 100)
 */

export const DECISION_TIERS = {
  ALLOW: 'ALLOW',
  WARN: 'WARN',
  VERIFY: 'VERIFY',
  BLOCK: 'BLOCK'
};

export function evaluateDecisionTier(riskScore, hardTriggers = {}) {
  // Check hard blocking triggers first (Zero-tolerance rules)
  if (hardTriggers.screenSharingActive && hardTriggers.isCollectRequest) {
    return {
      tier: DECISION_TIERS.BLOCK,
      actionRequired: 'EMERGENCY_INTERCEPTION',
      title: 'CRITICAL ATTACK INTERCEPTED',
      badgeColor: 'red',
      suggestedIntervention: {
        type: 'HARD_BLOCK',
        actionLabel: 'Transaction Intercepted & Blocked',
        reason: 'Simultaneous remote screen sharing tool and inverted UPI debit collect request detected.',
        actions: [
          'Immediate transaction halt',
          'Lock UPI profile for 30 minutes',
          'Prompt user to terminate AnyDesk / TeamViewer',
          'File auto-draft incident on NCRP (cybercrime.gov.in)'
        ],
        canOverride: false
      }
    };
  }

  if (hardTriggers.isMuleAccount || hardTriggers.isImpersonation && riskScore >= 75) {
    return {
      tier: DECISION_TIERS.BLOCK,
      actionRequired: 'FRAUD_BLOCK',
      title: 'HIGH CONFIDENCE FRAUD DETECTED',
      badgeColor: 'red',
      suggestedIntervention: {
        type: 'HARD_BLOCK',
        actionLabel: 'Blocked by Anti-Phishing Guard',
        reason: 'Beneficiary handle impersonates a financial institution or has active cybercrime reports.',
        actions: [
          'Payment rejected before UPI network routing',
          'Notify sending bank risk desk',
          'Provide Helpline 1930 one-tap dialer'
        ],
        canOverride: false
      }
    };
  }

  // Tier mapping based on dynamic composite score
  if (riskScore >= 80) {
    return {
      tier: DECISION_TIERS.BLOCK,
      actionRequired: 'HOLD_BLOCK',
      title: 'PAYMENT FROZEN / BLOCKED',
      badgeColor: 'red',
      suggestedIntervention: {
        type: 'SECURITY_HOLD',
        actionLabel: 'Payment Temporarily Blocked',
        reason: `Composite risk index is ${riskScore}/100, exceeding maximum security tolerance.`,
        actions: [
          'Halt payment before balance deduction',
          'Initiate 2-hour cooling-off security lock',
          'Request manual bank officer authorization or in-person verification'
        ],
        canOverride: false
      }
    };
  } else if (riskScore >= 60) {
    return {
      tier: DECISION_TIERS.VERIFY,
      actionRequired: 'STEPPED_VERIFICATION',
      title: 'STEPPED VERIFICATION REQUIRED',
      badgeColor: 'orange',
      suggestedIntervention: {
        type: 'STEPPED_VERIFY',
        actionLabel: 'Perform Multi-Factor Identity Check',
        coolingPeriodSeconds: 45,
        reason: 'Significant risk indicators detected. Elevated scrutiny required before fund dispatch.',
        actions: [
          'Enforce 45-second cooling-off countdown timer',
          'Reveal Recipient\'s NPCI-registered Bank Account Name',
          'Require Biometric Re-Authentication (Fingerprint / Face ID)',
          'Present interactive scam awareness confirmation challenge'
        ],
        canOverride: true
      }
    };
  } else if (riskScore >= 30) {
    return {
      tier: DECISION_TIERS.WARN,
      actionRequired: 'USER_CAUTION',
      title: 'PROCEED WITH CAUTION',
      badgeColor: 'amber',
      suggestedIntervention: {
        type: 'WARN_CONFIRM',
        actionLabel: 'Review Beneficiary Details',
        reason: 'Mild anomalies detected compared to standard spending baseline.',
        actions: [
          'Display cautionary highlight banner',
          'Verify recipient identity and purpose of transfer',
          'Checkbox acknowledgement: "I personally know this recipient"'
        ],
        canOverride: true
      }
    };
  } else {
    return {
      tier: DECISION_TIERS.ALLOW,
      actionRequired: 'DIRECT_PASS',
      title: 'PAYMENT APPROVED',
      badgeColor: 'emerald',
      suggestedIntervention: {
        type: 'SEAMLESS_ALLOW',
        actionLabel: 'Safe to Proceed',
        reason: 'Low risk. All behavioral and contextual parameters within expected standard baseline.',
        actions: [
          'Seamless biometric / PIN authorization',
          'Standard bank receipt generation'
        ],
        canOverride: true
      }
    };
  }
}

