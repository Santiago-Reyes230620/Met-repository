"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import {
  BookOpen,
  Target,
  TrendingUp,
  Award,
  ArrowRight,
  FileText,
  MessageSquareText,
  Clock,
  Star,
  Sparkles,
  Zap,
  Brain,
  Rocket,
  Volume2,
  Headphones,
  PenTool,
  Check,
  X,
} from "lucide-react";

const exerciseTypes = [
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: "Grammar",
    description: "2500+ exercises covering all grammar topics",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    href: "/grammar",
  },
  {
    icon: <MessageSquareText className="h-8 w-8" />,
    title: "Vocabulary",
    description: "4000+ words with context and examples",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    href: "/vocabulary",
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: "Reading",
    description: "500+ passages with comprehension questions",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    href: "/reading",
  },
  {
    icon: <Headphones className="h-8 w-8" />,
    title: "Listening",
    description: "300+ audio drills with native speakers",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    href: "/listening",
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Speaking",
    description: "300+ speech drills with feedback",
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    href: "/speaking",
  },
  {
    icon: <PenTool className="h-8 w-8" />,
    title: "Writing",
    description: "250+ guided writing exercises",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    href: "/writing",
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: "MET Quiz",
    description: "Real MET-style 40-question quiz with instant scoring",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    href: "/quiz",
  },
];

const pricingPlans = [
  {
    name: "Free",
    id: "free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      { text: "30 daily exercises", included: true },
      { text: "Grammar practice", included: true },
      { text: "Vocabulary practice", included: true },
      { text: "Reading practice", included: true },
      { text: "Daily Quiz (5 questions)", included: true },
      { text: "Listening Practice", included: false },
      { text: "Speaking Practice", included: false },
      { text: "Writing Practice", included: false },
      { text: "General MET Mock Exam", included: false },
    ],
    cta: "Try Free",
    highlighted: false,
  },
  {
    name: "Pro",
    id: "pro",
    price: "$9.99",
    period: "/month",
    description: "Most popular - ideal for learners",
    features: [
      { text: "Unlimited daily exercises", included: true },
      { text: "Full Grammar module", included: true },
      { text: "Full Vocabulary module", included: true },
      { text: "Full Reading module", included: true },
      { text: "Full Listening module", included: true },
      { text: "Full Speaking module", included: true },
      { text: "Full Writing module", included: true },
      { text: "Full Daily Quiz", included: true },
      { text: "General MET Mock Exam", included: false },
    ],
    cta: "Get Pro",
    highlighted: true,
  },
  {
    name: "Premium",
    id: "premium",
    price: "$19.99",
    period: "/month",
    description: "Complete package with advanced prep",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "General MET Mock Exam", included: true },
      { text: "Custom Study Plans", included: true },
      { text: "Monthly Progress Reports", included: true },
      { text: "Priority Support", included: true },
      { text: "Advanced Analytics", included: true },
      { text: "Exam Prep Guides", included: true },
      { text: "Certificate of Completion", included: true },
      { text: "Expert strategy sessions", included: true },
    ],
    cta: "Go Premium",
    highlighted: false,
  },
];

const stats = [
  { value: "500+", label: "Practice Questions", icon: <Star className="h-5 w-5" /> },
  { value: "3", label: "Difficulty Levels", icon: <Target className="h-5 w-5" /> },
  { value: "24/7", label: "Anytime Access", icon: <Clock className="h-5 w-5" /> },
  { value: "Real-time", label: "Progress Analytics", icon: <TrendingUp className="h-5 w-5" /> },
];

const benefits = [
  { text: "Refine grammar with intelligent error analysis", icon: Brain },
  { text: "Build vocabulary through context-based learning", icon: BookOpen },
  { text: "Enhance critical reading and analysis skills", icon: FileText },
  { text: "Develop exam confidence with timed practice", icon: Target },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[95vh] flex items-center pt-20">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] floating opacity-40" />
          <div className="absolute bottom-32 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] floating opacity-40" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 right-10 w-64 h-64 bg-accent/10 rounded-full blur-[100px] opacity-30" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center transition-all duration-1000 opacity-100">
              <div className="inline-flex items-center space-x-3 glass px-6 py-3 rounded-full mb-10 fade-in-up" style={{ animationDelay: '0.1s' }}>
                <Sparkles className="h-5 w-5 text-chart-3 animate-pulse" />
                <span className="text-sm md:text-base font-semibold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                  Premium English Exam Preparation
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 fade-in-up leading-[1.2] text-foreground" style={{ animationDelay: '0.2s' }}>
                Master English for
                <br />
                <span className="relative inline-block mt-4">
                  <span className="text-gradient">Academic Excellence</span>
                  <svg className="absolute -bottom-4 left-0 w-full" viewBox="0 0 400 16" fill="none">
                    <path d="M2 12C80 4 200 4 398 12" stroke="url(#grad)" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--chart-2))" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed fade-in-up" style={{ animationDelay: '0.3s' }}>
                Comprehensive preparation platform with interactive exercises, personalized quizzes, and real-time analytics.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-5 fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-primary via-chart-1 to-chart-2 hover:scale-105 text-lg px-12 py-7 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group font-semibold"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-10 py-7 rounded-xl glass hover:bg-white/10 transition-all duration-300 font-semibold">
                    Sign In
                  </Button>
                </Link>
              </div>

              <p className="mt-8 text-sm text-muted-foreground fade-in-up" style={{ animationDelay: '0.5s' }}>
                No credit card required • 100% Free • Join 10,000+ students
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative border-y border-border/30 bg-gradient-to-b from-background via-card to-background py-16 md:py-20">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl glass hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-24 bg-card/80 border-t border-border/10 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-center rounded-[2rem] border border-border bg-background/90 p-10 shadow-xl">
            <div>
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-semibold mb-4">
                MET Practice Quiz
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Practica un quiz estilo MET
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                Realiza un examen de 40 preguntas con el formato Cambridge MET. Recibe puntuación inmediata, retroalimentación y resultados para mejorar tu preparación.
              </p>
              <Link href="/quiz" className="inline-flex">
                <Button size="lg" className="bg-gradient-to-r from-primary via-chart-1 to-chart-2 hover:scale-105 rounded-3xl">
                  Comenzar Quiz MET
                </Button>
              </Link>
            </div>
            <div className="grid gap-4">
              {[
                "40 preguntas de práctica MET",
                "Retroalimentación con puntuación instantánea",
                "Secciones de gramática, lectura y vocabulario",
                "Perfecto para preparación de examen",
              ].map((item) => (
                <div key={item} className="flex gap-3 items-start rounded-3xl bg-background p-5 border border-border">
                  <Check className="h-5 w-5 text-chart-2 mt-1" />
                  <p className="text-foreground font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Exercise Types Section - All integrated */}
      <section className="relative py-24 md:py-36 overflow-hidden bg">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6">
              <Rocket className="h-4 w-4 text-chart-3" />
              <span className="text-sm font-semibold">Complete Learning Platform</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 fade-in-up text-foreground">
              Learn English with <span className="text-gradient">8 Comprehensive Skills</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed fade-in-up">
              Master grammar, vocabulary, reading, listening, speaking and practice tests all in one platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exerciseTypes.map((exercise, index) => (
              <Link key={index} href={exercise.href} className="block">
                <Card
                  className="group premium-card hover-lift overflow-hidden stagger-in h-full cursor-pointer transition-all duration-300"
                  style={{ animationDelay: `${index * 0.12}s` }}
                >
                  <CardContent className="p-8 relative z-10">
                    <div className={`inline-flex ${exercise.bgColor} p-4 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <div className={exercise.color}>
                        {exercise.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{exercise.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{exercise.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-24 md:py-36 bg overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6">
              <Star className="h-4 w-4 text-chart-3" />
              <span className="text-sm font-medium">Transparent Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Choose Your <span className="text-gradient">Learning Plan</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Start free and upgrade anytime. All plans include access to core features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative fade-in-up stagger-in transition-all ${
                  plan.highlighted
                    ? 'md:scale-105 md:shadow-xl'
                    : ''
                }`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {plan.highlighted && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gradient-to-r from-chart-2 to-chart-4 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg shadow-chart-4/30">
                    Most Popular
                  </div>
                )}
                <Card
                  className={`h-full premium-card hover-lift overflow-visible ${
                    plan.highlighted
                      ? 'border-chart-2 shadow-lg'
                      : ''
                  }`}
                >
                  <CardContent className={`p-8 ${plan.highlighted ? 'pt-12' : ''}`}>
                    <h3 className="text-2xl font-bold mb-2 text-foreground">{plan.name}</h3>
                    <p className="text-muted-foreground mb-6">{plan.description}</p>

                    <div className="mb-8">
                      <span className="text-5xl font-bold text-gradient">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                    </div>

                    <Button asChild className={`w-full ${plan.highlighted ? 'bg-gradient-to-r from-chart-2 to-chart-4 hover:scale-105' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                      <Link href={`/pricing?plan=${plan.id}`}>
                        {plan.cta}
                      </Link>
                    </Button>

                    <div className="space-y-4">
                      {plan.features.map((feature, fIndex) => (
                        <div key={fIndex} className="flex items-start space-x-3">
                          {feature.included ? (
                            <Check className="h-5 w-5 text-chart-2 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          )}
                          <span className={feature.included ? "text-foreground font-medium text-sm" : "text-muted-foreground text-sm"}>
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Progress Tracking Section */}
      <section className="relative py-24 md:py-36 bg-gradient-to-b from-card/50 to-background/50 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="slide-in-from-left">
              <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Progress Analytics</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Track Your <span className="text-gradient">Improvement</span> in Real-Time
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Advanced analytics monitor your performance across all areas,
                helping you identify strengths and target areas for improvement.
              </p>

              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-4 group">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-chart-2 to-chart-4 flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-foreground text-lg">{benefit.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-chart-2/30 to-chart-3/30 rounded-3xl blur-3xl opacity-50" />
              <Card className="relative premium-card overflow-visible">
                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold">Weekly Progress</h3>
                    <div className="flex items-center space-x-2">
                      <Award className="h-6 w-6 text-chart-3" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-muted-foreground font-medium">Grammar</span>
                        <span className="font-bold text-gradient">85%</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary via-chart-1 to-chart-2 rounded-full transition-all duration-1000 shimmer" style={{ width: "85%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-muted-foreground font-medium">Vocabulary</span>
                        <span className="font-bold text-gradient">72%</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-chart-2 to-chart-4 rounded-full transition-all duration-1000" style={{ width: "72%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-muted-foreground font-medium">Reading</span>
                        <span className="font-bold text-gradient">68%</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-chart-3 to-chart-5 rounded-full transition-all duration-1000" style={{ width: "68%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-border flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-muted-foreground">
                      <Clock className="h-5 w-5" />
                      <span className="font-medium">12 hours studied</span>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-chart-2/10 text-chart-2 font-bold">
                      +15% this week
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
