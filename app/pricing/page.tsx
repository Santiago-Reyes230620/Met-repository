"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Check,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Perfect for getting started",
    features: [
      { text: "250+ Grammar exercises", included: true },
      { text: "1000+ Vocabulary words", included: true },
      { text: "15 Reading passages", included: true },
      { text: "Limited Listening practice", included: true },
      { text: "Speaking Practice", included: false },
      { text: "Practice Tests", included: false },
      { text: "Progress Analytics", included: false },
      { text: "Ad-free", included: false },
      { text: "Priority Support", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 9.99,
    period: "month",
    description: "Most popular - ideal for learners",
    highlighted: true,
    features: [
      { text: "All Grammar exercises", included: true },
      { text: "2500+ Vocabulary words", included: true },
      { text: "500+ Reading passages", included: true },
      { text: "Full Listening module", included: true },
      { text: "AI Speaking Practice", included: true },
      { text: "Practice Tests", included: true },
      { text: "Progress Analytics", included: true },
      { text: "Ad-free", included: true },
      { text: "Email Support", included: true },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 19.99,
    period: "month",
    description: "Complete package with advanced prep",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Expert strategy sessions", included: true },
      { text: "Custom Study Plans", included: true },
      { text: "Monthly Progress Reports", included: true },
      { text: "Priority Support", included: true },
      { text: "Advanced Analytics", included: true },
      { text: "Exam Prep Guides", included: true },
      { text: "Certificate of Completion", included: true },
      { text: "Lifetime Access", included: true },
    ],
  },
];

function PricingPageContent() {
  const { user, session, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading } = useSubscription();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan");
  const planRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const paymentProvider = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || "mercadopago";

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      const target = `/pricing?plan=${planId}`;
      router.push(`/login?redirect=${encodeURIComponent(target)}`);
      return;
    }

    if (!session?.access_token) {
      setError("Your session is expired. Please sign in again.");
      return;
    }

    if (planId === "free") {
      router.push("/dashboard");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const endpoint =
        paymentProvider === "mercadopago"
          ? "/api/mercadopago/checkout"
          : "/api/stripe/checkout";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          planId,
          billingPeriod,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.url) {
        throw new Error(result.error || "Failed to start checkout");
      }

      window.location.href = result.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process subscription");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanObject = plans.find((plan) => plan.id === selectedPlan);

  useEffect(() => {
    if (selectedPlan && planRefs.current[selectedPlan]) {
      planRefs.current[selectedPlan]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedPlan]);

  const getPlanButtonLabel = (plan: (typeof plans)[number]) => {
    const currentPlanId = subscription?.plan_id || "free";
    if (currentPlanId === plan.id) return "Current Plan";
    return plan.id === "free" ? "Use Free Plan" : `Choose ${plan.name}`;
  };

  if (authLoading || (user && subLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-card">
      <Navbar />

      {selectedPlanObject ? (
        <div className="sticky top-16 md:top-20 z-50 border-b border-border/10 bg-background/95 backdrop-blur-xl shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] font-semibold text-primary mb-1">Plan seleccionado</p>
                <h2 className="text-xl sm:text-2xl font-bold">{selectedPlanObject.name}</h2>
                <p className="text-sm text-muted-foreground max-w-2xl">
                  Estás viendo este plan. Pulsa el botón para comprarlo o actualizar tu suscripción.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 sm:items-end">
                <div className="text-left sm:text-right">
                  <p className="text-sm text-muted-foreground">Precio</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">
                    ${selectedPlanObject.price === 0 ? "0" : selectedPlanObject.price.toFixed(2)}{selectedPlanObject.price > 0 ? "/month" : ""}
                  </p>
                </div>
                <Button
                  onClick={() => selectedPlanObject && handleSubscribe(selectedPlanObject.id)}
                  disabled={loading || (subscription?.plan_id || "free") === selectedPlanObject.id}
                  className="w-full max-w-xs bg-gradient-to-r from-primary to-chart-2"
                >
                  {(subscription?.plan_id || "free") === selectedPlanObject.id ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      {getPlanButtonLabel(selectedPlanObject)}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Choose the perfect plan for your English learning journey
            </p>
            <div className="inline-flex items-center justify-center gap-4 rounded-full border border-border/50 bg-background/70 px-4 py-3 shadow-sm">
              <span className={billingPeriod === "monthly" ? "font-semibold" : "text-muted-foreground"}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
                className="px-4 py-2 bg-primary/10 rounded-full text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
                {billingPeriod === "monthly" ? "Switch to Yearly" : "Switch to Monthly"}
              </button>
              <span className={billingPeriod === "yearly" ? "font-semibold" : "text-muted-foreground"}>
                Yearly
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                ref={(el) => (planRefs.current[plan.id] = el)}
                className={`relative overflow-visible ${
                  plan.highlighted ? "border-primary shadow-lg md:scale-105" : ""
                } ${plan.id === selectedPlan ? "ring-2 ring-primary/40 shadow-[0_0_0_1px_rgba(96,165,250,0.4)]" : ""}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-chart-2 shadow-lg shadow-primary/30">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">
                        ${plan.price === 0 ? "0" : plan.price.toFixed(2)}
                      </span>
                      {plan.price > 0 && <span className="text-muted-foreground">/{plan.period}</span>}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading || (subscription?.plan_id || "free") === plan.id}
                    className={`w-full ${
                      plan.highlighted ? "bg-gradient-to-r from-primary to-chart-2" : ""
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (subscription?.plan_id || "free") === plan.id ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Current Plan
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        {getPlanButtonLabel(plan)}
                      </>
                    )}
                  </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
              <div>
                <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes, our Free plan includes core features with no credit card required.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground text-sm">
                  We accept all major credit cards and digital payment methods through Stripe.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes, we offer a 7-day money-back guarantee on all paid plans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <PricingPageContent />
    </Suspense>
  );
}
