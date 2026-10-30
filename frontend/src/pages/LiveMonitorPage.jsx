import React, { useState, useEffect } from 'react';
import {
  Radio,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Filter,
  Eye,
  RefreshCw,
  Search,
  Lock
} from 'lucide-react';
import { fetchRecentTransactions } from '../services/api';

export default function LiveMonitorPage() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [filterTier, setFilterTier] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLive, setIsLive] = useState(true);

  const loadTransactions = async () => {
    const list = await fetchRecentTransactions(40);
    setTransactions(list);
    if (!selectedTx && list.length > 0) {
      setSelectedTx(list[0]);
    }
  };

  useEffect(() => {
    loadTransactions();
    let interval;
    if (isLive) {
      interval = setInterval(loadTransactions, 4000);
    }
    return () => clearInterval(interval);
  }, [isLive]);

  const filtered = transactions.filter((t) => {
    const matchesTier = filterTier === 'ALL' || t.decisionTier === filterTier;
    const matchesSearch =
      !searchQuery ||
      t.senderUpiId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.beneficiaryUpiId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.transactionId?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'BLOCK':
        return 'bg-red-950/80 text-red-400 border-red-700/60 shadow-glow-block';
      case 'VERIFY':
        return 'bg-orange-950/80 text-orange-400 border-orange-700/60 shadow-glow-verify';
      case 'WARN':
        return 'bg-amber-950/80 text-amber-400 border-amber-700/60 shadow-glow-warn';
      case 'ALLOW':
      default:
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60 shadow-glow-allow';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Page Title & Realtime Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Live Threat Stream & Transaction Radar
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed of UPI payments inspected by the pre-execution defense engine.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isLive
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                : 'bg-surface-card border-surface-border text-slate-400'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLive ? 'animate-pulse text-cyan-400' : ''}`} />
            <span>{isLive ? 'LIVE RADAR ACTIVE' : 'STREAM PAUSED'}</span>
          </button>

          <button
            onClick={loadTransactions}
            className="p-1.5 rounded-lg bg-surface-card border border-surface-border text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-xl bg-surface-card border border-surface-border flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Tier filter tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto text-xs">
          {['ALL', 'BLOCK', 'VERIFY', 'WARN', 'ALLOW'].map((tier) => (
            <button
              key={tier}
              onClick={() => setFilterTier(tier)}
              className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all ${
                filterTier === tier
                  ? 'bg-blue-600 text-white shadow-glow-cyan'
                  : 'bg-surface text-slate-400 hover:text-slate-200'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search VPA, ID, or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-surface-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Main Grid: Stream Feed vs Transaction Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Transaction Table / List (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-surface-card border border-surface-border overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-border flex justify-between items-center bg-surface/50">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Inspected Transactions ({filtered.length})
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Auto-updating every 4s
            </span>
          </div>

          <div className="divide-y divide-surface-border/60 max-h-[620px] overflow-y-auto">
            {filtered.map((tx) => (
              <div
                key={tx.transactionId}
                onClick={() => setSelectedTx(tx)}
                className={`p-3.5 hover:bg-surface cursor-pointer transition-colors flex items-center justify-between text-xs ${
                  selectedTx?.transactionId === tx.transactionId ? 'bg-surface/90 border-l-4 border-cyan-400' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[11px] text-slate-400">{tx.transactionId}</span>
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border font-bold ${getTierBadge(tx.decisionTier)}`}>
                      {tx.decisionTier} ({tx.riskScore})
                    </span>
                    {tx.screenSharingDetected && (
                      <span className="text-[9px] bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.5 rounded font-mono">
                        SCREEN-SHARE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-slate-200">
                    <span className="font-mono truncate max-w-[140px] text-slate-400">{tx.senderUpiId}</span>
                    <span className="text-slate-500">→</span>
                    <span className="font-mono font-medium truncate max-w-[160px] text-cyan-300">{tx.beneficiaryUpiId}</span>
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <div className="font-mono font-bold text-white text-sm">
                    ₹{tx.amount?.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs">
                No transactions match the selected filter.
              </div>
            )}
          </div>
        </div>

        {/* Selected Transaction Deep Inspection Drawer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedTx ? (
            <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-4">
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Pre-Execution Inspector
                  </span>
                  <h3 className="font-mono font-bold text-slate-100 text-sm">
                    {selectedTx.transactionId}
                  </h3>
                </div>
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border uppercase ${getTierBadge(selectedTx.decisionTier)}`}>
                  {selectedTx.decisionTier} ({selectedTx.riskScore}/100)
                </span>
              </div>

              {/* Status and Action banner */}
              <div className="p-3 rounded-xl bg-surface border border-surface-border text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pre-Payment Gate Status:</span>
                  <span className="font-mono font-bold text-white">{selectedTx.status || 'EVALUATED'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recipient Bank Name:</span>
                  <span className="font-semibold text-amber-300">{selectedTx.beneficiaryName || 'Direct Peer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount:</span>
                  <span className="font-mono font-bold text-white">₹{selectedTx.amount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location Origin:</span>
                  <span className="text-slate-300">{selectedTx.locationCity || 'Bengaluru'}</span>
                </div>
              </div>

              {/* Anomaly and Risk Factors */}
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-300 block mb-2 font-bold">
                  Flagged Threat Signatures
                </span>
                {selectedTx.anomalyFlags && selectedTx.anomalyFlags.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedTx.anomalyFlags.map((flag, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-surface/70 border border-surface-border/70 text-xs flex items-center space-x-2 text-slate-300"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span>{flag}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/50 text-xs text-emerald-400 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>No anomaly signatures detected. Clean baseline transaction.</span>
                  </div>
                )}
              </div>

              {/* Prevention Guarantee Note */}
              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-300/90 leading-relaxed">
                🛡️ <span className="font-semibold">Pay Rakshak Assurance:</span> Evaluation occurred before UPI PIN prompt. If classified as BLOCK, money remained safely in sender\'s bank account.
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 rounded-2xl bg-surface-card border border-surface-border text-xs">
              Select a transaction from the live stream to view deep inspection telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

