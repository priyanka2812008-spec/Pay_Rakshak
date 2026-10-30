import React, { useState, useEffect } from 'react';
import { Sliders, ShieldCheck, ToggleLeft, ToggleRight, Check, Save } from 'lucide-react';
import { fetchRules, updateRule } from '../services/api';

export default function RulesEnginePage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(null);

  useEffect(() => {
    async function load() {
      const r = await fetchRules();
      setRules(r);
      setLoading(false);
    }
    load();
  }, []);

  const handleToggle = async (rule) => {
    setSavingId(rule.ruleId);
    try {
      const updated = await updateRule(rule.ruleId, { enabled: !rule.enabled });
      setRules((prev) => prev.map((r) => (r.ruleId === rule.ruleId ? updated : r)));
      setSavedSuccess(rule.ruleId);
      setTimeout(() => setSavedSuccess(null), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const handleWeightChange = async (rule, newWeight) => {
    setSavingId(rule.ruleId);
    try {
      const updated = await updateRule(rule.ruleId, { weight: Number(newWeight) });
      setRules((prev) => prev.map((r) => (r.ruleId === rule.ruleId ? updated : r)));
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Decision Policies & Dynamic Rules Engine
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure risk weights, strictness thresholds, and automated actions. Changes immediately impact subsequent pre-payment risk evaluations.
        </p>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.ruleId}
            className={`p-5 rounded-2xl bg-surface-card border transition-all ${
              rule.enabled ? 'border-surface-border' : 'border-surface-border/40 opacity-70'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[11px] text-cyan-400 font-bold">
                    {rule.ruleId}
                  </span>
                  <span
                    className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded border font-bold ${
                      rule.action === 'BLOCK'
                        ? 'bg-red-950/80 text-red-400 border-red-800'
                        : rule.action === 'VERIFY'
                        ? 'bg-orange-950/80 text-orange-400 border-orange-800'
                        : 'bg-amber-950/80 text-amber-400 border-amber-800'
                    }`}
                  >
                    Action: {rule.action}
                  </span>
                  {savedSuccess === rule.ruleId && (
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <Check className="w-3 h-3" /> Updated
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-white">{rule.name}</h3>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  {rule.description}
                </p>
              </div>

              {/* Weight Slider & Enable Toggle */}
              <div className="flex items-center space-x-6 shrink-0">
                <div className="text-right space-y-1">
                  <div className="text-xs font-semibold text-slate-300">
                    Penalty Weight: <span className="font-mono text-cyan-400">+{rule.weight} pts</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={rule.weight}
                    disabled={!rule.enabled}
                    onChange={(e) => handleWeightChange(rule, e.target.value)}
                    className="w-28 accent-cyan-500 cursor-pointer disabled:opacity-40"
                  />
                </div>

                <button
                  onClick={() => handleToggle(rule)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    rule.enabled
                      ? 'bg-cyan-950/80 border-cyan-600 text-cyan-300 shadow-glow-cyan'
                      : 'bg-surface border-surface-border text-slate-500'
                  }`}
                >
                  <span>{rule.enabled ? 'ACTIVE' : 'DISABLED'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

