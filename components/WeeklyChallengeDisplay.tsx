import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/custom-progress";
import { Badge } from "@/components/ui/badge";
import { WeeklyChallenge, UserChallengeProgress } from "@/lib/supabase/client";
import { Zap, Target, CheckCircle2, Lock } from "lucide-react";

interface WeeklyChallengeDisplayProps {
  challenge: WeeklyChallenge | null;
  progress: UserChallengeProgress | null;
  onAcceptChallenge?: () => void;
  loading?: boolean;
}

export function WeeklyChallengeDisplay({
  challenge,
  progress,
  onAcceptChallenge,
  loading,
}: WeeklyChallengeDisplayProps) {
  if (!challenge) {
    return (
      <Card className="premium-card bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Weekly Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm">Loading this week's challenge...</p>
        </CardContent>
      </Card>
    );
  }

  const isCompleted = progress?.completed || false;
  const currentProgress = progress?.current_progress || 0;
  const progressPercentage = Math.min(100, (currentProgress / challenge.target_value) * 100);

  return (
    <Card className={`premium-card ${isCompleted ? "border-green-500/30" : "border-yellow-500/30"}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <Zap className={`h-5 w-5 ${isCompleted ? "text-green-400" : "text-yellow-500"}`} />
              {challenge.challenge_title}
            </CardTitle>
            <CardDescription className="mt-2">{challenge.description}</CardDescription>
          </div>
          {isCompleted && (
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-300 font-medium">Progress</span>
            <span className="text-yellow-400 font-semibold">
              {currentProgress}/{challenge.target_value}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        {/* Reward */}
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <Target className="h-4 w-4 text-yellow-400" />
          <div className="text-sm">
            <p className="font-semibold text-yellow-300">Reward: {challenge.reward_points} Points</p>
            <p className="text-xs text-yellow-300/70">Complete the challenge to earn</p>
          </div>
        </div>

        {/* Status */}
        {isCompleted ? (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="text-green-300 text-sm font-semibold">Challenge completed! 🎉</span>
          </div>
        ) : (
          <Button
            onClick={onAcceptChallenge}
            disabled={loading || !progress}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            {progress ? "Challenge Accepted" : "Accept Challenge"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
