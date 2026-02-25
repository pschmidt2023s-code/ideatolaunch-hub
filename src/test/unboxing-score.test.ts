import { describe, it, expect } from "vitest";
import { computeUnboxingScore, type UnboxingInput } from "@/lib/unboxing-score-engine";

const base: UnboxingInput = {
  packagingType: "kraft_box",
  tissuePaper: false,
  stickerSeal: false,
  thankYouCard: false,
  insertSamples: false,
  customLabeling: false,
  returnFriendly: false,
  targetPositioning: "mid",
};

describe("Unboxing Score Engine", () => {
  it("base kraft_box scores 20", () => {
    const r = computeUnboxingScore(base);
    expect(r.score).toBe(20);
    expect(r.level).toBe("basic");
  });

  it("all addons on kraft_box scores 74", () => {
    const r = computeUnboxingScore({
      ...base,
      tissuePaper: true,
      stickerSeal: true,
      thankYouCard: true,
      insertSamples: true,
      customLabeling: true,
      returnFriendly: true,
    });
    // 20 + 8 + 6 + 10 + 12 + 10 + 8 = 74
    expect(r.score).toBe(74);
    expect(r.level).toBe("premium");
  });

  it("custom_box with all addons caps at 99", () => {
    const r = computeUnboxingScore({
      ...base,
      packagingType: "custom_box",
      tissuePaper: true,
      stickerSeal: true,
      thankYouCard: true,
      insertSamples: true,
      customLabeling: true,
      returnFriendly: true,
    });
    // 45 + 54 = 99
    expect(r.score).toBe(99);
  });

  it("premium + poly_mailer gets -20 penalty", () => {
    const r = computeUnboxingScore({
      ...base,
      packagingType: "poly_mailer",
      targetPositioning: "premium",
    });
    // 5 - 20 = 0 (clamped)
    expect(r.score).toBe(0);
    expect(r.gaps).toContain("Premium-Positionierung mit Polybag: -20 Punkte Strafe");
  });

  it("budget with high score warns about over-investing", () => {
    const r = computeUnboxingScore({
      ...base,
      packagingType: "custom_box",
      tissuePaper: true,
      stickerSeal: true,
      thankYouCard: true,
      insertSamples: true,
      customLabeling: true,
      returnFriendly: true,
      targetPositioning: "budget",
    });
    expect(r.riskNotes.some((n) => n.includes("Überinvestitions-Risiko"))).toBe(true);
  });

  it("packaging budget > 20% of margin triggers risk note", () => {
    const r = computeUnboxingScore({
      ...base,
      packagingBudget: 30,
      productMarginBudget: 100,
    });
    expect(r.riskNotes.some((n) => n.includes("20%"))).toBe(true);
  });

  it("returns max 3 quick wins", () => {
    const r = computeUnboxingScore(base);
    expect(r.quickWins.length).toBeLessThanOrEqual(3);
  });

  it("recommendedKit varies by positioning", () => {
    const premium = computeUnboxingScore({ ...base, targetPositioning: "premium" });
    const budget = computeUnboxingScore({ ...base, targetPositioning: "budget" });
    expect(premium.recommendedKit.length).toBeGreaterThan(budget.recommendedKit.length);
  });

  it("score never exceeds 100", () => {
    const r = computeUnboxingScore({
      ...base,
      packagingType: "custom_box",
      tissuePaper: true,
      stickerSeal: true,
      thankYouCard: true,
      insertSamples: true,
      customLabeling: true,
      returnFriendly: true,
    });
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it("score never goes below 0", () => {
    const r = computeUnboxingScore({
      ...base,
      packagingType: "poly_mailer",
      targetPositioning: "premium",
    });
    expect(r.score).toBeGreaterThanOrEqual(0);
  });
});
