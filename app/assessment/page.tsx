"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAssessment, getAssessmentQuestions } from "@/hooks/use-assessment";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/custom-progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  MessageSquareText,
  FileText,
  Headphones,
  Mic,
  PenTool,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const typeIcons: Record<string, React.ReactNode> = {
  grammar: <BookOpen className="h-4 w-4" />,
  vocabulary: <MessageSquareText className="h-4 w-4" />,
  reading: <FileText className="h-4 w-4" />,
  listening: <Headphones className="h-4 w-4" />,
  speaking: <Mic className="h-4 w-4" />,
  writing: <PenTool className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  grammar: "bg-blue-500/20 text-blue-300 border-blue-500/50",
  vocabulary: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
  reading: "bg-amber-500/20 text-amber-300 border-amber-500/50",
  listening: "bg-rose-500/20 text-rose-300 border-rose-500/50",
  speaking: "bg-teal-500/20 text-teal-300 border-teal-500/50",
  writing: "bg-violet-500/20 text-violet-300 border-violet-500/50",
};

export default function AssessmentPage() {
  const { user, loading: authLoading } = useAuth();
  const { loading, answers, setAnswers, submitAssessment, results } = useAssessment();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const questions = getAssessmentQuestions();
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      setError("Please answer the question before continuing");
      return;
    }
    setError("");

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
    setError("");
  };

  const handleSubmit = async () => {
    if (!answers[currentQuestion.id]) {
      setError("Please answer the question before submitting");
      return;
    }

    try {
      setSubmitting(true);
      await submitAssessment(answers);
    } catch (err: any) {
      setError(err.message || "Failed to submit assessment");
    } finally {
      setSubmitting(false);
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
    return null;
  }

  // Results screen
  if (results) {
    const scores = [
      { label: "Grammar", value: results.grammar_score, icon: typeIcons.grammar },
      { label: "Vocabulary", value: results.vocabulary_score, icon: typeIcons.vocabulary },
      { label: "Reading", value: results.reading_score, icon: typeIcons.reading },
      { label: "Listening", value: results.listening_score, icon: typeIcons.listening },
      { label: "Speaking", value: results.speaking_score, icon: typeIcons.speaking },
      { label: "Writing", value: results.writing_score, icon: typeIcons.writing },
    ];

    const weakestrareas = scores.filter((s) => s.value < 6).sort((a, b) => a.value - b.value);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">
        <Navbar />

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-2xl">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader className="text-center space-y-2">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                  </div>
                </div>
                <CardTitle className="text-3xl text-white">Assessment Complete!</CardTitle>
                <CardDescription className="text-slate-300 text-base">
                  Here&apos;s your baseline assessment
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Overall Score */}
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-6 text-center">
                  <p className="text-slate-300 text-sm mb-2">Overall Score</p>
                  <p className="text-5xl font-bold text-white mb-2">
                    {results.overall_score.toFixed(1)}
                  </p>
                  <p className="text-slate-400 text-sm">/10</p>
                </div>

                {/* Scores by Category */}
                <div className="space-y-4">
                  <h3 className="text-white font-semibold text-lg">Scores by Category</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scores.map((score) => (
                      <div
                        key={score.label}
                        className={`p-4 rounded-lg border ${typeColors[score.label.toLowerCase()]}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {typeIcons[score.label.toLowerCase()]}
                            <span className="font-medium">{score.label}</span>
                          </div>
                          <span className="text-lg font-bold">{score.value.toFixed(1)}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${(score.value / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weak Areas */}
                {weakestrareas.length > 0 && (
                  <Alert className="bg-amber-500/20 border-amber-500/50">
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                    <AlertDescription className="text-amber-300 ml-2">
                      <p className="font-semibold mb-1">Areas to Focus On:</p>
                      <p>
                        {weakestrareas
                          .map((a) => a.label)
                          .join(", ")}{" "}
                        will help you reach your goal faster
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Next Steps */}
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 space-y-3">
                  <h4 className="text-white font-semibold">What&apos;s Next?</h4>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>Your personalized learning plan is ready</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>Focus on recommended exercises for weak areas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>Track your progress and celebrate improvements</span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6 text-lg font-semibold"
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            {/* Header */}
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`${typeColors[currentQuestion.type]}`}>
                  <span className="mr-2">{typeIcons[currentQuestion.type]}</span>
                  {currentQuestion.type.charAt(0).toUpperCase() + currentQuestion.type.slice(1)}
                </Badge>
                <span className="text-slate-400 text-sm">
                  Question {currentIndex + 1} of {questions.length}
                </span>
              </div>

              <Progress value={progress} className="h-2" />
            </CardHeader>

            {/* Question */}
            <CardContent className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">{currentQuestion.question}</h2>

                {error && (
                  <Alert className="mb-4 bg-red-500/20 border-red-500/50">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300 ml-2">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAnswers({
                          ...answers,
                          [currentQuestion.id]: option,
                        });
                        setError("");
                      }}
                      className={`w-full p-4 rounded-lg border text-left transition ${
                        answers[currentQuestion.id] === option
                          ? "bg-blue-500 border-blue-400 text-white"
                          : "bg-slate-700 border-slate-600 text-slate-200 hover:border-slate-500"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            answers[currentQuestion.id] === option
                              ? "border-white bg-white"
                              : "border-slate-500"
                          }`}
                        >
                          {answers[currentQuestion.id] === option && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentIndex === questions.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || loading}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
                    {submitting ? "Submitting..." : "Submit Assessment"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
