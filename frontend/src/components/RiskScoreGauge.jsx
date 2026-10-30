import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

// ── Arc math helpers ──────────────────────────────────────────────────────────
// Gauge sweeps 240° starting at 150° (bottom-left) clockwise to 30° (bottom-right)
const CX = 100, CY = 100, R = 78;
const START_DEG = 150;   // leftmost angle
const SWEEP = 240;        // total degrees

function degToRad(d) { return (d * Math.PI) / 180; }

function polarToXY(deg, r = R) {
  const rad = degToRad(deg);
  return {
    x: CX + r * Math.cos(rad),
    y: CY + r * Math.sin(rad),
  };
}

// Build an SVG arc path for a segment from angleDeg for sweepDeg degrees
function arcPath(startDeg, sweepDeg, r = R) {
  const endDeg = startDeg + sweepDeg;
  const s = polarToXY(startDeg, r);
  const e = polarToXY(endDeg, r);
  const large = sweepDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

// Score (0–100) → angle on the gauge arc
function scoreToAngle(score) {
  return START_DEG + (Math.min(100, Math.max(0, score)) / 100) * SWEEP;
}

// ── Colour zones on the arc ──────────────────────────────────────────────────
// ALLOW 0-29 (29%), WARN 30-59 (30%), VERIFY 60-79 (20%), BLOCK 80-100 (21%)
const ZONES = [
  { label: 'ALLOW',  from: 0,   to: 29,  color: '#10b981' }, // emerald
  { label: 'WARN',   from: 30,  to: 59,  color: '#f59e0b' }, // amber
  { label: 'VERIFY', from: 60,  to: 79,  color: '#f97316' }, // orange
  { label: 'BLOCK',  from: 80,  to: 100, color: '#ef4444' }, // red
];

// ── Tick positions (0, 30, 60, 80, 100) ─────────────────────────────────────
const TICKS = [0, 30, 60, 80, 100];

// ── Tier config ──────────────────────────────────────────────────────────────
function getTierConfig(t) {
  switch (t) {
    case 'BLOCK':
      return {
        textColor: 'text-red-600',
        strokeColor: '#dc2626',
        glowColor: 'rgba(220,38,38,0.25)',
        shadowClass: 'shadow-sm',
        bgBadge: 'bg-red-50 text-red-700 border-red-200',
        title: 'BLOCK / HOLD',
        subtitle: 'Critical Threat Intercepted',
        icon: ShieldAlert,
      };
    case 'VERIFY':
      return {
        textColor: 'text-orange-600',
        strokeColor: '#ea580c',
        glowColor: 'rgba(234,88,12,0.25)',
        shadowClass: 'shadow-sm',
        bgBadge: 'bg-orange-50 text-orange-700 border-orange-200',
        title: 'VERIFY (STEPPED MFA)',
        subtitle: 'Elevated Behavioral Deviation',
        icon: AlertTriangle,
      };
    case 'WARN':
      return {
        textColor: 'text-amber-600',
        strokeColor: '#d97706',
        glowColor: 'rgba(217,119,6,0.25)',
        shadowClass: 'shadow-sm',
        bgBadge: 'bg-amber-50 text-amber-700 border-amber-200',
        title: 'WARN & CAUTION',
        subtitle: 'Unusual Context Detected',
        icon: AlertCircle,
      };
    case 'ALLOW':
    default:
      return {
        textColor: 'text-emerald-600',
        strokeColor: '#059669',
        glowColor: 'rgba(5,150,105,0.25)',
        shadowClass: 'shadow-sm',
        bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        title: 'ALLOW (CLEAN)',
        subtitle: 'Within Baseline Tolerances',
        icon: ShieldCheck,
      };
  }
}

// ── Component ────────────────────────────────────────────────────────────────
export default function RiskScoreGauge({ score = 10, tier = 'ALLOW', actionRequired = 'DIRECT_PASS' }) {
  const config = getTierConfig(tier);
  const Icon = config.icon;

  // Animated count-up score display
  const [displayScore, setDisplayScore] = useState(0);
  const prevScore = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = prevScore.current;
    const end = score;
    const duration = 600; // ms
    const startTime = performance.now();

    function step(now) {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic
      const current = Math.round(start + (end - start) * eased);
      setDisplayScore(current);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else prevScore.current = end;
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [score]);

  // Needle glow dot position
  const needleAngle = scoreToAngle(score);
  const needle = polarToXY(needleAngle, R);

  // Active zone arc (from 0 to score)
  const activeSweep = (score / 100) * SWEEP;
  const activePath = arcPath(START_DEG, activeSweep);

  // Background arc (full 240°)
  const bgPath = arcPath(START_DEG, SWEEP);

  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-300`}>

      {/* ── SVG Speedometer ── */}
      <div className="relative w-52 h-44 flex items-center justify-center">
        <svg viewBox="0 0 200 160" className="w-full h-full overflow-visible">
          <defs>
            {/* Glow filter for needle dot */}
            <filter id="gaugeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Zone colour segments (background) ── */}
          {ZONES.map((z) => {
            const zStartSweep = (z.from / 100) * SWEEP;
            const zSpan = ((z.to - z.from + 1) / 100) * SWEEP;
            return (
              <path
                key={z.label}
                d={arcPath(START_DEG + zStartSweep, zSpan)}
                fill="none"
                stroke={z.color}
                strokeWidth="8"
                strokeLinecap="butt"
                opacity="0.25"
              />
            );
          })}

          {/* ── Grey track ── */}
          <path
            d={bgPath}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* ── Active progress arc ── */}
          {activeSweep > 0 && (
            <path
              d={activePath}
              fill="none"
              stroke={config.strokeColor}
              strokeWidth="10"
              strokeLinecap="round"
              style={{ transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)' }}
            />
          )}

          {/* ── Tick marks ── */}
          {TICKS.map((t) => {
            const angle = scoreToAngle(t);
            const inner = polarToXY(angle, R - 8);
            const outer = polarToXY(angle, R + 4);
            const label = polarToXY(angle, R - 18);
            return (
              <g key={t}>
                <line
                  x1={inner.x} y1={inner.y}
                  x2={outer.x} y2={outer.y}
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="7"
                  fill="#64748b"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {t}
                </text>
              </g>
            );
          })}

          {/* ── Needle glow dot ── */}
          <circle
            cx={needle.x}
            cy={needle.y}
            r="6"
            fill={config.strokeColor}
            filter="url(#gaugeGlow)"
            style={{ transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)' }}
          />
          <circle
            cx={needle.x}
            cy={needle.y}
            r="3"
            fill="white"
            style={{ transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)' }}
          />

          {/* ── Center content ── */}
          {/* Icon — placed slightly above centre of the arc's visual centre */}
          <foreignObject x="75" y="68" width="50" height="28">
            <div className="flex justify-center items-center h-full">
              <Icon className={`w-5 h-5 ${config.textColor}`} />
            </div>
          </foreignObject>

          {/* Score number */}
          <text
            x="100"
            y="96"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="26"
            fontWeight="800"
            fill="#0f172a"
            fontFamily="JetBrains Mono, monospace"
          >
            {displayScore}
          </text>
          <text
            x="119"
            y="91"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="9"
            fill="#64748b"
            fontFamily="JetBrains Mono, monospace"
          >
            /100
          </text>
          <text
            x="100"
            y="109"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="7.5"
            fill="#64748b"
            letterSpacing="2"
            fontFamily="JetBrains Mono, monospace"
          >
            RISK INDEX
          </text>
        </svg>
      </div>

      {/* ── Decision Tier Badge ── */}
      <div className="mt-2 text-center">
        <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase font-mono ${config.bgBadge}`}>
          <span>{config.title}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1.5 font-medium">{config.subtitle}</p>
      </div>

      {/* ── 4-Tier Scale Legend ── */}
      <div className="w-full mt-5 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span className={tier === 'ALLOW'  ? 'text-emerald-600 font-bold' : ''}>0 ALLOW</span>
          <span className={tier === 'WARN'   ? 'text-amber-600 font-bold'   : ''}>30 WARN</span>
          <span className={tier === 'VERIFY' ? 'text-orange-600 font-bold'  : ''}>60 VERIFY</span>
          <span className={tier === 'BLOCK'  ? 'text-red-600 font-bold'     : ''}>80 BLOCK</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden flex">
          <div className="h-full bg-emerald-500 w-[30%]" title="ALLOW 0-29" />
          <div className="h-full bg-amber-500  w-[30%]" title="WARN 30-59" />
          <div className="h-full bg-orange-500 w-[20%]" title="VERIFY 60-79" />
          <div className="h-full bg-red-500    w-[20%]" title="BLOCK 80-100" />
        </div>
      </div>
    </div>
  );
}
