import React, { useState } from 'react';
import { ShieldCheck, AlertOctagon, AlertTriangle, Info, TrendingDown, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

export default function ExplainabilityCard({ explainability, scoresBreakdown }) {
  const [showAll, setShowAll] = useState(false);

  if (!explainability) {
    return (
      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-center text-slate-500 text-sm">
        Awaiting transaction parameters to analyze factors...
      </div>
    );
  }

  const {
    summary,
    factors = [],
    riskSignals = [],
    trustSignals = [],
    riskTotal = 0,
    trustTotal = 0,
    compositeScore,
    decisionTier
  } = explainability;

  // Separate risk and trust factors from combined factors array
  const riskFactors = factors.filter(f => f.isRisk !== false && f.severity !== 'SAFE');
  const trustFactors = factors.filter(f => f.isRisk === false || f.severity === 'SAFE');

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':     return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MEDIUM':   return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW':      return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SAFE':
      default:         return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'CRITICAL': return <AlertOctagon className="w-3.5 h-3.5 text-red-600 shrink-0" />;
      case 'HIGH':
      case 'MEDIUM':   return <AlertTriangle className="w-3.5 h-3.5 text-orange-600 shrink-0" />;
      case 'SAFE':     return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      default:         return <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
    }
  };

  const tierColor = decisionTier === 'BLOCK' ? 'text-red-600' : decisionTier === 'VERIFY' ? 'text-orange-600' : decisionTier === 'WARN' ? 'text-amber-600' : 'text-emerald-600';

  return (
    <div className="space-y-4">

      {/* ── Executive Summary ── */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-900">
        <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Decision Reason &amp; Executive Summary</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>

        {/* Score breakdown pills */}
        {scoresBreakdown && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-mono">RISK SIGNALS</span>
              <span className="font-mono font-bold text-red-600">+{scoresBreakdown.heuristicPenalty ?? riskTotal} pts</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-mono">TRUST BONUS</span>
              <span className="font-mono font-bold text-emerald-600">−{scoresBreakdown.trustBonus ?? trustTotal} pts</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-mono">AMOUNT Z-SCORE</span>
              <span className={`font-mono font-bold ${(scoresBreakdown.amountZScore ?? 0) > 2 ? 'text-red-600' : 'text-blue-600'}`}>
                {(scoresBreakdown.amountZScore ?? 0) > 0 ? `+${scoresBreakdown.amountZScore}` : scoresBreakdown.amountZScore}σ
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-mono">VPA RISK</span>
              <span className="font-mono font-bold text-slate-800">{scoresBreakdown.vpaRiskScore ?? 0}/100</span>
            </div>
          </div>
        )}
      </div>

      {/* ── RISK EVIDENCE ── */}
      {riskFactors.length > 0 && (
        <div className="p-5 rounded-2xl bg-red-50/20 border border-red-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-red-600" />
              <span className="text-xs font-mono uppercase tracking-wider text-red-800 font-bold">
                Risk Evidence
              </span>
              <span className="text-[9px] bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-mono font-semibold">
                {riskFactors.length} signals
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-red-600">+{riskTotal} pts total</span>
          </div>

          <div className="space-y-2">
            {(showAll ? riskFactors : riskFactors.slice(0, 4)).map((f, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white border border-red-100 shadow-xs hover:border-red-200 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0">
                    {getSeverityIcon(f.severity)}
                    <span className="text-xs text-slate-800 font-medium truncate">{f.title}</span>
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border font-mono shrink-0 ${getSeverityBadge(f.severity)}`}>
                      {f.severity}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-red-600 shrink-0 ml-2">{f.impact}</span>
                </div>
                {f.recommendation && (
                  <div className="mt-1.5 pl-5 text-[10px] text-slate-600 flex items-start gap-1">
                    <span className="font-mono text-amber-700 font-bold uppercase tracking-wide shrink-0">RECOMMENDATION:</span>
                    <span>{f.recommendation}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TRUST EVIDENCE ── */}
      {trustFactors.length > 0 && (
        <div className="p-5 rounded-2xl bg-emerald-50/20 border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-800 font-bold">
                Trust Evidence
              </span>
              <span className="text-[9px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-mono font-semibold">
                {trustFactors.length} signals
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600">−{trustTotal} pts total</span>
          </div>

          <div className="space-y-1.5">
            {(showAll ? trustFactors : trustFactors.slice(0, 5)).map((f, idx) => (
              <div key={idx} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white border border-emerald-100 shadow-xs">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-xs text-slate-700 font-medium">{f.title}</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 shrink-0 ml-2">{f.impact}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show more toggle */}
      {(riskFactors.length > 4 || trustFactors.length > 5) && (
        <button
          onClick={() => setShowAll(v => !v)}
          className="w-full py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 font-mono shadow-xs"
        >
          {showAll ? <><ChevronUp className="w-3.5 h-3.5" />Show Less</> : <><ChevronDown className="w-3.5 h-3.5" />Show All Signals ({factors.length})</>}
        </button>
      )}

      {/* ── Final Decision Summary (for safe transactions) ── */}
      {decisionTier === 'ALLOW' && trustFactors.length > 0 && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <div className="text-xs font-bold text-emerald-800 font-mono uppercase tracking-wide">
              DECISION: ALLOW — Risk Score {compositeScore}/100
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Trust signals outweigh risk factors. Transaction is within safe operational parameters.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
