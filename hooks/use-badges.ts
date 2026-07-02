import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useBadges = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<any[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserBadges = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data } = await supabase
        .from('user_badges')
        .select('badge_id, unlocked_at, badges(*)')
        .eq('user_id', user.id);
      
      if (data) {
        setUnlockedBadges(data);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const unlockBadge = useCallback(
    async (badgeId: string) => {
      if (!user) return;
      try {
        const { error } = await supabase
          .from('user_badges')
          .insert({
            user_id: user.id,
            badge_id: badgeId,
          });
        
        if (error && error.code !== 'UNIQUE_VIOLATION') throw error;
        return true;
      } catch (error) {
        console.error('Error unlocking badge:', error);
        return false;
      }
    },
    [user]
  );

  return {
    badges,
    unlockedBadges,
    loading,
    fetchUserBadges,
    unlockBadge,
  };
};

export const predefinedBadges = [
  {
    name: 'First Steps',
    description: 'Complete your first 10 exercises',
    icon_name: 'Footprints',
    badge_type: 'achievement',
    criteria: { exercises_completed: 10 },
  },
  {
    name: 'Century Master',
    description: 'Complete 100 exercises',
    icon_name: 'Zap',
    badge_type: 'achievement',
    criteria: { exercises_completed: 100 },
  },
  {
    name: 'Grammar Expert',
    description: 'Get 9+ score in Grammar',
    icon_name: 'BookOpen',
    badge_type: 'achievement',
    criteria: { grammar_score: 9 },
  },
  {
    name: 'Vocab Master',
    description: 'Get 9+ score in Vocabulary',
    icon_name: 'MessageSquareText',
    badge_type: 'achievement',
    criteria: { vocabulary_score: 9 },
  },
  {
    name: 'Reader',
    description: 'Get 9+ score in Reading',
    icon_name: 'BookOpen',
    badge_type: 'achievement',
    criteria: { reading_score: 9 },
  },
  {
    name: 'Listener',
    description: 'Get 9+ score in Listening',
    icon_name: 'Headphones',
    badge_type: 'achievement',
    criteria: { listening_score: 9 },
  },
  {
    name: '7-Day Streak',
    description: 'Practice 7 days in a row',
    icon_name: 'Flame',
    badge_type: 'streak',
    criteria: { streak_days: 7 },
  },
  {
    name: '30-Day Streak',
    description: 'Practice 30 days in a row',
    icon_name: 'Flame',
    badge_type: 'streak',
    criteria: { streak_days: 30 },
  },
  {
    name: 'Perfect Score',
    description: 'Score 10/10 on any exercise',
    icon_name: 'Trophy',
    badge_type: 'milestone',
    criteria: { perfect_score: true },
  },
  {
    name: 'Goal Getter',
    description: 'Reach your target score',
    icon_name: 'Target',
    badge_type: 'milestone',
    criteria: { reached_goal: true },
  },
];
