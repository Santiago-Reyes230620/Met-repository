import { describe, expect, it } from "vitest";
import { calculateOverallScoreFromProfile, calculateProgressPercentage } from "@/lib/goal-calculations";

describe("goal calculations", () => {
  it("calcula promedio usando solo scores mayores a cero", () => {
    const overall = calculateOverallScoreFromProfile({
      grammar_score: 8,
      vocabulary_score: 6,
      reading_score: 0,
      listening_score: 0,
      speaking_score: 7,
      writing_score: 0,
    });

    expect(overall).toBe(7);
  });

  it("retorna 0 si no hay scores validos", () => {
    const overall = calculateOverallScoreFromProfile({
      grammar_score: 0,
      vocabulary_score: 0,
      reading_score: 0,
      listening_score: 0,
      speaking_score: 0,
      writing_score: 0,
    });

    expect(overall).toBe(0);
  });

  it("calcula progreso redondeado y acotado a 100", () => {
    expect(calculateProgressPercentage(6.6, 8)).toBe(83);
    expect(calculateProgressPercentage(9.5, 8)).toBe(100);
  });

  it("retorna 0 si faltan datos para calcular progreso", () => {
    expect(calculateProgressPercentage(0, 8)).toBe(0);
    expect(calculateProgressPercentage(6, null)).toBe(0);
  });
});
