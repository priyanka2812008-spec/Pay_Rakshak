import React, { useState } from 'react';
import { Code2, Terminal, Copy, Check, Play, Send, Zap } from 'lucide-react';
import { inspectPrePayment } from '../services/api';

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState('curl');
  const [copied, setCopied] = useState(false);
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(
      {
        senderUpiId: 'ramesh.sharma@okhdfcbank',
        beneficiaryUpiId: 'paytm-refund-support@okaxis',
        amount: 49500,
        category: 'Refund Processing',
        velocityLast1Hour: 3,
        velocityLast24Hours: 5,
        transactionHour: 15,
        beneficiaryAgeDays: 0.8,
        screenSharingActive: true,
        isCollectRequest: true
      },
      null,
      2
    )
  );

  const [responseOutput, setResponseOutput] = useState(null);
  const [executing, setExecuting] = useState(false);

  const handleTestApi = async () => {
    setExecuting(true);
    try {
      const parsed = JSON.parse(jsonInput);
      const res = await inspectPrePayment(parsed);
      setResponseOutput(JSON.stringify(res, null, 2));
    } catch (err) {
      setResponseOutput(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setExecuting(false);
    }
  };

  const curlCode = `curl -X POST http://localhost:5000/api/v1/pre-payment/inspect \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(JSON.parse(jsonInput || '{}'))}'`;

  const nodeCode = `import { PayRakshakClient } from '@payrakshak/sdk';

const rakshak = new PayRakshakClient({
  apiKey: process.env.PAYRAKSHAK_API_KEY,
  gatewayEndpoint: 'http://localhost:5000'
});

// Pre-Payment Pre-Routing Interceptor Hook
const assessment = await rakshak.inspectPrePayment({
  senderUpiId: 'ramesh.sharma@okhdfcbank',
  beneficiaryUpiId: 'paytm-refund-support@okaxis',
  amount: 49500,
  screenSharingActive: true,
  isCollectRequest: true
});

if (assessment.riskAssessment.decisionTier === 'BLOCK') {
  // Stop payment before PIN prompt!
  throw new PaymentBlockedSecurityException(assessment.riskAssessment.title);
}`;

  const pythonCode = `import requests

url = "http://localhost:5000/api/v1/pre-payment/inspect"
payload = {
    "senderUpiId": "ramesh.sharma@okhdfcbank",
    "beneficiaryUpiId": "paytm-refund-support@okaxis",
    "amount": 49500,
    "screenSharingActive": True,
    "isCollectRequest": True
}

response = requests.post(url, json=payload)
data = response.json()
print("Risk Score:", data["data"]["riskAssessment"]["compositeScore"])
print("Decision Tier:", data["data"]["riskAssessment"]["decisionTier"])`;

  const getCodeSnippet = () => {
    switch (activeTab) {
      case 'curl':
        return curlCode;
      case 'node':
        return nodeCode;
      case 'python':
        return pythonCode;
      default:
        return curlCode;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Fintech Pre-Routing API & SDK Documentation
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Integrate Pay Rakshak into UPI applications (PhonePe, Google Pay, Paytm, CRED) as an ultra-low-latency pre-routing gatekeeper.
        </p>
      </div>

      {/* Integration Flow Concept */}
      <div className="p-4 rounded-2xl bg-surface-card border border-surface-border">
        <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold mb-2">
          Fintech Integration Topology
        </h3>
        <div className="p-4 rounded-xl bg-surface border border-surface-border font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
          User Enters Payee & Amount → <span className="text-cyan-400 font-bold">[Pay Rakshak Inspection &lt;15ms]</span> → Tier Check:
          <br />
          &nbsp;&nbsp;↳ <span className="text-emerald-400 font-bold">ALLOW</span> → Prompt UPI PIN → NPCI Switch → Settlement
          <br />
          &nbsp;&nbsp;↳ <span className="text-amber-400 font-bold">WARN</span> → Caution Banner → User Acknowledges → Prompt UPI PIN
          <br />
          &nbsp;&nbsp;↳ <span className="text-orange-400 font-bold">VERIFY</span> → 45s Cooling Delay + Biometric Re-Auth + Reveal Bank Name
          <br />
          &nbsp;&nbsp;↳ <span className="text-red-400 font-bold">BLOCK</span> → Hard Interception → NO PIN Prompt → Auto-Draft NCRP Report
        </div>
      </div>

      {/* Code Snippets and SDKs */}
      <div className="rounded-2xl bg-surface-card border border-surface-border overflow-hidden">
        <div className="px-4 py-3 border-b border-surface-border bg-surface/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {['curl', 'node', 'python'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium uppercase transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-surface border border-surface-border text-xs text-slate-300 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        <div className="p-4 bg-[#0a0f1d] overflow-x-auto font-mono text-xs text-slate-300">
          <pre>{getCodeSnippet()}</pre>
        </div>
      </div>

      {/* Live API Tester / Playground */}
      <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
              Live API Playground (POST /api/v1/pre-payment/inspect)
            </h3>
          </div>
          <button
            onClick={handleTestApi}
            disabled={executing}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-glow-cyan"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{executing ? 'Inspecting...' : 'Send API Request'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400">Request JSON Body:</label>
            <textarea
              rows={12}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-surface-border rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400">Real-Time Response JSON:</label>
            <div className="w-full h-[252px] bg-[#0a0f1d] border border-surface-border rounded-xl p-3 text-xs font-mono text-cyan-300 overflow-y-auto">
              <pre>{responseOutput || '// Click "Send API Request" above to execute pre-payment inspection'}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

