import { describe, expect, it } from "vitest";
import { planHasAccess } from "@/lib/subscription-access";

describe("planHasAccess", () => {
  it("permite grammar para free", () => {
    expect(planHasAccess("free", "grammar")).toBe(true);
  });

  it("no permite listening para free", () => {
    expect(planHasAccess("free", "listening")).toBe(false);
  });

  it("permite quiz diario para free", () => {
    expect(planHasAccess("free", "quiz")).toBe(true);
  });

  it("permite writing para pro y premium", () => {
    expect(planHasAccess("pro", "writing")).toBe(true);
    expect(planHasAccess("premium", "writing")).toBe(true);
  });

  it("mock exams es exclusivo para premium", () => {
    expect(planHasAccess("free", "mock-exams")).toBe(false);
    expect(planHasAccess("pro", "mock-exams")).toBe(false);
    expect(planHasAccess("premium", "mock-exams")).toBe(true);
  });

  it("beneficios premium avanzados son exclusivos para premium", () => {
    const premiumOnly = [
      "advanced-analytics",
      "priority-support",
      "study-plans",
      "progress-reports",
      "tutoring",
      "exam-guides",
      "certificate",
    ];

    for (const feature of premiumOnly) {
      expect(planHasAccess("free", feature)).toBe(false);
      expect(planHasAccess("pro", feature)).toBe(false);
      expect(planHasAccess("premium", feature)).toBe(true);
    }
  });

  it("rechaza features desconocidos", () => {
    expect(planHasAccess("premium", "coaching")).toBe(false);
  });
});
