import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { planHasAccess } from "@/lib/subscription-access";
import { mapSupabaseErrorMessage } from "@/lib/supabase-error";

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: "free" | "pro" | "premium";
  status: "active" | "cancelled" | "expired";
  current_period_start: string;
  current_period_end: string;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_price_id?: string | null;
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

        if (data) {
          setSubscription(data);
        } else {
          setSubscription(null);
        }
      } catch (err) {
        setError(mapSupabaseErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const hasAccess = useCallback((feature: string): boolean => {
    if (!subscription) return planHasAccess("free", feature);

    return planHasAccess(subscription.plan_id, feature);
  }, [subscription]);

  const isPremium = useCallback((): boolean => subscription?.plan_id === "premium", [subscription]);
  const isPro = useCallback((): boolean => subscription?.plan_id === "pro", [subscription]);
  const isFree = useCallback((): boolean => !subscription || subscription.plan_id === "free", [subscription]);

  return useMemo(
    () => ({
      subscription,
      loading,
      error,
      hasAccess,
      isPremium,
      isPro,
      isFree,
    }),
    [subscription, loading, error, hasAccess, isPremium, isPro, isFree]
  );
}
