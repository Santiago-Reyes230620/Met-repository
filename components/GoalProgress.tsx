import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/custom-progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Target, TrendingUp, Calendar, AlertCircle, ArrowRight, Pencil } from "lucide-react";
import Link from "next/link";

interface GoalProgressProps {
  targetScore?: number;
  currentScore: number;
  deadline?: string;
  daysRemaining: number;
  progressPercentage: number;
  hasGoal: boolean;
  onSetGoal?: () => void;
}

export function GoalProgress({
  targetScore,
  currentScore,
  deadline,
  daysRemaining,
  progressPercentage,
  hasGoal,
  onSetGoal,
}: GoalProgressProps) {
  if (!hasGoal) {
    return (
      <Card className="premium-card border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-500" />
              Set Your Goal
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <p className="text-sm text-muted-foreground mb-4">
            Define your target MET score and deadline to get personalized recommendations and track your progress.
          </p>
          <Link href="/goal-setup">
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
              Set Goal Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const scoreDifference = targetScore ? (targetScore - currentScore).toFixed(1) : 0;
  const isOnTrack = daysRemaining > 0 && progressPercentage > 0;
  const estimatedDaysNeeded = targetScore ? Math.ceil((Number(scoreDifference) / 0.1)) : 0;

  return (
    <Card className="premium-card border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Goal Progress
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
              {progressPercentage}% Complete
            </Badge>
            <Link href="/goal-setup?mode=edit">
              <Button size="sm" variant="outline" className="border-blue-500/40 text-blue-300 hover:bg-blue-500/10">
                <Pencil className="h-4 w-4 mr-1" />
                Edit Goal
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        {/* Score Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/30 rounded-lg p-4 text-center">
            <p className="text-xs text-slate-400 mb-1">Current Score</p>
            <p className="text-3xl font-bold text-white">{currentScore.toFixed(1)}</p>
          </div>
          <div className="bg-blue-500/20 rounded-lg p-4 text-center border border-blue-500/30">
            <p className="text-xs text-blue-300 mb-1">Target Score</p>
            <p className="text-3xl font-bold text-blue-300">{targetScore?.toFixed(1)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-300 font-medium">Progress to Goal</span>
            <span className="text-blue-400 font-semibold">{scoreDifference} points remaining</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        {/* Timeline */}
        {deadline && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300 font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                Deadline
              </span>
              <span className="text-amber-400 font-semibold">
                {daysRemaining} days remaining
              </span>
            </div>
            <p className="text-xs text-slate-400">Target date: {new Date(deadline).toLocaleDateString()}</p>
          </div>
        )}

        {/* Status Alert */}
        {!isOnTrack && daysRemaining <= 0 && (
          <Alert className="bg-red-500/20 border-red-500/50">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300 ml-2">
              Deadline has passed. Consider setting a new target date.
            </AlertDescription>
          </Alert>
        )}

        {isOnTrack && estimatedDaysNeeded > daysRemaining && (
          <Alert className="bg-amber-500/20 border-amber-500/50">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-amber-300 ml-2">
              You need to improve {estimatedDaysNeeded - daysRemaining} points in {daysRemaining} days. 
              Focus on weak areas!
            </AlertDescription>
          </Alert>
        )}

        {isOnTrack && estimatedDaysNeeded <= daysRemaining && (
          <Alert className="bg-green-500/20 border-green-500/50">
            <AlertCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300 ml-2">
              Great pace! Keep practicing consistently to reach your goal.
            </AlertDescription>
          </Alert>
        )}

        {/* Recommendation */}
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm text-white mb-1">Recommended Action</p>
              <p className="text-xs text-slate-300">
                Practice {estimatedDaysNeeded > 0 ? "weak areas daily" : "to maintain your level"} to reach your target score.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
