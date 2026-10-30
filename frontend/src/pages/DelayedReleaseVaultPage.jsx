import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  MessageSquare,
  Smartphone,
  Play,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { fetchDelayedHolds, cancelDelayedHold, releaseDelayedHold } from '../services/api';
import AntiUrgencyModal from '../components/AntiUrgencyModal';

export default function DelayedReleaseVaultPage() {
  const [holds, setHolds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Time ticker state to update countdowns every second
  const [currentTime, setCurrentTime] = useState(Date.now());

  const loadHolds = async () => {
    const list = await fetchDelayedHolds();
    setHolds(list);
    setLoading(false);
  };

  useEffect(() => {
    loadHolds();
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCancelHold = async (holdId) => {
    try {
      const res = await cancelDelayedHold(holdId);
      setActionMessage({
        type: 'cancel',
        text: `Payment ${holdId} cancelled! 100% of funds refunded to sender bank account.`
      });
      loadHolds();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReleaseHold = async (holdId) => {
    try {
      const res = await releaseDelayedHold(holdId);
      setActionMessage({
        type: 'release',
        text: `Payment ${holdId} verified with biometric authorization and released to recipient.`
      });
      loadHolds();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to format remaining time
  const formatRemainingTime = (releaseAtStr) => {
    const remainingMs = new Date(releaseAtStr).getTime() - currentTime;
    if (remainingMs <= 0) return '00:00:00 (Ready for release)';

    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Title & Top Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Safe Delay Vault & Anti-Urgency Shield
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-0.5 rounded-full">
                CHARLIE MODEL
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Replaces instant irreversible transfers with an automatic 4-hour cooling delay for new payees, allowing victims to cancel if scammed.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-glow-cyan"
        >
          <Play className="w-4 h-4" />
          <span>Launch Interactive Mobile Demo</span>
        </button>
      </div>

      {/* Action Notification Alert Banner */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center space-x-2 animate-fade-in ${
            actionMessage.type === 'cancel'
              ? 'bg-red-950/80 border border-red-700 text-red-200'
              : 'bg-emerald-950/80 border border-emerald-700 text-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Visual Feature Spotlight (Charlie FraudShield Screens Comparison) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-surface-card via-surface to-[#0e172a] border border-surface-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
              Core Anti-Scam Architecture
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">
              How the 4-Hour Time Lock Disarms Psychological Pressure
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">NPCI Escrow Pattern</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar 1 */}
          <div className="p-4 rounded-xl bg-surface/80 border border-surface-border space-y-2">
            <div className="w-8 h-8 rounded-lg bg-red-950 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-200">1. False Urgency Interception</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When a payment is initiated to a brand-new payee, Pay Rakshak displays the "Stay Safe from Scams" screen reminding the user that fraudsters use panic tactics.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-4 rounded-xl bg-surface/80 border border-surface-border space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-200">2. 4-Hour Cooling-Off Escrow</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Money is not immediately routed to the recipient. Instead, it enters a temporary holding state while simulated SMS and app notifications are delivered.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-4 rounded-xl bg-surface/80 border border-surface-border space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-200">3. 1-Tap Cancellation Guarantee</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Once the phone call ends or the victim regains awareness, they tap "Cancel Payment" inside the 4-hour window and receive 100% immediate refund.
            </p>
          </div>
        </div>
      </div>

      {/* Active Scheduled Holds Table */}
      <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
              Active Delayed Releases ({holds.filter((h) => h.status === 'ACTIVE_COOLING_OFF').length} Held)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Live 1-second countdowns</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {holds.map((hold) => {
            const isActive = hold.status === 'ACTIVE_COOLING_OFF';
            const isCancelled = hold.status === 'CANCELLED_BY_USER';
            const isReleased = hold.status === 'RELEASED';

            return (
              <div
                key={hold.holdId}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isActive
                    ? 'bg-surface/90 border-blue-900/60 shadow-lg'
                    : isCancelled
                    ? 'bg-red-950/20 border-red-900/40 opacity-70'
                    : 'bg-emerald-950/20 border-emerald-900/40 opacity-70'
                }`}
              >
                {/* Hold Header */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-400">{hold.holdId}</span>
                  <span
                    className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${
                      isActive
                        ? 'bg-blue-950 text-blue-300 border-blue-800 animate-pulse'
                        : isCancelled
                        ? 'bg-red-950 text-red-400 border-red-800'
                        : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    }`}
                  >
                    {isActive ? 'HOLD ACTIVE' : isCancelled ? 'CANCELLED / REFUNDED' : 'RELEASED'}
                  </span>
                </div>

                {/* Recipient and Amount */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{hold.beneficiaryName}</h4>
                    <span className="text-xs font-mono text-cyan-300">{hold.beneficiaryUpiId}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold font-mono text-white">
                      ₹{hold.amount?.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">from {hold.senderUpiId.split('@')[0]}</span>
                  </div>
                </div>

                {/* Countdown Timer or Final Status */}
                <div className="p-3 rounded-lg bg-[#070b14] border border-surface-border flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-slate-400">Release Window:</span>
                  </div>
                  <div className="font-mono font-bold text-xs text-cyan-400">
                    {isActive ? formatRemainingTime(hold.releaseAt) : isCancelled ? '00:00:00 (Refunded)' : 'Settled'}
                  </div>
                </div>

                {/* Reason note */}
                <p className="text-[11px] text-slate-400 leading-tight">
                  <strong className="text-slate-300">Reason:</strong> {hold.reason}
                </p>

                {/* Actions */}
                {isActive && (
                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={() => handleCancelHold(hold.holdId)}
                      className="w-1/2 py-2 px-3 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-300 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Cancel & Refund</span>
                    </button>

                    <button
                      onClick={() => handleReleaseHold(hold.holdId)}
                      className="w-1/2 py-2 px-3 rounded-lg bg-surface border border-surface-border hover:bg-surface-border text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Release Early</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Anti-Urgency Modal */}
      <AntiUrgencyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        paymentDetails={{
          amount: 20500,
          beneficiaryName: 'Jane Cooper',
          beneficiaryUpiId: 'jane.freelance@okaxis',
          delayHours: 4
        }}
        onConfirmSchedule={() => {
          loadHolds();
        }}
        onCancelPayment={() => {
          loadHolds();
        }}
      />
    </div>
  );
}

