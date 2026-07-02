/*
  # Add user goals and assessment tracking

  1. Add columns to profiles table for goal tracking
  2. Create assessment_results table for initial diagnostic
*/

-- Add goal tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS target_score DECIMAL(3,1),
ADD COLUMN IF NOT EXISTS target_deadline DATE,
ADD COLUMN IF NOT EXISTS has_completed_assessment BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS listening_score DECIMAL(3,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS speaking_score DECIMAL(3,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS writing_score DECIMAL(3,1) DEFAULT 0;

-- Create assessment_results table for initial diagnostic
CREATE TABLE IF NOT EXISTS public.assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  grammar_score DECIMAL(3,1) NOT NULL,
  vocabulary_score DECIMAL(3,1) NOT NULL,
  reading_score DECIMAL(3,1) NOT NULL,
  listening_score DECIMAL(3,1) NOT NULL,
  speaking_score DECIMAL(3,1) NOT NULL,
  writing_score DECIMAL(3,1) NOT NULL,
  overall_score DECIMAL(3,1) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_assessment_results_user_id ON public.assessment_results(user_id);
