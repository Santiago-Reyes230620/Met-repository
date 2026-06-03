/**
 * Shared TypeScript types for the MET Practice App
 */

// Authentication & User Types
export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Difficulty Levels
export type DifficultyLevel = 'all' | 'easy' | 'medium' | 'hard';

// Grammar Exercise Types
export interface GrammarExercise {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: DifficultyLevel;
  category: string;
  created_at: string;
}

// Reading Question Types
export interface ReadingQuestion {
  id: string;
  passage: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: DifficultyLevel;
  topic: string;
  created_at: string;
}

// Quiz Types
export interface QuizQuestion {
  id: string;
  type: 'grammar' | 'vocabulary' | 'reading';
  question: string;
  options: string[];
  correct_answer: number;
  difficulty: DifficultyLevel;
}

export interface QuizResult {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  answers: {
    question_id: string;
    selected_answer: number;
    is_correct: boolean;
  }[];
}

// Vocabulary Types
export interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  example_sentence: string;
  difficulty: DifficultyLevel;
  part_of_speech: string;
  synonyms?: string[];
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error: Error | null;
  success: boolean;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData extends LoginFormData {
  fullName: string;
  confirmPassword: string;
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
