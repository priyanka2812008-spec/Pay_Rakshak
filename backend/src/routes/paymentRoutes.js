import express from 'express';
import {
  inspectPaymentHandler,
  executePaymentHandler,
  getPresetsHandler,
  getRecentTransactionsHandler,
  getUserProfilesHandler,
  getBeneficiariesHandler,
  getDelayedHoldsHandler,
  scheduleDelayedHoldHandler,
  cancelDelayedHoldHandler,
  releaseDelayedHoldHandler,
  getSupabaseStatusHandler
} from '../controllers/paymentController.js';

const router = express.Router();

router.get('/supabase-status', getSupabaseStatusHandler);
router.post('/inspect', inspectPaymentHandler);
router.post('/execute', executePaymentHandler);
router.get('/presets', getPresetsHandler);
router.get('/transactions', getRecentTransactionsHandler);
router.get('/users', getUserProfilesHandler);
router.get('/beneficiaries', getBeneficiariesHandler);

// Anti-Urgency Safe Delayed Release Holds
router.get('/delayed-holds', getDelayedHoldsHandler);
router.post('/schedule-delayed', scheduleDelayedHoldHandler);
router.post('/cancel-delayed/:holdId', cancelDelayedHoldHandler);
router.post('/release-delayed/:holdId', releaseDelayedHoldHandler);

export default router;
