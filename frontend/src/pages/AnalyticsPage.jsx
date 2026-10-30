import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  TrendingUp,
  Zap,
  Activity,
  DollarSign,
  PieChart as PieIcon,
  BarChart2,
  Clock,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { fetchAnalyticsOverview } from '../services/api';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetchAnalyticsOverview();
      setData(res);
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-sm animate-pulse">
        Compiling multi-dimensional threat analytics & Isolation Forest metrics...
      </div>
    );
  }

  const { stats, hourlyData, threatVectors, tierDistribution } = data;

  const TIER_COLORS = {
    'ALLOW (Direct Pass)': '#10b981',
    'WARN (Caution Banner)': '#f59e0b',
    'VERIFY (Stepped MFA)': '#f97316',
    'BLOCK (Hard Intercept)': '#ef4444'
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Risk Analytics & Threat Intelligence
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Performance metrics, threat vector distribution, and economic fraud loss prevention telemetry.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Money Saved */}
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-mono uppercase font-semibold">Funds Protected</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ₹{(stats.moneySavedINR / 100000).toFixed(1)} Lakhs
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Prevented from leaving victim accounts before execution
          </div>
        </div>

        {/* Card 2: Interceptions */}
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-mono uppercase font-semibold">Threats Intercepted</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400">
            {stats.totalBlocked?.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Hard-blocked scams (phishing, remote access, collect trap)
          </div>
        </div>

        {/* Card 3: Stepped Verifications */}
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-mono uppercase font-semibold">Stepped Verifications</span>
            <Layers className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-orange-400">
            {stats.totalVerified?.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Passed cooling-off delay & biometric challenge
          </div>
        </div>

        {/* Card 4: Inspection Latency */}
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-mono uppercase font-semibold">Decision Latency</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {stats.avgLatencyMs} ms
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Sub-execution speed (faster than bank OTP generation)
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 24-Hour Threat Heatmap Chart (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-surface-card border border-surface-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-slate-200">
                24-Hour Hourly Threat Distribution (IST)
              </h3>
              <p className="text-xs text-slate-400">
                Notice sharp fraud spikes during nocturnal windows (01:00 AM - 04:00 AM)
              </p>
            </div>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
   
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorSuspicious" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="safe" name="Safe Transactions" stroke="#10b981" fillOpacity={1} fill="url(#colorSafe)" />
                <Area type="monotone" dataKey="suspicious" name="Stepped Verifications" stroke="#f59e0b" fillOpacity={1} fill="url(#colorSuspicious)" />
                <Area type="monotone" dataKey="blocked" name="Hard Intercepts (Fraud)" stroke="#ef4444" fillOpacity={1} fill="url(#colorBlocked)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tier Distribution Donut Chart (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-surface-card border border-surface-border space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-slate-200">
              Decision Tier Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Breakdown across ALLOW, WARN, VERIFY, and BLOCK
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {tierDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-surface-border text-xs">
            {tierDistribution.map((t, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-slate-300 font-medium text-[11px]">{t.name}</span>
                </span>
                <span className="font-mono text-slate-400">{t.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Threat Vector Breakdown Bars */}
      <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-4">
        <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-slate-200">
          Top UPI Fraud Vectors Intercepted (National Landscape)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {threatVectors.map((tv, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-surface border border-surface-border space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-200">{tv.name}</span>
                <span className="font-mono font-bold" style={{ color: tv.color }}>
                  {tv.share}% ({tv.count} hits)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${tv.share}%`, backgroundColor: tv.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

