import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type CheckoutBody = {
  planId: "pro" | "premium";
  billingPeriod?: "monthly" | "yearly";
};

const PLAN_AMOUNTS: Record<"pro" | "premium", Record<"monthly" | "yearly", number>> = {
  pro: {
    monthly: Number(process.env.MERCADOPAGO_PRICE_PRO_MONTHLY || 39900),
    yearly: Number(process.env.MERCADOPAGO_PRICE_PRO_YEARLY || 399000),
  },
  premium: {
    monthly: Number(process.env.MERCADOPAGO_PRICE_PREMIUM_MONTHLY || 79900),
    yearly: Number(process.env.MERCADOPAGO_PRICE_PREMIUM_YEARLY || 799000),
  },
};

export async function POST(request: NextRequest) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: "MERCADOPAGO_ACCESS_TOKEN is required" }, { status: 500 });
    }

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

    if (!PLAN_AMOUNTS[planId]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const amount = PLAN_AMOUNTS[planId][billingPeriod];
    if (!amount || Number.isNaN(amount)) {
      return NextResponse.json({ error: "Missing Mercado Pago amount configuration" }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const currencyId = process.env.MERCADOPAGO_CURRENCY_ID || "COP";
    const notificationUrl = `${appUrl}/api/mercadopago/webhook`;

    const externalReference = `${user.id}|${planId}|${billingPeriod}`;

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: `MET Prep ${planId.toUpperCase()} (${billingPeriod})`,
            quantity: 1,
            unit_price: amount,
            currency_id: currencyId,
          },
        ],
        payer: {
          email: user.email,
        },
        external_reference: externalReference,
        metadata: {
          user_id: user.id,
          plan_id: planId,
          billing_period: billingPeriod,
        },
        back_urls: {
          success: `${appUrl}/dashboard?checkout=success&provider=mercadopago`,
          failure: `${appUrl}/pricing?checkout=failed&provider=mercadopago&plan=${planId}`,
          pending: `${appUrl}/pricing?checkout=pending&provider=mercadopago&plan=${planId}`,
        },
        auto_return: "approved",
        notification_url: notificationUrl,
      }),
    });

    const data = (await response.json()) as {
      id?: string;
      init_point?: string;
      sandbox_init_point?: string;
      message?: string;
    };

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.message || "Failed to create Mercado Pago checkout",
        },
        { status: 400 }
      );
    }

    const checkoutUrl = data.init_point || data.sandbox_init_point;
    if (!checkoutUrl) {
      return NextResponse.json({ error: "Mercado Pago did not return a checkout URL" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl, preferenceId: data.id });
  } catch (error) {
    console.error("Mercado Pago checkout error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
