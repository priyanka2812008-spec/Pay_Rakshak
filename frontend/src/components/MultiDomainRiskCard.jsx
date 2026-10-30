import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  CreditCard,
  Activity,
  Clock,
  Zap,
  Share2,
  Crosshair,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

const DOMAIN_ICONS = {
  beneficiary: UserCheck,
  transaction: CreditCard,
  behavioural: Activity,
  temporal: Clock,
  velocity: Zap,
  network: Share2,
  intent: Crosshair
};

function getScoreColor(score) {
  if (score >= 80) return { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', bar: 'bg-red-500' };
  if (score >= 60) return { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', bar: 'bg-orange-500' };
  if (score >= 30) return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-500' };
  return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500' };
}

export default function MultiDomainRiskCard({ evaluation }) {
  const [expandedDomain, setExpandedDomain] = useState(null);

  if (!evaluation) return null;

  const domains = evaluation.domains || [];
  const topContributors = evaluation.topContributors || [];
  const finalRisk = evaluation.finalRisk ?? evaluation.riskAssessment?.compositeScore ?? 0;
  const decision = evaluation.decision || evaluation.riskAssessment?.decisionTier || 'ALLOW';
  const reason = evaluation.reason || evaluation.explainability?.summary || '';

  const toggleDomain = (id) => {
    setExpandedDomain(prev => prev === id ? null : id);
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm text-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
            <Crosshair className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-900 uppercase">
              7-Domain Payment Risk Profile
            </h3>
            <p className="text-[10px] text-slate-500">
              Multi-Domain Pre-Payment Fraud Intelligence Engine (v3)
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-500 block">AGGREGATE SCORE</span>
          <span className={`text-sm font-mono font-extrabold ${getScoreColor(finalRisk).text}`}>
            {finalRisk}/100
          </span>
        </div>
      </div>

      {/* Rationale & Decision Banner */}
      <div className={`p-3.5 rounded-xl border ${
        decision === 'BLOCK / HOLD' || decision === 'BLOCK'
          ? 'bg-red-50 border-red-200 text-red-900'
          : decision === 'VERIFY'
          ? 'bg-orange-50 border-orange-200 text-orange-900'
          : decision === 'WARN'
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-start space-x-2.5">
          {decision === 'BLOCK / HOLD' || decision === 'BLOCK' ? (
            <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          ) : decision === 'VERIFY' ? (
            <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          ) : decision === 'WARN' ? (
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                decision === 'BLOCK / HOLD' || decision === 'BLOCK'
                  ? 'text-red-800'
                  : decision === 'VERIFY'
                  ? 'text-orange-800'
                  : decision === 'WARN'
                  ? 'text-amber-800'
                  : 'text-emerald-800'
              }`}>
                DECISION: {decision}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                (Band: {
                  finalRisk >= 80 ? '80–100 BLOCK' :
                  finalRisk >= 60 ? '60–79 VERIFY' :
                  finalRisk >= 30 ? '30–59 WARN' : '0–29 ALLOW'
                })
              </span>
            </div>
            <p className="text-xs leading-relaxed font-sans text-slate-700">
              {reason}
            </p>
          </div>
        </div>
      </div>

      {/* Top 3 Contributing Risk Drivers */}
      {topContributors.length > 0 && finalRisk >= 25 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            <span>Primary Risk Drivers (Top 3 Domains)</span>
            <span className="text-blue-600 font-semibold">Why this score was given</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {topContributors.slice(0, 3).map((driver, idx) => {
              const colors = getScoreColor(driver.score);
              const Icon = DOMAIN_ICONS[driver.id] || ShieldAlert;
              return (
                <div
                  key={driver.id || idx}
                  className={`p-2.5 rounded-xl border ${colors.bg} ${colors.border} flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                        <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
                        <span className="truncate">{driver.name.replace(' Risk', '')}</span>
                      </div>
                      <span className={`text-[10px] font-mono font-extrabold ${colors.text}`}>
                        {driver.score}/100
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 line-clamp-2 leading-tight">
                      {driver.explanation}
                    </p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-200/80 flex justify-between text-[9px] font-mono text-slate-500">
                    <span>Impact Weight</span>
                    <span className="font-bold text-slate-800">+{driver.contribution} pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7 Horizontal Domain Risk Bars */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 uppercase tracking-wider">
          <span>Domain Breakdown (Weighted Total)</span>
          <span>Click domain to inspect signals</span>
        </div>

        <div className="space-y-1.5">
          {domains.map((dom) => {
            const colors = getScoreColor(dom.score);
            const Icon = DOMAIN_ICONS[dom.id] || Activity;
            const isExpanded = expandedDomain === dom.id;

            return (
              <div
                key={dom.id}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all hover:border-slate-300 shadow-xs"
              >
                {/* Domain Bar Header */}
                <button
                  type="button"
                  onClick={() => toggleDomain(dom.id)}
                  className="w-full p-2.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`p-1 rounded-md ${colors.bg} ${colors.border} border`}>
                      <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {dom.name}
                        </span>
                        {dom.id === 'intent' && (
                          <span className="text-[9px] font-mono bg-purple-50 text-purple-700 border border-purple-200 px-1 py-0.2 rounded font-bold">
                            ⭐ SIGNATURE
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-500">
                          {dom.weightStr} wt
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 ml-2">
                    <div className="text-right">
                      <div className="flex items-center space-x-1.5 justify-end">
                        <span className={`text-xs font-mono font-bold ${colors.text}`}>
                          {dom.score}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">/100</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 block">
                        +{dom.contribution} pts
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Progress bar visual */}
                <div className="h-1.5 bg-slate-100 w-full overflow-hidden">
                  <div
                    className={`h-full ${colors.bar} transition-all duration-500`}
                    style={{ width: `${Math.max(4, Math.min(100, dom.score))}%` }}
                  />
                </div>

                {/* Expanded Signal Details */}
                {isExpanded && (
                  <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs space-y-2 animate-fade-in">
                    <div className="text-[11px] font-medium text-slate-700">
                      {dom.explanation}
                    </div>
                    {dom.signals && dom.signals.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-mono uppercase text-slate-500 block">
                          Evaluated Context &amp; Signals:
                        </span>
                        {dom.signals.map((sig, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-start space-x-2 text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200 shadow-xs"
                          >
                            <span className="text-blue-600 font-mono mt-0.5">•</span>
                            <span>{sig}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

