import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { testSupabaseConnection, isSupabaseConnected, SUPABASE_URL } from './config/supabase.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { analyticsRouter, rulesRouter } from './routes/analyticsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/v1/pre-payment', paymentRoutes);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/rules', rulesRouter);

// Health check & System info
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Pay Rakshak — Pre-Payment Fraud Intelligence Platform',
    version: '1.0.0',
    mode: 'PRODUCTION_READY',
    supabase: {
      connected: isSupabaseConnected(),
      projectUrl: SUPABASE_URL,
      projectRef: 'ecqcitnzcentnkdoyzmp'
    },
    timestamp: new Date().toISOString(),
    capabilities: [
      'Pre-Execution UPI Inspection',
      'Isolation Forest Anomaly Scoring',
      'VPA Typo-Squatting & Impersonation Engine',
      'Real-time Multi-Factor Decision Pipeline (ALLOW, WARN, VERIFY, BLOCK)',
      'Explainable Risk Decomposition',
      'Supabase Cloud Data Synchronization'
    ]
  });
});

// Start Server
async function startServer() {
  await connectDB();
  await testSupabaseConnection();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  PAY RAKSHAK — PRE-PAYMENT FRAUD INTELLIGENCE      `);
    console.log(`  Stop suspicious payments before money moves.      `);
    console.log(`  Backend Engine active on: http://localhost:${PORT}`);
    console.log(`  Supabase Cloud active on: ${SUPABASE_URL}`);
    console.log(`  Health Check: http://localhost:${PORT}/health     `);
    console.log(`====================================================`);
  });
}

startServer();

