/*
  # Premium benefits persistence + RLS

  Creates user-scoped premium tables so Premium Hub features are backed by real data.
*/

CREATE TABLE IF NOT EXISTS public.premium_study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_date DATE,
  weekly_hours INTEGER NOT NULL DEFAULT 8,
  focus_area TEXT NOT NULL DEFAULT 'mixed',
  plan_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.premium_progress_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_month DATE NOT NULL,
  average_score NUMERIC(5,2) NOT NULL,
  grammar_score NUMERIC(5,2) NOT NULL,
  vocabulary_score NUMERIC(5,2) NOT NULL,
  reading_score NUMERIC(5,2) NOT NULL,
  listening_score NUMERIC(5,2) NOT NULL,
  speaking_score NUMERIC(5,2) NOT NULL,
  writing_score NUMERIC(5,2) NOT NULL,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT premium_progress_reports_user_month_unique UNIQUE (user_id, report_month)
);

CREATE TABLE IF NOT EXISTS public.premium_support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'high',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT premium_support_requests_status_chk CHECK (status IN ('open', 'in_review', 'resolved')),
  CONSTRAINT premium_support_requests_priority_chk CHECK (priority IN ('normal', 'high'))
);

CREATE TABLE IF NOT EXISTS public.premium_strategy_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  slot_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT premium_strategy_sessions_status_chk CHECK (status IN ('booked', 'completed', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS public.premium_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  average_score NUMERIC(5,2) NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_premium_study_plans_user_created ON public.premium_study_plans(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_premium_reports_user_month ON public.premium_progress_reports(user_id, report_month DESC);
CREATE INDEX IF NOT EXISTS idx_premium_support_user_created ON public.premium_support_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_premium_sessions_user_created ON public.premium_strategy_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_premium_certificates_user_issued ON public.premium_certificates(user_id, issued_at DESC);

ALTER TABLE public.premium_study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_strategy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_certificates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- premium_study_plans
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'premium_study_plans' AND policyname = 'premium_study_plans_select_own'
  ) THEN
    EXECUTE 'CREATE POLICY premium_study_plans_select_own ON public.premium_study_plans FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'premium_study_plans' AND policyname = 'premium_study_plans_insert_own'
  ) THEN
    EXECUTE 'CREATE POLICY premium_study_plans_insert_own ON public.premium_study_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;

  -- premium_progress_reports
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'premium_progress_reports' AND policyname = 'premium_progress_reports_select_own'
  ) THEN
    EXECUTE 'CREATE POLICY premium_progress_reports_select_own ON public.premium_progress_reports FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'premium_progress_reports' AND policyname = 'premium_progress_reports_insert_own'
  ) THEN
    EXECUTE 'CREATE POLICY premium_progress_reports_insert_own ON public.premium_progress_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'premium_progress_reports' AND policyname = 'premium_progress_reports_update_own'
  ) THEN
    EXECUTE 'CREATE POLICY premium_progress_reports_update_own ON public.premium_progress_reports FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;

  -- premium_support_requests
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'premium_support_requests' AND policyname = 'premium_support_requests_select_own'
  ) THEN
    EXECUTE 'CREATE POLICY premium_support_requests_select_own ON public.premium_support_requests FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'premium_support_requests' AND policyname = 'premium_support_requests_insert_own'
  ) THEN
    EXECUTE 'CREATE POLICY premium_support_requests_insert_own ON public.premium_support_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;

  -- premium_strategy_sessions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'premium_strategy_sessions' AND policyname = 'premium_strategy_sessions_select_own'
  ) THEN
    EXECUTE 'CREATE POLICY premium_strategy_sessions_select_own ON public.premium_strategy_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'premium_strategy_sessions' AND policyname = 'premium_strategy_sessions_insert_own'
  ) THEN
    EXECUTE 'CREATE POLICY premium_strategy_sessions_insert_own ON public.premium_strategy_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;

  -- premium_certificates
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'premium_certificates' AND policyname = 'premium_certificates_select_own'
  ) THEN
    EXECUTE 'CREATE POLICY premium_certificates_select_own ON public.premium_certificates FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'premium_certificates' AND policyname = 'premium_certificates_insert_own'
  ) THEN
    EXECUTE 'CREATE POLICY premium_certificates_insert_own ON public.premium_certificates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;
