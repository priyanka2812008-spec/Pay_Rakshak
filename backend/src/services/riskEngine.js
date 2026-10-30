/**
 * Pay Rakshak — 7-Domain Payment Risk Intelligence Engine (v3)
 *
 * Core Principle:
 *   DETECT → EXPLAIN → DECIDE → PROTECT
 *
 * Evaluates payment risk across EXACTLY 7 orthogonal domains:
 *   1. BENEFICIARY RISK       (15%)
 *   2. TRANSACTION RISK       (15%)
 *   3. BEHAVIOURAL RISK       (20%)
 *   4. TEMPORAL RISK          (10%)
 *   5. VELOCITY RISK          (10%)
 *   6. NETWORK / ASSOC RISK   (15%)
 *   7. INTENT / CONTEXT RISK  (15%)
 *
 * Formula:
 *   finalRisk = Math.round(
 *     beneficiaryRisk * 0.15 +
 *     transactionRisk * 0.15 +
 *     behaviouralRisk * 0.20 +
 *     temporalRisk    * 0.10 +
 *     velocityRisk    * 0.10 +
 *     networkRisk     * 0.15 +
 *     intentRisk      * 0.15
 *   );
 *
 * Thresholds:
 *   0–29:  ALLOW
 *   30–59: WARN
 *   60–79: VERIFY
 *   80–100: BLOCK / HOLD
 *
 * Fully deterministic — no Math.random().
 */

// ── 1. Trusted PSP Handles ───────────────────────────────────────────────────
export const TRUSTED_PSP_HANDLES = new Set([
  'okaxis', 'okhdfcbank', 'oksbi', 'okicici', 'paytm', 'ybl', 'ibl', 'axl',
  'barodampay', 'upi', 'apl', 'federal', 'aubank', 'idfcbank', 'kotak', 'indus',
  'icici', 'hdfcbank', 'sbi', 'axisbank', 'billdesk', 'yesbank', 'airtel',
  'postbank', 'jupiteraxis', 'freecharge', 'waaxis', 'pingpay', 'payrakshak'
]);

// ── 2. Brand Phishing Patterns ───────────────────────────────────────────────
const BRAND_PATTERNS = [
  { brand: 'Paytm',     re: /paytm|pay-tm|pytm/i },
  { brand: 'PhonePe',   re: /phonepe|phone-pe|fonepe|phonpe/i },
  { brand: 'Google Pay', re: /gpay|googlepay|google-pay/i },
  { brand: 'SBI Bank',  re: /sbi[._-]?(care|support|help|helpline)/i },
  { brand: 'HDFC Bank', re: /hdfc[._-]?(care|support|help)/i },
  { brand: 'ICICI Bank', re: /icici[._-]?(care|support|help)/i },
  { brand: 'Police/RBI', re: /cybercell|rbi[._-]?verify|police[._-]?fine/i },
];

const SCAM_KEYWORDS = [
  { word: 'refund',       pts: 15 },
  { word: 'cashback',     pts: 12 },
  { word: 'support',      pts: 10 },
  { word: 'helpline',     pts: 12 },
  { word: 'customercare', pts: 15 },
  { word: 'care',         pts: 8  },
  { word: 'kyc',          pts: 15 },
  { word: 'verify',       pts: 10 },
  { word: 'lottery',      pts: 20 },
  { word: 'winner',       pts: 18 },
  { word: 'reward',       pts: 10 },
  { word: 'gift',         pts: 8  },
  { word: 'freeze',       pts: 15 }
];

// ── 3. Sender Behavioral Baseline Profiles ──────────────────────────────────
export const SENDER_BASELINES = {
  'ramesh.sharma@okhdfcbank': {
    name: 'Ramesh Sharma',
    avg: 1850,
    std: 950,
    min: 200,
    max: 18000,
    typicalHours: [8, 22],
    typicalVelocity: 2
  },
  'priya.patel@okaxis': {
    name: 'Priya Patel',
    avg: 4200,
    std: 2100,
    min: 500,
    max: 45000,
    typicalHours: [9, 23],
    typicalVelocity: 3
  },
  'ananya.iyer@icici': {
    name: 'Ananya Iyer',
    avg: 650,
    std: 320,
    min: 50,
    max: 5000,
    typicalHours: [10, 22],
    typicalVelocity: 1
  },
  'vikram.malhotra@ybl': {
    name: 'Vikram Malhotra',
    avg: 6800,
    std: 3500,
    min: 1000,
    max: 75000,
    typicalHours: [7, 23],
    typicalVelocity: 4
  }
};

// ── 4. Beneficiary Intelligence & Synthetic Graph Database ──────────────────
export const BENEFICIARY_DB = {
  // Safe Certified Merchants & Friends
  'verified.merchant@payrakshak': {
    name: 'Verified Merchant (Retail)',
    verified: true, known: true, successfulTxns: 18,
    fraudReports: 0, mule: false, riskStatus: 'trusted', ageDays: 730,
    networkLinks: { flaggedConnections: 0, riskScore: 5, cluster: 'NPCI_CERTIFIED_RETAIL' },
    entityType: 'MERCHANT'
  },
  'trusted.shop@payrakshak': {
    name: 'Trusted Local Shop',
    verified: true, known: true, successfulTxns: 25,
    fraudReports: 0, mule: false, riskStatus: 'trusted', ageDays: 365,
    networkLinks: { flaggedConnections: 0, riskScore: 5, cluster: 'TRUSTED_MERCHANT_NETWORK' },
    entityType: 'MERCHANT'
  },
  'swiggy.orders@icici': {
    name: 'Swiggy (Bundl Technologies)',
    verified: true, known: true, successfulTxns: 200,
    fraudReports: 0, mule: false, riskStatus: 'trusted', ageDays: 1400,
    networkLinks: { flaggedConnections: 0, riskScore: 5, cluster: 'ENTERPRISE_MERCHANT' },
    entityType: 'MERCHANT'
  },
  'rohit.verma@okaxis': {
    name: 'Rohit Verma (Friend)',
    verified: false, known: true, successfulTxns: 14,
    fraudReports: 0, mule: false, riskStatus: 'trusted', ageDays: 450,
    networkLinks: { flaggedConnections: 0, riskScore: 8, cluster: 'PERSONAL_PEER_CIRCLE' },
    entityType: 'P2P'
  },
  'tatapower.mumbai@billdesk': {
    name: 'Tata Power Utility',
    verified: true, known: true, successfulTxns: 150,
    fraudReports: 0, mule: false, riskStatus: 'trusted', ageDays: 1800,
    networkLinks: { flaggedConnections: 0, riskScore: 5, cluster: 'GOVERNMENT_UTILITY' },
    entityType: 'UTILITY'
  },

  // First-Time / Unknown Peer (Medium Risk)
  'newcontact@payrakshak': {
    name: 'New Contact (Freelance)',
    verified: false, known: false, successfulTxns: 0,
    fraudReports: 0, mule: false, riskStatus: 'unverified', ageDays: 1,
    networkLinks: { flaggedConnections: 0, riskScore: 28, cluster: 'ISOLATED_NEW_NODE' },
    entityType: 'P2P'
  },
  'unknown-beneficiary@payrakshak': {
    name: 'Unknown Peer Account',
    verified: false, known: false, successfulTxns: 0,
    fraudReports: 0, mule: false, riskStatus: 'unverified', ageDays: 0.5,
    networkLinks: { flaggedConnections: 1, riskScore: 45, cluster: 'UNVERIFIED_CLUSTER' },
    entityType: 'P2P'
  },
  'jane.freelance@okaxis': {
    name: 'Jane (Freelancer)',
    verified: false, known: false, successfulTxns: 0,
    fraudReports: 0, mule: false, riskStatus: 'unverified', ageDays: 0.5,
    networkLinks: { flaggedConnections: 0, riskScore: 30, cluster: 'NEW_FREELANCE_NODE' },
    entityType: 'P2P'
  },

  // High Risk / Known Fraud Syndicates
  'support-refund@okaxis': {
    name: 'Support Refund Helpline (Scam)',
    verified: false, known: false, successfulTxns: 0,
    fraudReports: 3, mule: false, riskStatus: 'high-risk', ageDays: 2,
    networkLinks: { flaggedConnections: 4, riskScore: 88, cluster: 'CUSTOMER_SUPPORT_PHISHING_SYNDICATE' },
    entityType: 'SCAM_HELPLINE'
  },
  'paytm-refund-support@okaxis': {
    name: 'Raju Yadav (Mule Ring)',
    verified: false, known: false, successfulTxns: 0,
    fraudReports: 9, mule: true, riskStatus: 'high-risk', ageDays: 0.8,
    networkLinks: { flaggedConnections: 8, riskScore: 96, cluster: 'JAMTARA_MULE_RING_33' },
    entityType: 'MULE_ACCOUNT'
  },
  'sbi.helpline24x7@okhdfcbank': {
    name: 'Fake SBI Helpline',
    verified: false, known: false, successfulTxns: 0,
    fraudReports: 14, mule: true, riskStatus: 'high-risk', ageDays: 1.2,
    networkLinks: { flaggedConnections: 7, riskScore: 94, cluster: 'MEWAT_PHISHING_COLLECT_RING' },
    entityType: 'IMPERSONATION'
  },
  'cred-bonus-cashback@axl': {
    name: 'Amit Mondal (Cashback Scam)',
    verified: false, known: false, successfulTxns: 0,
    fraudReports: 5, mule: true, riskStatus: 'high-risk', ageDays: 3,
    networkLinks: { flaggedConnections: 6, riskScore: 85, cluster: 'TELEGRAM_CASHBACK_SCAM_SYNDICATE' },
    entityType: 'CASHBACK_SCAM'
  },
  'google-lottery-winner@upi': {
    name: 'Lottery Scam Account',
    verified: false, known: false, successfulTxns: 0,
    fraudReports: 15, mule: true, riskStatus: 'high-risk', ageDays: 0.4,
    networkLinks: { flaggedConnections: 9, riskScore: 98, cluster: 'LOTTERY_ADVANCE_FEE_RING' },
    entityType: 'LOTTERY_FRAUD'
  }
};

// ── VPA Analysis Helper ──────────────────────────────────────────────────────
function inspectVpaHandle(vpaId) {
  if (!vpaId || !vpaId.includes('@')) {
    return { isLegitPsp: false, isImpersonation: false, matchedKeywords: [], vpaScore: 40 };
  }
  const [username, handle] = vpaId.toLowerCase().split('@');
  const isLegitPsp = TRUSTED_PSP_HANDLES.has(handle);

  let isImpersonation = false;
  let impersonatedBrand = null;
  for (const b of BRAND_PATTERNS) {
    if (b.re.test(username)) {
      isImpersonation = true;
      impersonatedBrand = b.brand;
      break;
    }
  }

  const matchedKeywords = [];
  let kwScore = 0;
  for (const k of SCAM_KEYWORDS) {
    if (username.includes(k.word)) {
      matchedKeywords.push(k.word);
      kwScore += k.pts;
    }
  }

  let vpaScore = 5;
  if (!isLegitPsp) vpaScore += 20;
  if (isImpersonation) vpaScore += 45;
  if (kwScore > 0) vpaScore += Math.min(30, kwScore);

  return {
    isLegitPsp,
    isImpersonation,
    impersonatedBrand,
    matchedKeywords,
    vpaScore: Math.min(100, vpaScore)
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7 DOMAIN RISK CALCULATION
// ─────────────────────────────────────────────────────────────────────────────
export function calculatePaymentRisk(payload) {
  const {
    senderUpiId = 'ramesh.sharma@okhdfcbank',
    beneficiaryUpiId = 'verified.merchant@payrakshak',
    amount = 850,
    paymentPurpose = 'Shopping',
    velocityLast1Hour = 1,
    velocityLast5Minutes = 0,
    transactionHour = new Date().getHours(),
    beneficiaryAgeDays: inputAgeDays,
    screenSharingActive = false,
    isCollectRequest = false,
    isolationForestScore = 0.05
  } = payload;

  const parsedAmount = Math.max(1, Number(amount));
  const vel1h = Number(velocityLast1Hour);
  const vel5m = Number(velocityLast5Minutes);
  const hour = Number(transactionHour);

  // 1. Fetch Baseline & Beneficiary Data
  const baseline = SENDER_BASELINES[senderUpiId] || {
    name: 'Default User',
    avg: 2000,
    std: 1000,
    min: 100,
    max: 30000,
    typicalHours: [8, 22]
  };

  const benKey = (beneficiaryUpiId || '').toLowerCase();
  const ben = BENEFICIARY_DB[benKey] || null;
  const isKnown = ben?.known ?? false;
  const isVerified = ben?.verified ?? false;
  const succTxns = ben?.successfulTxns ?? (isKnown ? 5 : 0);
  const fraudReports = ben?.fraudReports ?? 0;
  const isMule = ben?.mule ?? false;

  const ageDays = (inputAgeDays !== undefined && inputAgeDays !== null)
    ? Number(inputAgeDays)
    : (ben?.ageDays ?? 30);

  const vpa = inspectVpaHandle(beneficiaryUpiId);
  const zScore = (parsedAmount - baseline.avg) / (baseline.std || 500);
  const amountRatio = parsedAmount / (baseline.avg || 1);

  // ───────────────────────────────────────────────────────────────────────────
  // DOMAIN 1: BENEFICIARY RISK (Weight: 15%)
  // ───────────────────────────────────────────────────────────────────────────
  const benSignals = [];
  let benScore = 10;

  if (isVerified) {
    benScore -= 20;
    benSignals.push('Verified merchant identity registered with NPCI directory (-20)');
  }
  if (isKnown) {
    benScore -= 15;
    benSignals.push(`Known contact with ${succTxns} successful past transactions (-15)`);
  } else {
    benScore += 25;
    benSignals.push('First-time beneficiary — no historical payment relationship (+25)');
  }

  if (ageDays <= 1) {
    benScore += 30;
    benSignals.push(`Fresh disposable VPA created <24 hours ago (${ageDays.toFixed(1)}d) (+30)`);
  } else if (ageDays <= 7) {
    benScore += 15;
    benSignals.push(`Recently provisioned account (${Math.round(ageDays)} days old) (+15)`);
  }

  if (vpa.isImpersonation) {
    benScore += 45;
    benSignals.push(`Impersonates registered brand '${vpa.impersonatedBrand}' (+45)`);
  } else if (vpa.matchedKeywords.length > 0) {
    benScore += 20;
    benSignals.push(`Scam keywords detected: [${vpa.matchedKeywords.join(', ')}] (+20)`);
  }

  if (fraudReports >= 3) {
    benScore += 45;
    benSignals.push(`${fraudReports} active cybercrime fraud complaints on record (+45)`);
  } else if (fraudReports >= 1) {
    benScore += 25;
    benSignals.push(`Previously flagged for suspicious activity (${fraudReports} report) (+25)`);
  }

  if (isMule) {
    benScore += 35;
    benSignals.push('Matches high-velocity mule account drainage pattern (+35)');
  }

  const beneficiaryRisk = Math.min(100, Math.max(5, Math.round(benScore)));

  // ───────────────────────────────────────────────────────────────────────────
  // DOMAIN 2: TRANSACTION RISK (Weight: 15%)
  // ───────────────────────────────────────────────────────────────────────────
  const txSignals = [];
  let txScore = 8;

  if (amountRatio <= 1.2 && parsedAmount >= baseline.min && parsedAmount <= baseline.max) {
    txScore = 6;
    txSignals.push(`Amount ₹${parsedAmount.toLocaleString('en-IN')} within typical baseline range (0.2x–1.2x avg)`);
  } else if (amountRatio <= 2.5) {
    txScore = 25;
    txSignals.push(`Amount is ${amountRatio.toFixed(1)}x of average payment (₹${baseline.avg}) (+15)`);
  } else if (amountRatio <= 6.0) {
    txScore = 55;
    txSignals.push(`Unusual amount: ${amountRatio.toFixed(1)}x higher than average payment (+45)`);
  } else {
    txScore = 85;
    txSignals.push(`Extreme amount outlier: ₹${parsedAmount.toLocaleString('en-IN')} is ${amountRatio.toFixed(1)}x normal baseline (+75)`);
  }

  if (!isKnown && parsedAmount > 10000) {
    txScore += 15;
    txSignals.push('High-value transfer directed to a first-time recipient (+15)');
  }

  if (screenSharingActive) {
    txScore += 40;
    txSignals.push('Active screen sharing (AnyDesk / TeamViewer) during transaction (+40)');
  }
  if (isCollectRequest) {
    txScore += 35;
    txSignals.push('Inverted collect request: External party initiating debit (+35)');
  }

  const transactionRisk = Math.min(100, Math.max(5, Math.round(txScore)));

  // ───────────────────────────────────────────────────────────────────────────
  // DOMAIN 3: BEHAVIOURAL RISK (Weight: 20%)
  // ───────────────────────────────────────────────────────────────────────────
  const behSignals = [];
  let behScore = 5;

  if (zScore > 10) {
    behScore = 95;
    behSignals.push(`Extreme statistical deviation (Z = +${zScore.toFixed(1)}σ from 30-day mean)`);
  } else if (zScore > 5) {
    behScore = 75;
    behSignals.push(`Substantial behavioral anomaly (Z = +${zScore.toFixed(1)}σ)`);
  } else if (zScore > 2.5) {
    behScore = 45;
    behSignals.push(`Moderate deviation from user's historical habits (Z = +${zScore.toFixed(1)}σ)`);
  } else if (zScore > 1.2) {
    behScore = 22;
    behSignals.push(`Slight elevation over user's typical transfer average (Z = +${zScore.toFixed(1)}σ)`);
  } else {
    behScore = 6;
    behSignals.push(`Transaction amount ₹${parsedAmount} aligns with user mean of ₹${baseline.avg}`);
  }

  // Factor in Isolation Forest ML Anomaly Score
  const ifAnomaly = Number(isolationForestScore) || 0.05;
  if (ifAnomaly > 0.6) {
    behScore += 15;
    behSignals.push(`Isolation Forest unsupervised model flagged outlier vector (${(ifAnomaly * 100).toFixed(0)}%)`);
  }

  const behaviouralRisk = Math.min(100, Math.max(5, Math.round(behScore)));

  // ───────────────────────────────────────────────────────────────────────────
  // DOMAIN 4: TEMPORAL RISK (Weight: 10%)
  // ───────────────────────────────────────────────────────────────────────────
  const tempSignals = [];
  let tempScore = 5;
  const isNocturnal = hour >= 1 && hour <= 5;

  if (isNocturnal) {
    tempScore = 75;
    tempSignals.push(`Transaction at ${hour}:00 IST — outside user's regular daytime transacting hours`);
    if (parsedAmount > 5000) {
      tempScore += 15;
      tempSignals.push('High amount transfer initiated during late-night hours (+15)');
    }
  } else if (hour >= 23 || hour === 0) {
    tempScore = 25;
    tempSignals.push(`Late evening transaction (${hour}:00 IST)`);
  } else {
    tempScore = 5;
    tempSignals.push(`Transaction initiated during regular banking hours (${hour}:00 IST)`);
  }

  const temporalRisk = Math.min(100, Math.max(5, Math.round(tempScore)));

  // ───────────────────────────────────────────────────────────────────────────
  // DOMAIN 5: VELOCITY RISK (Weight: 10%)
  // ───────────────────────────────────────────────────────────────────────────
  const velSignals = [];
  let velScore = 5;

  if (vel5m >= 4 || vel1h >= 7) {
    velScore = 90;
    velSignals.push(`Rapid velocity attack: ${vel1h} transactions in 1hr / ${vel5m} in last 5 mins`);
  } else if (vel1h >= 4) {
    velScore = 65;
    velSignals.push(`Elevated velocity burst: ${vel1h} transfers in 60 minutes`);
  } else if (vel1h >= 2) {
    velScore = 25;
    velSignals.push(`Moderate frequency: ${vel1h} payments in last hour`);
  } else {
    velScore = 5;
    velSignals.push('Normal velocity: 1 payment in recent window');
  }

  const velocityRisk = Math.min(100, Math.max(5, Math.round(velScore)));

  // ───────────────────────────────────────────────────────────────────────────
  // DOMAIN 6: NETWORK / ASSOCIATION RISK (Weight: 15%)
  // ───────────────────────────────────────────────────────────────────────────
  const netSignals = [];
  let netScore = 8;

  if (ben?.networkLinks) {
    const net = ben.networkLinks;
    netScore = net.riskScore;
    if (net.flaggedConnections >= 4) {
      netSignals.push(`Direct graph connection to ${net.flaggedConnections} previously flagged fraud nodes`);
      netSignals.push(`Associated with synthetic cluster: ${net.cluster}`);
    } else if (net.flaggedConnections >= 1) {
      netSignals.push(`Entity shares co-linked device / counterparty with 1 reported account`);
    } else {
      netSignals.push(`Zero suspicious graph links in synthetic transaction network (${net.cluster})`);
    }
  } else {
    netScore = isKnown ? 10 : 35;
    netSignals.push(isKnown ? 'Clean peer-to-peer network graph' : 'Unindexed standalone recipient node (no adverse associations)');
  }

  const networkRisk = Math.min(100, Math.max(5, Math.round(netScore)));

  // ───────────────────────────────────────────────────────────────────────────
  // DOMAIN 7: INTENT / CONTEXT RISK ⭐ (Weight: 15%)
  // Signature Feature: User Intent vs Actual Transaction Context
  // ───────────────────────────────────────────────────────────────────────────
  const intentSignals = [];
  let intentScore = 10;
  const purpose = (paymentPurpose || 'Shopping').trim();

  switch (purpose) {
    case 'Refund':
      // CRITICAL TRAP: User sending money out under the guise of "receiving a refund"
      if (!isVerified || !isKnown) {
        intentScore = 95;
        intentSignals.push('CRITICAL MISMATCH: User selected "Refund", but this is an OUTGOING DEBIT transfer. In UPI, refunds are incoming credits — you NEVER enter PIN to receive money.');
      } else {
        intentScore = 60;
        intentSignals.push('Unusual: Outgoing transfer categorized as "Refund"');
      }
      break;

    case 'Bill Payment':
      if (isVerified && ben?.entityType === 'UTILITY') {
        intentScore = 5;
        intentSignals.push('Clean Intent Match: Payment matches verified utility provider');
      } else {
        intentScore = 80;
        intentSignals.push('Intent Mismatch: "Bill Payment" selected, but recipient is a personal P2P handle instead of an authorized utility provider.');
      }
      break;

    case 'Shopping':
      if (isVerified) {
        intentScore = 5;
        intentSignals.push('Clean Intent Match: Shopping transfer to certified merchant terminal');
      } else if (parsedAmount > 15000 && !isKnown) {
        intentScore = 75;
        intentSignals.push(`Context Discrepancy: High commercial amount (₹${parsedAmount}) sent to an unverified personal handle for "Shopping".`);
      } else {
        intentScore = 20;
        intentSignals.push('Standard peer shopping transfer');
      }
      break;

    case 'Investment':
      if (!isVerified) {
        intentScore = 85;
        intentSignals.push('High-Risk Intent Mismatch: "Investment" selected, but recipient is an individual personal handle without SEBI / banking merchant registration (matches Crypto/Task scam pattern).');
      } else {
        intentScore = 15;
        intentSignals.push('Investment transfer to registered entity');
      }
      break;

    case 'Government Service':
      if (!isVerified) {
        intentScore = 85;
        intentSignals.push('Suspicious Context: "Government Service" claimed, but recipient is a personal unverified VPA.');
      } else {
        intentScore = 5;
        intentSignals.push('Verified public service provider');
      }
      break;

    case 'Friend / Family':
      if (isKnown && !vpa.isImpersonation) {
        intentScore = 6;
        intentSignals.push('Consistent Context: Transfer to known peer aligns with "Friend / Family" purpose.');
      } else if (vpa.isImpersonation) {
        intentScore = 90;
        intentSignals.push('Severe Context Conflict: "Friend / Family" selected, but recipient VPA is impersonating an official bank or company helpline.');
      } else {
        intentScore = 35;
        intentSignals.push('First-time recipient categorized under "Friend / Family"');
      }
      break;

    case 'Rent':
      if (parsedAmount < 2000 || parsedAmount > 100000) {
        intentScore = 45;
        intentSignals.push(`Amount ₹${parsedAmount} differs from typical rent lease structures`);
      } else {
        intentScore = 12;
        intentSignals.push('Plausible rent transfer context');
      }
      break;

    default:
      intentScore = 20;
      intentSignals.push(`General purpose: ${purpose}`);
      break;
  }

  // Cross-cutting threat overrides on intent
  if (screenSharingActive) {
    intentScore = Math.max(90, intentScore);
    intentSignals.push('Screen-sharing tool overrides intent: User is likely being coerced / guided by an external attacker.');
  }
  if (isCollectRequest && purpose === 'Refund') {
    intentScore = 98;
    intentSignals.push('Known Scammer Trap: Collect debit request paired with "Refund" premise.');
  }

  const intentRisk = Math.min(100, Math.max(5, Math.round(intentScore)));

  // ───────────────────────────────────────────────────────────────────────────
  // FINAL WEIGHTED MULTI-DOMAIN AGGREGATION
  // ───────────────────────────────────────────────────────────────────────────
  // Beneficiary (15%) + Transaction (15%) + Behavioural (20%) +
  // Temporal (10%) + Velocity (10%) + Network (15%) + Intent (15%)
  const rawFinalScore =
    beneficiaryRisk * 0.15 +
    transactionRisk * 0.15 +
    behaviouralRisk * 0.20 +
    temporalRisk    * 0.10 +
    velocityRisk    * 0.10 +
    networkRisk     * 0.15 +
    intentRisk      * 0.15;

  let finalRisk = Math.min(100, Math.max(5, Math.round(rawFinalScore)));

  // Hard Override Safety Caps
  if (screenSharingActive && isCollectRequest) {
    finalRisk = Math.max(92, finalRisk);
  } else if (screenSharingActive) {
    finalRisk = Math.max(82, finalRisk);
  } else if (isCollectRequest && purpose === 'Refund') {
    finalRisk = Math.max(90, finalRisk);
  } else if (networkRisk >= 90 && beneficiaryRisk >= 90) {
    finalRisk = Math.max(85, finalRisk);
  } else if (velocityRisk >= 90 && !isKnown) {
    finalRisk = Math.max(75, finalRisk);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // DECISION TIERS
  // ───────────────────────────────────────────────────────────────────────────
  let decision, decisionTier, riskLevel, actionRequired, title, badgeColor;
  if (finalRisk >= 80) {
    decision = 'BLOCK / HOLD';
    decisionTier = 'BLOCK';
    riskLevel = 'CRITICAL';
    actionRequired = 'BLOCK_HOLD';
    title = 'BLOCK / HOLD — Critical Threat Intercepted';
    badgeColor = 'red';
  } else if (finalRisk >= 60) {
    decision = 'VERIFY';
    decisionTier = 'VERIFY';
    riskLevel = 'HIGH';
    actionRequired = 'REQUIRE_MFA';
    title = 'VERIFY — Step-Up Authentication Required';
    badgeColor = 'orange';
  } else if (finalRisk >= 30) {
    decision = 'WARN';
    decisionTier = 'WARN';
    riskLevel = 'MEDIUM';
    actionRequired = 'WARN_USER';
    title = 'WARN — Proceed with Caution';
    badgeColor = 'amber';
  } else {
    decision = 'ALLOW';
    decisionTier = 'ALLOW';
    riskLevel = 'LOW';
    actionRequired = 'DIRECT_PASS';
    title = 'ALLOW — Clean Transaction';
    badgeColor = 'green';
  }

  // ───────────────────────────────────────────────────────────────────────────
  // DOMAIN BREAKDOWN OBJECT FOR UI & EXPLAINABILITY
  // ───────────────────────────────────────────────────────────────────────────
  const domains = [
    {
      id: 'beneficiary',
      name: 'Beneficiary Risk',
      shortName: 'Beneficiary',
      weight: 15,
      weightStr: '15%',
      score: beneficiaryRisk,
      contribution: Number((beneficiaryRisk * 0.15).toFixed(1)),
      signals: benSignals,
      explanation: isVerified
        ? 'Verified merchant with clean transaction history'
        : isKnown
        ? 'Known contact with prior successful transfers'
        : 'First-time or unverified beneficiary'
    },
    {
      id: 'transaction',
      name: 'Transaction Risk',
      shortName: 'Transaction',
      weight: 15,
      weightStr: '15%',
      score: transactionRisk,
      contribution: Number((transactionRisk * 0.15).toFixed(1)),
      signals: txSignals,
      explanation: amountRatio > 5
        ? `Outlier amount: ${amountRatio.toFixed(1)}x of normal user average`
        : 'Amount aligns with normal baseline limits'
    },
    {
      id: 'behavioural',
      name: 'Behavioural Risk',
      shortName: 'Behaviour',
      weight: 20,
      weightStr: '20%',
      score: behaviouralRisk,
      contribution: Number((behaviouralRisk * 0.20).toFixed(1)),
      signals: behSignals,
      explanation: zScore > 5
        ? `Substantial behavioral deviation (Z = +${zScore.toFixed(1)}σ)`
        : 'Matches user standard spending habits'
    },
    {
      id: 'temporal',
      name: 'Temporal Risk',
      shortName: 'Temporal',
      weight: 10,
      weightStr: '10%',
      score: temporalRisk,
      contribution: Number((temporalRisk * 0.10).toFixed(1)),
      signals: tempSignals,
      explanation: isNocturnal
        ? `Initiated at ${hour}:00 IST (late-night off-hours)`
        : 'Initiated during regular daytime hours'
    },
    {
      id: 'velocity',
      name: 'Velocity Risk',
      shortName: 'Velocity',
      weight: 10,
      weightStr: '10%',
      score: velocityRisk,
      contribution: Number((velocityRisk * 0.10).toFixed(1)),
      signals: velSignals,
      explanation: vel1h >= 4
        ? `${vel1h} payments in recent window (burst)`
        : 'Normal payment frequency'
    },
    {
      id: 'network',
      name: 'Network Risk',
      shortName: 'Network',
      weight: 15,
      weightStr: '15%',
      score: networkRisk,
      contribution: Number((networkRisk * 0.15).toFixed(1)),
      signals: netSignals,
      explanation: netScore > 50
        ? 'Synthetic graph links to flagged scam clusters'
        : 'Zero adverse connections in synthetic entity graph'
    },
    {
      id: 'intent',
      name: 'Intent / Context Risk ⭐',
      shortName: 'Intent',
      weight: 15,
      weightStr: '15%',
      score: intentRisk,
      contribution: Number((intentRisk * 0.15).toFixed(1)),
      signals: intentSignals,
      explanation: intentScore > 50
        ? `Stated intent "${purpose}" mismatches transaction context`
        : `Intent "${purpose}" matches transaction context`
    }
  ];

  // Sort domains by contribution to find top 3 contributors
  const sortedDomains = [...domains].sort((a, b) => b.score - a.score);
  const topContributors = sortedDomains.slice(0, 3).map((d, index) => ({
    rank: index + 1,
    id: d.id,
    name: d.name,
    score: d.score,
    contribution: d.contribution,
    reason: d.signals[0] || d.explanation
  }));

  // Build natural language reason
  let reason = '';
  if (decisionTier === 'ALLOW') {
    reason = 'All 7 risk domains evaluate within normal operational tolerances. Trust signals and stated intent match beneficiary history.';
  } else if (decisionTier === 'WARN') {
    reason = `Moderate risk detected primarily from ${topContributors[0]?.name} (${topContributors[0]?.score}/100). Review recipient details before proceeding.`;
  } else if (decisionTier === 'VERIFY') {
    reason = `Elevated risk across ${topContributors[0]?.name} (${topContributors[0]?.score}) and ${topContributors[1]?.name} (${topContributors[1]?.score}). Step-up verification required.`;
  } else {
    reason = `CRITICAL THREAT: Money movement halted. Dominant risk drivers: ${topContributors[0]?.name} (${topContributors[0]?.score}), ${topContributors[1]?.name} (${topContributors[1]?.score}).`;
  }

  // Format factors for backwards compatibility with ExplainabilityCard
  const factors = domains.map(d => ({
    category: d.name,
    title: d.name,
    severity: d.score >= 80 ? 'CRITICAL' : d.score >= 60 ? 'HIGH' : d.score >= 30 ? 'MEDIUM' : 'SAFE',
    weight: d.score,
    impact: `${d.score}/100 (${d.contribution} pts)`,
    description: d.signals.join(' • '),
    recommendation: d.score >= 60 ? d.signals[0] : null,
    isRisk: d.score >= 30
  }));

  return {
    evaluatedAt: new Date().toISOString(),
    _source: '7_DOMAIN_ENGINE_V3',
    transactionInput: {
      senderUpiId,
      beneficiaryUpiId,
      amount: parsedAmount,
      paymentPurpose: purpose,
      category: purpose,
      velocityLast1Hour: vel1h,
      transactionHour: hour,
      beneficiaryAgeDays: ageDays,
      screenSharingActive,
      isCollectRequest
    },
    // The exact 7 domain scores
    beneficiaryRisk,
    transactionRisk,
    behaviouralRisk,
    temporalRisk,
    velocityRisk,
    networkRisk,
    intentRisk,
    finalRisk,
    decision,
    decisionTier,
    riskLevel,
    topContributors,
    domains,
    reason,
    // Backwards compatibility layer for UI components
    riskAssessment: {
      compositeScore: finalRisk,
      decisionTier,
      actionRequired,
      title,
      badgeColor,
      suggestedIntervention:
        decisionTier === 'BLOCK'  ? 'Block payment. Contact National Cybercrime Helpline 1930.' :
        decisionTier === 'VERIFY' ? 'Request biometric / OTP re-authentication.' :
        decisionTier === 'WARN'   ? 'Show user warning screen and verify recipient.' :
                                    'Allow transaction — clean pre-payment signals.'
    },
    scoresBreakdown: {
      beneficiaryRisk,
      transactionRisk,
      behaviouralRisk,
      temporalRisk,
      velocityRisk,
      networkRisk,
      intentRisk,
      finalRisk,
      amountZScore: Number(zScore.toFixed(2))
    },
    vpaIntelligence: {
      riskScore: vpa.vpaScore,
      isImpersonation: vpa.isImpersonation,
      impersonatedBrand: vpa.impersonatedBrand,
      matchedKeywords: vpa.matchedKeywords,
      isLegitPspHandle: vpa.isLegitPsp,
      explanation: vpa.isImpersonation
        ? `Impersonates brand '${vpa.impersonatedBrand}'`
        : vpa.matchedKeywords.length > 0
        ? `Flagged keywords: ${vpa.matchedKeywords.join(', ')}`
        : 'Legitimate PSP handle'
    },
    explainability: {
      compositeScore: finalRisk,
      decisionTier,
      summary: reason,
      factorsCount: domains.length,
      factors,
      topRiskDriver: topContributors[0] || null,
      topContributors,
      domains
    },
    beneficiaryProfile: {
      registeredBankName: ben?.name || 'Unregistered / Direct Peer',
      reputationScore: ben ? Math.max(0, 100 - (ben.fraudReports * 10)) : 55,
      disputeCount: ben?.fraudReports || 0,
      isVerifiedMerchant: ben?.verified || false,
      isMulePattern: ben?.mule || false,
      category: ben?.riskStatus || 'Unverified'
    }
  };
}

// Alias for backwards compatibility
export const calculateLocalRisk = calculatePaymentRisk;

export async function analyzePrePaymentRisk(payload) {
  return calculatePaymentRisk(payload);
}
