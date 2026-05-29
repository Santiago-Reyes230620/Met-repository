"use client";

import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Navbar } from "@/src/components/shared/Navbar";
import { Footer } from "@/src/components/shared/Footer";
import {
  BookOpen,
  Target,
  TrendingUp,
  Award,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  FileText,
  MessageSquareText,
  Clock,
  Star,
  Sparkles,
  Zap,
  Brain,
  Rocket,
} from "lucide-react";
import { useEffect, useState } from "react";

const features = [
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: "Grammar Mastery",
    description: "Master verb tenses, conditionals, articles, and more with AI-powered exercises.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    accent: "hsl(210 100% 50%)",
  },
  {
    icon: <MessageSquareText className="h-8 w-8" />,
    title: "Vocabulary Building",
    description: "Expand your lexicon with contextual learning and spaced repetition.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    accent: "hsl(142 76% 36%)",
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: "Reading Comprehension",
    description: "Develop analytical skills through diverse academic and narrative passages.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    accent: "hsl(48 96% 53%)",
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Adaptive Learning",
    description: "Intelligent system that adapts to your level and focuses on weak areas.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    accent: "hsl(280 85% 65%)",
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
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[95vh] flex items-center pt-20">
        <div className="absolute inset-0 mesh-gradient opacity-60" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[120px] floating opacity-40" />
          <div className="absolute bottom-32 right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-[120px] floating opacity-40" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 right-10 w-64 h-64 bg-accent/10 rounded-full blur-[100px] opacity-30" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <div className={`text-center transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              <div className="inline-flex items-center space-x-3 glass px-6 py-3 rounded-full mb-10 fade-in-up" style={{ animationDelay: '0.1s' }}>
                <Sparkles className="h-5 w-5 text-secondary animate-pulse" />
                <span className="text-sm md:text-base font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Premium English Exam Preparation
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 fade-in-up leading-[1.2]" style={{ animationDelay: '0.2s' }}>
                Master English for
                <br />
                <span className="relative inline-block mt-4">
                  <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Academic Excellence</span>
                  <svg className="absolute -bottom-4 left-0 w-full" viewBox="0 0 400 16" fill="none">
                    <path d="M2 12C80 4 200 4 398 12" stroke="url(#grad)" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(210 100% 50%)" />
                        <stop offset="50%" stopColor="hsl(280 85% 65%)" />
                        <stop offset="100%" stopColor="hsl(48 96% 53%)" />
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
                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:scale-105 text-lg px-12 py-7 rounded-xl shadow-2xl shadow-primary/40 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 group font-semibold"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-10 py-7 rounded-xl glass hover:bg-white/15 transition-all duration-300 font-semibold border-white/20">
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
      <section className="relative border-y border-border/40 bg-gradient-to-b from-background via-card/30 to-background py-20 md:py-28">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group p-6 md:p-8 rounded-2xl glass hover:scale-110 transition-all duration-300 cursor-default stagger-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 mb-4 group-hover:scale-125 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">{stat.value}</div>
                <div className="text-sm md:text-base text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6 fade-in-up">
              <Rocket className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold">Premium Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
              Everything You Need to <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Succeed</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed fade-in-up" style={{ animationDelay: '0.2s' }}>
              Comprehensive tools designed to maximize your exam performance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group premium-card card-hover overflow-hidden stagger-in"
                style={{ animationDelay: `${index * 0.12}s` }}
              >
                <CardContent className="p-8 relative z-10">
                  <div className={`inline-flex ${feature.bgColor} ${feature.color} p-4 rounded-xl mb-6 group-hover:scale-125 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{feature.description}</p>
                  <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-24 md:py-36 bg-gradient-to-b from-card/50 to-background/50 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="fade-in-up">
              <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Progress Tracking</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Track Your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Growth</span> Every Day
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Advanced analytics monitor your performance across all areas, helping you identify strengths and focus on improvement.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4 group fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mt-1 group-hover:scale-125 transition-transform">
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-foreground text-lg font-medium">{benefit.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 rounded-3xl blur-3xl opacity-60" />
              <Card className="relative premium-card overflow-hidden border-white/10">
                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold">Weekly Progress</h3>
                    <Award className="h-6 w-6 text-secondary animate-pulse" />
                  </div>

                  <div className="space-y-6">
                    {[
                      { label: "Grammar", value: 85, color: "from-primary to-blue-400" },
                      { label: "Vocabulary", value: 72, color: "from-emerald-500 to-green-400" },
                      { label: "Reading", value: 68, color: "from-secondary to-amber-400" },
                    ].map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-3">
                          <span className="text-muted-foreground font-semibold">{item.label}</span>
                          <span className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{item.value}%</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000 shimmer`} style={{ width: `${item.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-muted-foreground">
                      <Clock className="h-5 w-5" />
                      <span className="font-semibold">12 hours studied</span>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-secondary/20 to-accent/20 text-secondary font-bold text-sm">
                      +15% this week
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary opacity-90" />
            <div className="absolute inset-0 mesh-gradient opacity-50" />
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />

            <div className="relative p-8 sm:p-12 md:p-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm mb-8 floating">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>

              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
                Ready to Start Your Journey?
              </h2>
              <p className="text-lg md:text-xl mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed">
                Join thousands of successful students. Start your free account today and transform your English skills.
              </p>

              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 text-lg px-12 py-7 rounded-xl shadow-2xl hover:scale-105 transition-all duration-300 group font-semibold"
                >
                  Begin Learning Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              <p className="mt-8 text-sm text-white/70">
                No credit card required • Free forever • Premium content included
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
