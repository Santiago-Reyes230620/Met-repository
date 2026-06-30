import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: "free" | "pro" | "premium";
  status: "active" | "cancelled" | "expired";
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) {
          // Create default free subscription
          const { data: newSub, error: createError } = await supabase
            .from("user_subscriptions")
            .insert([
              {
                user_id: user.id,
                plan_id: "free",
                status: "active",
              },
            ])
            .select()
            .single();

          if (createError) throw createError;
          setSubscription(newSub);
        } else {
          setSubscription(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch subscription");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const hasAccess = (feature: string): boolean => {
    if (!subscription) return false;

    const features: Record<string, string[]> = {
      free: ["grammar", "vocabulary", "reading"],
      pro: ["grammar", "vocabulary", "reading", "listening", "speaking"],
      premium: ["grammar", "vocabulary", "reading", "listening", "speaking", "quiz"],
    };

    return features[subscription.plan_id]?.includes(feature) || false;
  };

  const isPremium = (): boolean => subscription?.plan_id === "premium";
  const isPro = (): boolean => subscription?.plan_id === "pro";
  const isFree = (): boolean => subscription?.plan_id === "free";

  return {
    subscription,
    loading,
    error,
    hasAccess,
    isPremium,
    isPro,
    isFree,
  };
}
