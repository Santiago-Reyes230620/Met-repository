import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge as BadgeComponent } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Trophy,
  Footprints,
  Zap,
  BookOpen,
  MessageSquareText,
  Headphones,
  Flame,
  Target,
  Award,
  Lock,
} from "lucide-react";

interface BadgesDisplayProps {
  unlockedBadges: any[];
  totalBadges?: number;
}

const badgeIcons: Record<string, React.ReactNode> = {
  Footprints: <Footprints className="h-5 w-5" />,
  Zap: <Zap className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  MessageSquareText: <MessageSquareText className="h-5 w-5" />,
  Headphones: <Headphones className="h-5 w-5" />,
  Flame: <Flame className="h-5 w-5" />,
  Trophy: <Trophy className="h-5 w-5" />,
  Target: <Target className="h-5 w-5" />,
  Award: <Award className="h-5 w-5" />,
};

export function BadgesDisplay({ unlockedBadges, totalBadges = 10 }: BadgesDisplayProps) {
  return (
    <Card className="premium-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Achievements
          </CardTitle>
          <BadgeComponent variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
            {unlockedBadges.length}/{totalBadges}
          </BadgeComponent>
        </div>
        <CardDescription>Unlock badges by completing challenges</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        {unlockedBadges.length > 0 ? (
          <div>
            <p className="text-sm font-semibold text-white mb-3">Unlocked</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {unlockedBadges.map((ub) => (
                <div
                  key={ub.badge_id}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 hover:border-amber-500/50 transition-all"
                >
                  <div className="text-2xl">
                    {badgeIcons[ub.badges?.icon_name] || <Award className="h-6 w-6" />}
                  </div>
                  <p className="text-xs font-semibold text-center text-white">{ub.badges?.name}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(ub.unlocked_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Alert className="bg-slate-700/50 border-slate-600">
            <Lock className="h-4 w-4 text-slate-400" />
            <AlertDescription className="text-slate-300 ml-2">
              Complete challenges to unlock badges
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
          <p className="text-xs text-slate-300">
            <span className="font-semibold">Next Badge Tip:</span> Complete 10 exercises to unlock &quot;First Steps&quot;
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
