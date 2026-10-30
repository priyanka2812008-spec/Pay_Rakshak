/**
 * Pay Rakshak API Client
 * Interfaces with backend endpoints with resilient error handling
 */

const BASE_URL = '/api/v1';

export async function inspectPrePayment(payload) {
  try {
    const res = await fetch(`${BASE_URL}/pre-payment/inspect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Inspection failed with status ${res.status}`);
    }
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('API inspectPrePayment error:', error);
    throw error;
  }
}

export async function executePayment(evaluationData, userAction = 'PROCEED') {
  try {
    const res = await fetch(`${BASE_URL}/pre-payment/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ evaluationData, userAction })
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('API executePayment error:', error);
    throw error;
  }
}

export async function fetchPresets() {
  try {
    const res = await fetch(`${BASE_URL}/pre-payment/presets`);
    const data = await res.json();
    return data.presets || [];
  } catch (error) {
    console.error('API fetchPresets error:', error);
    return [];
  }
}

export async function fetchRecentTransactions(limit = 30) {
  try {
    const res = await fetch(`${BASE_URL}/pre-payment/transactions?limit=${limit}`);
    const data = await res.json();
    return data.transactions || [];
  } catch (error) {
    console.error('API fetchRecentTransactions error:', error);
    return [];
  }
}

export async function fetchAnalyticsOverview() {
  try {
    const res = await fetch(`${BASE_URL}/analytics/overview`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('API fetchAnalyticsOverview error:', error);
    return null;
  }
}

export async function fetchRules() {
  try {
    const res = await fetch(`${BASE_URL}/rules`);
    const data = await res.json();
    return data.rules || [];
  } catch (error) {
    console.error('API fetchRules error:', error);
    return [];
  }
}

export async function updateRule(ruleId, updates) {
  try {
    const res = await fetch(`${BASE_URL}/rules/${ruleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    return data.rule;
  } catch (error) {
    console.error('API updateRule error:', error);
    throw error;
  }
}

export async function fetchUsers() {
  try {
    const res = await fetch(`${BASE_URL}/pre-payment/users`);
    const data = await res.json();
    return data.users || [];
  } catch (error) {
    console.error('API fetchUsers error:', error);
    return [];
  }
}

// Anti-Urgency Safe Delayed Release API
export async function fetchDelayedHolds() {
  try {
    const res = await fetch(`${BASE_URL}/pre-payment/delayed-holds`);
    const data = await res.json();
    return data.holds || [];
  } catch (error) {
    console.error('API fetchDelayedHolds error:', error);
    return [];
  }
}

export async function scheduleDelayedHold(payload) {
  try {
    const res = await fetch(`${BASE_URL}/pre-payment/schedule-delayed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('API scheduleDelayedHold error:', error);
    throw error;
  }
}

export async function cancelDelayedHold(holdId) {
  try {
    const res = await fetch(`${BASE_URL}/pre-payment/cancel-delayed/${holdId}`, {
      method: 'POST'
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('API cancelDelayedHold error:', error);
    throw error;
  }
}

export async function releaseDelayedHold(holdId) {
  try {
    const res = await fetch(`${BASE_URL}/pre-payment/release-delayed/${holdId}`, {
      method: 'POST'
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('API releaseDelayedHold error:', error);
    throw error;
  }
}

