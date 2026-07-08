export type PlanId = "free" | "pro" | "premium";

export const FEATURES_BY_PLAN: Record<PlanId, string[]> = {
  free: ["grammar", "vocabulary", "reading"],
  pro: ["grammar", "vocabulary", "reading", "listening", "speaking", "writing", "quiz"],
  premium: [
    "grammar",
    "vocabulary",
    "reading",
    "listening",
    "speaking",
    "writing",
    "quiz",
    "mock-exams",
    "advanced-analytics",
    "priority-support",
    "study-plans",
    "progress-reports",
    "tutoring",
    "exam-guides",
    "certificate",
  ],
};

export function planHasAccess(planId: PlanId, feature: string): boolean {
  return FEATURES_BY_PLAN[planId]?.includes(feature) || false;
}
