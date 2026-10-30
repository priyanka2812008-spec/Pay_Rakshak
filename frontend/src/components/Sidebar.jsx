import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldAlert,
  Radio,
  BarChart3,
  Sliders,
  AlertTriangle,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  Clock
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    {
      to: '/',
      label: 'Pre-Payment Inspector',
      sublabel: 'Interactive Risk Simulator',
      icon: ShieldAlert,
      badge: 'CORE'
    },
    {
      to: '/delayed-release',
      label: 'Safe Delay Vault',
      sublabel: 'Anti-Urgency Scam Shield',
      icon: Clock,
      badge: 'NEW'
    },
    {
      to: '/monitor',
      label: 'Live Threat Stream',
      sublabel: 'Real-time Payment Radar',
      icon: Radio,
      pulse: true
    },
    {
      to: '/analytics',
      label: 'Risk Analytics',
      sublabel: 'Anomaly Charts & Heatmaps',
      icon: BarChart3
    },
    {
      to: '/rules',
      label: 'Decision Policies',
      sublabel: 'Dynamic Thresholds & Weights',
      icon: Sliders
    },
    {
      to: '/threats',
      label: 'UPI Threat Taxonomy',
      sublabel: 'Phishing & Scam Vectors',
      icon: AlertTriangle
    },
    {
      to: '/api-docs',
      label: 'Fintech API & SDK',
      sublabel: 'Integration Playground',
      icon: Code2
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between p-4 shrink-0 shadow-xs">
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-3 mb-2">
            Intelligence Command
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                      {item.pulse && (
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="leading-tight">{item.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{item.sublabel}</div>
                    </div>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono uppercase bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-bold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Value Proposition Box */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center space-x-2 text-blue-700 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pre-Execution Protection</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Unlike post-facto fraud alerts, Pay Rakshak evaluates context <span className="text-slate-900 font-semibold">before</span> UPI PIN entry, preventing irreversible bank debits.
          </p>
        </div>
      </div>

      {/* System Architecture Metadata */}
      <div className="pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-1.5">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-blue-600" />
            <span>ML Isolation Forest</span>
          </span>
          <span className="text-emerald-600 font-semibold">Trained</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-slate-500" />
            <span>Decision Pipeline</span>
          </span>
          <span className="text-slate-700 font-medium">4 Tiers</span>
        </div>
      </div>
    </aside>
  );
}

