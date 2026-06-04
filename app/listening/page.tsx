"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { supabase } from "@/lib/supabase/client";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Headphones,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  Loader2,
  Play,
  Volume2,
} from "lucide-react";
import { PaywallAlert } from "@/components/shared/PaywallAlert";

const categories = [
  { id: "conversations", name: "Conversations", color: "default" as const },
  { id: "lectures", name: "Lectures", color: "secondary" as const },
  { id: "interviews", name: "Interviews", color: "outline" as const },
  { id: "announcements", name: "Announcements", color: "default" as const },
];

const listeningExercises = [
  {
    id: 1,
    category: "conversations",
    difficulty: "beginner",
    title: "Coffee Shop Conversation",
    audio: "https://example.com/audio/coffee-shop.mp3",
    transcript: "A: Can I have a coffee, please? B: Sure! What size? A: Medium, please.",
    question: "What size coffee does the customer want?",
    options: ["Small", "Medium", "Large", "Extra Large"],
    correctAnswer: 1,
    explanation: "The customer clearly says 'Medium, please' when asked about the size.",
  },
  {
    id: 2,
    category: "conversations",
    difficulty: "beginner",
    title: "Airport Information",
    audio: "https://example.com/audio/airport.mp3",
    transcript: "Welcome to airport information. Flight 245 to New York is delayed by 30 minutes.",
    question: "How long is flight 245 delayed?",
    options: ["15 minutes", "20 minutes", "30 minutes", "45 minutes"],
    correctAnswer: 2,
    explanation: "The announcement states the flight is delayed by 30 minutes.",
  },
  {
    id: 3,
    category: "lectures",
    difficulty: "intermediate",
    title: "Introduction to Climate Change",
    audio: "https://example.com/audio/climate-lecture.mp3",
    transcript: "Climate change is primarily caused by greenhouse gas emissions from human activities. The main gases are carbon dioxide, methane, and nitrous oxide.",
    question: "What are the main greenhouse gases mentioned?",
    options: [
      "Oxygen and nitrogen",
      "Carbon dioxide, methane, and nitrous oxide",
      "Helium and argon",
      "Hydrogen and oxygen",
    ],
    correctAnswer: 1,
    explanation: "The lecture clearly identifies carbon dioxide, methane, and nitrous oxide as the main greenhouse gases.",
  },
  {
    id: 4,
    category: "interviews",
    difficulty: "intermediate",
    title: "Job Interview",
    audio: "https://example.com/audio/job-interview.mp3",
    transcript: "Interviewer: What are your main strengths? Candidate: I'm a strong communicator and very organized. I also work well in teams.",
    question: "What strengths does the candidate mention?",
    options: [
      "Technical skills and leadership",
      "Communication skills and creativity",
      "Communication, organization, and teamwork",
      "Patience and problem-solving",
    ],
    correctAnswer: 2,
    explanation: "The candidate explicitly mentions being a strong communicator, very organized, and working well in teams.",
  },
  {
    id: 5,
    category: "announcements",
    difficulty: "beginner",
    title: "Weather Forecast",
    audio: "https://example.com/audio/weather.mp3",
    transcript: "Tomorrow's weather forecast: It will be sunny in the morning with temperatures reaching 25 degrees Celsius.",
    question: "What will the temperature reach tomorrow?",
    options: ["20 degrees", "22 degrees", "25 degrees", "28 degrees"],
    correctAnswer: 2,
    explanation: "The forecast clearly states the temperature will reach 25 degrees Celsius.",
  },
  {
    id: 6,
    category: "lectures",
    difficulty: "advanced",
    title: "Advanced Physics Lecture",
    audio: "https://example.com/audio/physics-lecture.mp3",
    transcript: "Quantum mechanics demonstrates that particles can exist in multiple states simultaneously until observation occurs. This phenomenon is known as superposition.",
    question: "What is the phenomenon called when particles exist in multiple states?",
    options: ["Entanglement", "Superposition", "Decoherence", "Quantization"],
    correctAnswer: 1,
    explanation: "The lecture explains that this phenomenon is called superposition.",
  },
];

export default function ListeningPage() {
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading, hasAccess } = useSubscription();
  const router = useRouter();

  const [exercises, setExercises] = useState(listeningExercises);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string>("all");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && user && !subLoading) {
      if (!hasAccess("listening")) {
        setShowPaywall(true);
      } else {
        filterExercises();
      }
    }
  }, [authLoading, user, selectedCategory, difficulty, subLoading, hasAccess, router]);

  const filterExercises = () => {
    let filtered = listeningExercises;

    if (selectedCategory) {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }

    if (difficulty !== "all") {
      filtered = filtered.filter((e) => e.difficulty === difficulty);
    }

    setExercises(filtered);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const currentExercise = exercises[currentIndex];
  if (!currentExercise) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-card">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <Headphones className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No Exercises Found</h2>
              <p className="text-muted-foreground mb-6">Try adjusting your filters.</p>
              <Button onClick={() => { setSelectedCategory(null); setDifficulty("all"); }}>
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    setShowResult(true);
    setAnsweredCount(answeredCount + 1);

    if (selectedAnswer === currentExercise.correctAnswer) {
      setCorrectCount(correctCount + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const isCorrect = selectedAnswer === currentExercise.correctAnswer;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-card">
      <Navbar />

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-6">
              <Headphones className="h-6 w-6 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">Listening Practice</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Category</Label>
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Difficulty</Label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="flex items-end">
                <div className="w-full">
                  <Badge variant="outline" className="w-full text-center py-2">
                    {currentIndex + 1} / {exercises.length}
                  </Badge>
                </div>
              </div>
              <div className="flex items-end">
                <div className="w-full">
                  <Badge variant="secondary" className="w-full text-center py-2">
                    Score: {answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{currentExercise.title}</CardTitle>
                      <CardDescription>{currentExercise.category.toUpperCase()}</CardDescription>
                    </div>
                    <Badge variant="outline">
                      {currentExercise.difficulty.charAt(0).toUpperCase() + currentExercise.difficulty.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                    <div className="flex items-center justify-center mb-4">
                      <Button
                        variant="outline"
                        size="lg"
                        className="rounded-full h-16 w-16"
                        onMouseEnter={() => setIsPlaying(true)}
                        onMouseLeave={() => setIsPlaying(false)}
                      >
                        {isPlaying ? (
                          <Volume2 className="h-8 w-8" />
                        ) : (
                          <Play className="h-8 w-8" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">Click to play audio</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Transcript</h3>
                    <p className="text-sm p-4 bg-card border border-border rounded-lg leading-relaxed">
                      {currentExercise.transcript}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">{currentExercise.question}</h3>
                    <RadioGroup value={selectedAnswer?.toString() || ""} onValueChange={(val) => setSelectedAnswer(parseInt(val))}>
                      <div className="space-y-3">
                        {currentExercise.options.map((option, idx) => (
                          <div key={idx} className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-primary/5 transition-colors">
                            <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                            <Label htmlFor={`option-${idx}`} className="cursor-pointer flex-1">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  {showResult && (
                    <Alert className={isCorrect ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"}>
                      <div className="flex items-start space-x-2">
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        )}
                        <div>
                          <h4 className={isCorrect ? "text-green-700 font-semibold" : "text-red-700 font-semibold"}>
                            {isCorrect ? "Correct!" : "Incorrect"}
                          </h4>
                          <AlertDescription className="mt-2 text-sm">
                            <Lightbulb className="h-4 w-4 inline mr-2" />
                            {currentExercise.explanation}
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                      className="flex-1"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    {!showResult ? (
                      <Button onClick={handleSubmit} disabled={selectedAnswer === null} className="flex-1">
                        Check Answer
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={handleNext} disabled={currentIndex === exercises.length - 1} className="flex-1">
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Correct Answers</span>
                      <span className="font-semibold">{correctCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Answered</span>
                      <span className="font-semibold">{answeredCount}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-border">
                      <span className="text-muted-foreground">Success Rate</span>
                      <span className="font-semibold">
                        {answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0}%
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <h4 className="font-semibold text-sm">Exercises by Category</h4>
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{cat.name}</span>
                        <span className="font-semibold">
                          {listeningExercises.filter((e) => e.category === cat.id).length}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <PaywallAlert
        isOpen={showPaywall}
        feature="Listening"
        plan="pro"
        onClose={() => setShowPaywall(false)}
      />
    </div>
  );
}
