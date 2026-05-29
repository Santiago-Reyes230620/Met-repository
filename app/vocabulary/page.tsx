"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, VocabularyExercise } from "@/lib/supabase/client";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MessageSquareText,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  BookOpen,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function VocabularyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [exercises, setExercises] = useState<VocabularyExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<string>("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && user) {
      fetchExercises();
    }
  }, [user, authLoading, difficulty, router]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      let query = supabase.from("vocabulary_exercises").select("*");

      if (difficulty !== "all") {
        query = query.eq("difficulty", difficulty);
      }

      const { data, error } = await query.limit(10);

      if (error) throw error;
      setExercises(data || []);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setCorrectCount(0);
      setAnsweredCount(0);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const checkAnswer = () => {
    if (!selectedAnswer || !exercises[currentIndex]) return;

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
              <span className="text-foreground">Vocabulary Practice</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Vocabulary Builder</h1>
            <p className="text-muted-foreground">
              Expand your word knowledge with contextual examples and definitions
            </p>
          </div>

          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="border-border/50">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Difficulty</h3>
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

              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-chart-2/10 mb-3">
                      <BookOpen className="h-8 w-8 text-chart-2" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Learn new words through context and examples
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-chart-2" />
                </div>
              ) : exercises.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="p-12 text-center">
                    <MessageSquareText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No exercises found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try selecting a different difficulty level
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Word {currentIndex + 1} of {exercises.length}</span>
                      <span className="text-muted-foreground">
                        Score: {correctCount}/{answeredCount}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-chart-2 to-chart-4 transition-all duration-300"
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
                        {currentExercise?.part_of_speech && (
                          <Badge variant="secondary" className="capitalize">
                            {currentExercise.part_of_speech}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6 text-center">
                        <h2 className="text-3xl font-bold mb-2 text-gradient">{currentExercise?.word}</h2>
                        <p className="text-muted-foreground">{currentExercise?.definition}</p>
                      </div>

                      {currentExercise?.example_sentence && (
                        <Alert className="mb-6 border-chart-2/50 bg-chart-2/5">
                          <AlertDescription className="text-center italic">
                            &ldquo;{currentExercise.example_sentence}&rdquo;
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="mb-4 text-center text-sm text-muted-foreground">
                        What is the correct meaning of this word?
                      </div>

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
                                ? "border-chart-2 bg-chart-2/5"
                                : "border-border hover:border-chart-2/50"
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
                            className="bg-gradient-to-r from-chart-2 to-chart-4 hover:opacity-90"
                          >
                            Check Answer
                          </Button>
                        ) : currentIndex < exercises.length - 1 ? (
                          <Button
                            onClick={nextQuestion}
                            className="bg-gradient-to-r from-chart-2 to-chart-4 hover:opacity-90"
                          >
                            Next Word
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            onClick={restartExercises}
                            className="bg-gradient-to-r from-chart-2 to-chart-4 hover:opacity-90"
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
    </div>
  );
}
