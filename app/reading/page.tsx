"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import { supabase, ReadingPassage, ReadingQuestion } from "@/src/lib/supabase/client";
import { Navbar } from "@/src/components/shared/Navbar";
import { Footer } from "@/src/components/shared/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import {
  FileText,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  Loader2,
  BookMarked,
} from "lucide-react";

export default function ReadingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [passages, setPassages] = useState<(ReadingPassage & { questions: ReadingQuestion[] })[]>([]);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
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
      fetchPassages();
    }
  }, [user, authLoading, difficulty, router]);

  const fetchPassages = async () => {
    setLoading(true);
    try {
      let query = supabase.from("reading_passages").select("*");

      if (difficulty !== "all") {
        query = query.eq("difficulty", difficulty);
      }

      const { data: passagesData, error: passagesError } = await query.limit(5);

      if (passagesError) throw passagesError;

      const passagesWithQuestions = await Promise.all(
        (passagesData || []).map(async (passage) => {
          const { data: questions } = await supabase
            .from("reading_questions")
            .select("*")
            .eq("passage_id", passage.id)
            .order("created_at", { ascending: true });

          return { ...passage, questions: questions || [] };
        })
      );

      setPassages(passagesWithQuestions);
      setCurrentPassageIndex(0);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setCorrectCount(0);
      setAnsweredCount(0);
    } catch (error) {
      console.error("Error fetching passages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const checkAnswer = () => {
    if (!selectedAnswer) return;

    setShowResult(true);
    setAnsweredCount((prev) => prev + 1);

    const currentQuestion = passages[currentPassageIndex]?.questions[currentQuestionIndex];
    if (selectedAnswer === currentQuestion?.correct_answer) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const nextQuestion = () => {
    const currentPassage = passages[currentPassageIndex];
    if (!currentPassage) return;

    if (currentQuestionIndex < currentPassage.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else if (currentPassageIndex < passages.length - 1) {
      setCurrentPassageIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else if (currentPassageIndex > 0) {
      const prevPassage = passages[currentPassageIndex - 1];
      setCurrentPassageIndex((prev) => prev - 1);
      setCurrentQuestionIndex(prevPassage.questions.length - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const restartExercises = () => {
    setCurrentPassageIndex(0);
    setCurrentQuestionIndex(0);
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

  const currentPassage = passages[currentPassageIndex];
  const currentQuestion = currentPassage?.questions[currentQuestionIndex];
  const totalQuestions = passages.reduce((sum, p) => sum + p.questions.length, 0);
  const currentQuestionNumber = passages
    .slice(0, currentPassageIndex)
    .reduce((sum, p) => sum + p.questions.length, 0) + currentQuestionIndex + 1;
  const progress = totalQuestions > 0 ? (currentQuestionNumber / totalQuestions) * 100 : 0;

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
              <span className="text-foreground">Reading Practice</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Reading Comprehension</h1>
            <p className="text-muted-foreground">
              Improve your reading skills with passages and comprehension questions
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
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-chart-3/10 mb-3">
                      <BookMarked className="h-8 w-8 text-chart-3" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Read passages carefully and answer questions to test understanding
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-chart-3" />
                </div>
              ) : passages.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No passages found</h3>
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
                      <span className="text-muted-foreground">
                        Passage {currentPassageIndex + 1} of {passages.length} - Question{" "}
                        {currentQuestionIndex + 1} of {currentPassage?.questions.length || 0}
                      </span>
                      <span className="text-muted-foreground">
                        Score: {correctCount}/{answeredCount}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-chart-3 to-chart-5 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Passage */}
                    <Card className="border-border/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{currentPassage?.title}</CardTitle>
                          <Badge variant="outline" className="capitalize">
                            {currentPassage?.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="prose prose-sm dark:prose-invert">
                            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                              {currentPassage?.content}
                            </p>
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    {/* Question */}
                    <Card className="border-border/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="capitalize">
                            {currentQuestion?.question_type || "Comprehension"}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-2">{currentQuestion?.question}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <RadioGroup
                          value={selectedAnswer || ""}
                          onValueChange={handleAnswer}
                          className="space-y-3"
                        >
                          {currentQuestion?.options.map((option: string, index: number) => (
                            <div
                              key={index}
                              className={`flex items-center space-x-3 p-4 rounded-lg border transition-all ${
                                showResult
                                  ? option === currentQuestion.correct_answer
                                    ? "border-chart-2 bg-chart-2/10"
                                    : selectedAnswer === option
                                    ? "border-destructive bg-destructive/10"
                                    : "border-border"
                                  : selectedAnswer === option
                                  ? "border-chart-3 bg-chart-3/5"
                                  : "border-border hover:border-chart-3/50"
                              }`}
                            >
                              <RadioGroupItem value={option} id={`option-${index}`} disabled={showResult} />
                              <Label
                                htmlFor={`option-${index}`}
                                className={`flex-1 cursor-pointer ${
                                  showResult && option === currentQuestion.correct_answer
                                    ? "text-chart-2 font-medium"
                                    : ""
                                }`}
                              >
                                {option}
                              </Label>
                              {showResult && option === currentQuestion.correct_answer && (
                                <CheckCircle2 className="h-5 w-5 text-chart-2" />
                              )}
                              {showResult &&
                                selectedAnswer === option &&
                                option !== currentQuestion.correct_answer && (
                                  <XCircle className="h-5 w-5 text-destructive" />
                                )}
                            </div>
                          ))}
                        </RadioGroup>

                        {showResult && currentQuestion?.question_type && (
                          <Alert className="mt-6 border-chart-3/50 bg-chart-3/5">
                            <Lightbulb className="h-4 w-4 text-chart-3" />
                            <AlertDescription className="ml-2">
                              Review the passage carefully to understand the context and find the
                              correct answer.
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="flex justify-between mt-6">
                          <Button
                            variant="outline"
                            onClick={prevQuestion}
                            disabled={currentPassageIndex === 0 && currentQuestionIndex === 0}
                          >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Previous
                          </Button>

                          {!showResult ? (
                            <Button
                              onClick={checkAnswer}
                              disabled={!selectedAnswer}
                              className="bg-gradient-to-r from-chart-3 to-chart-5 hover:opacity-90"
                            >
                              Check Answer
                            </Button>
                          ) : currentPassageIndex < passages.length - 1 ||
                            currentQuestionIndex < currentPassage.questions.length - 1 ? (
                            <Button
                              onClick={nextQuestion}
                              className="bg-gradient-to-r from-chart-3 to-chart-5 hover:opacity-90"
                            >
                              Next Question
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              onClick={restartExercises}
                              className="bg-gradient-to-r from-chart-3 to-chart-5 hover:opacity-90"
                            >
                              Practice Again
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
