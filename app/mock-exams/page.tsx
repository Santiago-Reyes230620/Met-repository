"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useMockExams } from "@/hooks/use-mock-exams";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MockExamsDisplay } from "@/components/MockExamsDisplay";
import { BarChart3, Clock, BookOpen, TrendingUp } from "lucide-react";

export default function MockExamsPage() {
  const { user, loading: authLoading } = useAuth();
  const { mockExams, attempts, loading, fetchMockExams, fetchUserAttempts, startMockExam } =
    useMockExams();
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<string>("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetchMockExams(difficulty === "all" ? undefined : difficulty);
    fetchUserAttempts();
  }, [difficulty, fetchMockExams, fetchUserAttempts]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const completedExams = attempts.filter((a) => a.status === "completed");
  const avgScore =
    completedExams.length > 0
      ? (completedExams.reduce((sum, a) => sum + (a.score || 0), 0) / completedExams.length).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card/30 to-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="h-8 w-8 text-blue-400" />
              <h1 className="text-3xl md:text-4xl font-bold">Full Practice Tests</h1>
            </div>
            <p className="text-slate-400">Take complete MET simulations to prepare for the real exam</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="premium-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Tests Completed</p>
                    <p className="text-3xl font-bold text-white">{completedExams.length}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="premium-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Average Score</p>
                    <p className="text-3xl font-bold text-white">{avgScore}/10</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="premium-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Time</p>
                    <p className="text-3xl font-bold text-white">
                      {attempts.reduce((sum, a) => sum + (a.time_taken_minutes || 0), 0)}m
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-2">
            {["all", "beginner", "intermediate", "advanced"].map((level) => (
              <Button
                key={level}
                onClick={() => setDifficulty(level)}
                variant={difficulty === level ? "default" : "outline"}
                className={`capitalize ${
                  difficulty === level
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "border-slate-600 text-slate-300 hover:border-slate-500"
                }`}
              >
                {level}
              </Button>
            ))}
          </div>

          {/* Mock Exams */}
          <MockExamsDisplay
            mockExams={mockExams}
            loading={loading}
            onStartExam={(examId) => router.push(`/mock-exam/${examId}`)}
          />

          {/* Recent Attempts */}
          {completedExams.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Your Recent Tests</h2>
              <div className="space-y-3">
                {completedExams.slice(0, 5).map((attempt) => (
                  <Card key={attempt.id} className="premium-card">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">Test from {new Date(attempt.created_at).toLocaleDateString()}</p>
                          <p className="text-sm text-slate-400">
                            {attempt.correct_answers}/{attempt.total_questions} correct • {attempt.time_taken_minutes} min
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-400">{attempt.score?.toFixed(1)}</p>
                          <p className="text-xs text-slate-400">/10</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
