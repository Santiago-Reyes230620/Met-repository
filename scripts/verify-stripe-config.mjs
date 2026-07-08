import fs from "node:fs";
import path from "node:path";
import Stripe from "stripe";

function loadEnvFile(fileName) {
  const fullPath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(fullPath)) return;

  const lines = fs.readFileSync(fullPath, "utf8").split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq <= 0) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function detectStripeKeyMode(key, livePrefix, testPrefix) {
  if (key.startsWith(livePrefix)) return "live";
  if (key.startsWith(testPrefix)) return "test";
  return null;
}

async function main() {
  loadEnvFile(".env");
  loadEnvFile(".env.local");

  const required = [
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_PRICE_ID_PRO_MONTHLY",
    "STRIPE_PRICE_ID_PRO_YEARLY",
    "STRIPE_PRICE_ID_PREMIUM_MONTHLY",
    "STRIPE_PRICE_ID_PREMIUM_YEARLY",
    "NEXT_PUBLIC_APP_URL",
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error("Missing required Stripe env vars:");
    for (const key of missing) {
      console.error(`- ${key}`);
    }
    process.exit(1);
  }

  const paymentProvider = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || "stripe";
  if (paymentProvider !== "stripe") {
    console.warn(`Warning: NEXT_PUBLIC_PAYMENT_PROVIDER is '${paymentProvider}'. Stripe checkout is not the active provider.`);
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  const secretMode = detectStripeKeyMode(secretKey, "sk_live_", "sk_test_");
  const publishableMode = detectStripeKeyMode(publishableKey, "pk_live_", "pk_test_");

  if (!secretMode || !publishableMode) {
    console.error("Stripe keys do not look valid. Check STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY formats.");
    process.exit(1);
  }

  if (secretMode !== publishableMode) {
    console.error(`Stripe key mode mismatch: secret=${secretMode}, publishable=${publishableMode}.`);
    process.exit(1);
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-06-24.dahlia",
  });

  const expectedLiveMode = secretMode === "live";

  const priceVars = [
    ["STRIPE_PRICE_ID_PRO_MONTHLY", "pro", "monthly"],
    ["STRIPE_PRICE_ID_PRO_YEARLY", "pro", "yearly"],
    ["STRIPE_PRICE_ID_PREMIUM_MONTHLY", "premium", "monthly"],
    ["STRIPE_PRICE_ID_PREMIUM_YEARLY", "premium", "yearly"],
  ];

  const failures = [];

  for (const [envName, plan, period] of priceVars) {
    const priceId = process.env[envName];

    try {
      const price = await stripe.prices.retrieve(priceId);

      if (!price.active) {
        failures.push(`${envName}: ${priceId} is not active`);
      }

      if (!price.recurring) {
        failures.push(`${envName}: ${priceId} is not a recurring price`);
      }

      if (price.livemode !== expectedLiveMode) {
        failures.push(
          `${envName}: ${priceId} mode mismatch (price livemode=${price.livemode}, keys mode=${secretMode})`
        );
      }

      console.log(`OK ${envName} (${plan}/${period}) -> ${priceId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      failures.push(`${envName}: could not retrieve ${priceId} (${message})`);
    }
  }

  if (failures.length > 0) {
    console.error("\nStripe configuration check failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("\nStripe configuration looks valid.");
  console.log(`Mode: ${secretMode}`);
  console.log(`App URL: ${process.env.NEXT_PUBLIC_APP_URL}`);
}

main().catch((error) => {
  console.error("Unexpected error while verifying Stripe config:", error);
  process.exit(1);
});
