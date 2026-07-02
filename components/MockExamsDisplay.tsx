import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MockExam } from "@/lib/supabase/client";
import { Clock, BookOpen, ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";

interface MockExamsDisplayProps {
  mockExams: MockExam[];
  onStartExam?: (examId: string) => void;
  loading?: boolean;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "beginner":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "intermediate":
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    case "advanced":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    default:
      return "bg-slate-500/20 text-slate-300 border-slate-500/30";
  }
};

export function MockExamsDisplay({ mockExams, onStartExam, loading }: MockExamsDisplayProps) {
  return (
    <Card className="premium-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Full Practice Tests
          </CardTitle>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
            {mockExams.length} Available
          </Badge>
        </div>
        <CardDescription>Take complete MET simulations</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 relative z-10">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            <p className="ml-3 text-slate-400">Loading exams...</p>
          </div>
        ) : mockExams.length > 0 ? (
          mockExams.map((exam) => (
            <div
              key={exam.id}
              className="p-4 rounded-lg border border-slate-600 hover:border-blue-500/50 bg-slate-700/50 hover:bg-slate-700/80 transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {exam.title}
                  </h4>
                  {exam.description && (
                    <p className="text-xs text-slate-400 mt-1">{exam.description}</p>
                  )}
                </div>
                <Badge className={`ml-2 ${getDifficultyColor(exam.difficulty)}`}>
                  {exam.difficulty.charAt(0).toUpperCase() + exam.difficulty.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-slate-300">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3 text-blue-400" />
                  {exam.total_questions} questions
                </div>
                {exam.duration_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-blue-400" />
                    {exam.duration_minutes} minutes
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-400 mb-3">
                Grammar: {exam.grammar_questions} • Vocabulary: {exam.vocabulary_questions} • Reading:{" "}
                {exam.reading_questions} • Listening: {exam.listening_questions}
              </div>

              <Button
                onClick={() => onStartExam && onStartExam(exam.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm group-hover:shadow-lg transition-all"
              >
                Start Test
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-400">
            <p>No practice tests available yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
