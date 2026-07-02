import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  level: string;
  total_points: number;
  grammar_score: number;
  vocabulary_score: number;
  reading_score: number;
  listening_score: number;
  speaking_score: number;
  writing_score: number;
  streak_days: number;
  last_activity_date?: string;
  target_score?: number;
  target_deadline?: string;
  has_completed_assessment: boolean;
  created_at: string;
  updated_at: string;
};

export type AssessmentResult = {
  id: string;
  user_id: string;
  grammar_score: number;
  vocabulary_score: number;
  reading_score: number;
  listening_score: number;
  speaking_score: number;
  writing_score: number;
  overall_score: number;
  completed_at: string;
  created_at: string;
};

export type Badge = {
  id: string;
  name: string;
  description?: string;
  icon_name?: string;
  badge_type: 'achievement' | 'streak' | 'milestone';
  criteria?: Record<string, any>;
  created_at: string;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_id: string;
  unlocked_at: string;
};

export type MockExam = {
  id: string;
  title: string;
  description?: string;
  duration_minutes?: number;
  total_questions: number;
  grammar_questions: number;
  vocabulary_questions: number;
  reading_questions: number;
  listening_questions: number;
  speaking_questions: number;
  writing_questions: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
};

export type MockExamAttempt = {
  id: string;
  user_id: string;
  mock_exam_id: string;
  started_at?: string;
  completed_at?: string;
  total_questions: number;
  correct_answers: number;
  score?: number;
  time_taken_minutes?: number;
  section_scores?: Record<string, number>;
  status: 'in_progress' | 'completed' | 'abandoned';
  created_at: string;
};

export type WeeklyChallenge = {
  id: string;
  week_start: string;
  challenge_title: string;
  description?: string;
  target_value: number;
  metric: string;
  reward_points: number;
  created_at: string;
};

export type UserChallengeProgress = {
  id: string;
  user_id: string;
  challenge_id: string;
  current_progress: number;
  completed: boolean;
  completed_at?: string;
};

export type UserNote = {
  id: string;
  user_id: string;
  exercise_id?: string;
  category: string;
  note_text: string;
  difficulty_flag: boolean;
  created_at: string;
  updated_at: string;
};

export type GrammarExercise = {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  created_at: string;
};

export type VocabularyExercise = {
  id: string;
  word: string;
  definition: string;
  options: string[];
  correct_answer: string;
  example_sentence?: string;
  part_of_speech?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  created_at: string;
};

export type ReadingPassage = {
  id: string;
  title: string;
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  created_at: string;
};

export type ReadingQuestion = {
  id: string;
  passage_id: string;
  question: string;
  options: string[];
  correct_answer: string;
  question_type: string;
  created_at: string;
};

export type Quiz = {
  id: string;
  user_id: string;
  quiz_type: 'grammar' | 'vocabulary' | 'reading' | 'mixed';
  total_questions: number;
  correct_answers: number;
  score: number;
  completed: boolean;
  started_at: string;
  completed_at?: string;
};

export type QuizAnswer = {
  id: string;
  quiz_id: string;
  question_type: string;
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  answered_at: string;
};

export type UserProgress = {
  id: string;
  user_id: string;
  date: string;
  exercises_completed: number;
  correct_answers: number;
  time_spent: number;
  points_earned: number;
};
