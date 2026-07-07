import { NextRequest, NextResponse } from "next/server";
import { getStripeClient, getPlanIdFromPriceId } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function mapStripeSubscriptionStatus(status: string): "active" | "cancelled" | "expired" {
  if (status === "active" || status === "trialing") {
    return "active";
  }

  if (status === "canceled") {
    return "cancelled";
  }

  return "expired";
}

function getSubscriptionPeriod(subscription: {
  items: {
    data: Array<{
      current_period_start?: number;
      current_period_end?: number;
    }>;
  };
}) {
  const firstItem = subscription.items.data[0];

  return {
    currentPeriodStart: firstItem?.current_period_start
      ? new Date(firstItem.current_period_start * 1000).toISOString()
      : new Date().toISOString(),
    currentPeriodEnd: firstItem?.current_period_end
      ? new Date(firstItem.current_period_end * 1000).toISOString()
      : null,
  };
}

async function upsertSubscription(params: {
  userId: string;
  planId: "free" | "pro" | "premium";
  status: "active" | "cancelled" | "expired";
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
}) {
  const supabaseAdmin = getSupabaseAdminClient();
  const {
    userId,
    planId,
    status,
    stripeCustomerId,
    stripeSubscriptionId,
    stripePriceId,
    currentPeriodStart,
    currentPeriodEnd,
  } = params;

  const { error } = await supabaseAdmin.from("user_subscriptions").upsert(
    {
      user_id: userId,
      plan_id: planId,
      status,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      stripe_price_id: stripePriceId,
      current_period_start: currentPeriodStart || new Date().toISOString(),
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const supabaseAdmin = getSupabaseAdminClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
  }

  let event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.client_reference_id || session.metadata?.user_id;

      if (!userId) {
        return NextResponse.json({ received: true });
      }

      const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
      const customerId = typeof session.customer === "string" ? session.customer : null;

      if (!subscriptionId) {
        return NextResponse.json({ received: true });
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const firstItem = subscription.items.data[0];
      const priceId = firstItem?.price?.id || null;
      const planId = priceId ? getPlanIdFromPriceId(priceId) : null;
      const normalizedStatus = mapStripeSubscriptionStatus(subscription.status);
      const period = getSubscriptionPeriod(subscription);

      if (!planId) {
        console.error("Stripe webhook: unknown price id on checkout completion", {
          subscriptionId,
          priceId,
        });
        return NextResponse.json({ received: true });
      }

      await upsertSubscription({
        userId,
        planId: normalizedStatus === "active" ? planId : "free",
        status: normalizedStatus,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        currentPeriodStart: period.currentPeriodStart,
        currentPeriodEnd: period.currentPeriodEnd,
      });
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : null;
      const priceId = subscription.items.data[0]?.price?.id || null;
      const planId = priceId ? getPlanIdFromPriceId(priceId) : null;

      const { data: existing } = await supabaseAdmin
        .from("user_subscriptions")
        .select("user_id")
        .eq("stripe_subscription_id", subscription.id)
        .maybeSingle();

      if (!existing?.user_id) {
        return NextResponse.json({ received: true });
      }

      const status = mapStripeSubscriptionStatus(subscription.status);
      const period = getSubscriptionPeriod(subscription);

      if (status === "active" && !planId) {
        console.error("Stripe webhook: active subscription with unknown price id", {
          subscriptionId: subscription.id,
          priceId,
        });
        return NextResponse.json({ received: true });
      }

      await upsertSubscription({
        userId: existing.user_id,
        planId: status === "active" ? (planId as "pro" | "premium") : "free",
        status,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        currentPeriodStart: period.currentPeriodStart,
        currentPeriodEnd: period.currentPeriodEnd,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handling failed:", error);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}
