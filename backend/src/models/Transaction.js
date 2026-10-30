import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  senderUpiId: { type: String, required: true },
  beneficiaryUpiId: { type: String, required: true },
  beneficiaryName: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  category: { type: String, default: 'P2P' },
  riskScore: { type: Number, required: true },
  decisionTier: { type: String, enum: ['ALLOW', 'WARN', 'VERIFY', 'BLOCK'], required: true },
  status: { type: String, enum: ['APPROVED', 'STEPPED_VERIFIED', 'WARNED_PROCEEDED', 'BLOCKED', 'CANCELLED'], default: 'APPROVED' },
  anomalyFlags: [String],
  riskFactors: [mongoose.Schema.Types.Mixed],
  deviceFingerprint: { type: String },
  locationCity: { type: String, default: 'Bengaluru' },
  screenSharingDetected: { type: Boolean, default: false },
  isCollectRequest: { type: Boolean, default: false }
}, { timestamps: true });

export const Transaction = mongoose.model('Transaction', TransactionSchema);

