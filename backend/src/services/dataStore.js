/**
 * Clean Unified Data Access Layer
 * Supports seamless MongoDB persistence with robust, pre-seeded In-Memory fallback.
 * Allows instant running and evaluation in demo/hackathon conditions without external setup.
 */

import { isDbConnected } from '../config/database.js';
import { Transaction } from '../models/Transaction.js';
import { Beneficiary, UserProfile, RiskRule } from '../models/Beneficiary.js';

// Pre-seeded Memory Database
const memoryStore = {
  users: [
    {
      upiId: 'ramesh.sharma@okhdfcbank',
      name: 'Ramesh Sharma',
      accountNumberMasked: 'HDFC-XXXX8812',
      averageTransactionAmount: 1850,
      standardDeviationAmount: 950,
      maxHistoricalSingleTransfer: 18000,
      trustedDeviceIds: ['DEV-SM-A52-881'],
      primaryLocation: 'Bengaluru',
      nocturnalRatio: 0.02,
      lastActive: new Date()
    },
    {
      upiId: 'priya.patel@okaxis',
      name: 'Priya Patel',
      accountNumberMasked: 'AXIS-XXXX4419',
      averageTransactionAmount: 4200,
      standardDeviationAmount: 2100,
      maxHistoricalSingleTransfer: 45000,
      trustedDeviceIds: ['DEV-IPHONE15-092'],
      primaryLocation: 'Mumbai',
      nocturnalRatio: 0.08,
      lastActive: new Date()
    },
    {
      upiId: 'ananya.iyer@icici',
      name: 'Ananya Iyer',
      accountNumberMasked: 'ICICI-XXXX3014',
      averageTransactionAmount: 650,
      standardDeviationAmount: 320,
      maxHistoricalSingleTransfer: 5000,
      trustedDeviceIds: ['DEV-PIXEL8-411'],
      primaryLocation: 'Chennai',
      nocturnalRatio: 0.01,
      lastActive: new Date()
    },
    {
      upiId: 'vikram.malhotra@ybl',
      name: 'Vikram Malhotra',
      accountNumberMasked: 'YESB-XXXX9031',
      averageTransactionAmount: 6800,
      standardDeviationAmount: 3500,
      maxHistoricalSingleTransfer: 75000,
      trustedDeviceIds: ['DEV-ONEPLUS12-772'],
      primaryLocation: 'Delhi NCR',
      nocturnalRatio: 0.05,
      lastActive: new Date()
    }
  ],

  beneficiaries: [
    // Verified Safe
    {
      upiId: 'rohit.verma@okaxis',
      registeredBankName: 'Rohit Verma',
      accountCreatedDate: new Date(Date.now() - 450 * 24 * 60 * 60 * 1000),
      reputationScore: 96,
      disputeCount: 0,
      isVerifiedMerchant: false,
      isMulePattern: false,
      category: 'Peer-to-Peer',
      historicalVolume: 125000,
      lastSeenLocation: 'Bengaluru'
    },
    {
      upiId: 'swiggy.orders@icici',
      registeredBankName: 'Bundl Technologies Pvt Ltd (Swiggy)',
      accountCreatedDate: new Date(Date.now() - 1400 * 24 * 60 * 60 * 1000),
      reputationScore: 99,
      disputeCount: 0,
      isVerifiedMerchant: true,
      isMulePattern: false,
      category: 'Food & Groceries',
      historicalVolume: 98000000,
      lastSeenLocation: 'Bengaluru'
    },
    {
      upiId: 'tatapower.mumbai@billdesk',
      registeredBankName: 'The Tata Power Company Limited',
      accountCreatedDate: new Date(Date.now() - 1800 * 24 * 60 * 60 * 1000),
      reputationScore: 100,
      disputeCount: 0,
      isVerifiedMerchant: true,
      isMulePattern: false,
      category: 'Utility Bills',
      historicalVolume: 45000000,
      lastSeenLocation: 'Mumbai'
    },
    {
      upiId: 'dr.sneha.clinic@okhdfcbank',
      registeredBankName: 'Dr Sneha Mukhopadhyay Clinic',
      accountCreatedDate: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000),
      reputationScore: 94,
      disputeCount: 0,
      isVerifiedMerchant: true,
      isMulePattern: false,
      category: 'Healthcare',
      historicalVolume: 560000,
      lastSeenLocation: 'Kolkata'
    },

    // Known Scams & High-Risk Mule Accounts
    {
      upiId: 'paytm-refund-support@okaxis',
      registeredBankName: 'Raju Yadav',
      accountCreatedDate: new Date(Date.now() - 0.8 * 24 * 60 * 60 * 1000), // 19 hours old
      reputationScore: 12,
      disputeCount: 9,
      isVerifiedMerchant: false,
      isMulePattern: true,
      category: 'Impersonation Scam',
      historicalVolume: 340000,
      lastSeenLocation: 'Jamtara'
    },
    {
      upiId: 'sbi.helpline24x7@okhdfcbank',
      registeredBankName: 'Manoj Kumar',
      accountCreatedDate: new Date(Date.now() - 1.2 * 24 * 60 * 60 * 1000), // 28 hours old
      reputationScore: 8,
      disputeCount: 14,
      isVerifiedMerchant: false,
      isMulePattern: true,
      category: 'Bank Helpline Phishing',
      historicalVolume: 780000,
      lastSeenLocation: 'Nuh, Mewat'
    },
    {
      upiId: 'electricity-bill-discount@ibl',
      registeredBankName: 'Sunil Kumar Paswan',
      accountCreatedDate: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000),
      reputationScore: 18,
      disputeCount: 6,
      isVerifiedMerchant: false,
      isMulePattern: true,
      category: 'Utility Phishing',
      historicalVolume: 190000,
      lastSeenLocation: 'Deoghar'
    },
    {
      upiId: 'kbc-lottery-winner@paytm',
      registeredBankName: 'Dharmendra Singh',
      accountCreatedDate: new Date(Date.now() - 0.4 * 24 * 60 * 60 * 1000), // 9 hours old
      reputationScore: 4,
      disputeCount: 22,
      isVerifiedMerchant: false,
      isMulePattern: true,
      category: 'Lottery Scam',
      historicalVolume: 490000,
      lastSeenLocation: 'Bharatpur'
    },
    {
      upiId: 'cred-bonus-cashback@axl',
      registeredBankName: 'Amit Mondal',
      accountCreatedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      reputationScore: 22,
      disputeCount: 5,
      isVerifiedMerchant: false,
      isMulePattern: false,
      category: 'Reward Phishing',
      historicalVolume: 120000,
      lastSeenLocation: 'Giridih'
    },
    // Demo test beneficiaries
    {
      upiId: 'verified.merchant@payrakshak',
      registeredBankName: 'Verified Demo Merchant',
      accountCreatedDate: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000),
      reputationScore: 98,
      disputeCount: 0,
      isVerifiedMerchant: true,
      isMulePattern: false,
      successfulTransactionCount: 18,
      category: 'Verified Merchant',
      historicalVolume: 850000,
      lastSeenLocation: 'Bengaluru'
    },
    {
      upiId: 'trusted.shop@payrakshak',
      registeredBankName: 'Trusted Shop Demo',
      accountCreatedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      reputationScore: 96,
      disputeCount: 0,
      isVerifiedMerchant: true,
      isMulePattern: false,
      successfulTransactionCount: 25,
      category: 'Verified Merchant',
      historicalVolume: 430000,
      lastSeenLocation: 'Mumbai'
    },
    {
      upiId: 'support-refund@okaxis',
      registeredBankName: 'Unknown (Suspected Scam)',
      accountCreatedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      reputationScore: 8,
      disputeCount: 3,
      isVerifiedMerchant: false,
      isMulePattern: false,
      successfulTransactionCount: 0,
      category: 'Suspected Fraud',
      historicalVolume: 0,
      lastSeenLocation: 'Unknown'
    }
  ],

  rules: [
    {
      ruleId: 'RULE-SCREEN-SHARE-COLLECT',
      name: 'Screen-Sharing + Debit Collect Intercept',
      category: 'CRITICAL_SECURITY',
      weight: 50,
      enabled: true,
      action: 'BLOCK',
      description: 'Hard-blocks any payment when remote screen sharing software is active in conjunction with a collect request.'
    },
    {
      ruleId: 'RULE-BRAND-IMPERSONATION',
      name: 'VPA Brand Impersonation Guard',
      category: 'PHISHING_PREVENTION',
      weight: 45,
      enabled: true,
      action: 'BLOCK',
      description: 'Stops payments to handles mimicking registered fintechs, customer care lines, or banks.'
    },
    {
      ruleId: 'RULE-NEW-BENEFICIARY-SPIKE',
      name: 'Fresh Beneficiary Outlier Amount',
      category: 'AMOUNT_ANOMALY',
      weight: 30,
      threshold: 3.5, // Z-score threshold
      enabled: true,
      action: 'VERIFY',
      description: 'Requires cooling period and biometrics if amount is > 3.5x sender standard deviation to beneficiary under 48h old.'
    },
    {
      ruleId: 'RULE-VELOCITY-BURST',
      name: 'High Frequency Velocity Burst',
      category: 'DRAINAGE_PREVENTION',
      weight: 25,
      threshold: 4, // transfers per hour
      enabled: true,
      action: 'VERIFY',
      description: 'Flags rapid successive payment attempts within a 60-minute window.'
    },
    {
      ruleId: 'RULE-NOCTURNAL-ANOMALY',
      name: 'Nocturnal Hour Deviation',
      category: 'TIME_ANOMALY',
      weight: 15,
      enabled: true,
      action: 'WARN',
      description: 'Alerts user when large transfers are initiated between 01:00 AM and 05:00 AM.'
    }
  ],

  transactions: [
    {
      transactionId: 'TXN-PR-908124',
      timestamp: new Date(Date.now() - 14 * 60 * 1000),
      senderUpiId: 'ramesh.sharma@okhdfcbank',
      beneficiaryUpiId: 'rohit.verma@okaxis',
      beneficiaryName: 'Rohit Verma',
      amount: 1200,
      currency: 'INR',
      category: 'P2P',
      riskScore: 12,
      decisionTier: 'ALLOW',
      status: 'APPROVED',
      anomalyFlags: [],
      locationCity: 'Bengaluru',
      screenSharingDetected: false,
      isCollectRequest: false
    },
    {
      transactionId: 'TXN-PR-908125',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      senderUpiId: 'priya.patel@okaxis',
      beneficiaryUpiId: 'swiggy.orders@icici',
      beneficiaryName: 'Swiggy India',
      amount: 480,
      currency: 'INR',
      category: 'Food',
      riskScore: 5,
      decisionTier: 'ALLOW',
      status: 'APPROVED',
      anomalyFlags: [],
      locationCity: 'Mumbai',
      screenSharingDetected: false,
      isCollectRequest: false
    },
    {
      transactionId: 'TXN-PR-908126',
      timestamp: new Date(Date.now() - 4 * 60 * 1000),
      senderUpiId: 'vikram.malhotra@ybl',
      beneficiaryUpiId: 'paytm-refund-support@okaxis',
      beneficiaryName: 'Raju Yadav',
      amount: 49500,
      currency: 'INR',
      category: 'Refund Scam',
      riskScore: 94,
      decisionTier: 'BLOCK',
      status: 'BLOCKED',
      anomalyFlags: ['VPA_IMPERSONATION', 'AMOUNT_OUTLIER', 'MULE_ACCOUNT', 'SCREEN_SHARE_ACTIVE'],
      locationCity: 'Delhi NCR',
      screenSharingDetected: true,
      isCollectRequest: true
    },
    {
      transactionId: 'TXN-PR-908127',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      senderUpiId: 'ananya.iyer@icici',
      beneficiaryUpiId: 'kbc-lottery-winner@paytm',
      beneficiaryName: 'Dharmendra Singh',
      amount: 15000,
      currency: 'INR',
      category: 'Lottery Scam',
      riskScore: 89,
      decisionTier: 'BLOCK',
      status: 'BLOCKED',
      anomalyFlags: ['VPA_PHISHING', 'Z_SCORE_SPIKE', 'NEW_BENEFICIARY'],
      locationCity: 'Chennai',
      screenSharingDetected: false,
      isCollectRequest: true
    }
  ],

  delayedHolds: [
    {
      holdId: 'HOLD-PR-40192',
      transactionId: 'TXN-PR-SCHED-01',
      senderUpiId: 'ramesh.sharma@okhdfcbank',
      beneficiaryUpiId: 'jane.freelance@okaxis',
      beneficiaryName: 'Jane Cooper',
      amount: 20500,
      scheduledAt: new Date(Date.now() - 42 * 60 * 1000), // 42 mins ago
      delayHours: 4,
      releaseAt: new Date(Date.now() + (4 * 60 - 42) * 60 * 1000), // ~3h 18m left
      status: 'ACTIVE_COOLING_OFF', // ACTIVE_COOLING_OFF, CANCELLED_BY_USER, RELEASED
      reason: 'New recipient VPA + First-time transfer anomaly',
      smsNotificationSent: true,
      canCancelUntil: new Date(Date.now() + (4 * 60 - 42) * 60 * 1000)
    },
    {
      holdId: 'HOLD-PR-40193',
      transactionId: 'TXN-PR-SCHED-02',
      senderUpiId: 'priya.patel@okaxis',
      beneficiaryUpiId: 'rohit.crypto-deals@ybl',
      beneficiaryName: 'Rohit Sharma (Trader)',
      amount: 35000,
      scheduledAt: new Date(Date.now() - 75 * 60 * 1000), // 1h 15m ago
      delayHours: 6,
      releaseAt: new Date(Date.now() + (6 * 60 - 75) * 60 * 1000), // ~4h 45m left
      status: 'ACTIVE_COOLING_OFF',
      reason: 'Anti-Urgency Scam Shield triggered (Caller pressure flag)',
      smsNotificationSent: true,
      canCancelUntil: new Date(Date.now() + (6 * 60 - 75) * 60 * 1000)
    }
  ]
};

export const dataStore = {
  // User Profile
  async getUserProfile(upiId) {
    if (isDbConnected()) {
      try {
        const doc = await UserProfile.findOne({ upiId });
        if (doc) return doc.toObject();
      } catch (e) {
        console.error('MongoDB getUserProfile error:', e.message);
      }
    }
    return memoryStore.users.find(u => u.upiId.toLowerCase() === upiId?.toLowerCase()) || {
      upiId: upiId || 'guest.user@okhdfcbank',
      name: 'Guest User',
      averageTransactionAmount: 1500,
      standardDeviationAmount: 800,
      trustedDeviceIds: ['DEV-GENERIC-001'],
      primaryLocation: 'Bengaluru',
      nocturnalRatio: 0.03
    };
  },

  async getAllUsers() {
    if (isDbConnected()) {
      try {
        const docs = await UserProfile.find();
        if (docs.length > 0) return docs;
      } catch (e) {}
    }
    return memoryStore.users;
  },

  // Beneficiary
  async getBeneficiary(upiId) {
    if (isDbConnected()) {
      try {
        const doc = await Beneficiary.findOne({ upiId });
        if (doc) return doc.toObject();
      } catch (e) {}
    }
    return memoryStore.beneficiaries.find(b => b.upiId.toLowerCase() === upiId?.toLowerCase()) || null;
  },

  async getAllBeneficiaries() {
    if (isDbConnected()) {
      try {
        const docs = await Beneficiary.find();
        if (docs.length > 0) return docs;
      } catch (e) {}
    }
    return memoryStore.beneficiaries;
  },

  // Transactions
  async recordTransaction(txData) {
    const txRecord = {
      ...txData,
      transactionId: txData.transactionId || `TXN-PR-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date()
    };

    if (isDbConnected()) {
      try {
        const created = await Transaction.create(txRecord);
        return created.toObject();
      } catch (e) {
        console.error('MongoDB recordTransaction error:', e.message);
      }
    }

    // Add to memory store front
    memoryStore.transactions.unshift(txRecord);
    if (memoryStore.transactions.length > 200) {
      memoryStore.transactions.pop();
    }
    return txRecord;
  },

  async getRecentTransactions(limit = 20) {
    if (isDbConnected()) {
      try {
        const docs = await Transaction.find().sort({ timestamp: -1 }).limit(limit);
        if (docs.length > 0) return docs;
      } catch (e) {}
    }
    return memoryStore.transactions.slice(0, limit);
  },

  // Rules
  async getRules() {
    if (isDbConnected()) {
      try {
        const docs = await RiskRule.find();
        if (docs.length > 0) return docs;
      } catch (e) {}
    }
    return memoryStore.rules;
  },

  async updateRule(ruleId, updates) {
    if (isDbConnected()) {
      try {
        const updated = await RiskRule.findOneAndUpdate({ ruleId }, updates, { new: true });
        if (updated) return updated.toObject();
      } catch (e) {}
    }
    const idx = memoryStore.rules.findIndex(r => r.ruleId === ruleId);
    if (idx !== -1) {
      memoryStore.rules[idx] = { ...memoryStore.rules[idx], ...updates };
      return memoryStore.rules[idx];
    }
    return null;
  },

  // Safe Delayed Release Holds (Anti-Urgency Escrow)
  async getDelayedHolds() {
    return memoryStore.delayedHolds;
  },

  async scheduleDelayedHold(holdData) {
    const delayHours = holdData.delayHours || 4;
    const now = new Date();
    const releaseAt = new Date(now.getTime() + delayHours * 60 * 60 * 1000);

    const newHold = {
      holdId: `HOLD-PR-${Math.floor(10000 + Math.random() * 90000)}`,
      transactionId: `TXN-PR-SCHED-${Math.floor(1000 + Math.random() * 9000)}`,
      senderUpiId: holdData.senderUpiId,
      beneficiaryUpiId: holdData.beneficiaryUpiId,
      beneficiaryName: holdData.beneficiaryName || 'Beneficiary',
      amount: Number(holdData.amount) || 0,
      scheduledAt: now,
      delayHours,
      releaseAt,
      status: 'ACTIVE_COOLING_OFF',
      reason: holdData.reason || 'All new payees get a 4-hour delay (Anti-Urgency Scam Shield)',
      smsNotificationSent: true,
      canCancelUntil: releaseAt
    };

    memoryStore.delayedHolds.unshift(newHold);
    return newHold;
  },

  async cancelDelayedHold(holdId) {
    const hold = memoryStore.delayedHolds.find(h => h.holdId === holdId);
    if (hold) {
      hold.status = 'CANCELLED_BY_USER';
      hold.cancelledAt = new Date();
      return hold;
    }
    return null;
  },

  async releaseDelayedHold(holdId) {
    const hold = memoryStore.delayedHolds.find(h => h.holdId === holdId);
    if (hold) {
      hold.status = 'RELEASED';
      hold.releasedAt = new Date();
      return hold;
    }
    return null;
  }
};

