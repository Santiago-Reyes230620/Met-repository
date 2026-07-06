/*
  # Stripe subscriptions hardening

  1. Extend user_subscriptions for Stripe references
  2. Lock down direct client writes to user_subscriptions
  3. Keep read access for authenticated users on own rows
*/

ALTER TABLE public.user_subscriptions
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id
  ON public.user_subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id
  ON public.user_subscriptions(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

DROP POLICY IF EXISTS user_subscriptions_insert_own ON public.user_subscriptions;
DROP POLICY IF EXISTS user_subscriptions_update_own ON public.user_subscriptions;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_subscriptions' AND policyname = 'user_subscriptions_select_own'
  ) THEN
    EXECUTE 'CREATE POLICY user_subscriptions_select_own ON public.user_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;
