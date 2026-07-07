"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useGoal } from "@/hooks/use-goal";
import { useBadges } from "@/hooks/use-badges";
import { useMockExams } from "@/hooks/use-mock-exams";
import { useWeeklyChallenges } from "@/hooks/use-weekly-challenges";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { GoalProgress } from "@/components/GoalProgress";
import { RecommendedExercises } from "@/components/RecommendedExercises";
import { BadgesDisplay } from "@/components/BadgesDisplay";
import { MockExamsDisplay } from "@/components/MockExamsDisplay";
import { WeeklyChallengeDisplay } from "@/components/WeeklyChallengeDisplay";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/custom-progress";
import {
  BookOpen,
  MessageSquareText,
  FileText,
  Target,
  TrendingUp,
  Flame,
  Trophy,
  ArrowRight,
  Star,
  Sparkles,
  Headphones,
  Mic,
  PenTool,
  Zap,
} from "lucide-react";

const skillCards = [
  {
    title: "Grammar",
    icon: BookOpen,
    href: "/grammar",
    color: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-500",
    count: "156 exercises",
  },
  {
    title: "Vocabulary",
    icon: MessageSquareText,
    href: "/vocabulary",
    color: "from-emerald-500 to-emerald-600",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-500",
    count: "128 exercises",
  },
  {
    title: "Reading",
    icon: FileText,
    href: "/reading",
    color: "from-amber-500 to-amber-600",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-500",
    count: "17 passages",
  },
  {
    title: "Listening",
    icon: Headphones,
    href: "/listening",
    color: "from-rose-500 to-rose-600",
    iconBg: "bg-rose-500/15",
    iconColor: "text-rose-500",
    count: "40 exercises",
  },
  {
    title: "Speaking",
    icon: Mic,
    href: "/speaking",
    color: "from-teal-500 to-teal-600",
    iconBg: "bg-teal-500/15",
    iconColor: "text-teal-500",
    count: "30 exercises",
  },
  {
    title: "Writing",
    icon: PenTool,
    href: "/writing",
    color: "from-violet-500 to-violet-600",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-500",
    count: "27 exercises",
  },
  {
    title: "Daily Quiz",
    icon: Target,
    href: "/quiz",
    color: "from-primary to-chart-2",
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
    count: "15 questions/day",
  },
];

export default function DashboardPage() {
  const { user, profile, session, loading } = useAuth();
  const { targetScore, deadline, overallScore, daysRemaining, progressPercentage } = useGoal();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSyncingCheckout, setIsSyncingCheckout] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
    setMounted(true);
  }, [user, loading, router]);

  useEffect(() => {
    const syncCheckout = async () => {
      if (!user || !session?.access_token) return;

      const params = new URLSearchParams(window.location.search);
      const checkoutStatus = params.get("checkout");
      const sessionId = params.get("session_id");

      if (checkoutStatus !== "success" || !sessionId) return;

      try {
        setIsSyncingCheckout(true);

        const response = await fetch("/api/stripe/sync-checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Failed to sync subscription after checkout");
        }

        // Clean URL params and refresh local subscription/profile hooks.
        router.replace("/dashboard");
        router.refresh();
      } catch (error) {
        console.error("Checkout sync failed:", error);
      } finally {
        setIsSyncingCheckout(false);
      }
    };

    syncCheckout();
  }, [user, session, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-card">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-primary/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const grammarScore = profile?.grammar_score || 0;
  const vocabularyScore = profile?.vocabulary_score || 0;
  const readingScore = profile?.reading_score || 0;
  const totalScore = Math.round((grammarScore + vocabularyScore + readingScore) / 3);

  const progressItems = [
    { label: "Grammar", icon: BookOpen, score: grammarScore, bg: "bg-primary/10", color: "text-primary" },
    { label: "Vocabulary", icon: MessageSquareText, score: vocabularyScore, bg: "bg-chart-2/10", color: "text-chart-2" },
    { label: "Reading", icon: FileText, score: readingScore, bg: "bg-chart-3/10", color: "text-chart-3" },
    { label: "Listening", icon: Headphones, score: 45, bg: "bg-rose-500/10", color: "text-rose-500" },
    { label: "Speaking", icon: Mic, score: 35, bg: "bg-teal-500/10", color: "text-teal-500" },
    { label: "Writing", icon: PenTool, score: 30, bg: "bg-violet-500/10", color: "text-violet-500" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-card/30 to-background">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Welcome Section */}
          <div className={`mb-8 md:mb-12 ${mounted ? 'slide-in-from-bottom' : 'opacity-0'}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-4">
                  <Sparkles className="h-4 w-4 text-chart-3" />
                  <span className="text-sm font-medium">Keep up the great work!</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                  Welcome back, <span className="text-gradient">{profile?.full_name?.split(" ")[0] || "Student"}</span>!
                </h1>
                <p className="text-muted-foreground text-lg">
                  Continue your journey to mastering the Michigan English Test.
                </p>
              </div>
              {isSyncingCheckout && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  Updating your subscription...
                </div>
              )}
              <Link href="/quiz" className="hidden md:block">
                <Button className="bg-gradient-to-r from-primary to-chart-2 hover:scale-105 transition-all duration-300 text-base px-6">
                  <Zap className="mr-2 h-4 w-4" />
                  Daily Quiz
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Overview */}
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12 ${mounted ? 'scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            <Card className="premium-card hover-lift">
              <CardContent className="pt-6 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-chart-3/20 to-chart-3/5">
                    <Trophy className="h-5 w-5 text-chart-3" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-1 text-gradient">{totalScore}%</div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </CardContent>
            </Card>

            <Card className="premium-card hover-lift">
              <CardContent className="pt-6 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-chart-5/20 to-chart-5/5">
                    <Flame className="h-5 w-5 text-chart-5" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-1 text-gradient-gold">{profile?.streak_days || 0}</div>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </CardContent>
            </Card>

            <Card className="premium-card hover-lift">
              <CardContent className="pt-6 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-chart-2/20 to-chart-2/5">
                    <TrendingUp className="h-5 w-5 text-chart-2" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-1">{profile?.total_points || 0}</div>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </CardContent>
            </Card>

            <Card className="premium-card hover-lift">
              <CardContent className="pt-6 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-1 capitalize">{profile?.level || "Beginner"}</div>
                <p className="text-sm text-muted-foreground">Current Level</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className={`grid lg:grid-cols-3 gap-6 md:gap-8 ${mounted ? 'slide-in-from-bottom' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* Goal Progress */}
              <GoalProgress
                targetScore={targetScore ?? undefined}
                currentScore={overallScore}
                deadline={deadline ?? undefined}
                daysRemaining={daysRemaining}
                progressPercentage={progressPercentage}
                hasGoal={!!targetScore}
              />

              {/* Recommended Exercises */}
              {profile && (
                <RecommendedExercises
                  scores={{
                    grammar: profile.grammar_score || 0,
                    vocabulary: profile.vocabulary_score || 0,
                    reading: profile.reading_score || 0,
                    listening: profile.listening_score || 0,
                    speaking: profile.speaking_score || 0,
                    writing: profile.writing_score || 0,
                  }}
                />
              )}

              {/* Your Progress */}
              <Card className="premium-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl md:text-2xl">Your Progress</CardTitle>
                  <CardDescription className="text-base">
                    Track your performance across all skills
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                    {progressItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2.5">
                              <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${item.bg}`}>
                                <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                              </div>
                              <span className="font-semibold text-sm">{item.label}</span>
                            </div>
                            <span className="text-sm font-bold">{item.score}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${item.color === 'text-primary' ? 'from-primary to-chart-1' : item.color === 'text-chart-2' ? 'from-chart-2 to-chart-4' : item.color === 'text-chart-3' ? 'from-chart-3 to-chart-5' : item.color === 'text-rose-500' ? 'from-rose-500 to-pink-500' : item.color === 'text-teal-500' ? 'from-teal-500 to-cyan-500' : 'from-violet-500 to-purple-500'} transition-all duration-700`}
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Practice Skills */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl md:text-2xl font-bold">Practice Skills</h2>
                  <span className="text-sm text-muted-foreground">{skillCards.length} sections available</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {skillCards.map((skill) => {
                    const Icon = skill.icon;
                    return (
                      <button
                        key={skill.title}
                        onClick={() => router.push(skill.href)}
                        className="group text-left"
                      >
                        <Card className="premium-card h-full transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/30">
                          <CardContent className="p-4 md:p-5 relative z-10 flex flex-col items-center text-center">
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${skill.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                              <Icon className={`h-6 w-6 md:h-7 md:w-7 ${skill.iconColor}`} />
                            </div>
                            <h3 className="font-bold text-sm md:text-base mb-1">{skill.title}</h3>
                            <p className="text-xs text-muted-foreground">{skill.count}</p>
                            <div className={`mt-3 w-7 h-7 rounded-full bg-gradient-to-br ${skill.color} flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300`}>
                              <ArrowRight className="h-3.5 w-3.5 text-white" />
                            </div>
                          </CardContent>
                        </Card>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 md:space-y-8">
              {/* Daily Goal */}
              <Card className="premium-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg md:text-xl">Daily Goal</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-chart-5/20 to-chart-3/10 mb-4 floating">
                      <Flame className="h-12 w-12 md:h-14 md:w-14 text-chart-5" />
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground font-medium">
                      Complete 5 exercises today
                    </p>
                  </div>
                  <Progress value={40} className="h-3 mb-3 rounded-full" />
                  <p className="text-sm text-center text-muted-foreground">
                    2 of 5 exercises completed
                  </p>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="premium-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg md:text-xl">Study Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  {[
                    { text: "Practice regularly - consistency is key", color: "bg-primary" },
                    { text: "Review incorrect answers to learn from mistakes", color: "bg-chart-2" },
                    { text: "Use the daily quiz to test mixed skills", color: "bg-chart-3" },
                    { text: "Listen first, then read the transcript", color: "bg-rose-500" },
                    { text: "Speak out loud even when alone", color: "bg-teal-500" },
                  ].map((tip, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${tip.color} mt-1.5 shrink-0`} />
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tip.text}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
