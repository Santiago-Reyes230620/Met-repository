import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type BillingPeriod = "monthly" | "yearly";
type PlanId = "pro" | "premium";

function getPlanPeriodFromReference(ref?: string | null): {
  userId: string;
  planId: PlanId;
  billingPeriod: BillingPeriod;
} | null {
  if (!ref) return null;

  const [userId, planIdRaw, billingPeriodRaw] = ref.split("|");
  const planId = planIdRaw as PlanId;
  const billingPeriod = billingPeriodRaw as BillingPeriod;

  if (!userId || !["pro", "premium"].includes(planId) || !["monthly", "yearly"].includes(billingPeriod)) {
    return null;
  }

  return {
    userId,
    planId,
    billingPeriod,
  };
}

function getPeriodDates(billingPeriod: BillingPeriod) {
  const now = new Date();
  const end = new Date(now);

  if (billingPeriod === "yearly") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }

  return {
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: end.toISOString(),
  };
}

async function fetchPayment(paymentId: string) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN is required");
  }

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Mercado Pago payment");
  }

  return (await response.json()) as {
    id: number;
    status?: string;
    external_reference?: string;
    metadata?: {
      user_id?: string;
      plan_id?: PlanId;
      billing_period?: BillingPeriod;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      action?: string;
      type?: string;
      data?: { id?: string | number };
    };

    const paymentId = body.data?.id ? String(body.data.id) : request.nextUrl.searchParams.get("data.id") || request.nextUrl.searchParams.get("id");
    const type = body.type || request.nextUrl.searchParams.get("type") || request.nextUrl.searchParams.get("topic");

    if (!paymentId || (type !== "payment" && type !== "merchant_order")) {
      return NextResponse.json({ received: true });
    }

    const payment = await fetchPayment(paymentId);

    if (payment.status !== "approved") {
      return NextResponse.json({ received: true });
    }

    const reference = getPlanPeriodFromReference(payment.external_reference);
    const userId = payment.metadata?.user_id || reference?.userId;
    const planId = payment.metadata?.plan_id || reference?.planId;
    const billingPeriod = payment.metadata?.billing_period || reference?.billingPeriod;

    if (!userId || !planId || !billingPeriod) {
      return NextResponse.json({ received: true });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const period = getPeriodDates(billingPeriod);

    const { error } = await supabaseAdmin.from("user_subscriptions").upsert(
      {
        user_id: userId,
        plan_id: planId,
        status: "active",
        current_period_start: period.currentPeriodStart,
        current_period_end: period.currentPeriodEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      throw error;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Mercado Pago webhook error:", error);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}
