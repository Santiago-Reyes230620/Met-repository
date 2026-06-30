import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock, Zap, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface DailyLimitAlertProps {
  isOpen: boolean;
  remaining: number;
  hoursUntilReset: number;
  minutesUntilReset: number;
  onClose: () => void;
}

export function DailyLimitAlert({
  isOpen,
  remaining,
  hoursUntilReset,
  minutesUntilReset,
  onClose,
}: DailyLimitAlertProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push("/pricing");
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Zap className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">Daily Limit Reached</AlertDialogTitle>
          <AlertDialogDescription className="text-center pt-2">
            You've used all {5} of your free daily exercises. Come back tomorrow or upgrade to continue practicing now!
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 my-4">
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold">Reset in:</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {hoursUntilReset}h {minutesUntilReset}m
            </p>
          </div>

          <div className="bg-primary/5 rounded-lg p-4">
            <p className="text-sm font-semibold mb-2">Upgrade to Pro</p>
            <p className="text-2xl font-bold text-primary">
              $9.99<span className="text-sm text-muted-foreground">/month</span>
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center text-sm">
                <span className="w-1 h-1 rounded-full bg-primary mr-2" />
                Unlimited daily exercises
              </div>
              <div className="flex items-center text-sm">
                <span className="w-1 h-1 rounded-full bg-primary mr-2" />
                All exercise modules unlocked
              </div>
              <div className="flex items-center text-sm">
                <span className="w-1 h-1 rounded-full bg-primary mr-2" />
                Detailed progress tracking
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <AlertDialogCancel>Try Tomorrow</AlertDialogCancel>
          <AlertDialogAction onClick={handleUpgrade} className="bg-primary hover:bg-primary/90">
            Upgrade Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
