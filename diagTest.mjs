import { calculatePaymentRisk } from './frontend/src/services/localRiskEngine.js';

// User's 3 exact test scenarios
const scenarios = [
  {
    name: 'SAFE: Priya → mother@payrakshak ₹500',
    payload: {
      senderUpiId: 'priya.patel@okaxis',
      beneficiaryUpiId: 'mother@payrakshak',
      amount: 500,
      paymentPurpose: 'Friend / Family',
      velocityLast1Hour: 1,
      transactionHour: 18,
      beneficiaryAgeDays: 365
    },
    expected: 'ALLOW'
  },
  {
    name: 'SUSPICIOUS: Priya → urgent-refund@payrakshak ₹25,000',
    payload: {
      senderUpiId: 'priya.patel@okaxis',
      beneficiaryUpiId: 'urgent-refund@payrakshak',
      amount: 25000,
      paymentPurpose: 'Refund',
      velocityLast1Hour: 5,
      velocityLast5Minutes: 5,
      transactionHour: 2,
      beneficiaryAgeDays: 0.5
    },
    expected: 'BLOCK'
  },
  {
    name: 'MEDIUM: Priya → shop-demo@payrakshak ₹8,500',
    payload: {
      senderUpiId: 'priya.patel@okaxis',
      beneficiaryUpiId: 'shop-demo@payrakshak',
      amount: 8500,
      paymentPurpose: 'Shopping',
      velocityLast1Hour: 1,
      transactionHour: 14,
      beneficiaryAgeDays: 30
    },
    expected: 'WARN or VERIFY'
  }
];

console.log('=== PAY RAKSHAK — 7-Domain Test Report ===\n');
for (const s of scenarios) {
  const r = calculatePaymentRisk(s.payload);
  console.log(`--- ${s.name} ---`);
  console.log(`  Expected:      ${s.expected}`);
  console.log(`  Actual Score:  ${r.finalRisk}/100`);
  console.log(`  Decision:      ${r.decision} (tier: ${r.decisionTier})`);
  console.log(`  [D1] Beneficiary:   ${r.beneficiaryRisk}/100`);
  console.log(`  [D2] Transaction:   ${r.transactionRisk}/100`);
  console.log(`  [D3] Behavioural:   ${r.behaviouralRisk}/100`);
  console.log(`  [D4] Temporal:      ${r.temporalRisk}/100`);
  console.log(`  [D5] Velocity:      ${r.velocityRisk}/100`);
  console.log(`  [D6] Network:       ${r.networkRisk}/100`);
  console.log(`  [D7] Intent:        ${r.intentRisk}/100`);
  console.log(`  ben found in DB:    ${!!r.beneficiaryProfile?.registeredBankName}`);
  console.log();
}

