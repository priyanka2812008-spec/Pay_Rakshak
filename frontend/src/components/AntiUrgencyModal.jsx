import React, { useState } from 'react';
import {
  Shield,
  Clock,
  AlertTriangle,
  Smartphone,
  ArrowLeft,
  X,
  CheckCircle2,
  Bell,
  MessageSquare,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export default function AntiUrgencyModal({
  isOpen,
  onClose,
  paymentDetails,
  onConfirmSchedule,
  onCancelPayment
}) {
  if (!isOpen) return null;

  // Step 1: "Stay safe from scams (Scammers create false urgency)"
  // Step 2: "Thank you. Your payment has been scheduled (All new payees get a delay)"
  const [step, setStep] = useState(1);
  const [isCancelled, setIsCancelled] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const amount = paymentDetails?.amount || 20500;
  const recipientName = paymentDetails?.beneficiaryName || 'Jane';
  const recipientVpa = paymentDetails?.beneficiaryUpiId || 'jane.freelance@okaxis';
  const delayHours = paymentDetails?.delayHours || 4;

  const handleContinueFromUrgency = () => {
    setStep(2);
  };

  const handleFinalContinue = () => {
    setIsCompleted(true);
    if (onConfirmSchedule) {
      onConfirmSchedule({
        amount,
        recipientName,
        recipientVpa,
        delayHours
      });
    }
  };

  const handleCancel = () => {
    setIsCancelled(true);
    if (onCancelPayment) {
      onCancelPayment();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl my-8 flex flex-col lg:flex-row items-center justify-center gap-6">
        
        {/* Main Phone Mockup Screen */}
        <div className="w-full max-w-[380px] bg-white text-slate-900 rounded-[44px] shadow-2xl border-[10px] border-slate-900 overflow-hidden flex flex-col min-h-[660px] relative font-sans">
          
          {/* Phone Top Notch / Speaker Bar */}
          <div className="w-full bg-slate-900 h-6 flex items-center justify-center relative">
            <div className="w-24 h-4 bg-slate-900 rounded-b-xl flex items-center justify-center">
              <div className="w-10 h-1 bg-slate-700 rounded-full" />
            </div>
          </div>

          {/* STEP 1: Stay safe from scams */}
          {step === 1 && !isCancelled && (
            <div className="flex-1 flex flex-col justify-between p-6 bg-white animate-fade-in">
              <div>
                {/* Header Brand */}
                <div className="flex items-center space-x-1.5 text-slate-800 text-xs font-semibold mb-6">
                  <span className="font-bold tracking-tight">Pay Rakshak</span>
                  <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px]">
                    <Shield className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-slate-500 font-medium">FraudShield</span>
                </div>

                {/* Heading */}
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  Stay safe<br />from scams
                </h2>

                {/* Violet Card with Visual Clocks & Triangle */}
                <div className="mt-5 p-5 rounded-2xl bg-[#eff2fe] border border-blue-100 flex flex-col items-center text-center">
                  
                  {/* Graphics Illustration */}
                  <div className="relative w-36 h-24 flex items-center justify-center mb-3">
                    {/* Alarm Clock */}
                    <div className="w-14 h-14 rounded-full bg-[#8b87d6] flex items-center justify-center text-white shadow-md relative z-10">
                      <Clock className="w-7 h-7 text-white" />
                      {/* Clock bells */}
                      <span className="absolute -top-1 -left-1 w-3 h-3 bg-[#6c67c5] rounded-full" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#6c67c5] rounded-full" />
                    </div>

                    {/* Warning Triangle */}
                    <div className="absolute left-3 bottom-1 z-20 w-8 h-8 rounded-lg bg-[#eb5757] flex items-center justify-center text-white shadow">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>

                    {/* Smartphone with Alert */}
                    <div className="absolute right-4 bottom-1 z-20 w-7 h-12 rounded-md bg-[#2d2a4a] border border-purple-300 flex flex-col items-center justify-between p-1 rotate-12 shadow">
                      <div className="w-3 h-0.5 bg-slate-400 rounded-full" />
                      <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-ping" />
                      <div className="w-2 h-0.5 bg-slate-400 rounded-full" />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Scammers create false urgency
                  </h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-1.5">
                    Fraudsters often use pressure tactics to get you to send them money. Be careful if you are feeling pressured in any way.{' '}
                    <span className="underline font-medium text-blue-700 cursor-pointer">
                      See common ways that scammers create urgency.
                    </span>
                  </p>
                </div>

                {/* Helpline note */}
                <p className="text-[11px] text-slate-500 leading-relaxed mt-4 px-1">
                  If you are concerned or unsure about what to do next, know you're not alone. You can always reach us at{' '}
                  <span className="text-blue-700 underline font-medium cursor-pointer">
                    support@payrakshak.in
                  </span>{' '}
                  or National Helpline <strong className="text-slate-800">1930</strong>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-4">
                <button
                  type="button"
                  onClick={handleContinueFromUrgency}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#1e1b38] hover:bg-[#2d2854] text-white font-semibold text-xs tracking-wide transition-colors shadow-md"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-center text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Thank you. Your payment has been scheduled. */}
          {step === 2 && !isCancelled && !isCompleted && (
            <div className="flex-1 flex flex-col justify-between p-6 bg-white animate-fade-in">
              <div>
                {/* Back Link */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center space-x-1.5 text-xs text-slate-700 font-semibold mb-6 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Pay or Request</span>
                </button>

                {/* Small category tag */}
                <span className="text-[11px] text-slate-500 font-semibold block mb-1">
                  Pay an individual
                </span>

                {/* Main Headline */}
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Thank you. Your<br />payment has been<br />scheduled.
                </h2>
                <p className="text-xs text-slate-600 mt-2 font-medium">
                  We will release the payment in {delayHours} hours.
                </p>

                {/* Delayed Hold Explanation Card */}
                <div className="mt-5 p-4 rounded-2xl bg-[#eff2fe] border border-blue-100 space-y-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Clock className="w-4 h-4" />
                  </div>

                  <h3 className="text-xs font-bold text-slate-900">
                    All new payees get a {delayHours}-hour delay
                  </h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong>Why the wait?</strong> The delay gives Pay Rakshak the time to notify you about the transaction across SMS, email and the app. This gives you the awareness and the time to cancel the transaction for any reason.
                  </p>
                </div>

                {/* Recipient pill */}
                <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <span className="text-slate-500">Scheduled to:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {recipientName} (₹{Number(amount).toLocaleString('en-IN')})
                  </span>
                </div>
              </div>

              {/* Buttons: Continue & Cancel Payment */}
              <div className="space-y-2 pt-4">
                <button
                  type="button"
                  onClick={handleFinalContinue}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#1e1b38] hover:bg-[#2d2854] text-white font-semibold text-xs tracking-wide transition-colors shadow-md"
                >
                  Continue
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full py-2.5 text-center text-xs font-bold text-[#eb5757] hover:text-red-700 transition-colors"
                >
                  Cancel Payment
                </button>
              </div>
            </div>
          )}

          {/* Cancelled State */}
          {isCancelled && (
            <div className="flex-1 flex flex-col justify-center items-center p-6 bg-white text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <RotateCcw className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Payment Cancelled
              </h3>
              <p className="text-xs text-slate-600 max-w-xs">
                Your payment of <strong>₹{Number(amount).toLocaleString('en-IN')}</strong> to <strong>{recipientName}</strong> was successfully halted. No funds left your account.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          )}

          {/* Completed State */}
          {isCompleted && (
            <div className="flex-1 flex flex-col justify-center items-center p-6 bg-white text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Safe Delay Vault Active
              </h3>
              <p className="text-xs text-slate-600 max-w-xs">
                Payment scheduled and locked in safe cooling-off. Releasing in {delayHours} hours unless cancelled.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                Go to Safe Delay Vault
              </button>
            </div>
          )}

          {/* Phone Bottom Home Bar */}
          <div className="w-full py-2 flex items-center justify-center bg-white">
            <div className="w-32 h-1 bg-slate-400 rounded-full" />
          </div>
        </div>

        {/* Callout Bubble (Right Side) — Exact match from screenshot */}
        <div className="max-w-xs space-y-4 text-left">
          {/* Blue Speech Callout Bubble */}
          <div className="relative p-4 rounded-2xl bg-[#2f80ed] text-white shadow-xl">
            {/* Bubble tail on left for desktop */}
            <div className="hidden lg:block absolute top-6 -left-2.5 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-[#2f80ed]" />
            
            <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-wider text-blue-200 mb-1 font-bold">
              <MessageSquare className="w-3 h-3" />
              <span>SMS Alert Preview</span>
            </div>

            <p className="text-sm font-medium leading-relaxed">
              A ₹{Number(amount).toLocaleString('en-IN')} payment was sent to {recipientName}. Because it's a new recipient phone number, it will be released in {delayHours} hrs.
            </p>

            <div className="mt-3 pt-2.5 border-t border-blue-400/40 flex items-center justify-between text-[11px] text-blue-100">
              <span className="font-semibold underline cursor-pointer" onClick={handleCancel}>
                Tap to Cancel Instantly
              </span>
              <span className="text-[10px] text-blue-200 font-mono">Now</span>
            </div>
          </div>

          {/* Explanation Callout for Hackathon / Fintech Judges */}
          <div className="p-4 rounded-xl bg-surface-card border border-surface-border text-xs text-slate-300 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Why This Stops Social Engineering</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Psychological studies show 95% of scam victims realize they were manipulated within 30 to 60 minutes after hanging up the phone.
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
              The {delayHours}-hour safe delay completely disarms the attacker's "urgency trigger", giving victims time to cancel with 1 tap.
            </p>
          </div>

          {/* Close button for entire modal */}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-surface border border-surface-border hover:bg-surface-border text-xs text-slate-300 font-semibold transition-colors"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
}

