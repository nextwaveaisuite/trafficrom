-- ============================================================
-- AffordableSafelist – Initial Database Schema
-- Run this in Supabase → SQL Editor
-- ============================================================

-- PROFILES (extends auth.users)
CREATE TABLE public.profiles (
  id                  UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username            TEXT UNIQUE NOT NULL,
  first_name          TEXT,
  last_name           TEXT,
  membership_tier     TEXT DEFAULT 'free' CHECK (membership_tier IN ('free','starter','pro')),
  credits             INTEGER DEFAULT 100,
  emails_sent_today   INTEGER DEFAULT 0,
  total_emails_sent   INTEGER DEFAULT 0,
  subscription_expires TIMESTAMPTZ,
  referrer_id         UUID REFERENCES public.profiles(id),
  stripe_customer_id  TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- EMAIL CAMPAIGNS
CREATE TABLE public.email_campaigns (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject          TEXT NOT NULL,
  message          TEXT NOT NULL,
  target_category  TEXT,
  credits_used     INTEGER NOT NULL,
  recipients_count INTEGER DEFAULT 0,
  opens_count      INTEGER DEFAULT 0,
  clicks_count     INTEGER DEFAULT 0,
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','cancelled')),
  scheduled_send   TIMESTAMPTZ,
  sent_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- CREDIT TRANSACTIONS
CREATE TABLE public.credit_transactions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('earned','purchased','spent','bonus')),
  amount      INTEGER NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- EMAIL TRACKING
CREATE TABLE public.email_tracking (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id  UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  opened_at    TIMESTAMPTZ,
  clicked_at   TIMESTAMPTZ,
  ip_address   INET,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- REFERRALS
CREATE TABLE public.referrals (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id  UUID REFERENCES public.profiles(id) NOT NULL,
  referred_id  UUID REFERENCES public.profiles(id) NOT NULL,
  commission   NUMERIC(10,2) DEFAULT 0,
  paid_out     BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_tracking    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals         ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Email campaigns
CREATE POLICY "Users manage own campaigns"   ON public.email_campaigns FOR ALL USING (auth.uid() = user_id);

-- Credit transactions
CREATE POLICY "Users view own transactions"  ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);

-- Email tracking
CREATE POLICY "Users view own tracking"      ON public.email_tracking FOR SELECT USING (auth.uid() = recipient_id OR auth.uid() IN (SELECT user_id FROM public.email_campaigns WHERE id = campaign_id));

-- Referrals
CREATE POLICY "Users view own referrals"     ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, first_name, last_name, credits)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'firstName', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
    100  -- signup bonus credits
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Spend credits function
CREATE OR REPLACE FUNCTION public.spend_credits(p_user_id UUID, p_amount INTEGER, p_description TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles SET credits = credits - p_amount WHERE id = p_user_id AND credits >= p_amount;
  IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient credits'; END IF;
  INSERT INTO public.credit_transactions (user_id, type, amount, description)
  VALUES (p_user_id, 'spent', p_amount, p_description);
END;
$$;

-- Earn credits function
CREATE OR REPLACE FUNCTION public.earn_credits(p_user_id UUID, p_amount INTEGER, p_description TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles SET credits = credits + p_amount WHERE id = p_user_id;
  INSERT INTO public.credit_transactions (user_id, type, amount, description)
  VALUES (p_user_id, 'earned', p_amount, p_description);
END;
$$;

-- Reset daily send counts (run via Supabase cron or Edge Function daily)
CREATE OR REPLACE FUNCTION public.reset_daily_counts()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles SET emails_sent_today = 0;
END;
$$;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ADMIN SUPPORT (add to profiles table)
-- ============================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Policy: admins can read all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Policy: admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Policy: admins can read all campaigns
CREATE POLICY "Admins can view all campaigns" ON public.email_campaigns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Policy: admins can manage all credit transactions
CREATE POLICY "Admins can manage all transactions" ON public.credit_transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- To make yourself admin, run this in Supabase SQL Editor:
-- UPDATE public.profiles SET is_admin = true WHERE username = 'YOUR_USERNAME';
