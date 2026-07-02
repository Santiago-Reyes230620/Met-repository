import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useGoal = () => {
  const { user, profile } = useAuth();
  const [targetScore, setTargetScore] = useState<number | null>(null);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      setTargetScore(profile.target_score || null);
      setDeadline(profile.target_deadline || null);

      // Calculate overall score from profile
      const scores = [
        profile.grammar_score,
        profile.vocabulary_score,
        profile.reading_score,
        profile.listening_score,
        profile.speaking_score,
        profile.writing_score,
      ].filter(score => score > 0);

      if (scores.length > 0) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        setOverallScore(Math.round(avg * 10) / 10);
      }

      // Calculate days remaining
      if (profile.target_deadline) {
        const today = new Date();
        const target = new Date(profile.target_deadline);
        const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        setDaysRemaining(Math.max(0, diff));
      }

      // Calculate progress percentage
      if (profile.target_score && overallScore > 0) {
        const progress = (overallScore / profile.target_score) * 100;
        setProgressPercentage(Math.min(100, Math.round(progress)));
      }

      setLoading(false);
    }
  }, [profile]);

  const setGoal = useCallback(
    async (newTargetScore: number, newDeadline: string) => {
      if (!user) return;

      try {
        setLoading(true);
        const { error } = await supabase
          .from('profiles')
          .update({
            target_score: newTargetScore,
            target_deadline: newDeadline,
          })
          .eq('id', user.id);

        if (error) throw error;

        setTargetScore(newTargetScore);
        setDeadline(newDeadline);
      } catch (error) {
        console.error('Error setting goal:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const getScoreDifference = useCallback(() => {
    if (!targetScore) return 0;
    return Math.round((targetScore - overallScore) * 10) / 10;
  }, [targetScore, overallScore]);

  const getEstimatedDaysToReachGoal = useCallback(() => {
    if (!targetScore || overallScore >= targetScore) return 0;

    const scoreDifference = targetScore - overallScore;
    // Assuming average improvement of 0.1 points per day of practice
    const estimatedDays = Math.ceil(scoreDifference / 0.1);
    return estimatedDays;
  }, [targetScore, overallScore]);

  return {
    targetScore,
    deadline,
    overallScore,
    daysRemaining,
    progressPercentage,
    loading,
    setGoal,
    getScoreDifference,
    getEstimatedDaysToReachGoal,
  };
};
