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

    let existingCustomerId: string | null = null;
    try {
      const supabaseAdmin = getSupabaseAdminClient();
      const { data: existingSubscription } = await supabaseAdmin
        .from("user_subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();

      existingCustomerId = existingSubscription?.stripe_customer_id || null;
    } catch (adminError) {
      // Do not block checkout creation when admin client is misconfigured.
      console.warn("Checkout: admin client unavailable, creating session without existing customer", adminError);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const createCheckoutSession = async (customerId?: string | null) => {
      return stripe.checkout.sessions.create({
        mode: "subscription",
        success_url: `${appUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/pricing?checkout=cancelled&plan=${planId}`,
        client_reference_id: user.id,
        customer: customerId || undefined,
        customer_email: customerId ? undefined : user.email,
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: {
          user_id: user.id,
          plan_id: planId,
          billing_period: billingPeriod,
        },
        allow_promotion_codes: true,
      });
    };

    let session;
    try {
      session = await createCheckoutSession(existingCustomerId);
    } catch (checkoutError) {
      const message =
        (checkoutError as { raw?: { message?: string } })?.raw?.message ||
        (checkoutError as Error)?.message ||
        "";

      // Recover from stale customer IDs by retrying without passing customer.
      if (existingCustomerId && /no such customer/i.test(message)) {
        session = await createCheckoutSession(null);
      } else {
        throw checkoutError;
      }
    }

    if (!session.url) {
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    const details = error as {
      message?: string;
      raw?: { message?: string; code?: string; type?: string };
      code?: string;
      type?: string;
    };

    const message = details.raw?.message || details.message || "Internal server error";
    const code = details.raw?.code || details.code;
    const type = details.raw?.type || details.type;

    if (error instanceof Error) {
      if (
        message.includes("STRIPE_SECRET_KEY") ||
        message.includes("NEXT_PUBLIC_SUPABASE_URL") ||
        message.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
        message.includes("SUPABASE_SERVICE_ROLE_KEY")
      ) {
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    if (type?.includes("Stripe") || code || message.toLowerCase().includes("stripe")) {
      return NextResponse.json({ error: message, code }, { status: 400 });
    }

    // Always return the real error message to simplify production diagnostics.
    return NextResponse.json(
      {
        error: message || "Unknown checkout error",
        code: code || "checkout_unknown_error",
      },
      { status: 500 }
    );
  }
}
