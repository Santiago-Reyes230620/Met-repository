import Stripe from "stripe";

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required");
  }

  return new Stripe(secretKey, {
    apiVersion: "2026-06-24.dahlia",
  });
}

export function getStripePriceId(planId: string, billingPeriod: "monthly" | "yearly") {
  if (planId === "pro") {
    return billingPeriod === "yearly"
      ? process.env.STRIPE_PRICE_ID_PRO_YEARLY
      : process.env.STRIPE_PRICE_ID_PRO_MONTHLY;
  }

  if (planId === "premium") {
    return billingPeriod === "yearly"
      ? process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY
      : process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY;
  }

  return null;
}

export function getPlanIdFromPriceId(priceId: string): "pro" | "premium" | null {
  const mapping: Record<string, "pro" | "premium"> = {
    [process.env.STRIPE_PRICE_ID_PRO_MONTHLY || ""]: "pro",
    [process.env.STRIPE_PRICE_ID_PRO_YEARLY || ""]: "pro",
    [process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY || ""]: "premium",
    [process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY || ""]: "premium",
  };

  return mapping[priceId] || null;
}
