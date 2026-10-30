/**
 * UPI VPA Intelligence & Impersonation Detector
 * Detects typo-squatting, fake customer care handles, phishing keywords, and mule VPAs.
 */

const TRUSTED_PSP_HANDLES = new Set([
  'okaxis', 'okhdfcbank', 'oksbi', 'okicici', 'paytm', 'ybl', 'ibl', 'axl',
  'barodampay', 'upi', 'apl', 'federal', 'aubank', 'idfcbank', 'kotak', 'indus',
  'icici', 'hdfcbank', 'sbi', 'axisbank', 'billdesk', 'yesbank', 'airtel', 'postbank',
  'jupiteraxis', 'freecharge', 'waaxis', 'pingpay', 'payrakshak'
]);

const TARGETED_BRANDS = [
  { brand: 'Paytm', patterns: [/paytm/i, /pay-tm/i, /pytm/i] },
  { brand: 'PhonePe', patterns: [/phonepe/i, /phone-pe/i, /fonepe/i, /phonpe/i] },
  { brand: 'Google Pay / GPay', patterns: [/gpay/i, /googlepay/i, /google-pay/i] },
  { brand: 'State Bank of India', patterns: [/sbi[._-]?care/i, /sbi[._-]?support/i, /sbi[._-]?help/i, /statebank/i] },
  { brand: 'HDFC Bank', patterns: [/hdfc[._-]?care/i, /hdfc[._-]?support/i, /hdfc[._-]?help/i] },
  { brand: 'ICICI Bank', patterns: [/icici[._-]?care/i, /icici[._-]?support/i, /icici[._-]?help/i] },
  { brand: 'Electricity Board', patterns: [/bijli/i, /electricity/i, /bses/i, /uppcl/i, /tneb/i, /mahadiscom/i] },
  { brand: 'CRED', patterns: [/cred[._-]?rewards/i, /cred[._-]?cash/i] },
  { brand: 'Cyber Police / RBI', patterns: [/cybercell/i, /rbi[._-]?verify/i, /police[._-]?fine/i] }
];

const SCAM_KEYWORDS = [
  { word: 'refund', weight: 35 },
  { word: 'cashback', weight: 30 },
  { word: 'support', weight: 25 },
  { word: 'helpline', weight: 30 },
  { word: 'customercare', weight: 35 },
  { word: 'care', weight: 20 },
  { word: 'kyc', weight: 40 },
  { word: 'verify', weight: 25 },
  { word: 'lottery', weight: 45 },
  { word: 'winner', weight: 40 },
  { word: 'urgent', weight: 20 },
  { word: 'tollfree', weight: 30 },
  { word: 'recharge', weight: 15 },
  { word: 'reward', weight: 25 },
  { word: 'gift', weight: 20 }
];

// Levenshtein distance for string similarity
function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1].toLowerCase() === s2[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,      // deletion
          dp[i][j - 1] + 1,      // insertion
          dp[i - 1][j - 1] + 1   // substitution
        );
      }
    }
  }
  return dp[m][n];
}

export function inspectVpa(vpa) {
  if (!vpa || typeof vpa !== 'string') {
    return {
      isValidVpa: false,
      riskScore: 60,
      isImpersonation: false,
      impersonatedBrand: null,
      matchedKeywords: [],
      handle: '',
      username: '',
      isLegitPspHandle: false,
      details: 'Invalid or missing UPI VPA format.'
    };
  }

  const cleanVpa = vpa.trim().toLowerCase();
  const parts = cleanVpa.split('@');

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return {
      isValidVpa: false,
      riskScore: 70,
      isImpersonation: false,
      impersonatedBrand: null,
      matchedKeywords: [],
      handle: '',
      username: cleanVpa,
      isLegitPspHandle: false,
      details: 'Malformed UPI ID: Must follow format username@handle (e.g. rohit@okaxis)'
    };
  }

  const [username, handle] = parts;
  const isLegitPsp = TRUSTED_PSP_HANDLES.has(handle);

  let impersonatedBrand = null;
  let impersonationConfidence = 0;

  // 1. Check brand impersonation in username
  for (const b of TARGETED_BRANDS) {
    for (const pattern of b.patterns) {
      if (pattern.test(username)) {
        impersonatedBrand = b.brand;
        impersonationConfidence = 0.85;
        break;
      }
    }
    if (impersonatedBrand) break;
  }

  // 2. Check keyword traps in username
  const matchedKeywords = [];
  let keywordRiskSum = 0;

  for (const item of SCAM_KEYWORDS) {
    if (username.includes(item.word)) {
      matchedKeywords.push(item.word);
      keywordRiskSum += item.weight;
    }
  }

  // 3. Typo-squatting checks on standard usernames (e.g. paytmcare -> 0 distance vs paytmcare)
  let typoScore = 0;
  if (username.length > 5) {
    const brandKeywords = ['phonepe', 'paytm', 'googlepay', 'sbibank', 'icicibank'];
    for (const bk of brandKeywords) {
      const dist = levenshteinDistance(username.slice(0, bk.length), bk);
      if (dist === 1 || dist === 2) {
        typoScore = Math.max(typoScore, 0.75);
        if (!impersonatedBrand) {
          impersonatedBrand = bk.toUpperCase();
        }
      }
    }
  }

  // Calculate composite VPA risk
  let vpaRisk = 5; // base baseline risk

  if (!isLegitPsp) {
    vpaRisk += 25; // Unknown or unofficial PSP handle
  }

  if (impersonatedBrand) {
    vpaRisk += 45;
  }

  if (matchedKeywords.length > 0) {
    vpaRisk += Math.min(40, keywordRiskSum);
  }

  if (typoScore > 0) {
    vpaRisk += Math.floor(typoScore * 30);
  }

  // High numbers / random string heuristic (e.g. user98347103847@ybl)
  const digitRatio = (username.match(/\d/g) || []).length / username.length;
  if (digitRatio > 0.6 && username.length > 10) {
    // Phone numbers as UPI ID is normal in India (e.g. 9876543210@paytm)
    // Only flag if it's mixed random letters & digits
    const isPurePhone = /^\d{10}$/.test(username);
    if (!isPurePhone) {
      vpaRisk += 15;
    }
  }

  const finalRisk = Math.min(99, Math.max(0, vpaRisk));

  let explanation = 'UPI handle appears standard and matches registered PSP handles.';
  if (impersonatedBrand) {
    explanation = `High alert: Beneficiary VPA impersonates '${impersonatedBrand}' official handles using deceptive prefix '${username}'.`;
  } else if (matchedKeywords.length > 0) {
    explanation = `Suspicious keywords detected in UPI handle: [${matchedKeywords.join(', ')}]. Often used in refund/support impostor scams.`;
  } else if (!isLegitPsp) {
    explanation = `Unrecognized PSP handle '@${handle}'. May be an unauthorized gateway or non-standard router.`;
  }

  return {
    isValidVpa: true,
    riskScore: finalRisk,
    isImpersonation: !!impersonatedBrand || typoScore > 0.6,
    impersonatedBrand,
    matchedKeywords,
    handle,
    username,
    isLegitPspHandle: isLegitPsp,
    explanation
  };
}
