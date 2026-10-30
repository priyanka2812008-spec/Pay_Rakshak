import express from 'express';
import { getAnalyticsOverviewHandler } from '../controllers/analyticsController.js';
import { getRulesHandler, updateRuleHandler } from '../controllers/rulesController.js';

export const analyticsRouter = express.Router();
analyticsRouter.get('/overview', getAnalyticsOverviewHandler);

export const rulesRouter = express.Router();
rulesRouter.get('/', getRulesHandler);
rulesRouter.patch('/:ruleId', updateRuleHandler);

