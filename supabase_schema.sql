-- ====================================================================
-- PAY RAKSHAK: Supabase PostgreSQL Schema Migration
-- Database: ecqcitnzcentnkdoyzmp.supabase.co
-- Pre-Payment Fraud Intelligence Platform
-- ====================================================================

-- 1. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id TEXT UNIQUE NOT NULL,
    sender_upi TEXT NOT NULL,
    beneficiary_upi TEXT NOT NULL,
    beneficiary_name TEXT,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    category TEXT DEFAULT 'P2P',
    risk_score INTEGER NOT NULL,
    decision_tier TEXT NOT NULL CHECK (decision_tier IN ('ALLOW', 'WARN', 'VERIFY', 'BLOCK')),
    action_taken TEXT DEFAULT 'APPROVED',
    anomaly_flags JSONB DEFAULT '[]'::jsonb,
    scores_breakdown JSONB DEFAULT '{}'::jsonb,
    device_fingerprint TEXT,
    location_city TEXT DEFAULT 'Bengaluru',
    screen_sharing_detected BOOLEAN DEFAULT FALSE,
    is_collect_request BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Beneficiaries Table
CREATE TABLE IF NOT EXISTS public.beneficiaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upi_id TEXT UNIQUE NOT NULL,
    registered_bank_name TEXT NOT NULL,
    account_created_date TIMESTAMPTZ DEFAULT NOW(),
    reputation_score INTEGER DEFAULT 85 CHECK (reputation_score BETWEEN 0 AND 100),
    dispute_count INTEGER DEFAULT 0,
    is_verified_merchant BOOLEAN DEFAULT FALSE,
    is_mule_pattern BOOLEAN DEFAULT FALSE,
    category TEXT DEFAULT 'Peer-to-Peer',
    historical_volume NUMERIC DEFAULT 0,
    last_seen_location TEXT DEFAULT 'Bengaluru',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upi_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    account_number_masked TEXT DEFAULT 'XX9021',
    average_transaction_amount NUMERIC DEFAULT 1500,
    standard_deviation_amount NUMERIC DEFAULT 800,
    max_historical_single_transfer NUMERIC DEFAULT 15000,
    trusted_device_ids JSONB DEFAULT '[]'::jsonb,
    primary_location TEXT DEFAULT 'Bengaluru',
    nocturnal_ratio NUMERIC DEFAULT 0.02,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Risk Evaluations Table (Audit Trail)
CREATE TABLE IF NOT EXISTS public.risk_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id TEXT UNIQUE NOT NULL,
    sender_upi TEXT NOT NULL,
    beneficiary_upi TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    payment_purpose TEXT,
    beneficiary_risk INTEGER NOT NULL,
    transaction_risk INTEGER NOT NULL,
    behavioural_risk INTEGER NOT NULL,
    temporal_risk INTEGER NOT NULL,
    velocity_risk INTEGER NOT NULL,
    network_risk INTEGER NOT NULL,
    intent_risk INTEGER NOT NULL,
    composite_score INTEGER NOT NULL,
    decision_tier TEXT NOT NULL CHECK (decision_tier IN ('ALLOW', 'WARN', 'VERIFY', 'BLOCK')),
    explanations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS) & Public Policies for Demo/Anon Key
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_evaluations ENABLE ROW LEVEL SECURITY;

-- Allow anon read & insert for platform demonstration
CREATE POLICY "Allow public read transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read beneficiaries" ON public.beneficiaries FOR SELECT USING (true);
CREATE POLICY "Allow public insert beneficiaries" ON public.beneficiaries FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read user_profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert user_profiles" ON public.user_profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read risk_evaluations" ON public.risk_evaluations FOR SELECT USING (true);
CREATE POLICY "Allow public insert risk_evaluations" ON public.risk_evaluations FOR INSERT WITH CHECK (true);

-- Seed Initial Verified & Flagged Beneficiaries for Demo
INSERT INTO public.beneficiaries (upi_id, registered_bank_name, reputation_score, dispute_count, is_verified_merchant, is_mule_pattern, category, historical_volume)
VALUES 
    ('rohit.verma@okaxis', 'Rohit Verma', 96, 0, false, false, 'Peer-to-Peer', 125000),
    ('swiggy.orders@icici', 'Bundl Technologies Pvt Ltd (Swiggy)', 99, 0, true, false, 'Merchant', 45000000),
    ('urgent-refund@payrakshak', 'Claim Rewards Desk Ltd', 8, 41, false, true, 'High-Risk Mule', 840000),
    ('mother@payrakshak', 'Savita Sharma', 98, 0, false, false, 'Family & Relatives', 54000)
ON CONFLICT (upi_id) DO NOTHING;
