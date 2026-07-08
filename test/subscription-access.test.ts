import { describe, expect, it } from "vitest";
import { planHasAccess } from "@/lib/subscription-access";

describe("planHasAccess", () => {
  it("permite grammar para free", () => {
    expect(planHasAccess("free", "grammar")).toBe(true);
  });

  it("no permite listening para free", () => {
    expect(planHasAccess("free", "listening")).toBe(false);
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

  it("rechaza features desconocidos", () => {
    expect(planHasAccess("premium", "coaching")).toBe(false);
  });
});
