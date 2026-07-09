import { useState, useCallback } from 'react';
import { supabase, WeeklyChallenge, UserChallengeProgress } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { mapSupabaseErrorMessage } from '@/lib/supabase-error';

export const useWeeklyChallenges = () => {
  const { user } = useAuth();
  const [currentChallenge, setCurrentChallenge] = useState<WeeklyChallenge | null>(null);
  const [userProgress, setUserProgress] = useState<UserChallengeProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentWeekChallenge = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('week_start', weekStartStr)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCurrentChallenge(data || null);
    } catch (error) {
      const message = mapSupabaseErrorMessage(error);
      console.error('Error fetching weekly challenge:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserChallengeProgress = useCallback(async (challengeId: string) => {
    if (!user) return;
    try {
      setError(null);
      const { data, error } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserProgress(data || null);
    } catch (error) {
      const message = mapSupabaseErrorMessage(error);
      console.error('Error fetching user challenge progress:', message);
      setError(message);
    }
  }, [user]);

  const updateChallengeProgress = useCallback(
    async (challengeId: string, incrementBy: number) => {
      if (!user) return false;
      try {
        setError(null);
        let newProgress = incrementBy;
        
        if (userProgress) {
          newProgress = userProgress.current_progress + incrementBy;
        }

        const { data: existingProgress } = await supabase
          .from('user_challenge_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('challenge_id', challengeId)
          .maybeSingle();

        if (existingProgress) {
          const { error } = await supabase
            .from('user_challenge_progress')
            .update({
              current_progress: newProgress,
              completed: false,
            })
            .eq('id', existingProgress.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('user_challenge_progress')
            .insert({
              user_id: user.id,
              challenge_id: challengeId,
              current_progress: newProgress,
            });

          if (error) throw error;
        }

        setUserProgress(prev => prev ? { ...prev, current_progress: newProgress } : null);
        return true;
      } catch (error) {
        const message = mapSupabaseErrorMessage(error);
        console.error('Error updating challenge progress:', message);
        setError(message);
        return false;
      }
    },
    [user, userProgress]
  );

  const completeChallenge = useCallback(
    async (challengeId: string) => {
      if (!user) return false;
      try {
        setError(null);
        const { error } = await supabase
          .from('user_challenge_progress')
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('challenge_id', challengeId);

        if (error) throw error;
        setUserProgress(prev => prev ? { ...prev, completed: true } : null);
        return true;
      } catch (error) {
        const message = mapSupabaseErrorMessage(error);
        console.error('Error completing challenge:', message);
        setError(message);
        return false;
      }
    },
    [user]
  );

  return {
    currentChallenge,
    userProgress,
    loading,
    error,
    getCurrentWeekChallenge,
    getUserChallengeProgress,
    updateChallengeProgress,
    completeChallenge,
  };
};
