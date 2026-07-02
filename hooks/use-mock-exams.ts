import { useState, useCallback } from 'react';
import { supabase, MockExam, MockExamAttempt } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useMockExams = () => {
  const { user } = useAuth();
  const [mockExams, setMockExams] = useState<MockExam[]>([]);
  const [attempts, setAttempts] = useState<MockExamAttempt[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMockExams = useCallback(async (difficulty?: string) => {
    try {
      setLoading(true);
      let query = supabase.from('mock_exams').select('*');
      
      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      setMockExams(data || []);
    } catch (error) {
      console.error('Error fetching mock exams:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserAttempts = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('mock_exam_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAttempts(data || []);
    } catch (error) {
      console.error('Error fetching attempts:', error);
    }
  }, [user]);

  const startMockExam = useCallback(
    async (mockExamId: string) => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('mock_exam_attempts')
          .insert({
            user_id: user.id,
            mock_exam_id: mockExamId,
            started_at: new Date().toISOString(),
            status: 'in_progress',
            total_questions: 0,
            correct_answers: 0,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error starting mock exam:', error);
        return null;
      }
    },
    [user]
  );

  const completeMockExam = useCallback(
    async (
      attemptId: string,
      correctAnswers: number,
      totalQuestions: number,
      score: number,
      timeTakenMinutes: number,
      sectionScores: Record<string, number>
    ) => {
      try {
        const { error } = await supabase
          .from('mock_exam_attempts')
          .update({
            completed_at: new Date().toISOString(),
            correct_answers: correctAnswers,
            total_questions: totalQuestions,
            score,
            time_taken_minutes: timeTakenMinutes,
            section_scores: sectionScores,
            status: 'completed',
          })
          .eq('id', attemptId);
        
        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error completing mock exam:', error);
        return false;
      }
    },
    []
  );

  return {
    mockExams,
    attempts,
    loading,
    fetchMockExams,
    fetchUserAttempts,
    startMockExam,
    completeMockExam,
  };
};
