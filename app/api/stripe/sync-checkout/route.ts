import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripeClient, getPlanIdFromPriceId } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type SyncBody = {
  sessionId?: string;
};

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

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripeClient();
    const supabaseAdmin = getSupabaseAdminClient();

    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseAnon.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as SyncBody;
    const sessionId = body.sessionId;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const sessionUserId = session.client_reference_id || session.metadata?.user_id;

    if (!sessionUserId || sessionUserId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
    if (!subscriptionId) {
      return NextResponse.json({ error: "No subscription found for session" }, { status: 400 });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const firstItem = subscription.items.data[0];
    const priceId = firstItem?.price?.id || null;
    const planId = priceId ? getPlanIdFromPriceId(priceId) : null;

    if (!planId) {
      return NextResponse.json({ error: "Unknown price id" }, { status: 400 });
    }

    const status =
      subscription.status === "active" || subscription.status === "trialing"
        ? "active"
        : subscription.status === "canceled"
        ? "cancelled"
        : "expired";

    const period = getSubscriptionPeriod(subscription);

    const { error: upsertError } = await supabaseAdmin.from("user_subscriptions").upsert(
      {
        user_id: user.id,
        plan_id: status === "active" ? planId : "free",
        status,
        stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : null,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        current_period_start: period.currentPeriodStart,
        current_period_end: period.currentPeriodEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (upsertError) {
      throw upsertError;
    }

    return NextResponse.json({ ok: true, planId, status });
  } catch (error) {
    console.error("Stripe sync-checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
