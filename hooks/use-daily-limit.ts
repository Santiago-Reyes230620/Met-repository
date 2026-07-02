import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";

const DAILY_FREE_LIMIT = 5; // 5 exercises per day for free users

export function useDailyLimit(isFreeUser = true) {
  const { user } = useAuth();
  const [dailyCount, setDailyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [canContinue, setCanContinue] = useState(true);

  useEffect(() => {
    if (!user || !isFreeUser) {
      setDailyCount(0);
      setCanContinue(true);
      setLoading(false);
      return;
    }

    const fetchDailyCount = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];

        const { data, error } = await supabase
          .from("daily_usage")
          .select("exercise_count")
          .eq("user_id", user.id)
          .eq("date", today)
          .maybeSingle();

        if (error) throw error;

        const count = data?.exercise_count || 0;
        setDailyCount(count);
        setCanContinue(count < DAILY_FREE_LIMIT);
      } catch (err) {
        console.error("Error fetching daily count:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyCount();
  }, [user, isFreeUser]);

  const incrementDailyCount = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split("T")[0];

      // Check if record exists
      const { data: existing } = await supabase
        .from("daily_usage")
        .select("id, exercise_count")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        // Update existing
        const newCount = existing.exercise_count + 1;
        await supabase
          .from("daily_usage")
          .update({
            exercise_count: newCount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        setDailyCount(newCount);
        setCanContinue(newCount < DAILY_FREE_LIMIT);
      } else {
        // Create new
        await supabase.from("daily_usage").insert([
          {
            user_id: user.id,
            date: today,
            exercise_count: 1,
          },
        ]);

        setDailyCount(1);
        setCanContinue(1 < DAILY_FREE_LIMIT);
      }
    } catch (err) {
      console.error("Error incrementing daily count:", err);
    }
  };

  const getRemainingExercises = () => {
    return Math.max(0, DAILY_FREE_LIMIT - dailyCount);
  };

  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes };
  };

  return {
    dailyCount,
    canContinue,
    loading,
    incrementDailyCount,
    getRemainingExercises,
    getTimeUntilReset,
    DAILY_FREE_LIMIT,
  };
}
