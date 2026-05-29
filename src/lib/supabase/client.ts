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
  streak_days: number;
  last_activity_date?: string;
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
