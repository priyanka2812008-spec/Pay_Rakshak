import mongoose from 'mongoose';

const BeneficiarySchema = new mongoose.Schema({
  upiId: { type: String, required: true, unique: true },
  registeredBankName: { type: String, required: true },
  accountCreatedDate: { type: Date, default: Date.now },
  reputationScore: { type: Number, default: 85 }, // 0 to 100
  disputeCount: { type: Number, default: 0 },
  isVerifiedMerchant: { type: Boolean, default: false },
  isMulePattern: { type: Boolean, default: false },
  category: { type: String, default: 'Individual' },
  historicalVolume: { type: Number, default: 0 },
  lastSeenLocation: { type: String, default: 'Mumbai' }
}, { timestamps: true });

export const Beneficiary = mongoose.model('Beneficiary', BeneficiarySchema);

const UserProfileSchema = new mongoose.Schema({
  upiId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  accountNumberMasked: { type: String, default: 'XX9021' },
  averageTransactionAmount: { type: Number, default: 1500 },
  standardDeviationAmount: { type: Number, default: 800 },
  maxHistoricalSingleTransfer: { type: Number, default: 15000 },
  trustedDeviceIds: [String],
  primaryLocation: { type: String, default: 'Bengaluru' },
  nocturnalRatio: { type: Number, default: 0.02 },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

export const UserProfile = mongoose.model('UserProfile', UserProfileSchema);

const RiskRuleSchema = new mongoose.Schema({
  ruleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  weight: { type: Number, default: 20 },
  threshold: { type: Number },
  enabled: { type: Boolean, default: true },
  action: { type: String, enum: ['ALLOW', 'WARN', 'VERIFY', 'BLOCK'] },
  description: { type: String }
}, { timestamps: true });

export const RiskRule = mongoose.model('RiskRule', RiskRuleSchema);

