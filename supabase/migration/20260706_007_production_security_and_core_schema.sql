/*
  # Production hardening: core schema + RLS policies

  1. Create missing core tables used by the app when they do not exist
  2. Enable row level security on user-scoped tables
  3. Add idempotent policies for authenticated users
*/

-- Core tables used by app flows
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT 'Student',
  avatar_url TEXT,
  level TEXT NOT NULL DEFAULT 'beginner',
  total_points INTEGER NOT NULL DEFAULT 0,
  grammar_score DECIMAL(3,1) NOT NULL DEFAULT 0,
  vocabulary_score DECIMAL(3,1) NOT NULL DEFAULT 0,
  reading_score DECIMAL(3,1) NOT NULL DEFAULT 0,
  listening_score DECIMAL(3,1) NOT NULL DEFAULT 0,
  speaking_score DECIMAL(3,1) NOT NULL DEFAULT 0,
  writing_score DECIMAL(3,1) NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  target_score DECIMAL(3,1),
  target_deadline DATE,
  has_completed_assessment BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT user_subscriptions_plan_chk CHECK (plan_id IN ('free', 'pro', 'premium')),
  CONSTRAINT user_subscriptions_status_chk CHECK (status IN ('active', 'cancelled', 'expired')),
  CONSTRAINT user_subscriptions_user_unique UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  exercise_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT daily_usage_unique_user_date UNIQUE (user_id, date)
);

CREATE TABLE IF NOT EXISTS public.grammar_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vocabulary_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  definition TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  example_sentence TEXT,
  part_of_speech TEXT,
  difficulty TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reading_passages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reading_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_id UUID NOT NULL REFERENCES public.reading_passages(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  question_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_usage_user_id_date ON public.daily_usage(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_questions_passage_id ON public.reading_questions(passage_id);

-- Enable RLS on user-scoped tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- Read-only content tables
ALTER TABLE public.grammar_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_select_own'
  ) THEN
    EXECUTE 'CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_insert_own'
  ) THEN
    EXECUTE 'CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_update_own'
  ) THEN
    EXECUTE 'CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id)';
  END IF;

  -- user_subscriptions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_subscriptions' AND policyname = 'user_subscriptions_select_own'
  ) THEN
    EXECUTE 'CREATE POLICY user_subscriptions_select_own ON public.user_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_subscriptions' AND policyname = 'user_subscriptions_insert_own'
  ) THEN
    EXECUTE 'CREATE POLICY user_subscriptions_insert_own ON public.user_subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_subscriptions' AND policyname = 'user_subscriptions_update_own'
  ) THEN
    EXECUTE 'CREATE POLICY user_subscriptions_update_own ON public.user_subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;

  -- daily_usage
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'daily_usage' AND policyname = 'daily_usage_select_own'
  ) THEN
    EXECUTE 'CREATE POLICY daily_usage_select_own ON public.daily_usage FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'daily_usage' AND policyname = 'daily_usage_insert_own'
  ) THEN
    EXECUTE 'CREATE POLICY daily_usage_insert_own ON public.daily_usage FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'daily_usage' AND policyname = 'daily_usage_update_own'
  ) THEN
    EXECUTE 'CREATE POLICY daily_usage_update_own ON public.daily_usage FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;

  -- Shared helper: user_id-scoped tables
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'assessment_results' AND policyname = 'assessment_results_select_own'
  ) THEN
    EXECUTE 'CREATE POLICY assessment_results_select_own ON public.assessment_results FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'assessment_results' AND policyname = 'assessment_results_insert_own'
  ) THEN
    EXECUTE 'CREATE POLICY assessment_results_insert_own ON public.assessment_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_badges' AND policyname = 'user_badges_select_own'
  ) THEN
    EXECUTE 'CREATE POLICY user_badges_select_own ON public.user_badges FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_badges' AND policyname = 'user_badges_insert_own'
  ) THEN
    EXECUTE 'CREATE POLICY user_badges_insert_own ON public.user_badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'mock_exam_attempts' AND policyname = 'mock_exam_attempts_select_own'
  ) THEN
    EXECUTE 'CREATE POLICY mock_exam_attempts_select_own ON public.mock_exam_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'mock_exam_attempts' AND policyname = 'mock_exam_attempts_insert_own'
  ) THEN
    EXECUTE 'CREATE POLICY mock_exam_attempts_insert_own ON public.mock_exam_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'mock_exam_attempts' AND policyname = 'mock_exam_attempts_update_own'
  ) THEN
    EXECUTE 'CREATE POLICY mock_exam_attempts_update_own ON public.mock_exam_attempts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_challenge_progress' AND policyname = 'user_challenge_progress_select_own'
  ) THEN
    EXECUTE 'CREATE POLICY user_challenge_progress_select_own ON public.user_challenge_progress FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_challenge_progress' AND policyname = 'user_challenge_progress_insert_own'
  ) THEN
    EXECUTE 'CREATE POLICY user_challenge_progress_insert_own ON public.user_challenge_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_challenge_progress' AND policyname = 'user_challenge_progress_update_own'
  ) THEN
    EXECUTE 'CREATE POLICY user_challenge_progress_update_own ON public.user_challenge_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_notes' AND policyname = 'user_notes_select_own'
  ) THEN
    EXECUTE 'CREATE POLICY user_notes_select_own ON public.user_notes FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_notes' AND policyname = 'user_notes_insert_own'
  ) THEN
    EXECUTE 'CREATE POLICY user_notes_insert_own ON public.user_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_notes' AND policyname = 'user_notes_update_own'
  ) THEN
    EXECUTE 'CREATE POLICY user_notes_update_own ON public.user_notes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;

  -- content tables readable by authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'grammar_exercises' AND policyname = 'grammar_exercises_select_authenticated'
  ) THEN
    EXECUTE 'CREATE POLICY grammar_exercises_select_authenticated ON public.grammar_exercises FOR SELECT TO authenticated USING (TRUE)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vocabulary_exercises' AND policyname = 'vocabulary_exercises_select_authenticated'
  ) THEN
    EXECUTE 'CREATE POLICY vocabulary_exercises_select_authenticated ON public.vocabulary_exercises FOR SELECT TO authenticated USING (TRUE)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reading_passages' AND policyname = 'reading_passages_select_authenticated'
  ) THEN
    EXECUTE 'CREATE POLICY reading_passages_select_authenticated ON public.reading_passages FOR SELECT TO authenticated USING (TRUE)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reading_questions' AND policyname = 'reading_questions_select_authenticated'
  ) THEN
    EXECUTE 'CREATE POLICY reading_questions_select_authenticated ON public.reading_questions FOR SELECT TO authenticated USING (TRUE)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'mock_exams' AND policyname = 'mock_exams_select_authenticated'
  ) THEN
    EXECUTE 'CREATE POLICY mock_exams_select_authenticated ON public.mock_exams FOR SELECT TO authenticated USING (TRUE)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'weekly_challenges' AND policyname = 'weekly_challenges_select_authenticated'
  ) THEN
    EXECUTE 'CREATE POLICY weekly_challenges_select_authenticated ON public.weekly_challenges FOR SELECT TO authenticated USING (TRUE)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'badges' AND policyname = 'badges_select_authenticated'
  ) THEN
    EXECUTE 'CREATE POLICY badges_select_authenticated ON public.badges FOR SELECT TO authenticated USING (TRUE)';
  END IF;
END $$;
