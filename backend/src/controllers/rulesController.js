import { dataStore } from '../services/dataStore.js';

export async function getRulesHandler(req, res) {
  try {
    const rules = await dataStore.getRules();
    return res.status(200).json({ success: true, rules });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateRuleHandler(req, res) {
  try {
    const { ruleId } = req.params;
    const updates = req.body;
    const updated = await dataStore.updateRule(ruleId, updates);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }
    return res.status(200).json({ success: true, rule: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

