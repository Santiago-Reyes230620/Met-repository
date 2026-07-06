export type GoalScores = {
  grammar_score: number;
  vocabulary_score: number;
  reading_score: number;
  listening_score: number;
  speaking_score: number;
  writing_score: number;
};

export function calculateOverallScoreFromProfile(profile: GoalScores): number {
  const scores = [
    profile.grammar_score,
    profile.vocabulary_score,
    profile.reading_score,
    profile.listening_score,
    profile.speaking_score,
    profile.writing_score,
  ].filter((score) => score > 0);

  if (scores.length === 0) return 0;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}

export function calculateProgressPercentage(overallScore: number, targetScore?: number | null): number {
  if (!targetScore || overallScore <= 0) return 0;
  const progress = (overallScore / targetScore) * 100;
  return Math.min(100, Math.round(progress));
}
