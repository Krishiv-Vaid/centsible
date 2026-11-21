import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addPoints, checkBadges, checkIn, checkMilestones, focusIndex, level } from "./rewards.js";
import { freshPlan } from "./storage.js";

describe("level", () => {
  it("maps points to coin levels", () => {
    expect(level(0)).toMatchObject({ n: 1, name: "Penny" });
    expect(level(150)).toMatchObject({ n: 2, name: "Nickel" });
    expect(level(9999)).toMatchObject({ name: "Gold Maple", pct: 100, next: undefined });
  });
});

describe("addPoints", () => {
  it("announces level-ups alongside the normal message", () => {
    const S = { points: 145 };
    const msgs = [];
    addPoints(S, 10, "+10 pts", msgs);
    expect(S.points).toBe(155);
    expect(msgs).toEqual(["+10 pts", "Level up! You're a Nickel now ✦"]);
  });
});

describe("checkIn", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 2, 10, 12)); });
  afterEach(() => vi.useRealTimers());

  it("starts a streak, ignores repeat logins the same day, and builds day over day", () => {
    const S = freshPlan();
    const msgs = [];
    checkIn(S, msgs, true);
    expect(S.streak).toBe(1);
    expect(S.points).toBe(10);
    checkIn(S, msgs);
    expect(S.points).toBe(10);
    vi.setSystemTime(new Date(2026, 2, 11, 9));
    checkIn(S, msgs);
    expect(S.streak).toBe(2);
  });

  it("resets the streak after a missed day", () => {
    const S = freshPlan();
    checkIn(S, []);
    vi.setSystemTime(new Date(2026, 2, 13, 12));
    checkIn(S, []);
    expect(S.streak).toBe(1);
  });

  it("gives a +50 bonus every 7th day in a row", () => {
    const S = freshPlan();
    for (let d = 0; d < 7; d++) { vi.setSystemTime(new Date(2026, 2, 10 + d, 12)); checkIn(S, []); }
    expect(S.streak).toBe(7);
    expect(S.points).toBe(6 * 10 + 60);
  });
});

describe("badges and milestones", () => {
  it("awards badges once", () => {
    const S = freshPlan();
    S.goals = [{ id: "g", name: "Phone", target: 200, saved: 100 }];
    S.log = [{ id: "l" }];
    const msgs = [];
    checkBadges(S, msgs);
    checkBadges(S, msgs);
    expect(S.badges.sort()).toEqual(["first", "half", "hundred"]);
    expect(msgs).toHaveLength(3);
  });

  it("pays each goal milestone once", () => {
    const S = freshPlan();
    const g = { id: "g", name: "Phone", target: 100, saved: 60 };
    checkMilestones(S, g, []);
    expect(S.points).toBe(15 + 25);
    checkMilestones(S, g, []);
    expect(S.points).toBe(40);
  });
});

describe("focusIndex", () => {
  it("prefers the chosen goal, else the soonest unfinished one", () => {
    const S = { focus: null, goals: [{ id: "a" }, { id: "b" }, { id: "c" }] };
    expect(focusIndex(S, { finish: [0, 8, 3] })).toBe(2);
    expect(focusIndex({ ...S, focus: "b" }, { finish: [0, 8, 3] })).toBe(1);
    expect(focusIndex({ focus: null, goals: [] }, { finish: [] })).toBe(-1);
  });
});
