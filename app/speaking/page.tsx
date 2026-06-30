"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PaywallAlert } from "@/components/shared/PaywallAlert";
import {
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Copy,
  AlertTriangle,
} from "lucide-react";

interface SpeakingExercise {
  id: number;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  title: string;
  prompt: string;
  sampleAnswer: string;
  keywords: string[];
  tips: string;
}

const categories = [
  { id: "greetings", name: "Greetings" },
  { id: "descriptions", name: "Descriptions" },
  { id: "opinions", name: "Opinions" },
  { id: "situations", name: "Situations" },
  { id: "storytelling", name: "Storytelling" },
  { id: "questions", name: "Questions" },
  { id: "debates", name: "Debates" },
];

const speakingExercises: SpeakingExercise[] = [
  // === GREETINGS - Beginner ===
  {
    id: 1,
    category: "greetings",
    difficulty: "beginner",
    title: "Greeting a Friend",
    prompt: "You meet your friend at the coffee shop. Greet them and ask how they've been doing.",
    sampleAnswer: "Hi! Good to see you! How have you been? How are things going with you?",
    keywords: ["hi", "hello", "how", "been", "things", "doing", "good", "see"],
    tips: "Use natural, friendly greetings. Ask follow-up questions to show genuine interest.",
  },
  {
    id: 2,
    category: "greetings",
    difficulty: "beginner",
    title: "Greeting Formally",
    prompt: "Greet someone you don't know at a professional event. Introduce yourself.",
    sampleAnswer: "Hello, my name is Sarah. It's nice to meet you. What's your name?",
    keywords: ["hello", "name", "nice", "meet", "pleased", "introduce"],
    tips: "Use formal language like 'It's nice to meet you' and wait for a response.",
  },
  {
    id: 3,
    category: "greetings",
    difficulty: "beginner",
    title: "Phone Greeting",
    prompt: "You're calling a customer service hotline. Greet the agent and state your purpose.",
    sampleAnswer: "Hello, I'm calling to ask about my order status. My order number is 12345.",
    keywords: ["hello", "calling", "order", "status", "number", "help", "assistance"],
    tips: "Be polite and clear about your reason for calling. Provide relevant details upfront.",
  },
  {
    id: 4,
    category: "greetings",
    difficulty: "beginner",
    title: "Morning Greeting",
    prompt: "You arrive at work in the morning. Greet your colleagues.",
    sampleAnswer: "Good morning, everyone! How's everyone doing today?",
    keywords: ["good", "morning", "morning", "how", "doing", "everyone", "hey"],
    tips: "Morning greetings are often casual and friendly in workplace settings.",
  },
  {
    id: 5,
    category: "greetings",
    difficulty: "beginner",
    title: "Saying Goodbye",
    prompt: "You're leaving a social gathering. Say goodbye to your friends warmly.",
    sampleAnswer: "It was great seeing you! Take care and let's catch up again soon!",
    keywords: ["great", "seeing", "take", "care", "goodbye", "bye", "soon", "catch"],
    tips: "Express that you enjoyed the time together and suggest meeting again.",
  },

  // === DESCRIPTIONS - Beginner ===
  {
    id: 6,
    category: "descriptions",
    difficulty: "beginner",
    title: "Describing Your Day",
    prompt: "Describe what you did today to a friend.",
    sampleAnswer: "Today was pretty good. I went to work in the morning, had lunch with a colleague, and then came home. In the evening, I watched a movie and relaxed.",
    keywords: ["today", "went", "work", "lunch", "home", "evening", "watched", "relaxed"],
    tips: "Use simple past tense and organize your story chronologically.",
  },
  {
    id: 7,
    category: "descriptions",
    difficulty: "beginner",
    title: "Describing a Person",
    prompt: "Describe a family member or close friend, including their appearance and personality.",
    sampleAnswer: "My sister is tall and has long brown hair. She's very kind and always helps others. She loves to laugh and is very funny.",
    keywords: ["sister", "tall", "hair", "kind", "helps", "funny", "laugh", "personality"],
    tips: "Include physical description and personality traits. Use adjectives effectively.",
  },
  {
    id: 8,
    category: "descriptions",
    difficulty: "beginner",
    title: "Describing a Place",
    prompt: "Describe your favorite place to visit. What makes it special?",
    sampleAnswer: "My favorite place is the beach. It's beautiful with white sand and blue water. I love the peaceful feeling and the fresh ocean air.",
    keywords: ["beach", "beautiful", "sand", "water", "peaceful", "feeling", "ocean", "favorite"],
    tips: "Use sensory details - sights, sounds, smells - to make your description vivid.",
  },
  {
    id: 9,
    category: "descriptions",
    difficulty: "beginner",
    title: "Describing Food",
    prompt: "Describe your favorite food and explain why you like it.",
    sampleAnswer: "My favorite food is pizza. I love it because it's delicious, easy to eat, and versatile. You can put any toppings on it that you like.",
    keywords: ["pizza", "favorite", "delicious", "easy", "versatile", "toppings", "love"],
    tips: "Describe taste, texture, and why you enjoy it. Give specific reasons.",
  },

  // === OPINIONS - Beginner/Intermediate ===
  {
    id: 10,
    category: "opinions",
    difficulty: "beginner",
    title: "Expressing Preference",
    prompt: "Someone asks whether you prefer morning or evening. Express your preference and explain why.",
    sampleAnswer: "I prefer the morning because I feel more energetic and productive. The fresh air and quiet of the morning help me start my day well.",
    keywords: ["prefer", "morning", "energetic", "productive", "fresh", "air", "quiet"],
    tips: "Clearly state your preference and provide at least one reason for it.",
  },
  {
    id: 11,
    category: "opinions",
    difficulty: "beginner",
    title: "Agreeing and Disagreeing",
    prompt: "Your friend says learning English is difficult. Respond with your opinion.",
    sampleAnswer: "I agree that it can be challenging, but I think with consistent practice, it becomes easier. The key is to keep learning every day.",
    keywords: ["agree", "challenging", "practice", "easier", "key", "learning", "every"],
    tips: "Use phrases like 'I agree', 'I disagree', 'I think', 'In my opinion'.",
  },
  {
    id: 12,
    category: "opinions",
    difficulty: "intermediate",
    title: "Defending an Opinion",
    prompt: "You believe technology has improved communication. Explain your viewpoint.",
    sampleAnswer: "I strongly believe technology has revolutionized communication. We can now instantly connect with people around the world through video calls, messages, and social media, which was impossible before.",
    keywords: ["technology", "improved", "communication", "instantly", "connect", "video", "messages"],
    tips: "Provide specific examples to support your opinion. Use strong reasoning.",
  },
  {
    id: 13,
    category: "opinions",
    difficulty: "intermediate",
    title: "Discussing Pros and Cons",
    prompt: "Discuss both advantages and disadvantages of living in a big city.",
    sampleAnswer: "Big cities offer great job opportunities, cultural diversity, and excellent public transport. However, they can be very crowded, expensive, and stressful. The noise pollution is also a concern.",
    keywords: ["opportunities", "diversity", "transport", "crowded", "expensive", "stressful", "pollution"],
    tips: "Present balanced arguments. Use 'However', 'On the other hand', 'Despite this'.",
  },

  // === SITUATIONS - Intermediate ===
  {
    id: 14,
    category: "situations",
    difficulty: "intermediate",
    title: "At a Restaurant",
    prompt: "You're at a restaurant with a friend. Order food and drinks for both of you.",
    sampleAnswer: "Hello, we're ready to order. I'd like the grilled salmon with a side salad and water. My friend would like the pasta with a glass of red wine, please.",
    keywords: ["order", "grilled", "salmon", "salad", "water", "pasta", "wine"],
    tips: "Be polite and clear. Specify what you want and ask if you're unsure about menu items.",
  },
  {
    id: 15,
    category: "situations",
    difficulty: "intermediate",
    title: "Asking for Help",
    prompt: "You're lost in a city. Ask a local for directions to the nearest subway station.",
    sampleAnswer: "Excuse me, could you help me? I'm looking for the nearest subway station. Can you tell me how to get there from here?",
    keywords: ["excuse", "help", "looking", "subway", "station", "directions", "here"],
    tips: "Be polite when asking for help. Ask clear, specific questions.",
  },
  {
    id: 16,
    category: "situations",
    difficulty: "intermediate",
    title: "Making a Complaint",
    prompt: "You received a damaged product from an online store. Call customer service to complain.",
    sampleAnswer: "Hello, I received my order yesterday, but unfortunately the item was damaged during shipping. I'd like to request a replacement or refund, please.",
    keywords: ["received", "damaged", "unfortunately", "shipping", "request", "replacement", "refund"],
    tips: "Be respectful but clear about the problem. State what you want resolved.",
  },
  {
    id: 17,
    category: "situations",
    difficulty: "intermediate",
    title: "Job Interview Answer",
    prompt: "In a job interview, tell the interviewer about your strengths and why you're a good fit for the position.",
    sampleAnswer: "I have five years of experience in project management. My key strengths are strong organizational skills, attention to detail, and excellent communication abilities. I believe these qualities make me a great fit for this role.",
    keywords: ["experience", "strengths", "organizational", "detail", "communication", "fit", "qualified"],
    tips: "Be confident and specific. Relate your strengths to the job requirements.",
  },

  // === STORYTELLING - Intermediate ===
  {
    id: 18,
    category: "storytelling",
    difficulty: "intermediate",
    title: "A Memorable Vacation",
    prompt: "Tell a story about an interesting vacation you took or would like to take.",
    sampleAnswer: "Last year, I took a trip to Japan. I visited Tokyo and Kyoto. In Tokyo, I went to temples and saw the beautiful traditional architecture. In Kyoto, I tried authentic Japanese cuisine and experienced the culture. It was an amazing and unforgettable experience.",
    keywords: ["vacation", "trip", "visited", "temples", "traditional", "cuisine", "culture", "amazing"],
    tips: "Use past tense. Include specific details like places, people, and activities.",
  },
  {
    id: 19,
    category: "storytelling",
    difficulty: "intermediate",
    title: "A Challenging Experience",
    prompt: "Share a story about a time when you faced a challenge and how you overcome it.",
    sampleAnswer: "I once had to present a project in front of a large audience, which made me very nervous. I prepared thoroughly and practiced my speech multiple times. When the day came, I took a deep breath and delivered my presentation confidently. It turned out great!",
    keywords: ["challenge", "nervous", "prepared", "practiced", "nervous", "confident", "delivered"],
    tips: "Include the problem, your actions, and the outcome. Show growth and learning.",
  },
  {
    id: 20,
    category: "storytelling",
    difficulty: "intermediate",
    title: "An Interesting Coincidence",
    prompt: "Tell a story about an interesting coincidence or unexpected meeting.",
    sampleAnswer: "I once ran into my old school friend at the airport completely by chance. We hadn't seen each other for ten years. We were both surprised and excited to reconnect. We spent hours catching up and even decided to have lunch together.",
    keywords: ["ran into", "airport", "chance", "hadn't", "surprised", "reconnect", "catching up"],
    tips: "Build suspense and emotion. Help the listener connect with your story.",
  },

  // === QUESTIONS - Intermediate/Advanced ===
  {
    id: 21,
    category: "questions",
    difficulty: "intermediate",
    title: "Asking About Hobbies",
    prompt: "You meet someone new. Ask them about their hobbies and interests.",
    sampleAnswer: "What hobbies do you enjoy in your free time? Are there any activities you're passionate about? I'd love to hear what interests you.",
    keywords: ["hobbies", "free time", "enjoy", "activities", "passionate", "interests"],
    tips: "Ask open-ended questions to encourage conversation. Show genuine interest.",
  },
  {
    id: 22,
    category: "questions",
    difficulty: "intermediate",
    title: "Interviewing Someone",
    prompt: "You're a journalist. Ask an author about their latest book and writing process.",
    sampleAnswer: "Congratulations on your new book! What was the inspiration behind it? How long did it take you to write? Can you describe your writing process?",
    keywords: ["inspiration", "book", "write", "writing", "process", "congratulations", "behind"],
    tips: "Ask follow-up questions. Listen carefully to build on their answers.",
  },
  {
    id: 23,
    category: "questions",
    difficulty: "advanced",
    title: "Philosophical Questions",
    prompt: "Discuss your thoughts on an important life question: What makes a good life?",
    sampleAnswer: "I believe a good life consists of meaningful relationships, personal growth, and contributing to society. It's about finding balance between work and personal interests, and pursuing goals that align with your values. Health and happiness are also crucial elements.",
    keywords: ["good life", "relationships", "growth", "society", "balance", "goals", "values", "health"],
    tips: "Think deeply and speak thoughtfully. Support your views with reasoning.",
  },
  {
    id: 24,
    category: "questions",
    difficulty: "advanced",
    title: "Complex Questioning",
    prompt: "Ask nuanced questions about someone's career transition and the factors that influenced it.",
    sampleAnswer: "What inspired your transition into this field? What were the main challenges you faced during the change? Did your previous experience help you? How did your network support this transition?",
    keywords: ["transition", "inspired", "challenges", "experience", "network", "career", "influenced"],
    tips: "Ask multi-layered questions. Show sophistication in your questioning.",
  },

  // === DEBATES - Advanced ===
  {
    id: 25,
    category: "debates",
    difficulty: "advanced",
    title: "Remote Work vs Office Work",
    prompt: "Argue that remote work is better than office work. Provide at least three reasons.",
    sampleAnswer: "Remote work offers numerous advantages over traditional office settings. First, it provides flexibility and better work-life balance. Second, it reduces commute time and increases productivity. Third, it saves both employees and employers money on transportation and infrastructure costs. These factors make remote work a superior option.",
    keywords: ["remote", "advantages", "flexibility", "balance", "commute", "productivity", "costs"],
    tips: "Present clear arguments with specific evidence. Use logical reasoning.",
  },
  {
    id: 26,
    category: "debates",
    difficulty: "advanced",
    title: "Social Media Impact",
    prompt: "Discuss whether social media has more positive or negative effects on society.",
    sampleAnswer: "While social media has democratized communication, its negative effects are significant. It contributes to mental health issues like anxiety and depression through constant comparison and cyberbullying. The spread of misinformation is alarming, and privacy concerns are substantial. Although it offers connectivity, the harms outweigh the benefits.",
    keywords: ["democratized", "communication", "mental health", "anxiety", "cyberbullying", "misinformation", "privacy"],
    tips: "Present a balanced view but take a clear stance. Use evidence-based arguments.",
  },
  {
    id: 27,
    category: "debates",
    difficulty: "advanced",
    title: "Climate Action Priorities",
    prompt: "Argue for prioritizing renewable energy investment over other climate solutions.",
    sampleAnswer: "Renewable energy is the most critical investment for combating climate change. Unlike other solutions, it addresses the root cause by replacing fossil fuels. Renewable energy is becoming increasingly cost-effective and creates jobs. Additionally, it reduces air pollution and improves public health. Therefore, governments should prioritize renewable energy development.",
    keywords: ["renewable", "energy", "climate", "fossil fuels", "cost-effective", "jobs", "pollution", "health"],
    tips: "Use strong arguments with supporting facts. Address counterarguments.",
  },

  // === DESCRIPTIONS - Intermediate ===
  {
    id: 28,
    category: "descriptions",
    difficulty: "intermediate",
    title: "Describing a Process",
    prompt: "Explain how to make your favorite dish, step by step.",
    sampleAnswer: "To make pasta carbonara, first boil water and cook the pasta. While it's cooking, fry bacon until crispy. In a bowl, beat eggs with cheese and black pepper. When the pasta is done, mix it with the bacon. Remove from heat and add the egg mixture, stirring quickly to create a creamy sauce.",
    keywords: ["pasta", "boil", "cook", "fry", "beat", "eggs", "cheese", "stirring", "creamy"],
    tips: "Use sequence words like 'first', 'then', 'meanwhile', 'finally'. Be clear and detailed.",
  },
  {
    id: 29,
    category: "descriptions",
    difficulty: "intermediate",
    title: "Describing an Event",
    prompt: "Describe a festival or celebration you've attended or would like to attend.",
    sampleAnswer: "The Carnival in Rio de Janeiro is an incredible celebration full of music, dance, and vibrant colors. Thousands of people parade through the streets wearing elaborate costumes and feathers. The atmosphere is electric with samba music and joyful celebrations. It's a festival that brings people together and celebrates Brazilian culture.",
    keywords: ["carnival", "celebration", "music", "dance", "colors", "parade", "costumes", "samba", "culture"],
    tips: "Paint a vivid picture with sensory details. Convey the atmosphere and emotions.",
  },
  {
    id: 30,
    category: "descriptions",
    difficulty: "intermediate",
    title: "Describing Emotions",
    prompt: "Describe a moment when you felt excited or happy. How did you feel and what was happening?",
    sampleAnswer: "I felt incredibly excited and happy when I received my college acceptance letter. My hands were shaking as I opened it, and when I saw the word 'accepted', I felt a rush of joy and relief. I immediately called my parents and celebrated with my family. It was one of the best moments of my life.",
    keywords: ["excited", "happy", "shaking", "joy", "relief", "called", "celebrated", "accepted"],
    tips: "Use emotional vocabulary. Describe physical sensations and reactions.",
  },
];

export default function SpeakingPage() {
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading, hasAccess } = useSubscription();
  const router = useRouter();

  const [filteredExercises, setFilteredExercises] = useState<SpeakingExercise[]>(speakingExercises);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string>("all");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [speechRecognitionAvailable, setSpeechRecognitionAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechRecognitionAvailable(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsRecording(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript((prev) => prev + finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      setError(`Microphone error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const resetExerciseState = useCallback(() => {
    setTranscript("");
    setDetectedKeywords([]);
    setScore(null);
    setShowResult(false);
    setError(null);
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.abort();
    }
  }, [isRecording]);

  // Filter exercises when category/difficulty changes
  useEffect(() => {
    let filtered = speakingExercises;
    if (selectedCategory) {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }
    if (difficulty !== "all") {
      filtered = filtered.filter((e) => e.difficulty === difficulty);
    }
    setFilteredExercises(filtered);
    setCurrentIndex(0);
    resetExerciseState();
  }, [selectedCategory, difficulty, resetExerciseState]);

  // Auth & access check - separate from filtering
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && user && !subLoading) {
      if (!hasAccess("speaking")) {
        setShowPaywall(true);
      }
    }
  }, [authLoading, user, subLoading, router, hasAccess]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not available on this browser");
      return;
    }
    setTranscript("");
    setDetectedKeywords([]);
    setError(null);
    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const checkAnswer = () => {
    if (!transcript.trim()) {
      setError("Please record something before checking");
      return;
    }

    const currentExercise = filteredExercises[currentIndex];
    const lowerTranscript = transcript.toLowerCase();
    const detected = currentExercise.keywords.filter((keyword) =>
      lowerTranscript.includes(keyword.toLowerCase())
    );

    setDetectedKeywords(detected);
    const calculatedScore = Math.round((detected.length / currentExercise.keywords.length) * 100);
    setScore(calculatedScore);
    setShowResult(true);
    setAnsweredCount((prev) => prev + 1);

    if (calculatedScore >= 60) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredExercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetExerciseState();
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      resetExerciseState();
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleCopyText = (text: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
    }
  };

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case "beginner":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "intermediate":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "advanced":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "";
    }
  };

  const getDifficultyBadgeColor = (d: string) => {
    switch (d) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-amber-100 text-amber-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  };

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const currentExercise = filteredExercises[currentIndex];
  if (!currentExercise) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-card">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <Mic className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No Exercises Found</h2>
              <p className="text-muted-foreground mb-6">Try adjusting your filters.</p>
              <Button
                onClick={() => {
                  setSelectedCategory(null);
                  setDifficulty("all");
                }}
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const progress = ((currentIndex + (showResult ? 1 : 0)) / filteredExercises.length) * 100;
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-card">
      <Navbar />

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8" ref={scrollRef}>
            <div className="flex items-center space-x-2 mb-6">
              <Mic className="h-6 w-6 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">Speaking Practice</h1>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-chart-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Exercise {currentIndex + 1} of {filteredExercises.length}
              </p>
            </div>

            {/* Filters and Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div>
                <label className="text-sm font-semibold mb-2 block">Category</label>
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
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
                <label className="text-sm font-semibold mb-2 block">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="flex items-end">
                <Badge variant="outline" className="w-full text-center py-2 justify-center">
                  Score: {accuracy}%
                </Badge>
              </div>
              <div className="flex items-end">
                <Badge variant="secondary" className="w-full text-center py-2 justify-center">
                  {filteredExercises.length} exercises
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{currentExercise.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {categories.find((c) => c.id === currentExercise.category)?.name}
                      </CardDescription>
                    </div>
                    <Badge className={getDifficultyBadgeColor(currentExercise.difficulty)}>
                      {currentExercise.difficulty.charAt(0).toUpperCase() + currentExercise.difficulty.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!speechRecognitionAvailable && (
                    <Alert className="border-amber-500/50 bg-amber-500/5">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Speech recognition is not available in your browser. Please use Chrome, Edge, or Safari.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Task */}
                  <div>
                    <h3 className="font-semibold mb-3 text-sm text-muted-foreground">YOUR TASK</h3>
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                      <p className="text-lg leading-relaxed">{currentExercise.prompt}</p>
                    </div>
                  </div>

                  {/* Recording Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground">RECORD YOUR RESPONSE</h3>
                    <div className="bg-background border-2 border-border rounded-xl p-8 flex flex-col items-center gap-6">
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={!speechRecognitionAvailable || showResult}
                        className={`relative w-20 h-20 rounded-full transition-all duration-200 flex items-center justify-center ${
                          isRecording
                            ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50 animate-pulse"
                            : "bg-primary hover:bg-primary/90 shadow-lg"
                        } ${!speechRecognitionAvailable || showResult ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {isRecording ? (
                          <MicOff className="h-10 w-10 text-white" />
                        ) : (
                          <Mic className="h-10 w-10 text-white" />
                        )}
                      </button>

                      {isRecording && (
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 bg-primary rounded-full"
                              style={{
                                height: `${Math.random() * 30 + 10}px`,
                                animation: `pulse 0.5s ease-in-out infinite`,
                                animationDelay: `${i * 0.1}s`,
                              }}
                            />
                          ))}
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground text-center">
                        {isRecording ? (
                          <span className="text-red-600 font-semibold">Recording... Click mic to stop</span>
                        ) : transcript ? (
                          "Recording complete. Review your response below."
                        ) : (
                          "Click the microphone to start speaking"
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <Alert className="border-red-500/50 bg-red-500/5">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Transcribed Text */}
                  {transcript && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm text-muted-foreground">YOUR RESPONSE</h3>
                      <div className="bg-muted/50 border border-border rounded-lg p-4 relative">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{transcript}</p>
                        <button
                          onClick={() => handleCopyText(transcript)}
                          className="absolute top-3 right-3 p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Check Answer Button */}
                  {!showResult && transcript && (
                    <Button
                      onClick={checkAnswer}
                      className="w-full bg-gradient-to-r from-primary to-chart-2 hover:opacity-90"
                      disabled={isRecording}
                    >
                      Check My Response
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}

                  {/* Results Section */}
                  {showResult && (
                    <>
                      {/* Score */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-center">
                          <div className="text-3xl font-bold text-blue-600">{score}%</div>
                          <div className="text-xs text-muted-foreground mt-1">Keyword Score</div>
                        </div>
                        <div
                          className={`rounded-xl p-4 text-center ${
                            score && score >= 60
                              ? "bg-green-500/10 border border-green-500/20"
                              : "bg-amber-500/10 border border-amber-500/20"
                          }`}
                        >
                          <div className={`text-3xl font-bold ${score && score >= 60 ? "text-green-600" : "text-amber-600"}`}>
                            {score && score >= 60 ? "Great!" : "Good Try"}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {score && score >= 60 ? "60%+ Keywords" : "Keep Practicing"}
                          </div>
                        </div>
                      </div>

                      {/* Keywords Found */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm text-muted-foreground">
                          KEYWORDS DETECTED ({detectedKeywords.length}/{currentExercise.keywords.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {currentExercise.keywords.map((keyword) => (
                            <Badge
                              key={keyword}
                              className={`${
                                detectedKeywords.includes(keyword)
                                  ? "bg-green-500/20 text-green-700 border-green-500/30"
                                  : "bg-gray-500/20 text-gray-700 border-gray-500/30"
                              }`}
                              variant="outline"
                            >
                              {detectedKeywords.includes(keyword) ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  {keyword}
                                </>
                              ) : (
                                keyword
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Sample Answer */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm text-muted-foreground">SAMPLE ANSWER</h3>
                        <div className="bg-muted/50 border border-border rounded-lg p-4">
                          <p className="text-sm leading-relaxed">{currentExercise.sampleAnswer}</p>
                        </div>
                      </div>

                      {/* Tips */}
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
                        <div className="flex gap-3">
                          <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-sm text-amber-900 mb-1">Speaking Tip</h4>
                            <p className="text-sm text-amber-800">{currentExercise.tips}</p>
                          </div>
                        </div>
                      </div>

                      {/* Record Again / Next */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={() => {
                            resetExerciseState();
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Try Again
                        </Button>
                        <Button
                          onClick={handleNext}
                          disabled={currentIndex === filteredExercises.length - 1}
                          className="flex-1 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90"
                        >
                          {currentIndex === filteredExercises.length - 1 ? "Finish" : "Next"}
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Navigation without result */}
                  {!showResult && (
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
                      <Button
                        onClick={handleNext}
                        disabled={currentIndex === filteredExercises.length - 1}
                        className="flex-1"
                      >
                        Skip
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Answered</span>
                      <span className="font-semibold">{answeredCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Excellent (60%+)</span>
                      <span className="font-semibold text-green-600">{correctCount}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-border">
                      <span className="text-muted-foreground">Success Rate</span>
                      <span className="font-semibold">{accuracy}%</span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <h4 className="font-semibold text-sm">By Category</h4>
                    {categories.map((cat) => {
                      const count = speakingExercises.filter((e) => e.category === cat.id).length;
                      if (count === 0) return null;
                      return (
                        <div key={cat.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{cat.name}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 space-y-2">
                    <h4 className="font-semibold text-sm">By Difficulty</h4>
                    {["beginner", "intermediate", "advanced"].map((d) => {
                      const count = speakingExercises.filter((e) => e.difficulty === d as any).length;
                      return (
                        <div key={d} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{d.charAt(0).toUpperCase() + d.slice(1)}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Speaking Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Speak naturally and at a comfortable pace.</p>
                  <p>Use complete sentences when possible.</p>
                  <p>Include key vocabulary from the exercise.</p>
                  <p>Do not worry about perfect pronunciation - focus on clarity.</p>
                  <p>Practice regularly to improve fluency.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <PaywallAlert isOpen={showPaywall} feature="Speaking" plan="pro" onClose={() => setShowPaywall(false)} />
    </div>
  );
}
