import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { mapSupabaseErrorMessage } from "@/lib/supabase-error";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";

type BillingPeriod = "monthly" | "yearly";
type PlanId = "pro" | "premium";

const PLAN_AMOUNTS: Record<PlanId, Record<BillingPeriod, number>> = {
  pro: {
    monthly: Number(process.env.MERCADOPAGO_PRICE_PRO_MONTHLY || 39900),
    yearly: Number(process.env.MERCADOPAGO_PRICE_PRO_YEARLY || 399000),
  },
  premium: {
    monthly: Number(process.env.MERCADOPAGO_PRICE_PREMIUM_MONTHLY || 79900),
    yearly: Number(process.env.MERCADOPAGO_PRICE_PREMIUM_YEARLY || 799000),
  },
};

function parseSignatureHeader(signatureHeader: string) {
  const values = signatureHeader
    .split(",")
    .map((entry) => entry.trim())
    .reduce<Record<string, string>>((acc, entry) => {
      const [key, value] = entry.split("=");
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {});

  return {
    ts: values.ts,
    v1: values.v1,
  };
}

function verifyMercadoPagoSignature(request: NextRequest, paymentId: string) {
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return true;
  }

  const signatureHeader = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");

  if (!signatureHeader || !requestId) {
    return false;
  }

  const { ts, v1 } = parseSignatureHeader(signatureHeader);
  if (!ts || !v1) {
    return false;
  }

  const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", webhookSecret).update(manifest).digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(v1, "utf8");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

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
    transaction_amount?: number;
    currency_id?: string;
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

    if (!paymentId || type !== "payment") {
      return NextResponse.json({ received: true });
    }

    if (!verifyMercadoPagoSignature(request, paymentId)) {
      return NextResponse.json({ error: "Invalid Mercado Pago signature" }, { status: 400 });
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

    const expectedAmount = PLAN_AMOUNTS[planId][billingPeriod];
    const expectedCurrency = process.env.MERCADOPAGO_CURRENCY_ID || "COP";

    if (payment.transaction_amount !== expectedAmount || payment.currency_id !== expectedCurrency) {
      console.error("Mercado Pago webhook: amount/currency mismatch", {
        paymentId,
        expectedAmount,
        receivedAmount: payment.transaction_amount,
        expectedCurrency,
        receivedCurrency: payment.currency_id,
      });
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
    const message = mapSupabaseErrorMessage(error);
    console.error("Mercado Pago webhook error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
