"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, GrammarExercise, VocabularyExercise, ReadingPassage, ReadingQuestion } from "@/lib/supabase/client";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/custom-progress";
import {
  Target,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  ArrowRight,
  Loader2,
} from "lucide-react";

type QuizQuestion = {
  id: string;
  type: "grammar" | "vocabulary" | "reading";
  question: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
  passage?: string;
  passageTitle?: string;
};

export default function QuizPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [fillAnswer, setFillAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeStarted, setTimeStarted] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [difficulty, setDifficulty] = useState<string>("all");
  const [quizType, setQuizType] = useState<string>("mixed");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // This ensures the component is ready without needing user in useEffect for data fetching
  // since data fetching happens when the user manually starts the quiz

  useEffect(() => {
    if (quizStarted && timeStarted) {
      const interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - timeStarted) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [quizStarted, timeStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startQuiz = async () => {
    setLoading(true);
    try {
      const questions: QuizQuestion[] = [];

      if (quizType === "mixed" || quizType === "grammar") {
        let grammarQuery = supabase.from("grammar_exercises").select("*");
        if (difficulty !== "all") {
          grammarQuery = grammarQuery.eq("difficulty", difficulty);
        }
        const { data: grammarData } = await grammarQuery.limit(quizType === "mixed" ? 4 : 10);
        (grammarData || []).forEach((g) => {
          questions.push({
            id: g.id,
            type: "grammar",
            question: g.question,
            options: g.options,
            correct_answer: g.correct_answer,
            explanation: g.explanation,
          });
        });
      }

      if (quizType === "mixed" || quizType === "vocabulary") {
        let vocabQuery = supabase.from("vocabulary_exercises").select("*");
        if (difficulty !== "all") {
          vocabQuery = vocabQuery.eq("difficulty", difficulty);
        }
        const { data: vocabData } = await vocabQuery.limit(quizType === "mixed" ? 4 : 10);
        (vocabData || []).forEach((v) => {
          questions.push({
            id: v.id,
            type: "vocabulary",
            question: `What does "${v.word}" mean?`,
            options: v.options,
            correct_answer: v.correct_answer,
          });
        });
      }

      if (quizType === "mixed" || quizType === "reading") {
        let readingQuery = supabase.from("reading_passages").select("*");
        if (difficulty !== "all") {
          readingQuery = readingQuery.eq("difficulty", difficulty);
        }
        const { data: readingData } = await readingQuery.limit(quizType === "mixed" ? 1 : 2);

        for (const passage of readingData || []) {
          const { data: questionsData } = await supabase
            .from("reading_questions")
            .select("*")
            .eq("passage_id", passage.id)
            .limit(quizType === "mixed" ? 2 : 5);

          (questionsData || []).forEach((q) => {
            questions.push({
              id: q.id,
              type: "reading",
              question: q.question,
              options: q.options,
              correct_answer: q.correct_answer,
              passage: passage.content,
              passageTitle: passage.title,
            });
          });
        }
      }

      setQuizQuestions(questions.sort(() => Math.random() - 0.5));
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setFillAnswer("");
      setShowResult(false);
      setCorrectCount(0);
      setQuizStarted(true);
      setQuizCompleted(false);
      setTimeStarted(Date.now());
      setTimeElapsed(0);
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const checkAnswer = () => {
    setShowResult(true);
    const current = quizQuestions[currentIndex];
    const answer = current.options ? selectedAnswer : fillAnswer;

    if (answer === current.correct_answer) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setFillAnswer("");
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSelectedAnswer(null);
      setFillAnswer("");
      setShowResult(false);
    }
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setQuizQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setFillAnswer("");
    setShowResult(false);
    setCorrectCount(0);
    setTimeStarted(null);
    setTimeElapsed(0);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentIndex];
  const progress = quizQuestions.length > 0 ? ((currentIndex + 1) / quizQuestions.length) * 100 : 0;
  const score = quizQuestions.length > 0 ? Math.round((correctCount / quizQuestions.length) * 100) : 0;

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
              <span className="text-foreground">Quiz</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Practice Quiz</h1>
            <p className="text-muted-foreground">
              Test your knowledge with comprehensive practice quizzes
            </p>
          </div>

          {!quizStarted ? (
            <Card className="max-w-2xl mx-auto border-border/50">
              <CardHeader>
                <CardTitle className="text-xl text-center">Configure Your Quiz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Quiz Type</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["mixed", "grammar", "vocabulary", "reading"].map((type) => (
                      <Button
                        key={type}
                        variant={quizType === type ? "default" : "outline"}
                        className="capitalize"
                        onClick={() => setQuizType(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Difficulty</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {["all", "easy", "medium", "hard"].map((diff) => (
                      <Button
                        key={diff}
                        variant={difficulty === diff ? "default" : "outline"}
                        className="capitalize"
                        onClick={() => setDifficulty(diff)}
                      >
                        {diff}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={startQuiz}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-chart-4 to-chart-5 hover:opacity-90 text-lg py-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      Start Quiz
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : quizCompleted ? (
            <Card className="max-w-2xl mx-auto border-border/50">
              <CardContent className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-chart-2/20 to-chart-3/20 mb-6">
                  <Trophy className="h-12 w-12 text-chart-2" />
                </div>

                <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
                <p className="text-muted-foreground mb-8">
                  Great job completing the quiz. Here&apos;s how you did:
                </p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-gradient">{score}%</div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-gradient">
                      {correctCount}/{quizQuestions.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Correct</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-gradient">{formatTime(timeElapsed)}</div>
                    <div className="text-sm text-muted-foreground">Time</div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={() => router.push("/dashboard")}>
                    Back to Dashboard
                  </Button>
                  <Button
                    onClick={restartQuiz}
                    className="bg-gradient-to-r from-chart-4 to-chart-5 hover:opacity-90"
                  >
                    Take Another Quiz
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Quiz Progress */}
              <div className="max-w-4xl mx-auto mb-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">
                      Question {currentIndex + 1} of {quizQuestions.length}
                    </span>
                    <Badge variant="outline" className="capitalize">
                      {currentQuestion?.type}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{formatTime(timeElapsed)}</span>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Question Card */}
              <div className="max-w-4xl mx-auto">
                <Card className="border-border/50">
                  <CardHeader>
                    {currentQuestion?.passage && (
                      <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          {currentQuestion.passageTitle}
                        </p>
                        <p className="text-sm">{currentQuestion.passage?.substring(0, 300)}...</p>
                      </div>
                    )}
                    <CardTitle className="text-xl">{currentQuestion?.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentQuestion?.options ? (
                      <RadioGroup
                        value={selectedAnswer || ""}
                        onValueChange={handleAnswer}
                        className="space-y-3"
                      >
                        {currentQuestion.options.map((option: string, index: number) => (
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
                                ? "border-chart-4 bg-chart-4/5"
                                : "border-border hover:border-chart-4/50"
                            }`}
                          >
                            <RadioGroupItem
                              value={option}
                              id={`option-${index}`}
                              disabled={showResult}
                            />
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
                    ) : (
                      <div className="space-y-4">
                        <Input
                          placeholder="Type your answer..."
                          value={fillAnswer}
                          onChange={(e) => setFillAnswer(e.target.value)}
                          disabled={showResult}
                          className="text-lg"
                        />
                        {showResult && (
                          <Alert
                            className={
                              fillAnswer.toLowerCase() ===
                              currentQuestion.correct_answer.toLowerCase()
                                ? "border-chart-2 bg-chart-2/5"
                                : "border-destructive bg-destructive/5"
                            }
                          >
                            {fillAnswer.toLowerCase() ===
                            currentQuestion.correct_answer.toLowerCase() ? (
                              <CheckCircle2 className="h-4 w-4 text-chart-2" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                            <AlertDescription className="ml-2">
                              {fillAnswer.toLowerCase() ===
                              currentQuestion.correct_answer.toLowerCase()
                                ? "Correct!"
                                : `Incorrect. The correct answer is: ${currentQuestion.correct_answer}`}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
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
                          disabled={!selectedAnswer && !fillAnswer}
                          className="bg-gradient-to-r from-chart-4 to-chart-5 hover:opacity-90"
                        >
                          Check Answer
                        </Button>
                      ) : currentIndex < quizQuestions.length - 1 ? (
                        <Button
                          onClick={nextQuestion}
                          className="bg-gradient-to-r from-chart-4 to-chart-5 hover:opacity-90"
                        >
                          Next Question
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={nextQuestion}
                          className="bg-gradient-to-r from-chart-4 to-chart-5 hover:opacity-90"
                        >
                          See Results
                          <Trophy className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
