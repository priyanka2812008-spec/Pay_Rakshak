import { analyzePrePaymentRisk } from '../services/riskEngine.js';
import { dataStore } from '../services/dataStore.js';
import { syncTransactionToSupabase, isSupabaseConnected, SUPABASE_URL, testSupabaseConnection } from '../config/supabase.js';

export async function getSupabaseStatusHandler(req, res) {
  try {
    const isOnline = await testSupabaseConnection();
    return res.status(200).json({
      success: true,
      supabase: {
        connected: isOnline,
        projectUrl: SUPABASE_URL,
        projectRef: 'ecqcitnzcentnkdoyzmp',
        tablesRequired: ['transactions', 'beneficiaries', 'user_profiles', 'risk_evaluations'],
        schemaFile: 'supabase_schema.sql'
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

export async function inspectPaymentHandler(req, res) {
  try {
    const payload = req.body;
    if (!payload.senderUpiId || !payload.beneficiaryUpiId || payload.amount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: senderUpiId, beneficiaryUpiId, amount'
      });
    }

    const evaluation = await analyzePrePaymentRisk(payload);
    return res.status(200).json({
      success: true,
      data: evaluation
    });
  } catch (err) {
    console.error('Error in inspectPaymentHandler:', err);
    return res.status(500).json({
      success: false,
      error: 'Pre-payment risk evaluation failed: ' + err.message
    });
  }
}

export async function executePaymentHandler(req, res) {
  try {
    const { evaluationData, userAction = 'PROCEED' } = req.body;
    if (!evaluationData) {
      return res.status(400).json({
        success: false,
        error: 'Evaluation data required to commit transaction'
      });
    }

    const { transactionInput, riskAssessment, scoresBreakdown, explainability } = evaluationData;

    let finalStatus = 'APPROVED';
    if (riskAssessment.decisionTier === 'BLOCK') {
      finalStatus = 'BLOCKED';
    } else if (riskAssessment.decisionTier === 'VERIFY') {
      finalStatus = userAction === 'VERIFIED' ? 'STEPPED_VERIFIED' : 'CANCELLED';
    } else if (riskAssessment.decisionTier === 'WARN') {
      finalStatus = 'WARNED_PROCEEDED';
    }

    const savedTx = await dataStore.recordTransaction({
      senderUpiId: transactionInput.senderUpiId,
      beneficiaryUpiId: transactionInput.beneficiaryUpiId,
      beneficiaryName: evaluationData.beneficiaryProfile?.registeredBankName || 'Recipient',
      amount: transactionInput.amount,
      category: transactionInput.category || 'P2P',
      riskScore: riskAssessment.compositeScore,
      decisionTier: riskAssessment.decisionTier,
      status: finalStatus,
      anomalyFlags: explainability?.factors?.map(f => f.title) || [],
      riskFactors: explainability?.factors || [],
      locationCity: transactionInput.locationCity || 'Bengaluru',
      screenSharingDetected: transactionInput.screenSharingActive,
      isCollectRequest: transactionInput.isCollectRequest
    });

    // Asynchronously replicate to Supabase Cloud
    syncTransactionToSupabase(savedTx).catch(() => {});

    return res.status(200).json({
      success: true,
      transaction: savedTx,
      message: finalStatus === 'BLOCKED'
        ? 'Payment blocked before execution. Funds safe in sender account.'
        : 'Payment successfully processed.'
    });
  } catch (err) {
    console.error('Error executing payment:', err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

export async function getPresetsHandler(req, res) {
  // Curated 7-Domain presets for hackathon live demo
  const presets = [
    {
      id: 'safe-verified-merchant-demo',
      title: '✅ 1. Verified Merchant ₹480 (ALLOW)',
      description: 'Certified merchant with 18 successful txns. Amount matches baseline habits. Stated intent: Shopping.',
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
      expectedTier: 'ALLOW',
      category: 'SAFE'
    },
    {
      id: 'safe-regular-peer',
      title: '✅ 2. Known Friend ₹1,200 (ALLOW)',
      description: 'Established peer contact with 14 past transactions. Amount within normal range. Stated intent: Friend / Family.',
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
        isCollectRequest: false,
        currentLocation: 'Bengaluru'
      },
      expectedTier: 'ALLOW',
      category: 'SAFE'
    },
    {
      id: 'warn-new-unverified-peer',
      title: '⚠️ 3. First-Time Beneficiary ₹3,500 (WARN)',
      description: 'First payment to brand new contact. Amount slightly above student baseline, no prior fraud association.',
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
        isCollectRequest: false,
        currentLocation: 'Chennai'
      },
      expectedTier: 'WARN',
      category: 'CAUTION'
    },
    {
      id: 'scam-support-refund-block',
      title: '🚫 4. Fake Refund Scam ₹49,500 (BLOCK)',
      description: 'CRITICAL INTENT MISMATCH: User selected "Refund" but money is exiting to an unverified recipient at 3 AM.',
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
      expectedTier: 'BLOCK',
      category: 'PHISHING'
    },
    {
      id: 'verify-unknown-nocturnal',
      title: '🔍 5. High-Value Outlier ₹25,000 (VERIFY)',
      description: 'Large transfer at 2:00 AM off-hours to unverified payee. High behavioural deviation triggers MFA step-up.',
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
      expectedTier: 'VERIFY',
      category: 'BEHAVIORAL_ANOMALY'
    },
    {
      id: 'velocity-burst-attack',
      title: '⚡ 6. Velocity Burst Attack (VERIFY/BLOCK)',
      description: 'Sudden burst of 8 rapid transfers in short window to unfamiliar payee, indicative of automated account drain.',
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
      expectedTier: 'VERIFY',
      category: 'VELOCITY_ATTACK'
    },
    {
      id: 'suspicious-network-mule',
      title: '🕸️ 7. Suspicious Network Mule ₹38,000 (BLOCK)',
      description: 'Synthetic Graph links beneficiary to Jamtara mule cluster 33 with 9 prior cybercrime complaints.',
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
      expectedTier: 'BLOCK',
      category: 'NETWORK_RISK'
    },
    {
      id: 'scam-screenshare-collect',
      title: '🚫 Threat Vector: AnyDesk + Collect Trap',
      description: 'Active remote screen share combined with incoming debit collect trap. Expected: BLOCK.',
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
        isCollectRequest: true,
        currentLocation: 'Bengaluru'
      },
      expectedTier: 'BLOCK',
      category: 'CRITICAL_ATTACK'
    }
  ];

  return res.status(200).json({ success: true, presets });
}

export async function getRecentTransactionsHandler(req, res) {
  try {
    const limit = Number(req.query.limit) || 25;
    const txs = await dataStore.getRecentTransactions(limit);
    return res.status(200).json({ success: true, transactions: txs });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getUserProfilesHandler(req, res) {
  try {
    const users = await dataStore.getAllUsers();
    return res.status(200).json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getBeneficiariesHandler(req, res) {
  try {
    const beneficiaries = await dataStore.getAllBeneficiaries();
    return res.status(200).json({ success: true, beneficiaries });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Delayed Safe Release Holds Handlers (Anti-Urgency Scam Shield)
export async function getDelayedHoldsHandler(req, res) {
  try {
    const holds = await dataStore.getDelayedHolds();
    return res.status(200).json({ success: true, holds });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function scheduleDelayedHoldHandler(req, res) {
  try {
    const { senderUpiId, beneficiaryUpiId, beneficiaryName, amount, delayHours, reason } = req.body;
    if (!senderUpiId || !beneficiaryUpiId || !amount) {
      return res.status(400).json({ success: false, error: 'Missing required hold parameters' });
    }

    const hold = await dataStore.scheduleDelayedHold({
      senderUpiId,
      beneficiaryUpiId,
      beneficiaryName,
      amount,
      delayHours: delayHours || 4,
      reason
    });

    return res.status(200).json({
      success: true,
      hold,
      message: `Payment scheduled. Funds safely locked for ${hold.delayHours} hours with cancel guarantee.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function cancelDelayedHoldHandler(req, res) {
  try {
    const { holdId } = req.params;
    const hold = await dataStore.cancelDelayedHold(holdId);
    if (!hold) {
      return res.status(404).json({ success: false, error: 'Hold record not found' });
    }

    return res.status(200).json({
      success: true,
      hold,
      message: 'Payment cancelled successfully. Full funds restored to sender account.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function releaseDelayedHoldHandler(req, res) {
  try {
    const { holdId } = req.params;
    const hold = await dataStore.releaseDelayedHold(holdId);
    if (!hold) {
      return res.status(404).json({ success: false, error: 'Hold record not found' });
    }

    return res.status(200).json({
      success: true,
      hold,
      message: 'Payment released and routed to recipient.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

