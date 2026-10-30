import React from 'react';
import {
  AlertTriangle,
  Smartphone,
  ShieldAlert,
  ArrowRight,
  QrCode,
  Users,
  Moon,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function ThreatTaxonomyPage() {
  const vectors = [
    {
      id: 'screen-sharing',
      title: 'Remote Screen-Sharing App Takeover',
      icon: Smartphone,
      severity: 'CRITICAL',
      prevalence: '34% of Indian UPI Frauds',
      modusOperandi:
        'Victim is contacted regarding an uncredited refund or KYC expiring. Scammer convinces victim to install remote desktop apps (AnyDesk, TeamViewer, RustDesk) under the guise of "verification". When victim enters UPI PIN, the attacker intercepts the keystrokes and OTP in real time.',
      detectionVector:
        'Pay Rakshak queries the Android/iOS Accessibility & MediaProjection service layer. If screen projection or accessibility remote touch injection is detected concurrently with payment initiation, the transaction is hard-blocked.',
      payRakshakAction: 'BLOCK (Hard Stop + Disconnect Warning)'
    },
    {
      id: 'impersonation-vpa',
      title: 'VPA Impersonation & Typo-Squatting',
      icon: ShieldAlert,
      severity: 'CRITICAL',
      prevalence: '28% of Indian UPI Frauds',
      modusOperandi:
        'Fraudsters register deceptively named VPAs such as "sbi.customercare24x7@okaxis", "paytm-refund-desk@ybl", or "electricity-bill-discount@ibl". Victims trust the brand name appearing before the "@" handle.',
      detectionVector:
        'Pay Rakshak computes Levenshtein edit distance and brand keyword n-grams against verified Indian banking and utility entities. Triggers instant impersonation flag if an unverified individual VPA mimics official brand trademarks.',
      payRakshakAction: 'BLOCK (Phishing Signature Alert)'
    },
    {
      id: 'collect-request',
      title: 'Inverted UPI "Collect Request" Trap',
      icon: AlertTriangle,
      severity: 'CRITICAL',
      prevalence: '19% of Indian UPI Frauds',
      modusOperandi:
        'Scammer sends a UPI Collect Request with note "Click here to receive your ₹25,000 lottery/refund". The victim enters their UPI PIN under the false impression that entering PIN is required to receive money.',
      detectionVector:
        'Pay Rakshak intercepts the transaction flow direction. It flags any transaction where the initiated action is an incoming DEBIT authorization rather than an outgoing user-initiated transfer.',
      payRakshakAction: 'BLOCK / VERIFY (Prompt: PIN is ONLY for Debits)'
    },
    {
      id: 'mule-accounts',
      title: 'Mule Account Layering & Rapid Drainage',
      icon: Users,
      severity: 'HIGH',
      prevalence: '12% of Indian UPI Frauds',
      modusOperandi:
        'Syndicates recruit students or villagers to open UPI-enabled bank accounts. Once fraudulent proceeds arrive, funds are immediately split into smaller tranches and routed to dozens of secondary accounts within minutes.',
      detectionVector:
        'Pay Rakshak calculates Graph Entropy and Recipient Age. Fresh accounts (< 48 hours old) experiencing sudden spikes in incoming deposits followed by immediate transfers are flagged as high-risk mule accounts.',
      payRakshakAction: 'VERIFY (45-sec Cooling Period + Account Age Reveal)'
    },
    {
      id: 'tampered-qr',
      title: 'Tampered QR Codes & Counterfeit Stickers',
      icon: QrCode,
      severity: 'HIGH',
      prevalence: '5% of Indian UPI Frauds',
      modusOperandi:
        'Attackers paste deceptive adhesive QR stickers over authentic merchant QR codes at retail stores, redirecting consumer payments to criminal accounts.',
      detectionVector:
        'Pay Rakshak validates merchant registration credentials against the NPCI BharatQR registry. If a personal P2P VPA is disguised as a merchant terminal, stepped confirmation is required.',
      payRakshakAction: 'WARN (Reveal Actual Registered Individual Name)'
    },
    {
      id: 'nocturnal-drain',
      title: 'Nocturnal Velocity Drainage (SIM Swap)',
      icon: Moon,
      severity: 'HIGH',
      prevalence: '2% of Indian UPI Frauds',
      modusOperandi:
        'Attackers clone victims\' SIM cards or compromise devices and initiate rapid sequential transfers during early morning hours (02:00 AM - 04:00 AM) while the victim is asleep.',
      detectionVector:
        'Pay Rakshak profiles individual circadian transaction patterns. Outlier transfers during deep sleep hours trigger mandatory cooling delay and emergency biometric confirmation.',
      payRakshakAction: 'VERIFY (Biometric Re-Auth + Delayed Routing)'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          UPI Threat Vectors & Attack Taxonomy
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed cyber threat intelligence dossiers on the primary modern digital payment fraud patterns in India.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {vectors.map((vec) => {
          const Icon = vec.icon;
          return (
            <div
              key={vec.id}
              className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-4 hover:border-slate-700 transition-all shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-surface border border-surface-border text-cyan-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{vec.title}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">{vec.prevalence}</span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                    vec.severity === 'CRITICAL'
                      ? 'bg-red-950/80 text-red-400 border-red-800'
                      : 'bg-orange-950/80 text-orange-400 border-orange-800'
                  }`}
                >
                  {vec.severity}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block mb-0.5">
                    Modus Operandi (Attack Pattern):
                  </span>
                  <p className="text-slate-300 leading-relaxed font-normal">
                    {vec.modusOperandi}
                  </p>
                </div>

                <div className="pt-2 border-t border-surface-border/60">
                  <span className="text-[11px] font-mono uppercase text-cyan-400 font-bold block mb-0.5">
                    Pay Rakshak Pre-Payment Detection:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {vec.detectionVector}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-surface border border-surface-border flex items-center justify-between text-xs">
                <span className="text-slate-400">Recommended Action:</span>
                <span className="font-mono font-bold text-emerald-400">{vec.payRakshakAction}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

