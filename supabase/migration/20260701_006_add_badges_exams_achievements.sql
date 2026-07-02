/*
  # Add badges, mock exams, and user achievements

  1. Create badges table for achievements
  2. Create mock_exams table for full practice tests
  3. Create user_achievements junction table
  4. Create weekly_challenges table
  5. Create user_notes table for study notes
*/

-- Badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  badge_type TEXT NOT NULL, -- 'achievement', 'streak', 'milestone'
  criteria JSONB, -- stores criteria like {points_needed: 100, days_streak: 7}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements (many-to-many)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Mock exams (full practice tests)
CREATE TABLE IF NOT EXISTS public.mock_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER, -- total time for exam
  total_questions INTEGER,
  grammar_questions INTEGER,
  vocabulary_questions INTEGER,
  reading_questions INTEGER,
  listening_questions INTEGER,
  speaking_questions INTEGER,
  writing_questions INTEGER,
  difficulty TEXT, -- 'beginner', 'intermediate', 'advanced'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User mock exam attempts
CREATE TABLE IF NOT EXISTS public.mock_exam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mock_exam_id UUID NOT NULL REFERENCES public.mock_exams(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  total_questions INTEGER,
  correct_answers INTEGER,
  score DECIMAL(3,1),
  time_taken_minutes INTEGER,
  section_scores JSONB, -- {grammar: 7.5, vocabulary: 8.0, reading: 6.5, listening: 7.0, speaking: 6.0, writing: 7.5}
  status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weekly challenges
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_start DATE NOT NULL,
  challenge_title TEXT NOT NULL,
  description TEXT,
  target_value INTEGER, -- e.g., 50 exercises, 2 points improvement
  metric TEXT NOT NULL, -- 'exercises_completed', 'score_improvement', 'exercises_per_day'
  reward_points INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User challenge progress
CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, challenge_id)
);

-- User study notes
CREATE TABLE IF NOT EXISTS public.user_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_id TEXT, -- reference to grammar/vocab/reading exercise
  category TEXT, -- 'grammar', 'vocabulary', 'reading', 'listening', 'speaking', 'writing'
  note_text TEXT NOT NULL,
  difficulty_flag BOOLEAN DEFAULT FALSE, -- marked as difficult
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_exam_attempts_user_id ON public.mock_exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_user_id ON public.user_challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON public.user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_exam_attempts_status ON public.mock_exam_attempts(status);
