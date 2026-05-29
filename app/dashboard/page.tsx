"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
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
  Clock,
  ArrowRight,
  Star,
  Sparkles,
} from "lucide-react";

const quickActions = [
  {
    title: "Grammar Practice",
    description: "Improve your sentence structure with targeted exercises",
    icon: <BookOpen className="h-7 w-7" />,
    href: "/grammar",
    color: "text-primary",
    bgColor: "bg-primary/10",
    gradient: "from-primary/20 to-chart-1/10",
  },
  {
    title: "Vocabulary Builder",
    description: "Expand your word knowledge with contextual learning",
    icon: <MessageSquareText className="h-7 w-7" />,
    href: "/vocabulary",
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    gradient: "from-chart-2/20 to-chart-4/10",
  },
  {
    title: "Reading Practice",
    description: "Enhance comprehension skills with diverse passages",
    icon: <FileText className="h-7 w-7" />,
    href: "/reading",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    gradient: "from-chart-3/20 to-chart-5/10",
  },
  {
    title: "Take a Quiz",
    description: "Test your overall knowledge with adaptive tests",
    icon: <Target className="h-7 w-7" />,
    href: "/quiz",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    gradient: "from-chart-4/20 to-primary/10",
  },
];

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    setMounted(true);
  }, [user, loading, router]);

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
              <Link href="/quiz" className="hidden md:block">
                <Button className="bg-gradient-to-r from-primary to-chart-2 hover:scale-105 transition-all duration-300 text-base px-6">
                  Quick Quiz
                  <ArrowRight className="ml-2 h-4 w-4" />
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
            {/* Progress Section */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              <Card className="premium-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl md:text-2xl">Your Progress</CardTitle>
                  <CardDescription className="text-base">
                    Track your performance across different areas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-semibold text-base">Grammar</span>
                      </div>
                      <span className="text-lg font-bold text-gradient">{grammarScore}%</span>
                    </div>
                    <Progress value={grammarScore} className="h-3 rounded-full" />
                    <p className="text-sm text-muted-foreground">
                      {grammarScore >= 80
                        ? "Excellent! Keep up the great work!"
                        : grammarScore >= 60
                        ? "Good progress! A bit more practice and you'll master it."
                        : "Keep practicing to improve your grammar skills."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-chart-2/10">
                          <MessageSquareText className="h-4 w-4 text-chart-2" />
                        </div>
                        <span className="font-semibold text-base">Vocabulary</span>
                      </div>
                      <span className="text-lg font-bold text-gradient">{vocabularyScore}%</span>
                    </div>
                    <Progress value={vocabularyScore} className="h-3 rounded-full" />
                    <p className="text-sm text-muted-foreground">
                      {vocabularyScore >= 80
                        ? "Outstanding vocabulary skills!"
                        : vocabularyScore >= 60
                        ? "Building a solid foundation in vocabulary."
                        : "Expand your vocabulary with more practice."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-chart-3/10">
                          <FileText className="h-4 w-4 text-chart-3" />
                        </div>
                        <span className="font-semibold text-base">Reading</span>
                      </div>
                      <span className="text-lg font-bold text-gradient">{readingScore}%</span>
                    </div>
                    <Progress value={readingScore} className="h-3 rounded-full" />
                    <p className="text-sm text-muted-foreground">
                      {readingScore >= 80
                        ? "Excellent reading comprehension!"
                        : readingScore >= 60
                        ? "Good comprehension skills developing."
                        : "Practice reading to improve comprehension."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Quick Actions</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Card
                      key={index}
                      className="premium-card cursor-pointer group"
                      onClick={() => router.push(action.href)}
                    >
                      <CardContent className="p-5 md:p-6 relative z-10">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 md:p-4 rounded-xl ${action.bgColor} ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                            {action.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold mb-1 text-base md:text-lg">{action.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                            <div className="flex items-center text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
                              Start Practice
                              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                    { text: "Review incorrect answers to learn", color: "bg-chart-2" },
                    { text: "Read diverse materials for vocabulary", color: "bg-chart-3" },
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
