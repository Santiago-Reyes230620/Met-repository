import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripeClient, getStripePriceId } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type CheckoutBody = {
  planId: "pro" | "premium";
  billingPeriod?: "monthly" | "yearly";
};

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

    const body = (await request.json()) as CheckoutBody;
    const planId = body.planId;
    const billingPeriod = body.billingPeriod || "monthly";

    if (!["pro", "premium"].includes(planId)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceId = getStripePriceId(planId, billingPeriod);
    if (!priceId) {
      return NextResponse.json({ error: "Missing Stripe price configuration" }, { status: 500 });
    }

    const { data: existingSubscription } = await supabaseAdmin
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: `${appUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?checkout=cancelled&plan=${planId}`,
      client_reference_id: user.id,
      customer: existingSubscription?.stripe_customer_id || undefined,
      customer_email: existingSubscription?.stripe_customer_id ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        user_id: user.id,
        plan_id: planId,
        billing_period: billingPeriod,
      },
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
