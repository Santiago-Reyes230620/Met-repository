"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAssessment, getAssessmentQuestions } from "@/hooks/use-assessment";
import { useSubscription } from "@/hooks/use-subscription";
import { useLocalDateKey } from "@/hooks/use-local-date-key";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/custom-progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Play,
  Square,
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

const sectionHints: Record<string, string> = {
  listening: "Use Play Audio first, then answer the listening question.",
  speaking:
    "Answer by voice using the microphone, or type your answer if voice is unavailable.",
};

type SpeechRecognitionType = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionErrorEvent = {
  error?: string;
};

const MAX_LISTENING_PLAYS = 2;
const SKIPPED_ANSWER = "__SKIPPED__";

export default function AssessmentPage() {
  const { user, loading: authLoading } = useAuth();
  const { isFree } = useSubscription();
  const { loading, answers, setAnswers, submitAssessment, results } = useAssessment();
  const router = useRouter();
  const rotationDay = useLocalDateKey();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [listeningPlayCount, setListeningPlayCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [hasSpeechPermission, setHasSpeechPermission] = useState<boolean | null>(null);
  const [voiceNotice, setVoiceNotice] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);

  const questions = useMemo(() => getAssessmentQuestions(), [rotationDay]);
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const setCurrentAnswer = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const stopAudio = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  const playAudio = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setError("Audio playback is not available in this browser.");
      return;
    }

    if (currentQuestion.type === "listening" && listeningPlayCount >= MAX_LISTENING_PLAYS) {
      setError("You can only play the listening audio twice for this question.");
      return;
    }

    stopAudio();

    const script = currentQuestion.audio_text || currentQuestion.passage || currentQuestion.question;
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    utterance.pitch = 1;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setError("Could not play audio. Please try again.");
    };

    speechRef.current = utterance;
    setIsPlayingAudio(true);
    if (currentQuestion.type === "listening") {
      setListeningPlayCount((prev) => prev + 1);
    }
    window.speechSynthesis.speak(utterance);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const requestMicrophonePermission = async () => {
    if (typeof window === "undefined") return false;

    if (!navigator.mediaDevices?.getUserMedia) {
      // Some browsers can still prompt mic permission through SpeechRecognition.
      return true;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setHasSpeechPermission(true);
      return true;
    } catch {
      setHasSpeechPermission(false);
      return false;
    }
  };

  const startRecording = async () => {
    if (!recognitionRef.current) {
      setSpeechSupported(false);
      setVoiceNotice("Voice capture unavailable in this browser. Continue by typing your response.");
      return;
    }

    if (typeof window !== "undefined") {
      const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
      const isSecure = window.location.protocol === "https:" || isLocalhost;
      if (!isSecure) {
        setVoiceNotice("Voice capture requires HTTPS (or localhost). Continue by typing your response.");
        setSpeechSupported(false);
        return;
      }
    }

    const permissionGranted = await requestMicrophonePermission();
    if (!permissionGranted) {
      setHasSpeechPermission(false);
      setVoiceNotice("Microphone permission denied. Continue by typing your response.");
      return;
    }

    setError("");
    setVoiceNotice("");

    try {
      setIsRecording(true);
      recognitionRef.current.start();
    } catch {
      setIsRecording(false);
      setVoiceNotice("Could not start voice recording. Continue by typing your response.");
    }
  };

  const hasValidAnswer = () => {
    const value = (answers[currentQuestion.id] || "").trim();
    if (!value) return false;

    if (value === SKIPPED_ANSWER) {
      return true;
    }

    if (currentQuestion.response_mode === "speech") {
      return value.split(/\s+/).length >= 4;
    }

    if (currentQuestion.response_mode === "writing") {
      return value.split(/\s+/).length >= 18;
    }

    return true;
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setSpeechSupported(false);
      recognitionRef.current = null;
      return;
    }

    const recognition: SpeechRecognitionType = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let capturedText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          capturedText += `${event.results[i][0].transcript} `;
        }
      }

      const normalizedCaptured = capturedText.trim();
      if (normalizedCaptured) {
          setAnswers((prev) => {
            const previousAnswer = prev[currentQuestion.id] || "";
            const merged = previousAnswer
              ? `${previousAnswer.trim()} ${normalizedCaptured}`
              : normalizedCaptured;

            return {
              ...prev,
              [currentQuestion.id]: merged,
            };
          });
      }
    };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsRecording(false);

        const reason = event?.error || "unknown";

        if (reason === "aborted") {
          // User or app stopped capture intentionally; do not show an error banner.
          return;
        }

        if (reason === "not-allowed" || reason === "service-not-allowed" || reason === "audio-capture") {
          setHasSpeechPermission(false);
          setVoiceNotice("Microphone is blocked or unavailable. Continue by typing your response.");
          return;
        }

        setVoiceNotice("Voice capture failed. Continue by typing your response.");
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion.id, setAnswers]);

  useEffect(() => {
    setError("");
    setVoiceNotice("");
    stopAudio();
    stopRecording();
    setListeningPlayCount(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const handleNext = () => {
    if (!hasValidAnswer()) {
      setError(
        currentQuestion.response_mode === "speech"
          ? "Please provide a fuller speaking response before continuing"
          : currentQuestion.response_mode === "writing"
          ? "Please write a fuller response before continuing"
          : "Please answer the question before continuing"
      );
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
    if (!hasValidAnswer()) {
      setError(
        currentQuestion.response_mode === "speech"
          ? "Please provide a fuller speaking response before submitting"
          : currentQuestion.response_mode === "writing"
          ? "Please write a fuller response before submitting"
          : "Please answer the question before submitting"
      );
      return;
    }

    try {
      setSubmitting(true);
      await submitAssessment(answers, questions);
    } catch (err: any) {
      setError(err.message || "Failed to submit assessment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipQuestion = async () => {
    setError("");
    setCurrentAnswer(SKIPPED_ANSWER);

    if (currentIndex === questions.length - 1) {
      try {
        setSubmitting(true);
        await submitAssessment({
          ...answers,
          [currentQuestion.id]: SKIPPED_ANSWER,
        }, questions);
      } catch (err: any) {
        setError(err.message || "Failed to submit assessment");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const shouldShowSkipQuestion =
    (currentQuestion.response_mode === "speech" && (!speechSupported || hasSpeechPermission === false || Boolean(voiceNotice))) ||
    (currentQuestion.type === "listening" && Boolean(error));

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
    const isFreePlan = isFree();
    const scores = [
      { label: "Grammar", value: results.grammar_score, icon: typeIcons.grammar },
      { label: "Vocabulary", value: results.vocabulary_score, icon: typeIcons.vocabulary },
      { label: "Reading", value: results.reading_score, icon: typeIcons.reading },
      { label: "Listening", value: results.listening_score, icon: typeIcons.listening },
      { label: "Speaking", value: results.speaking_score, icon: typeIcons.speaking },
      { label: "Writing", value: results.writing_score, icon: typeIcons.writing },
    ];

    const weakestrareas = scores.filter((s) => s.value < 6).sort((a, b) => a.value - b.value);
    const strongestAreas = [...scores].sort((a, b) => b.value - a.value).slice(0, 2);

    const getFeedbackByScore = (overall: number) => {
      if (overall >= 8) {
        return "Strong performance. You are close to advanced MET readiness. Focus on timing and consistency to maintain this level.";
      }

      if (overall >= 6) {
        return "Good foundation. You can reach an advanced score with focused practice on your weakest skills and regular mock testing.";
      }

      if (overall >= 4) {
        return "Developing level. Build core grammar, vocabulary, and reading habits first, then reinforce with listening and speaking practice.";
      }

      return "Early-stage level. Start with fundamental daily practice and short, consistent sessions to build confidence in all skills.";
    };

    const personalizedFeedback = getFeedbackByScore(results.overall_score);
    const questionFeedback = questions.map((question) => {
      const rawAnswer = (answers[question.id] || "").trim();
      const normalizedAnswer = rawAnswer.toLowerCase();
      const hasAnswer = rawAnswer.length > 0;
      const isSkipped = rawAnswer === SKIPPED_ANSWER;

      let isCorrect = false;

      if (!isSkipped && hasAnswer) {
        if (question.response_mode === "speech" || question.response_mode === "writing") {
          const keywords = (question.expected_keywords || []).map((k) => k.toLowerCase());
          const matched = keywords.filter((keyword) => normalizedAnswer.includes(keyword)).length;
          const minMatches = Math.max(2, Math.ceil(keywords.length * 0.4));
          const wordCount = normalizedAnswer.split(/\s+/).filter(Boolean).length;
          const minimumWords = question.response_mode === "writing" ? 18 : 4;
          const meetsLength = wordCount >= minimumWords;

          if (keywords.length === 0) {
            isCorrect = meetsLength;
          } else {
            isCorrect = matched >= minMatches && meetsLength;
          }
        } else if (question.correct_answer) {
          isCorrect = normalizedAnswer === question.correct_answer.toLowerCase();
        }
      }

      return {
        question,
        userAnswer: isSkipped ? "Skipped" : rawAnswer || "No answer",
        isCorrect,
      };
    });

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

                {/* Feedback */}
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 space-y-3">
                  <h4 className="text-white font-semibold">Performance Feedback</h4>
                  <p className="text-sm text-slate-300">{personalizedFeedback}</p>
                  <p className="text-sm text-slate-300">
                    Strongest areas: <span className="font-semibold text-cyan-300">{strongestAreas.map((s) => s.label).join(", ")}</span>
                  </p>
                  {weakestrareas.length > 0 && (
                    <p className="text-sm text-slate-300">
                      Priority improvement: <span className="font-semibold text-amber-300">{weakestrareas.slice(0, 2).map((s) => s.label).join(", ")}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowFeedback((prev) => !prev)}
                    className="w-full border-slate-600 text-slate-200 hover:bg-slate-700"
                  >
                    {showFeedback ? "Hide Feedback" : "View Feedback"}
                  </Button>

                  {showFeedback && (
                    <div className="rounded-lg border border-slate-600 bg-slate-900/40 p-4 space-y-3 max-h-[360px] overflow-y-auto">
                      <p className="text-sm text-slate-300">
                        {isFreePlan
                          ? "Free plan: quick feedback (correct/incorrect and correct answer)."
                          : "Pro/Premium: detailed feedback with guidance and examples."}
                      </p>

                      {questionFeedback.map(({ question, userAnswer, isCorrect }, idx) => (
                        <div key={question.id} className="rounded border border-slate-700 p-3 bg-slate-800/40">
                          <p className="text-sm text-slate-100 font-medium">
                            {idx + 1}. {question.question}
                          </p>
                          <p className="text-xs mt-1 text-slate-300">Your answer: {userAnswer}</p>
                          <p className={`text-xs mt-1 ${isCorrect ? "text-emerald-300" : "text-rose-300"}`}>
                            {isCorrect ? "Correct" : "Incorrect"}
                          </p>
                          {question.correct_answer && (
                            <p className="text-xs mt-1 text-slate-300">Correct answer: {question.correct_answer}</p>
                          )}
                          {!isFreePlan && (
                            <div className="mt-2 rounded border border-teal-500/30 bg-teal-500/10 p-2">
                              <p className="text-xs text-teal-100">
                                Tip: Focus on key vocabulary and complete ideas for stronger MET responses.
                              </p>
                              <p className="text-xs text-teal-200 mt-1">
                                Example: &quot;I agree because this improves communication at work, for example during team meetings.&quot;
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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

              <div className="flex items-center justify-between rounded-md border border-slate-600/70 bg-slate-900/40 px-3 py-2">
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-200 border-cyan-500/40">
                  Daily Assessment Set
                </Badge>
                <span className="text-xs text-slate-300">Questions refresh every day (local time)</span>
              </div>
            </CardHeader>

            {/* Question */}
            <CardContent className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">{currentQuestion.question}</h2>

                {sectionHints[currentQuestion.type] && (
                  <Alert className="mb-4 bg-slate-700/60 border-slate-600/80">
                    <AlertCircle className="h-4 w-4 text-slate-300" />
                    <AlertDescription className="text-slate-200 ml-2">
                      {sectionHints[currentQuestion.type]}
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert className="mb-4 bg-red-500/20 border-red-500/50">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300 ml-2">{error}</AlertDescription>
                  </Alert>
                )}

                {currentQuestion.type === "reading" && currentQuestion.passage && (
                  <div className="mb-4 rounded-lg border border-slate-600 bg-slate-900/40 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Reading Passage</p>
                    <p className="text-slate-200 leading-relaxed">{currentQuestion.passage}</p>
                  </div>
                )}

                {currentQuestion.type === "listening" && (
                  <div className="mb-4 space-y-3">
                    <div className="rounded-lg border border-slate-600 bg-slate-900/40 p-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-slate-200 font-medium">Listening Audio</p>
                        <p className="text-xs text-slate-400">
                          Play the prompt before answering ({Math.max(0, MAX_LISTENING_PLAYS - listeningPlayCount)} repeats left)
                        </p>
                      </div>
                      <Button
                        onClick={isPlayingAudio ? stopAudio : playAudio}
                        disabled={!isPlayingAudio && listeningPlayCount >= MAX_LISTENING_PLAYS}
                        type="button"
                        className="bg-slate-700 hover:bg-slate-600 text-white"
                      >
                        {isPlayingAudio ? (
                          <>
                            <Square className="h-4 w-4 mr-2" />
                            Stop Audio
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Play Audio
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {currentQuestion.response_mode === "speech" || currentQuestion.response_mode === "writing" ? (
                  <div className="space-y-3">
                    {currentQuestion.response_mode === "speech" ? (
                      <div className="rounded-lg border border-slate-600 bg-slate-900/40 p-4">
                        <p className="text-sm text-slate-300 mb-3">
                          Speak your answer in English. We will capture your response automatically.
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            type="button"
                            onClick={isRecording ? stopRecording : () => void startRecording()}
                            disabled={!speechSupported}
                            className={isRecording ? "bg-red-500 hover:bg-red-600 text-white" : "bg-teal-500 hover:bg-teal-600 text-white"}
                          >
                            {isRecording ? "Stop Recording" : "Start Recording"}
                          </Button>
                          {!speechSupported && (
                            <span className="text-xs text-amber-300 self-center">
                              Voice capture unavailable in this browser.
                            </span>
                          )}
                          {hasSpeechPermission === false && (
                            <span className="text-xs text-amber-300 self-center">
                              Microphone permission denied. Continue by typing your response.
                            </span>
                          )}
                          {voiceNotice && (
                            <span className="text-xs text-amber-300 self-center">
                              {voiceNotice}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-slate-600 bg-slate-900/40 p-4">
                        <p className="text-sm text-slate-300">
                          Write your answer in English. We will evaluate idea coverage and clarity.
                        </p>
                      </div>
                    )}

                    <Textarea
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => {
                        setCurrentAnswer(e.target.value);
                        setError("");
                      }}
                      placeholder={
                        currentQuestion.response_mode === "speech"
                          ? "Your spoken response will appear here. You can also type it manually."
                          : "Write your response here..."
                      }
                      className="min-h-[130px] bg-slate-700 border-slate-600 text-slate-100"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentAnswer(option);
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
                )}
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

                {shouldShowSkipQuestion && (
                  <Button
                    onClick={() => void handleSkipQuestion()}
                    disabled={submitting || loading}
                    variant="outline"
                    className="flex-1 border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                  >
                    Skip Question
                  </Button>
                )}

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
