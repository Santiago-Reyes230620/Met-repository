import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  MessageSquareText,
  FileText,
  Headphones,
  Mic,
  PenTool,
  ArrowRight,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface WeakArea {
  name: string;
  score: number;
  href: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface RecommendedExercisesProps {
  scores: {
    grammar: number;
    vocabulary: number;
    reading: number;
    listening: number;
    speaking: number;
    writing: number;
  };
}

export function RecommendedExercises({ scores }: RecommendedExercisesProps) {
  const areas: WeakArea[] = [
    { name: "Grammar", score: scores.grammar, href: "/grammar", icon: <BookOpen className="h-5 w-5" />, color: "text-blue-400", bgColor: "bg-blue-500/10" },
    { name: "Vocabulary", score: scores.vocabulary, href: "/vocabulary", icon: <MessageSquareText className="h-5 w-5" />, color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
    { name: "Reading", score: scores.reading, href: "/reading", icon: <FileText className="h-5 w-5" />, color: "text-amber-400", bgColor: "bg-amber-500/10" },
    { name: "Listening", score: scores.listening, href: "/listening", icon: <Headphones className="h-5 w-5" />, color: "text-rose-400", bgColor: "bg-rose-500/10" },
    { name: "Speaking", score: scores.speaking, href: "/speaking", icon: <Mic className="h-5 w-5" />, color: "text-teal-400", bgColor: "bg-teal-500/10" },
    { name: "Writing", score: scores.writing, href: "/writing", icon: <PenTool className="h-5 w-5" />, color: "text-violet-400", bgColor: "bg-violet-500/10" },
  ];

  const weakAreas = areas.filter((a) => a.score < 6).sort((a, b) => a.score - b.score);
  const strongAreas = areas.filter((a) => a.score >= 7);

  return (
    <Card className="premium-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Recommended Practice
          </CardTitle>
        </div>
        <CardDescription>Focus on these areas to improve faster</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        {/* Weak Areas to Practice */}
        {weakAreas.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-amber-400">Areas to Focus On</p>
            <div className="space-y-2">
              {weakAreas.map((area) => (
                <Link key={area.name} href={area.href}>
                  <button className="w-full group text-left">
                    <div className={`p-4 rounded-lg border border-slate-600 ${area.bgColor} hover:border-amber-500/50 transition-all duration-300 group-hover:scale-105`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={area.color}>{area.icon}</div>
                          <div>
                            <p className="font-semibold text-white text-sm">{area.name}</p>
                            <p className="text-xs text-slate-400">Current: {area.score.toFixed(1)}/10</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                            Priority
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </button>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {/* All Areas Good */}
        {weakAreas.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-green-400">Great Work! All Areas Strong</p>
            <p className="text-xs text-slate-400">Continue practicing to maintain your level. Try the Daily Quiz for mixed challenges!</p>
          </div>
        )}

        {/* Strong Areas */}
        {strongAreas.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-green-400">Your Strengths</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {strongAreas.map((area) => (
                <div key={area.name} className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={area.color}>{area.icon}</div>
                    <p className="font-medium text-white text-sm">{area.name}</p>
                  </div>
                  <p className="text-xs text-slate-300 ml-7">{area.score.toFixed(1)}/10</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Quiz Button */}
        <Link href="/quiz">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <Zap className="h-4 w-4 mr-2" />
            Start Daily Quiz
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
