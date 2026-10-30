import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Zap,
  Sliders,
  Clock,
  Smartphone,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  RefreshCw,
  UserCheck,
  Building,
  RotateCcw,
  Search,
  ChevronDown,
  X
} from 'lucide-react';
import RiskScoreGauge from '../components/RiskScoreGauge';
import ExplainabilityCard from '../components/ExplainabilityCard';
import MultiDomainRiskCard from '../components/MultiDomainRiskCard';
import InterventionModal from '../components/InterventionModal';
import AntiUrgencyModal from '../components/AntiUrgencyModal';
import PaymentDnaHero from '../components/PaymentDnaHero';
import { inspectPrePayment, fetchPresets, executePayment, scheduleDelayedHold } from '../services/api';
import { calculateLocalRisk, SENDER_BASELINES } from '../services/localRiskEngine';

const SENDER_PROFILES = [
  {
    upiId: 'ramesh.sharma@okhdfcbank',
    name: 'Ramesh Sharma',
    summary: 'Avg ₹1,850, Std ₹950 (Moderate P2P)'
  },
  {
    upiId: 'priya.patel@okaxis',
    name: 'Priya Patel',
    summary: 'Avg ₹4,200, Std ₹2,100 (Freelancer)'
  },
  {
    upiId: 'ananya.iyer@icici',
    name: 'Ananya Iyer',
    summary: 'Avg ₹650, Std ₹320 (Student)'
  },
  {
    upiId: 'vikram.malhotra@ybl',
    name: 'Vikram Malhotra',
    summary: 'Avg ₹6,800, Std ₹3,500 (Tech Professional)'
  }
];

const DEFAULT_PRESETS = [
  {
    id: 'safe-1-merchant',
    title: '✅ 1. Verified Merchant ₹480',
    description: 'Certified merchant with 18 successful txns. Amount matches baseline habits. Stated intent: Shopping. Expected: 0–20, ALLOW.',
    payload: {
      senderUpiId: 'ramesh.sharma@okhdfcbank',
      beneficiaryUpiId: 'verified.merchant@payrakshak',
      amount: 480,
      paymentPurpose: 'Shopping',
      category: 'Shopping',
      velocityLast1Hour: 1,
      velocityLast24Hours: 2,
      transactionHour: 14,
      beneficiaryAgeDays: 730,
      screenSharingActive: false,
      isCollectRequest: false
    },
    expectedTier: 'ALLOW'
  },
  {
    id: 'safe-2-friend',
    title: '✅ 2. Known Friend ₹1,200',
    description: 'Established peer contact with 14 past transactions. Amount within normal range. Stated intent: Friend / Family. Expected: 0–20, ALLOW.',
    payload: {
      senderUpiId: 'ramesh.sharma@okhdfcbank',
      beneficiaryUpiId: 'rohit.verma@okaxis',
      amount: 1200,
      paymentPurpose: 'Friend / Family',
      category: 'Friend / Family',
      velocityLast1Hour: 1,
      velocityLast24Hours: 2,
      transactionHour: 14,
      beneficiaryAgeDays: 450,
      screenSharingActive: false,
      isCollectRequest: false
    },
    expectedTier: 'ALLOW'
  },
  {
    id: 'warn-new-contact',
    title: '⚠️ 3. First-Time Beneficiary ₹3,500',
    description: 'First payment to brand new contact. Amount slightly above student baseline, no prior fraud association. Expected: 30–59, WARN.',
    payload: {
      senderUpiId: 'ananya.iyer@icici',
      beneficiaryUpiId: 'newcontact@payrakshak',
      amount: 3500,
      paymentPurpose: 'Friend / Family',
      category: 'Friend / Family',
      velocityLast1Hour: 1,
      velocityLast24Hours: 2,
      transactionHour: 17,
      beneficiaryAgeDays: 1,
      screenSharingActive: false,
      isCollectRequest: false
    },
    expectedTier: 'WARN'
  },
  {
    id: 'block-support-refund-scam',
    title: '🚫 4. Fake Refund Scam ₹49,500',
    description: 'CRITICAL INTENT MISMATCH: User selected "Refund" but money is exiting to an unverified recipient at 3 AM. Expected: 80–100, BLOCK.',
    payload: {
      senderUpiId: 'ramesh.sharma@okhdfcbank',
      beneficiaryUpiId: 'support-refund@okaxis',
      amount: 49500,
      paymentPurpose: 'Refund',
      category: 'Refund',
      velocityLast1Hour: 4,
      velocityLast24Hours: 6,
      transactionHour: 3,
      beneficiaryAgeDays: 2,
      screenSharingActive: false,
      isCollectRequest: false
    },
    expectedTier: 'BLOCK'
  },
  {
    id: 'verify-unknown-nocturnal',
    title: '🔍 5. High-Value Outlier ₹25,000',
    description: 'Large transfer at 2:00 AM off-hours to unverified payee. High behavioural deviation triggers MFA step-up. Expected: 60–79, VERIFY.',
    payload: {
      senderUpiId: 'ramesh.sharma@okhdfcbank',
      beneficiaryUpiId: 'unknown-beneficiary@payrakshak',
      amount: 25000,
      paymentPurpose: 'Investment',
      category: 'Investment',
      velocityLast1Hour: 1,
      velocityLast24Hours: 2,
      transactionHour: 2,
      beneficiaryAgeDays: 0.5,
      screenSharingActive: false,
      isCollectRequest: false
    },
    expectedTier: 'VERIFY'
  },
  {
    id: 'velocity-burst-attack',
    title: '⚡ 6. Velocity Burst Attack',
    description: 'Sudden burst of 8 rapid transfers in short window to unfamiliar payee, indicative of automated account drain. Expected: 60–79, VERIFY.',
    payload: {
      senderUpiId: 'ramesh.sharma@okhdfcbank',
      beneficiaryUpiId: 'newcontact@payrakshak',
      amount: 4500,
      paymentPurpose: 'Shopping',
      category: 'Shopping',
      velocityLast1Hour: 8,
      velocityLast24Hours: 12,
      transactionHour: 15,
      beneficiaryAgeDays: 1,
      screenSharingActive: false,
      isCollectRequest: false
    },
    expectedTier: 'VERIFY'
  },
  {
    id: 'suspicious-network-mule',
    title: '🕸️ 7. Suspicious Syndicate Mule ₹38,000',
    description: 'Synthetic Graph links beneficiary to Jamtara mule cluster 33 with 9 prior cybercrime complaints. Expected: 80–100, BLOCK.',
    payload: {
      senderUpiId: 'ramesh.sharma@okhdfcbank',
      beneficiaryUpiId: 'paytm-refund-support@okaxis',
      amount: 38000,
      paymentPurpose: 'Shopping',
      category: 'Shopping',
      velocityLast1Hour: 3,
      velocityLast24Hours: 5,
      transactionHour: 15,
      beneficiaryAgeDays: 0.8,
      screenSharingActive: false,
      isCollectRequest: false
    },
    expectedTier: 'BLOCK'
  },
  {
    id: 'block-screenshare-collect',
    title: '🚫 Threat: AnyDesk + Collect Trap',
    description: 'Active remote screen share combined with incoming debit collect trap. Expected: 80–100, BLOCK.',
    payload: {
      senderUpiId: 'ramesh.sharma@okhdfcbank',
      beneficiaryUpiId: 'paytm-refund-support@okaxis',
      amount: 49900,
      paymentPurpose: 'Refund',
      category: 'Refund',
      velocityLast1Hour: 3,
      velocityLast24Hours: 5,
      transactionHour: 15,
      beneficiaryAgeDays: 0.8,
      screenSharingActive: true,
      isCollectRequest: true
    },
    expectedTier: 'BLOCK'
  }
];

export default function SimulatorPage() {
  const [presets, setPresets] = useState(DEFAULT_PRESETS);
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [showIntervention, setShowIntervention] = useState(false);
  const [showAntiUrgencyModal, setShowAntiUrgencyModal] = useState(false);

  // Form State
  const [senderUpiId, setSenderUpiId] = useState('ramesh.sharma@okhdfcbank');
  const [showSenderDropdown, setShowSenderDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSenderDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // Default: safe clean transaction (ALLOW tier — green gauge)
  const [beneficiaryUpiId, setBeneficiaryUpiId] = useState('verified.merchant@payrakshak');
  const [amount, setAmount] = useState(480);
  const [paymentPurpose, setPaymentPurpose] = useState('Shopping');
  const [velocityLast1Hour, setVelocityLast1Hour] = useState(1);
  const [velocityLast24Hours, setVelocityLast24Hours] = useState(2);
  const [transactionHour, setTransactionHour] = useState(14);
  const [beneficiaryAgeDays, setBeneficiaryAgeDays] = useState(730);
  const [screenSharingActive, setScreenSharingActive] = useState(false);
  const [isCollectRequest, setIsCollectRequest] = useState(false);
  const [category, setCategory] = useState('Merchant Payment');

  // Load presets on mount (fall back to DEFAULT_PRESETS if offline)
  useEffect(() => {
    async function loadPresets() {
      const p = await fetchPresets();
      if (p && p.length > 0) {
        setPresets(p);
      }
    }
    loadPresets();
  }, []);

  // Run dynamic risk assessment whenever input changes
  // Primary: backend API. Fallback: local JS engine (always works offline)
  useEffect(() => {
    let isCancelled = false;

    async function evaluate() {
      setLoading(true);

      const params = {
        senderUpiId,
        beneficiaryUpiId,
        amount: Number(amount),
        category,
        paymentPurpose,
        velocityLast1Hour: Number(velocityLast1Hour),
        velocityLast5Minutes: Number(velocityLast1Hour) >= 4 ? Math.ceil(Number(velocityLast1Hour) / 2) : 0,
        velocityLast24Hours: Number(velocityLast24Hours),
        transactionHour: Number(transactionHour),
        beneficiaryAgeDays: Number(beneficiaryAgeDays),
        screenSharingActive,
        isCollectRequest
      };

      // Always show local result immediately so gauge is never empty
      const localResult = calculateLocalRisk(params);
      if (!isCancelled) setEvaluation(localResult);

      // Then try to fetch richer backend result
      try {
        const result = await inspectPrePayment(params);
        if (!isCancelled) setEvaluation(result);
      } catch (err) {
        // Backend not running — local engine result already shown, keep it
        console.warn('Backend unavailable, using local risk engine:', err.message);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    const timer = setTimeout(evaluate, 150);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    senderUpiId,
    beneficiaryUpiId,
    amount,
    paymentPurpose,
    velocityLast1Hour,
    velocityLast24Hours,
    transactionHour,
    beneficiaryAgeDays,
    screenSharingActive,
    isCollectRequest,
    category
  ]);

  const applyPreset = (preset) => {
    const p = preset.payload;
    setSenderUpiId(p.senderUpiId);
    setBeneficiaryUpiId(p.beneficiaryUpiId);
    setAmount(p.amount);
    setVelocityLast1Hour(p.velocityLast1Hour);
    setVelocityLast24Hours(p.velocityLast24Hours !== undefined ? p.velocityLast24Hours : 2);
    setTransactionHour(p.transactionHour !== undefined ? p.transactionHour : 14);
    setBeneficiaryAgeDays(p.beneficiaryAgeDays !== undefined ? p.beneficiaryAgeDays : 30);
    setScreenSharingActive(Boolean(p.screenSharingActive));
    setIsCollectRequest(Boolean(p.isCollectRequest));
    setCategory(p.category || 'P2P');
    setPaymentPurpose(p.paymentPurpose || p.category || 'Shopping');
  };

  const handleProceedVerified = async (action) => {
    if (evaluation) {
      await executePayment(evaluation, action);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in text-slate-900">
      {/* Top Section / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Pre-Payment Risk Inspector
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate transaction signals, behavioral deviations, and UPI VPA intelligence before PIN entry.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setBeneficiaryUpiId('jane.freelance@okaxis');
              setAmount(20500);
              setBeneficiaryAgeDays(0.5);
              setShowAntiUrgencyModal(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors shadow-xs"
          >
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Anti-Urgency Scam Shield (Charlie Flow)</span>
          </button>

          <button
            onClick={() => {
              // Reset to safe standard
              setSenderUpiId('ramesh.sharma@okhdfcbank');
              setBeneficiaryUpiId('verified.merchant@payrakshak');
              setAmount(480);
              setPaymentPurpose('Shopping');
              setVelocityLast1Hour(1);
              setVelocityLast24Hours(2);
              setTransactionHour(14);
              setBeneficiaryAgeDays(730);
              setScreenSharingActive(false);
              setIsCollectRequest(false);
              setCategory('Merchant Payment');
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset to Safe Baseline</span>
          </button>
        </div>
      </div>

      {/* Preset Scenarios Selector (Quick Hackathon Demo) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-xs font-mono font-semibold uppercase tracking-wider text-blue-700">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Simulate Real UPI Threat Scenarios</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">1-Click Live Test</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="group text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all text-xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-slate-800 group-hover:text-blue-600 truncate">
                  {preset.title}
                </span>
                <span
                  className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ml-1.5 ${
                    preset.expectedTier === 'BLOCK'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : preset.expectedTier === 'VERIFY'
                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                      : preset.expectedTier === 'WARN'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {preset.expectedTier}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── PAYMENT DNA HERO VISUALIZER (Reference UI Match) ── */}
      <PaymentDnaHero
        amount={amount}
        beneficiaryUpiId={beneficiaryUpiId}
        beneficiaryName={evaluation?.beneficiaryProfile?.registeredBankName}
        senderName={SENDER_PROFILES.find((p) => p.upiId === senderUpiId)?.name || 'Priya'}
        senderBaseline={SENDER_BASELINES?.[senderUpiId] || { avg: 1850, std: 950 }}
        riskScore={evaluation?.finalRisk ?? evaluation?.riskAssessment?.compositeScore ?? 0}
        decisionTier={evaluation?.decisionTier ?? evaluation?.riskAssessment?.decisionTier ?? 'ALLOW'}
        transactionHour={transactionHour}
        velocityLast1Hour={velocityLast1Hour}
        isKnownBeneficiary={evaluation?.beneficiaryProfile?.category !== 'Unverified' && (evaluation?.beneficiaryProfile?.reputationScore || 0) > 50}
        isVerifiedMerchant={Boolean(evaluation?.beneficiaryProfile?.isVerifiedMerchant)}
        onVerifyRecipient={() => setShowIntervention(true)}
        onHoldPayment={() => setShowAntiUrgencyModal(true)}
      />

      {/* Main Grid: Parameters vs Evaluation Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Input Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-wider font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Payment Context & Behavioral Parameters</span>
            </h2>

            {/* Sender Selection / Searchable Input */}
            <div className="space-y-2" ref={dropdownRef}>
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <span>Sender UPI Profile:</span>
                  <span className="text-[10px] text-slate-400 font-normal">(Search or select persona)</span>
                </label>
                <span className="text-[10px] text-blue-600 font-mono font-medium">30-day Habits Baseline</span>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={senderUpiId}
                  onChange={(e) => {
                    setSenderUpiId(e.target.value);
                    setShowSenderDropdown(true);
                  }}
                  onFocus={() => setShowSenderDropdown(true)}
                  placeholder="Type any sender UPI ID (e.g. ramesh.sharma@okhdfcbank)..."
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-24 py-2.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs transition-all"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
                  {senderUpiId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSenderUpiId('');
                        setShowSenderDropdown(true);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded"
                      title="Clear"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowSenderDropdown(!showSenderDropdown)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Toggle preset profiles"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        showSenderDropdown ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Dropdown Suggestions Menu */}
                {showSenderDropdown && (
                  <div className="absolute left-0 right-0 mt-1.5 z-30 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-100 animate-fade-in">
                    <div className="p-2.5 bg-slate-50 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>CHOOSE PRE-CONFIGURED PERSONA</span>
                      <span className="text-blue-600">Or type custom ID above</span>
                    </div>
                    {SENDER_PROFILES.map((profile) => (
                      <button
                        key={profile.upiId}
                        type="button"
                        onClick={() => {
                          setSenderUpiId(profile.upiId);
                          setShowSenderDropdown(false);
                        }}
                        className={`w-full text-left p-3 hover:bg-slate-50 flex items-center justify-between transition-colors ${
                          senderUpiId === profile.upiId
                            ? 'bg-blue-50/70 border-l-2 border-blue-600'
                            : ''
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span>{profile.name}</span>
                          </div>
                          <div className="text-[11px] font-mono text-blue-600 mt-0.5">
                            {profile.upiId}
                          </div>
                        </div>
                        <div className="text-right text-[10px] text-slate-500 font-mono">
                          {profile.summary}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Profile Selection Pills */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] text-slate-500 font-mono">Quick persona:</span>
                {SENDER_PROFILES.map((p) => (
                  <button
                    key={p.upiId}
                    type="button"
                    onClick={() => {
                      setSenderUpiId(p.upiId);
                      setShowSenderDropdown(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                      senderUpiId === p.upiId
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {p.name.split(' ')[0]} ({p.summary.split(' ')[1]})
                  </button>
                ))}
              </div>
            </div>

            {/* Beneficiary UPI ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>Beneficiary UPI ID (VPA):</span>
                {evaluation?.vpaIntelligence?.isImpersonation && (
                  <span className="text-[10px] text-red-600 font-mono font-bold animate-pulse">
                    ⚠️ Impersonation Flagged
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={beneficiaryUpiId}
                  onChange={(e) => setBeneficiaryUpiId(e.target.value)}
                  placeholder="username@psp (e.g. support-refund@okaxis)"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs"
                />
              </div>
              <p className="text-[10px] text-slate-500">
                Try handles with keywords: <code className="text-blue-600 font-semibold">refund</code>, <code className="text-blue-600 font-semibold">sbi-helpline</code>, <code className="text-blue-600 font-semibold">paytm-support</code>, or genuine <code className="text-emerald-600 font-semibold">mother@payrakshak</code>.
              </p>
            </div>

            {/* Payment Purpose / Stated Intent ⭐ Signature Feature */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span>Payment Purpose / Stated Intent:</span>
                  <span className="text-[9px] font-mono bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded font-bold">
                    ⭐ INTENT ENGINE
                  </span>
                </label>
                <span className="text-[10px] font-mono text-blue-700 font-semibold">{paymentPurpose}</span>
              </div>
              <select
                value={paymentPurpose}
                onChange={(e) => setPaymentPurpose(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs cursor-pointer"
              >
                <option value="Shopping">Shopping (E-Commerce / Retail Merchant Goods)</option>
                <option value="Rent">Rent (House / Office Lease Transfer)</option>
                <option value="Bill Payment">Bill Payment (Electricity, Water, Mobile, Utility)</option>
                <option value="Friend / Family">Friend / Family (Lunch Split, Personal Gift, Peer Transfer)</option>
                <option value="Refund">Refund ⚠️ (User intending to claim a refund)</option>
                <option value="Government Service">Government Service (Official Taxes, Fine, Challan)</option>
                <option value="Investment">Investment (Crypto, Stocks, High-Yield Trading)</option>
                <option value="Other">Other / General Transfer</option>
              </select>
              {paymentPurpose === 'Refund' ? (
                <p className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-xl font-mono leading-relaxed">
                  ⚠️ Context Warning: You NEVER enter UPI PIN or send money to receive a refund. This triggers high Intent Risk!
                </p>
              ) : (
                <p className="text-[10px] text-slate-500">
                  The platform validates whether transaction direction, recipient type, and amount match your declared intent.
                </p>
              )}
            </div>

            {/* Amount Slider & Input */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Transaction Amount:</span>
                <div className="flex items-center space-x-1 font-mono font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                  <span className="text-slate-500">₹</span>
                  <span>{Number(amount).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <input
                type="range"
                min="50"
                max="100000"
                step="250"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>₹50</span>
                <span>₹25,000</span>
                <span>₹50,000</span>
                <span>₹1,00,000 (UPI Ceiling)</span>
              </div>
            </div>

            {/* Beneficiary Age Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Beneficiary VPA Age (Freshness):</span>
                <span className="font-mono text-blue-700 font-semibold">
                  {beneficiaryAgeDays < 1
                    ? `${(beneficiaryAgeDays * 24).toFixed(0)} Hours Old`
                    : `${Math.round(beneficiaryAgeDays)} Days Old`}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="700"
                step="0.5"
                value={beneficiaryAgeDays}
                onChange={(e) => setBeneficiaryAgeDays(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span className="text-red-600 font-bold">2.4 Hours (Fresh)</span>
                <span>30 Days</span>
                <span className="text-emerald-600 font-semibold">2 Years (Established)</span>
              </div>
            </div>

            {/* Velocity (1 hour & 24 hour) */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Velocity (Last 1 hr):</span>
                  <span className="font-mono font-bold text-blue-700">{velocityLast1Hour} payments</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={velocityLast1Hour}
                  onChange={(e) => setVelocityLast1Hour(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Hour of Day (IST):</span>
                  <span className="font-mono font-bold text-blue-700">
                    {transactionHour}:00 {transactionHour >= 1 && transactionHour <= 5 ? '(Nocturnal ⚠️)' : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={transactionHour}
                  onChange={(e) => setTransactionHour(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Critical Security Threat Flags */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block font-bold">
                Contextual Threat Vectors
              </span>

              {/* Screen Sharing Toggle */}
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${screenSharingActive ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-500'}`}>
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      Remote Screen-Sharing Software Active
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Detects active AnyDesk, TeamViewer, RustDesk, or screenshare during UPI PIN
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={screenSharingActive}
                  onChange={(e) => setScreenSharingActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
              </label>

              {/* UPI Collect Request Toggle */}
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${isCollectRequest ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-500'}`}>
                    <AlertOctagon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      UPI "Collect Request" Trap (Inverted Flow)
                    </div>
                    <div className="text-[10px] text-slate-500">
                      External party requested a debit while telling victim they are receiving money
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isCollectRequest}
                  onChange={(e) => setIsCollectRequest(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Pre-Execution Intelligence & Action (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Dynamic Risk Gauge — always visible, updates in real-time */}
          <div className={`transition-opacity duration-300 ${loading ? 'opacity-70' : 'opacity-100'}`}>
            <RiskScoreGauge
              score={evaluation?.riskAssessment?.compositeScore ?? 0}
              tier={evaluation?.riskAssessment?.decisionTier ?? 'ALLOW'}
              actionRequired={evaluation?.riskAssessment?.actionRequired ?? 'DIRECT_PASS'}
            />
          </div>

          {/* Action Button: Authorize / Intervene */}
          {evaluation && (
            <button
              onClick={() => setShowIntervention(true)}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-sm ${
                evaluation.riskAssessment.decisionTier === 'BLOCK'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : evaluation.riskAssessment.decisionTier === 'VERIFY'
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : evaluation.riskAssessment.decisionTier === 'WARN'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <span>Inspect & Execute Transaction Flow</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* 7-Domain Payment Risk Profile Breakdown */}
          {evaluation && (
            <MultiDomainRiskCard evaluation={evaluation} />
          )}

          {/* Explainability Breakdown */}
          {evaluation && (
            <ExplainabilityCard
              explainability={evaluation.explainability}
              scoresBreakdown={evaluation.scoresBreakdown}
            />
          )}
        </div>
      </div>

      {/* Stepped Intervention Modal */}
      <InterventionModal
        isOpen={showIntervention}
        onClose={() => setShowIntervention(false)}
        evaluation={evaluation}
        onProceedVerified={handleProceedVerified}
      />

      {/* Anti-Urgency Scam Shield Modal (Charlie Flow) */}
      <AntiUrgencyModal
        isOpen={showAntiUrgencyModal}
        onClose={() => setShowAntiUrgencyModal(false)}
        paymentDetails={{
          amount: amount || 20500,
          beneficiaryName: evaluation?.beneficiaryProfile?.registeredBankName || 'Jane',
          beneficiaryUpiId: beneficiaryUpiId || 'jane.freelance@okaxis',
          delayHours: 4
        }}
        onConfirmSchedule={async (details) => {
          try {
            await scheduleDelayedHold({
              senderUpiId,
              beneficiaryUpiId: details.recipientVpa,
              beneficiaryName: details.recipientName,
              amount: details.amount,
              delayHours: details.delayHours,
              reason: 'New payee 4-hour delay (Anti-Urgency Scam Shield)'
            });
          } catch (e) {
            console.error(e);
          }
        }}
      />
    </div>
  );
}

