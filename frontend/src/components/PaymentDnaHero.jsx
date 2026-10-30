import React from 'react';
import { ShieldCheck, AlertTriangle, Check, ArrowRight, Zap, Clock, Users, DollarSign, Activity } from 'lucide-react';

export default function PaymentDnaHero({
  amount,
  beneficiaryUpiId,
  beneficiaryName,
  senderName = 'Priya',
  senderBaseline = { avg: 1850, std: 950 },
  riskScore = 0,
  decisionTier = 'ALLOW',
  transactionHour = 14,
  velocityLast1Hour = 1,
  isKnownBeneficiary = false,
  isVerifiedMerchant = false,
  onVerifyRecipient,
  onHoldPayment
}) {
  const isAnomalous = riskScore >= 50;
  const isCritical = riskScore >= 80;
  const isModerate = riskScore >= 30 && riskScore < 50;

  // Amount ratio
  const avg = senderBaseline.avg || 1850;
  const amountNum = Number(amount) || 0;
  const amountRatio = amountNum / avg;
  const isAmountAnomalous = amountRatio > 2.5;

  // Time anomaly (1am - 5am)
  const isTimeAnomalous = transactionHour >= 1 && transactionHour <= 5;

  // Recipient anomaly
  const isRecipientAnomalous = !isKnownBeneficiary && !isVerifiedMerchant;

  // Velocity anomaly
  const isVelocityAnomalous = velocityLast1Hour >= 3;

  // Determine display name
  const displayName = beneficiaryName || (beneficiaryUpiId ? beneficiaryUpiId.split('@')[0] : 'Rahul Sharma');

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#090d13] border border-[#1b2533] p-6 lg:p-8 shadow-2xl text-slate-100">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      {isAnomalous && (
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-red-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      )}

      {/* Top Bar: Brand & Mode */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800/60 relative z-10">
        <div className="flex items-center space-x-3">
          {/* Hexagonal Shield Logo matching reference */}
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 via-teal-500 to-amber-500 p-0.5 flex items-center justify-center shadow-lg">
            <div className="w-full h-full bg-[#090d13] rounded-[6px] flex items-center justify-center">
              <span className="text-emerald-400 font-extrabold text-sm tracking-tighter">PR</span>
            </div>
          </div>
          <span className="text-base font-bold tracking-tight text-white font-sans">
            PayRakshak
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            AI BIOMETRIC PAYMENT DNA ACTIVE
          </span>
        </div>
      </div>

      {/* Hero Title & Subtitle */}
      <div className="pt-6 pb-4 relative z-10">
        <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-sans uppercase">
          PAYMENT DNA
        </h2>
        <p className="text-xs lg:text-sm text-slate-400 font-medium mt-1">
          Every payment has a unique behavioral fingerprint.
        </p>
      </div>

      {/* Central Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10 pt-2">
        {/* Left Card: Transaction Voucher Card (Cream/Ivory pill matching reference photo) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#FAF7EE] text-[#131b26] rounded-2xl p-5 shadow-2xl border border-[#ede5d0] transition-all hover:scale-[1.02] duration-300">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
              Outgoing UPI Intent
            </span>
            <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#065f46]">
              Pay ₹{amountNum.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-700 font-medium mt-1 flex items-center gap-1">
              <span>to</span>
              <span className="font-bold text-slate-900 truncate">{displayName}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
              {beneficiaryUpiId || 'rahul.sharma@okaxis'}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-300/70 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Sender Baseline:</span>
              <span className="font-mono font-bold text-slate-800">Avg ₹{avg.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Quick status badge pill at bottom-left */}
          <div className="p-3 rounded-xl bg-[#0f1724] border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isAnomalous ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className="text-[11px] text-slate-300 font-medium">
                {isAnomalous ? 'Anomalous Vector Flagged' : 'Normal Habits Matched'}
              </span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              decisionTier === 'BLOCK' ? 'bg-red-950 text-red-400 border border-red-800' :
              decisionTier === 'VERIFY' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
              decisionTier === 'WARN' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
              'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}>
              {decisionTier}
            </span>
          </div>
        </div>

        {/* Center: The Glowing Futuristic Biometric Fingerprint (Payment DNA) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative py-4">
          <div className="relative w-64 h-80 lg:w-72 lg:h-96 flex items-center justify-center">
            {/* SVG Biometric Fingerprint Graphic */}
            <svg
              viewBox="0 0 240 320"
              className="w-full h-full drop-shadow-[0_0_35px_rgba(6,182,212,0.35)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Glow Filter */}
                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="red-core-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {/* Radial glow background inside fingerprint */}
                <radialGradient id="fingerprint-core" cx="50%" cy="45%" r="40%">
                  <stop offset="0%" stopColor={isAnomalous ? '#ef4444' : '#06b6d4'} stopOpacity={isAnomalous ? "0.35" : "0.15"} />
                  <stop offset="100%" stopColor="#090d13" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Core Ambient Glow */}
              <circle cx="120" cy="140" r="70" fill="url(#fingerprint-core)" />

              {/* Fingerprint Ridge Loops: Outer Normal Ridges (Emerald / Cyan) */}
              <g stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" filter="url(#neon-glow)">
                {/* Outermost loop */}
                <path d="M 50 240 C 40 200, 35 150, 55 100 C 75 50, 165 50, 185 100 C 205 150, 200 200, 190 240" />
                <path d="M 60 250 C 50 200, 48 155, 66 112 C 82 72, 158 72, 174 112 C 192 155, 190 200, 180 250" stroke="#06b6d4" />
                <path d="M 72 260 C 62 210, 60 165, 78 126 C 92 92, 148 92, 162 126 C 180 165, 178 210, 168 260" stroke="#14b8a6" />
                <path d="M 82 268 C 74 220, 72 178, 88 142 C 100 114, 140 114, 152 142 C 168 178, 166 220, 158 268" />
              </g>

              {/* Center Fingerprint Anomaly Core: Switches to Neon Fiery Red when Anomalous */}
              <g
                stroke={isAnomalous ? '#f43f5e' : '#10b981'}
                strokeWidth={isAnomalous ? "3" : "2.5"}
                strokeLinecap="round"
                opacity={isAnomalous ? "0.95" : "0.75"}
                filter={isAnomalous ? "url(#red-core-glow)" : "url(#neon-glow)"}
              >
                {/* Mid whorls */}
                <path d="M 94 275 C 88 230, 85 190, 98 158 C 108 132, 132 132, 142 158 C 155 190, 152 230, 146 275" />
                <path d="M 104 280 C 100 240, 98 205, 108 175 C 114 152, 126 152, 132 175 C 142 205, 140 240, 136 280" />
                {/* Innermost loop whorl */}
                <path d="M 114 285 C 112 250, 110 220, 116 195 C 118 180, 122 180, 124 195 C 130 220, 128 250, 126 285" />
                <path d="M 120 225 L 120 290" />
              </g>

              {/* Glowing Anomaly Vectors / Directional Filaments shooting from Red Center */}
              {isAnomalous ? (
                <g filter="url(#red-core-glow)">
                  {/* Top-right anomaly tracer arc pointing to "Your usual pattern" */}
                  <path
                    d="M 130 145 C 160 120, 180 130, 220 85"
                    stroke="#f43f5e"
                    strokeWidth="2.5"
                    strokeDasharray="4 3"
                    className="animate-pulse"
                  />
                  <circle cx="220" cy="85" r="4" fill="#f43f5e" />
                  <path d="M 215 80 L 225 85 L 217 92" stroke="#f43f5e" strokeWidth="2" fill="none" />

                  {/* Mid-right tracer arc */}
                  <path
                    d="M 135 180 C 165 175, 185 200, 225 180"
                    stroke="#fb923c"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                  />
                  <circle cx="225" cy="180" r="3.5" fill="#fb923c" />

                  {/* Bottom-right tracer line pointing towards Actions */}
                  <path
                    d="M 130 220 C 150 230, 175 250, 215 260"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                  <circle cx="215" cy="260" r="4" fill="#f59e0b" />
                  <path d="M 207 257 L 217 261 L 211 268" stroke="#f59e0b" strokeWidth="2" fill="none" />

                  {/* Anomaly hot-spot marker dots */}
                  <circle cx="125" cy="150" r="4.5" fill="#ef4444" className="animate-ping" />
                  <circle cx="125" cy="150" r="3" fill="#ffffff" />
                  <circle cx="112" cy="185" r="3" fill="#f43f5e" />
                  <circle cx="138" cy="195" r="3" fill="#f43f5e" />
                </g>
              ) : (
                /* Safe state: Harmonious emerald particle flow */
                <g filter="url(#neon-glow)">
                  <circle cx="120" cy="140" r="4" fill="#10b981" className="animate-pulse" />
                  <circle cx="100" cy="170" r="2.5" fill="#06b6d4" />
                  <circle cx="140" cy="170" r="2.5" fill="#06b6d4" />
                </g>
              )}
            </svg>

            {/* Handwritten-style Callout arrow matching photo: "Action" */}
            {isAnomalous && (
              <div className="absolute bottom-2 right-2 flex items-center space-x-1 text-[11px] font-mono text-amber-300 font-bold tracking-wider animate-bounce">
                <span>⚡ Action Required</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: "Your Usual Pattern" & "Before you send it" */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: "Your usual pattern" Waveform Panel */}
          <div className="p-4 rounded-2xl bg-[#111722] border border-[#1e293b] shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="text-xs font-bold font-sans text-slate-200">
                Your usual pattern
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                30-day DNA
              </span>
            </div>

            {/* 4 Waveform visual rows matching reference image */}
            <div className="space-y-2 text-xs">
              {/* Amount Waveform */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 w-20">Amount</span>
                <div className="flex-1 px-2">
                  <svg className="w-full h-6" viewBox="0 0 140 24" fill="none">
                    <path
                      d={isAmountAnomalous
                        ? "M 0 12 Q 25 2, 50 18 T 100 0 T 140 22"
                        : "M 0 12 Q 20 6, 40 12 T 80 12 T 120 12 T 140 12"}
                      stroke={isAmountAnomalous ? "#f43f5e" : "#10b981"}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className={`text-[10px] font-mono font-bold ${isAmountAnomalous ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isAmountAnomalous ? `${amountRatio.toFixed(1)}x avg` : 'Normal'}
                </span>
              </div>

              {/* Time Waveform */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 w-20">Time</span>
                <div className="flex-1 px-2">
                  <svg className="w-full h-6" viewBox="0 0 140 24" fill="none">
                    <path
                      d={isTimeAnomalous
                        ? "M 0 12 Q 35 22, 70 2 T 140 20"
                        : "M 0 12 Q 25 8, 50 14 T 100 10 T 140 12"}
                      stroke={isTimeAnomalous ? "#f97316" : "#06b6d4"}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className={`text-[10px] font-mono font-bold ${isTimeAnomalous ? 'text-orange-400' : 'text-cyan-400'}`}>
                  {transactionHour}:00 IST
                </span>
              </div>

              {/* Recipient Waveform */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 w-20">Recipient</span>
                <div className="flex-1 px-2">
                  <svg className="w-full h-6" viewBox="0 0 140 24" fill="none">
                    <path
                      d={isRecipientAnomalous
                        ? "M 0 12 Q 30 20, 60 4 T 110 22 T 140 8"
                        : "M 0 12 Q 35 8, 70 12 T 140 12"}
                      stroke={isRecipientAnomalous ? "#fbbf24" : "#10b981"}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className={`text-[10px] font-mono font-bold ${isRecipientAnomalous ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {isKnownBeneficiary ? 'Known' : 'First-time'}
                </span>
              </div>

              {/* Frequency Waveform */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 w-20">Frequency</span>
                <div className="flex-1 px-2">
                  <svg className="w-full h-6" viewBox="0 0 140 24" fill="none">
                    <path
                      d={isVelocityAnomalous
                        ? "M 0 12 Q 10 2, 20 22 T 40 2 T 60 22 T 80 2 T 100 22 T 120 2 T 140 12"
                        : "M 0 12 Q 35 10, 70 14 T 140 12"}
                      stroke={isVelocityAnomalous ? "#ef4444" : "#14b8a6"}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className={`text-[10px] font-mono font-bold ${isVelocityAnomalous ? 'text-red-400' : 'text-emerald-400'}`}>
                  {velocityLast1Hour} / hr
                </span>
              </div>
            </div>

            {/* Bottom Verdict Line matching reference photo */}
            <div className="pt-2 border-t border-slate-800/80">
              <p className={`text-xs font-semibold ${
                isAnomalous ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {isAnomalous
                  ? "This payment doesn't look like you."
                  : "This payment matches your normal DNA."}
              </p>
            </div>
          </div>

          {/* Card 2: "Before you send it" Action Buttons Container matching reference photo */}
          <div className="p-4 rounded-2xl bg-[#0c1a16] border border-[#1b3a2f] shadow-xl space-y-2.5">
            <span className="text-xs font-bold text-emerald-300 block">
              Before you send it
            </span>

            {/* Action 1: Verify Recipient Button (Cream/Ivory Pill button matching photo) */}
            <button
              type="button"
              onClick={onVerifyRecipient}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FAF7EE] text-[#111827] hover:bg-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4 text-teal-600 stroke-[3]" />
              <span>Verify recipient</span>
            </button>

            {/* Action 2: Hold Payment Button (Sunset / Aurora Gradient Button matching photo) */}
            <button
              type="button"
              onClick={onHoldPayment}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 via-amber-500 to-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg hover:brightness-110 transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4 text-white stroke-[3]" />
              <span>Hold payment (4-Hr Shield)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

