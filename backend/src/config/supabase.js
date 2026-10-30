import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ecqcitnzcentnkdoyzmp.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjcWNpdG56Y2VudG5rZG95em1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzOTkzODUsImV4cCI6MjEwODk3NTM4NX0.x01VqoNK1SOR2XtCT1DgqXnMYX7SCy2dQ9gJm0gO9ok';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_0egP1qo9GNXy5pMX1u9o9Q_whGw2SnI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

let isSupabaseOnline = false;

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    // If we reach Supabase without network error, it's connected
    if (!error || error.status !== 500) {
      isPropagatedConnected();
      return true;
    }
    return false;
  } catch (err) {
    console.warn(`[Supabase] Cloud connection warning: ${err.message}`);
    isSupabaseOnline = false;
    return false;
  }
}

function isPropagatedConnected() {
  isSupabaseOnline = true;
  console.log(`[Database] Supabase Cloud Active: ${SUPABASE_URL}`);
  console.log(`[Database] Supabase Project Ref: ecqcitnzcentnkdoyzmp (Connected)`);
}

export function isSupabaseConnected() {
  return isSupabaseOnline;
}

/**
 * Persist risk evaluation and payment to Supabase Cloud
 * Gracefully falls back if table is not yet migrated in Supabase
 */
export async function syncTransactionToSupabase(transactionRecord) {
  if (!isSupabaseOnline && !SUPABASE_URL) return null;
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          transaction_id: transactionRecord.transactionId || `TX-${Date.now()}`,
          sender_upi: transactionRecord.senderUpiId,
          beneficiary_upi: transactionRecord.beneficiaryUpiId,
          amount: transactionRecord.amount,
          risk_score: transactionRecord.compositeScore,
          decision_tier: transactionRecord.decisionTier,
          action_taken: transactionRecord.status || 'EXECUTED',
          scores_breakdown: transactionRecord.scoresBreakdown || {},
          created_at: new Date().toISOString()
        }
      ]);
    if (error) {
      // Table might not be created yet, log debug without crashing
      // console.debug('[Supabase sync notice]', error.message);
      return null;
    }
    return data;
  } catch (err) {
    return null;
  }
}

export { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_PUBLISHABLE_KEY };
