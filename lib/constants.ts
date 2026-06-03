/**
 * Constants and configuration values for the MET Practice App
 */

// Application Settings
export const APP_NAME = 'MET Prep';
export const APP_DESCRIPTION = 'Master the Michigan English Test with comprehensive grammar, vocabulary, reading exercises, and practice quizzes.';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://metprep.example.com';
export const APP_VERSION = '0.1.0';

// Authentication
export const MIN_PASSWORD_LENGTH = 8;
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasUppercase: true,
  hasLowercase: true,
  hasNumbers: true,
  hasSpecialChars: true,
};

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  ALL: 'all',
} as const;

// Exercise Types
export const EXERCISE_TYPES = {
  GRAMMAR: 'grammar',
  VOCABULARY: 'vocabulary',
  READING: 'reading',
  QUIZ: 'quiz',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Validation Patterns
export const PATTERNS = {
  EMAIL: /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i,
  PASSWORD_SPECIAL_CHARS: /[!@#$%^&*(),.?":{}|<>]/,
  UPPERCASE: /[A-Z]/,
  LOWERCASE: /[a-z]/,
  NUMBERS: /[0-9]/,
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  GRAMMAR: '/grammar',
  VOCABULARY: '/vocabulary',
  READING: '/reading',
  QUIZ: '/quiz',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  MISSING_CREDENTIALS: 'Please provide both email and password',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_MISMATCH: 'Passwords do not match',
  WEAK_PASSWORD: 'Password does not meet the required criteria',
  ACCOUNT_EXISTS: 'An account with this email already exists. Please sign in instead.',
  INVALID_CREDENTIALS: 'Invalid email or password',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  ACCOUNT_CREATED: 'Account created successfully!',
  SIGNED_IN: 'Signed in successfully!',
  SIGNED_OUT: 'Signed out successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
};

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 4000,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
};

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Social Links
export const SOCIAL_LINKS = {
  GITHUB: 'https://github.com',
  TWITTER: 'https://twitter.com',
  EMAIL: 'mailto:contact@metprep.com',
};
