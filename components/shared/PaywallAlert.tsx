import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaywallAlertProps {
  isOpen: boolean;
  feature: string;
  plan: "pro" | "premium";
  onClose: () => void;
}

export function PaywallAlert({ isOpen, feature, plan, onClose }: PaywallAlertProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push("/pricing");
    onClose();
  };

  const planDisplay = plan === "pro" ? "Pro Plan" : "Premium Plan";
  const price = plan === "pro" ? "$9.99" : "$19.99";

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">Unlock {feature}</AlertDialogTitle>
          <AlertDialogDescription className="text-center pt-2">
            This feature requires a {planDisplay} subscription. Unlock unlimited access to all {feature.toLowerCase()} exercises and more!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="bg-primary/5 rounded-lg p-4 my-4">
          <p className="text-sm font-semibold mb-2">Upgrade to {planDisplay}</p>
          <p className="text-2xl font-bold text-primary">{price}<span className="text-sm text-muted-foreground">/month</span></p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <span className="w-1 h-1 rounded-full bg-primary mr-2" />
            Unlimited exercises
          </div>
          <div className="flex items-center text-sm">
            <span className="w-1 h-1 rounded-full bg-primary mr-2" />
            Full {feature.toLowerCase()} module
          </div>
          <div className="flex items-center text-sm">
            <span className="w-1 h-1 rounded-full bg-primary mr-2" />
            Detailed progress analytics
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <AlertDialogCancel>Continue Free</AlertDialogCancel>
          <AlertDialogAction onClick={handleUpgrade} className="bg-primary hover:bg-primary/90">
            Upgrade Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
