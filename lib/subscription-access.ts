export type PlanId = "free" | "pro" | "premium";

export const FEATURES_BY_PLAN: Record<PlanId, string[]> = {
  free: ["grammar", "vocabulary", "reading"],
  pro: ["grammar", "vocabulary", "reading", "listening", "speaking", "writing", "quiz"],
  premium: ["grammar", "vocabulary", "reading", "listening", "speaking", "writing", "quiz"],
};

export function planHasAccess(planId: PlanId, feature: string): boolean {
  return FEATURES_BY_PLAN[planId]?.includes(feature) || false;
}
