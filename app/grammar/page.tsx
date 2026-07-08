"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { useDailyLimit } from "@/hooks/use-daily-limit";
import { supabase, GrammarExercise } from "@/lib/supabase/client";
import { FALLBACK_GRAMMAR_EXERCISES } from "@/lib/fallback-content";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DailyLimitAlert } from "@/components/shared/DailyLimitAlert";
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  Loader2,
  Lock,
} from "lucide-react";

const categories = [
  { id: "verb-tenses", name: "Verb Tenses", color: "default" as const },
  { id: "conditionals", name: "Conditionals", color: "secondary" as const },
  { id: "articles", name: "Articles", color: "outline" as const },
  { id: "prepositions", name: "Prepositions", color: "default" as const },
];

export default function GrammarPage() {
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading, hasAccess, isFree } = useSubscription();
  const { dailyCount, canContinue, getRemainingExercises, getTimeUntilReset, incrementDailyCount, DAILY_FREE_LIMIT } = useDailyLimit(isFree());
  const router = useRouter();

  const [exercises, setExercises] = useState<GrammarExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string>("all");
  const [showDailyLimit, setShowDailyLimit] = useState(false);

  const getFallbackExercises = useCallback(() => {
    return FALLBACK_GRAMMAR_EXERCISES.filter((exercise) => {
      const matchesCategory = selectedCategory ? exercise.category === selectedCategory : true;
      const matchesDifficulty = difficulty !== "all" ? exercise.difficulty === difficulty : true;
      return matchesCategory && matchesDifficulty;
    });
  }, [selectedCategory, difficulty]);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from("grammar_exercises").select("*");

      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      if (difficulty !== "all") {
        query = query.eq("difficulty", difficulty);
      }

      const { data, error } = await query.limit(30);

      if (error) throw error;

      const fetchedExercises = (data || []) as GrammarExercise[];
      const fallbackExercises = getFallbackExercises();

      setExercises(fetchedExercises.length > 0 ? fetchedExercises : fallbackExercises);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setCorrectCount(0);
      setAnsweredCount(0);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      setExercises(getFallbackExercises());
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setCorrectCount(0);
      setAnsweredCount(0);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, difficulty, getFallbackExercises]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && user && !subLoading) {
      if (!hasAccess("grammar")) {
        router.push("/pricing");
      } else {
        fetchExercises();
      }
    }
  }, [user, authLoading, router, subLoading, hasAccess, fetchExercises]);

  // Separate effect for checking daily limit
  const checkDailyLimit = useCallback(() => {
    if (!loading && isFree() && !canContinue) {
      setShowDailyLimit(true);
    }
  }, [loading, isFree, canContinue]);

  useEffect(() => {
    checkDailyLimit();
  }, [checkDailyLimit]);

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const checkAnswer = async () => {
    if (!selectedAnswer || !exercises[currentIndex]) return;

    if (isFree() && !canContinue) {
      setShowDailyLimit(true);
      return;
    }

    // Increment daily count for free users
    if (isFree()) {
      await incrementDailyCount();
    }

    const isCorrect = selectedAnswer === exercises[currentIndex].correct_answer;
    setShowResult(true);
    setAnsweredCount((prev) => prev + 1);

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const restartExercises = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectCount(0);
    setAnsweredCount(0);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const currentExercise = exercises[currentIndex];
  const isCorrect = selectedAnswer === currentExercise?.correct_answer;
  const progress = exercises.length > 0 ? ((currentIndex + 1) / exercises.length) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">Grammar Practice</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Grammar Exercises</h1>
            <p className="text-muted-foreground mb-3">
              Improve your grammar skills with interactive practice exercises
            </p>
            {!loading && exercises.length > 0 && (
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
                {exercises.length}+ exercises loaded for practice
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant={!selectedCategory ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All Categories
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Difficulty</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {["all", "easy", "medium", "hard"].map((diff) => (
                    <Button
                      key={diff}
                      variant={difficulty === diff ? "default" : "outline"}
                      className="w-full justify-start capitalize"
                      onClick={() => setDifficulty(diff)}
                    >
                      {diff}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : exercises.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="p-12 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No exercises found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try selecting different categories or difficulty levels
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Question {currentIndex + 1} of {exercises.length}</span>
                      <span className="text-muted-foreground">
                        Score: {correctCount}/{answeredCount}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-chart-2 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Question Card */}
                  <Card className="border-border/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">
                          {currentExercise?.difficulty}
                        </Badge>
                        {currentExercise?.category && (
                          <Badge variant="secondary" className="capitalize">
                            {currentExercise.category}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl mt-4">{currentExercise?.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup value={selectedAnswer || ""} onValueChange={handleAnswer} className="space-y-3">
                        {currentExercise?.options.map((option: string, index: number) => (
                          <div
                            key={index}
                            className={`flex items-center space-x-3 p-4 rounded-lg border transition-all ${
                              showResult
                                ? option === currentExercise.correct_answer
                                  ? "border-chart-2 bg-chart-2/10"
                                  : selectedAnswer === option
                                  ? "border-destructive bg-destructive/10"
                                  : "border-border"
                                : selectedAnswer === option
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <RadioGroupItem value={option} id={`option-${index}`} disabled={showResult} />
                            <Label
                              htmlFor={`option-${index}`}
                              className={`flex-1 cursor-pointer ${
                                showResult && option === currentExercise.correct_answer
                                  ? "text-chart-2 font-medium"
                                  : ""
                              }`}
                            >
                              {option}
                            </Label>
                            {showResult && option === currentExercise.correct_answer && (
                              <CheckCircle2 className="h-5 w-5 text-chart-2" />
                            )}
                            {showResult && selectedAnswer === option && option !== currentExercise.correct_answer && (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                          </div>
                        ))}
                      </RadioGroup>

                      {showResult && currentExercise?.explanation && (
                        <Alert className="mt-6 border-chart-2/50 bg-chart-2/5">
                          <Lightbulb className="h-4 w-4 text-chart-2" />
                          <AlertDescription className="ml-2">
                            {currentExercise.explanation}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex justify-between mt-6">
                        <Button
                          variant="outline"
                          onClick={prevQuestion}
                          disabled={currentIndex === 0}
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Previous
                        </Button>

                        {!showResult ? (
                          <Button
                            onClick={checkAnswer}
                            disabled={!selectedAnswer}
                            className="bg-gradient-to-r from-primary to-chart-2 hover:opacity-90"
                          >
                            Check Answer
                          </Button>
                        ) : currentIndex < exercises.length - 1 ? (
                          <Button
                            onClick={nextQuestion}
                            className="bg-gradient-to-r from-primary to-chart-2 hover:opacity-90"
                          >
                            Next Question
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            onClick={restartExercises}
                            className="bg-gradient-to-r from-primary to-chart-2 hover:opacity-90"
                          >
                            Practice Again
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {isFree() && (
        <DailyLimitAlert
          isOpen={showDailyLimit}
          remaining={getRemainingExercises()}
          limit={DAILY_FREE_LIMIT}
          hoursUntilReset={getTimeUntilReset().hours}
          minutesUntilReset={getTimeUntilReset().minutes}
          onClose={() => setShowDailyLimit(false)}
        />
      )}
    </div>
  );
}
