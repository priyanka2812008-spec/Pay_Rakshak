import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Fingerprint,
  Timer,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Copy,
  Check
} from 'lucide-react';

export default function InterventionModal({
  isOpen,
  onClose,
  evaluation,
  onProceedVerified
}) {
  if (!isOpen || !evaluation) return null;

  const { riskAssessment, transactionInput, beneficiaryProfile, explainability } = evaluation;
  const tier = riskAssessment.decisionTier;

  // Stepped verification state
  const [countdown, setCountdown] = useState(30);
  const [coolingActive, setCoolingActive] = useState(tier === 'VERIFY');
  const [biometricVerified, setBiometricVerified] = useState(false);
  const [scamConfirmed, setScamConfirmed] = useState(false);
  const [warnAcknowledged, setWarnAcknowledged] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let timer;
    if (coolingActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCoolingActive(false);
    }
    return () => clearInterval(timer);
  }, [coolingActive, countdown]);

  const handleCopyCybercrimeReport = () => {
    const reportText = `[NATIONAL CYBER CRIME REPORTING DRAFT - NCRP 1930]
Date: ${new Date().toLocaleString()}
Incident Type: Suspicious UPI Pre-Payment Interception
Beneficiary UPI ID: ${transactionInput.beneficiaryUpiId}
Beneficiary Registered Name: ${beneficiaryProfile.registeredBankName}
Attempted Amount: ₹${transactionInput.amount.toLocaleString('en-IN')}
Risk Score: ${riskAssessment.compositeScore}/100 (Tier: ${riskAssessment.decisionTier})
Flags: ${explainability.factors.map(f => f.title).join(', ')}
Screen Sharing Active: ${transactionInput.screenSharingActive ? 'YES' : 'NO'}
Collect Request Scam: ${transactionInput.isCollectRequest ? 'YES' : 'NO'}
Reported via Pay Rakshak Automated Fraud Defense.`;

    navigator.clipboard.writeText(reportText);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 3000);
  };

  const handleConfirmStepped = () => {
    setIsCompleted(true);
    if (onProceedVerified) {
      onProceedVerified('VERIFIED');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-surface-card border border-surface-border shadow-2xl overflow-hidden p-6 relative">
        {/* Tier: BLOCK */}
        {tier === 'BLOCK' && (
          <div className="space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-700/80 flex items-center justify-center mx-auto text-red-500 shadow-glow-block">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <div className="text-center">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest bg-red-950 text-red-400 border border-red-800 px-2.5 py-0.5 rounded-full">
                HARD INTERCEPTION HALT
              </span>
              <h2 className="text-xl font-bold text-white mt-2">
                Transaction Blocked by Pay Rakshak
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                No money was deducted. The transaction was stopped before reaching the UPI network to protect your funds.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-red-900/50 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Attempted Amount:</span>
                <span className="font-mono font-bold text-white">₹{transactionInput.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Recipient VPA:</span>
                <span className="font-mono text-red-400">{transactionInput.beneficiaryUpiId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Actual Registered Name:</span>
                <span className="font-semibold text-amber-300">{beneficiaryProfile.registeredBankName}</span>
              </div>
              <div className="pt-2 border-t border-surface-border flex justify-between text-slate-400">
                <span>Primary Risk Trigger:</span>
                <span className="font-semibold text-red-400">{explainability.topRiskDriver?.title || 'Phishing / Malware'}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/50 text-[11px] text-red-300 leading-relaxed">
              ⚠️ <span className="font-semibold">Security Action:</span> Your UPI PIN was NOT transmitted. If someone instructed you to enter PIN while on a phone call or sharing your screen, disconnect immediately.
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleCopyCybercrimeReport}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-surface border border-surface-border hover:bg-surface-border text-xs font-medium text-slate-200 transition-colors"
              >
                {copiedDraft ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                <span>{copiedDraft ? 'Incident Report Copied to Clipboard!' : 'Copy Incident Report for Helpline 1930'}</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs tracking-wide transition-colors"
              >
                Close & Keep Money Safe
              </button>
            </div>
          </div>
        )}

        {/* Tier: VERIFY */}
        {tier === 'VERIFY' && !isCompleted && (
          <div className="space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-orange-950/80 border border-orange-700/80 flex items-center justify-center mx-auto text-orange-400 shadow-glow-verify">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="text-center">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest bg-orange-950 text-orange-400 border border-orange-800 px-2.5 py-0.5 rounded-full">
                STEPPED MULTI-FACTOR VERIFICATION
              </span>
              <h2 className="text-lg font-bold text-white mt-2">
                Mandatory Safety Verification
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Anomalous payment detected. Complete multi-factor checks before authorization.
              </p>
            </div>

            {/* Cooling-off Countdown */}
            <div className="p-3.5 rounded-xl bg-surface border border-surface-border text-center">
              <div className="flex items-center justify-center space-x-2 text-xs font-mono text-slate-300 mb-1">
                <Timer className="w-4 h-4 text-cyan-400" />
                <span>Anti-Panic Cooling-Off Period:</span>
              </div>
              <div className="text-2xl font-mono font-bold text-cyan-400">
                {countdown > 0 ? `00:${countdown.toString().padStart(2, '0')}` : 'VERIFIED WINDOW OPEN'}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {countdown > 0 ? 'Wait for countdown to prevent hasty scam execution' : 'Cooling delay satisfied.'}
              </p>
            </div>

            {/* Recipient Revealed Details */}
            <div className="p-3.5 rounded-xl bg-surface/90 border border-surface-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient UPI ID:</span>
                <span className="font-mono text-cyan-300">{transactionInput.beneficiaryUpiId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bank-Registered Legal Name:</span>
                <span className="font-bold text-amber-300">{beneficiaryProfile.registeredBankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-white">₹{transactionInput.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="space-y-2 text-xs">
              <label className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-surface/60 border border-surface-border/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scamConfirmed}
                  onChange={(e) => setScamConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="text-slate-300 leading-tight">
                  I understand this is a <strong className="text-white">DEBIT</strong> from my bank account. Entering my UPI PIN will NOT deposit any money into my account.
                </span>
              </label>

              <button
                type="button"
                onClick={() => setBiometricVerified(true)}
                className={`w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  biometricVerified
                    ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                    : 'bg-surface border-cyan-700/60 text-cyan-300 hover:bg-cyan-950/30'
                }`}
              >
                <Fingerprint className="w-4 h-4" />
                <span>{biometricVerified ? 'Biometric Identity Confirmed ✓' : 'Tap to Simulate Biometric Re-Auth'}</span>
              </button>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={onClose}
                className="w-1/2 py-2.5 px-4 rounded-xl bg-surface border border-surface-border text-xs font-medium text-slate-300 hover:bg-surface-border transition-colors"
              >
                Cancel Payment
              </button>
              <button
                disabled={countdown > 0 || !scamConfirmed || !biometricVerified}
                onClick={handleConfirmStepped}
                className="w-1/2 py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs tracking-wide transition-colors"
              >
                Authorize Payment
              </button>
            </div>
          </div>
        )}

        {/* Tier: WARN */}
        {tier === 'WARN' && !isCompleted && (
          <div className="space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-700/80 flex items-center justify-center mx-auto text-amber-400 shadow-glow-warn">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="text-center">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest bg-amber-950 text-amber-400 border border-amber-800 px-2.5 py-0.5 rounded-full">
                SECURITY ADVISORY
              </span>
              <h2 className="text-lg font-bold text-white mt-2">
                Caution: Review Recipient Details
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                This transaction has slight deviations from your regular spending pattern.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-surface-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient VPA:</span>
                <span className="font-mono text-cyan-300">{transactionInput.beneficiaryUpiId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient Bank Name:</span>
                <span className="font-semibold text-white">{beneficiaryProfile.registeredBankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-white">₹{transactionInput.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <label className="flex items-start space-x-2.5 p-3 rounded-lg bg-surface/60 border border-surface-border/60 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={warnAcknowledged}
                onChange={(e) => setWarnAcknowledged(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-0"
              />
              <span className="text-slate-300 leading-tight">
                I have confirmed the recipient\'s identity and authorize the transfer of ₹{transactionInput.amount.toLocaleString('en-IN')}.
              </span>
            </label>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={onClose}
                className="w-1/2 py-2.5 px-4 rounded-xl bg-surface border border-surface-border text-xs font-medium text-slate-300 hover:bg-surface-border transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!warnAcknowledged}
                onClick={handleConfirmStepped}
                className="w-1/2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs tracking-wide transition-colors"
              >
                Proceed with Caution
              </button>
            </div>
          </div>
        )}

        {/* Tier: ALLOW or Completed Step */}
        {(tier === 'ALLOW' || isCompleted) && (
          <div className="space-y-5 text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-700/80 flex items-center justify-center mx-auto text-emerald-400 shadow-glow-allow">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full">
                PRE-PAYMENT CLEARANCE GRANTED
              </span>
              <h2 className="text-xl font-bold text-white mt-2">
                Payment Authorized & Executed
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Zero security anomalies. Funds safely transferred via standard UPI rail.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-surface-border text-xs space-y-1.5 text-left">
              <div className="flex justify-between text-slate-400">
                <span>Amount Debited:</span>
                <span className="font-mono font-bold text-emerald-400">₹{transactionInput.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Credited To:</span>
                <span className="font-mono text-slate-200">{transactionInput.beneficiaryUpiId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Inspection Latency:</span>
                <span className="font-mono text-cyan-400">11.2 ms (Sub-execution)</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wide transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

