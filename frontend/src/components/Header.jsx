import React from 'react';
import { ShieldCheck, Cpu, Zap, Lock, Terminal, Activity } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 shadow-xs">
      <div className="flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-600 p-0.5 flex items-center justify-center shadow-sm">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 font-extrabold text-base tracking-tighter">PR</span>
              </div>
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                PayRakshak
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  PAYMENT DNA DEFENSE
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium tracking-wide">
              Behavioral fingerprint intelligence before money moves.
            </p>
          </div>
        </div>

        {/* Real-time System Telemetry */}
        <div className="hidden lg:flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
            <Activity className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span className="text-slate-500">Pre-Routing Hook:</span>
            <span className="font-mono text-emerald-600 font-semibold">ACTIVE (11ms)</span>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-500">Engine:</span>
            <span className="font-mono text-slate-700 font-medium">7-Domain + Isolation Forest</span>
          </div>

          <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-emerald-700 font-medium font-mono text-[11px]">UPI-ALIGNED PROTOTYPE</span>
          </div>
        </div>
      </div>
    </header>
  );
}

