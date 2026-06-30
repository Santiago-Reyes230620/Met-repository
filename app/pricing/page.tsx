"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { supabase } from "@/lib/supabase/client";
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
      { text: "100+ Grammar exercises", included: true },
      { text: "200+ Vocabulary words", included: true },
      { text: "5 Reading passages", included: true },
      { text: "Limited Listening", included: true },
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
      { text: "1000+ Vocabulary words", included: true },
      { text: "200+ Reading passages", included: true },
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
    description: "Complete package with tutoring",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "1-on-1 Tutoring (2/month)", included: true },
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

export default function PricingPage() {
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading } = useSubscription();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if subscription exists
      const { data: existing } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        // Update existing subscription
        const { error } = await supabase
          .from("user_subscriptions")
          .update({
            plan_id: planId,
            status: "active",
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Create new subscription
        const { error } = await supabase
          .from("user_subscriptions")
          .insert([
            {
              user_id: user.id,
              plan_id: planId,
              status: "active",
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ]);

        if (error) throw error;
      }

      // Small delay to allow subscription to be updated
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process subscription");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-card">
      <Navbar />

      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Choose the perfect plan for your English learning journey
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
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
                className={`relative ${
                  plan.highlighted ? "border-primary shadow-lg md:scale-105" : ""
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-chart-2">
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
                    disabled={loading || subscription?.plan_id === plan.id}
                    className={`w-full ${
                      plan.highlighted ? "bg-gradient-to-r from-primary to-chart-2" : ""
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : subscription?.plan_id === plan.id ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Current Plan
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        {plan.price === 0 ? "Downgrade" : "Upgrade"}
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
