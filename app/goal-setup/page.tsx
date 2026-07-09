"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useGoal } from "@/hooks/use-goal";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Target, AlertCircle, CheckCircle2, Calendar } from "lucide-react";

export default function GoalSetupPage() {
  const { user, loading: authLoading } = useAuth();
  const { setGoal, loading: goalLoading, targetScore, deadline: existingDeadline } = useGoal();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [score, setScore] = useState<number>(6.5);
  const [deadline, setDeadline] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const isEditingExistingGoal = useMemo(
    () => targetScore !== null || !!existingDeadline || searchParams.get("mode") === "edit",
    [targetScore, existingDeadline, searchParams]
  );

  useEffect(() => {
    if (targetScore !== null) {
      setScore(targetScore);
    }

    if (existingDeadline) {
      setDeadline(existingDeadline.split("T")[0]);
    }
  }, [targetScore, existingDeadline]);

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split("T")[0];
  };

  const handleSetGoal = async () => {
    setError("");

    if (!deadline) {
      setError("Please select a deadline date");
      return;
    }

    if (score < 1 || score > 10) {
      setError("Score must be between 1 and 10");
      return;
    }

    try {
      await setGoal(score, deadline);
      setSuccess(true);
      setTimeout(() => {
        router.push(isEditingExistingGoal ? "/dashboard" : "/assessment");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to set goal");
    }
  };

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
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Target className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-3xl text-white">
                {isEditingExistingGoal ? "Update Your MET Goal" : "Set Your MET Goal"}
              </CardTitle>
              <CardDescription className="text-slate-300 text-base">
                {isEditingExistingGoal
                  ? "Adjust your target score and deadline any time based on your progress"
                  : "Define your target score and deadline to get a personalized learning plan"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {success && (
                <Alert className="bg-green-500/20 border-green-500/50">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-300 ml-2">
                    {isEditingExistingGoal ? "Goal updated! Returning to dashboard..." : "Goal saved! Taking you to assessment..."}
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert className="bg-red-500/20 border-red-500/50">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300 ml-2">{error}</AlertDescription>
                </Alert>
              )}

              {/* Score Selection */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-white text-lg font-semibold">Target Score</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-bold text-blue-400">{score.toFixed(1)}</span>
                    <span className="text-slate-400">/10</span>
                  </div>
                </div>

                <Slider
                  value={[score]}
                  onValueChange={(val) => setScore(val[0])}
                  min={1}
                  max={10}
                  step={0.5}
                  className="w-full"
                  disabled={success}
                />

                <div className="flex gap-2 flex-wrap">
                  {[5, 6, 6.5, 7, 8, 9].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setScore(preset)}
                      disabled={success}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                        score === preset
                          ? "bg-blue-500 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      } disabled:opacity-50`}
                    >
                      {preset.toFixed(1)}
                    </button>
                  ))}
                </div>

                <div className="text-sm text-slate-400">
                  <p>MET Scale: 1-3 (Low) • 4-6 (Intermediate) • 7-9 (Advanced) • 10 (Mastery)</p>
                </div>
              </div>

              {/* Deadline Selection */}
              <div className="space-y-4">
                <Label htmlFor="deadline" className="text-white text-lg font-semibold">
                  Target Deadline
                </Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-slate-400" />
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={getMinDate()}
                    disabled={success}
                    className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                  />
                </div>

                {deadline && (
                  <div className="text-sm text-slate-300">
                    {(() => {
                      const today = new Date();
                      const target = new Date(deadline);
                      const days = Math.ceil(
                        (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                      );
                      return `You have ${days} days to reach your goal`;
                    })()}
                  </div>
                )}
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-300">Personalized Learning</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-400">
                    Get exercises tailored to your weaknesses
                  </CardContent>
                </Card>

                <Card className="bg-slate-700/50 border-slate-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-300">Progress Tracking</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-400">
                    Monitor your journey with detailed analytics
                  </CardContent>
                </Card>

                <Card className="bg-slate-700/50 border-slate-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-300">Smart Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-400">
                    AI-powered suggestions for efficient practice
                  </CardContent>
                </Card>

                <Card className="bg-slate-700/50 border-slate-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-300">Deadline Alerts</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-400">
                    Stay on track with timeline reminders
                  </CardContent>
                </Card>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleSetGoal}
                disabled={!deadline || goalLoading || success}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6 text-lg font-semibold disabled:opacity-50"
              >
                {goalLoading
                  ? "Saving Goal..."
                  : success
                  ? "Goal Saved!"
                  : isEditingExistingGoal
                  ? "Save Goal Changes"
                  : "Continue to Assessment"}
              </Button>

              <p className="text-center text-xs text-slate-400">
                You can change your goal anytime in your profile settings
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
