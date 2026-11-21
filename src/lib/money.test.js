import { describe, expect, it } from "vitest";
import { monthlySavings, paycheque, simulate, spending } from "./money.js";

describe("paycheque", () => {
  it("charges a 16-year-old EI only (no CPP, no income tax under the basic amounts)", () => {
    const p = paycheque({ wage: 16.9, hours: 12, weeks: 50, age: 16 });
    expect(p.annual).toBeCloseTo(10140);
    expect(p.ei).toBeCloseTo(10140 * 0.0163);
    expect(p.cpp).toBe(0);
    expect(p.tax).toBe(0);
    expect(p.net).toBeCloseTo(10140 - 10140 * 0.0163);
  });

  it("adds CPP, federal + Ontario tax and the health premium for a full-time adult", () => {
    const p = paycheque({ wage: 20, hours: 40, weeks: 52, age: 18 });
    expect(p.annual).toBe(41600);
    expect(p.cpp).toBeCloseTo((41600 - 3500) * 0.0595);
    const fed = (41600 - 16452) * 0.14;
    const on = (41600 - 12989) * 0.0505;
    expect(p.tax).toBeCloseTo(fed + on + 450); // health premium capped at $450 in this band
  });

  it("clamps silly hours and weeks, and ignores negative wages", () => {
    expect(paycheque({ wage: 20, hours: 100, weeks: 80, age: 16 }).annual).toBe(20 * 60 * 52);
    expect(paycheque({ wage: -5, hours: 10, weeks: 10, age: 16 }).annual).toBe(0);
  });

  it("adds tips and allowance on top of monthly take-home", () => {
    const p = paycheque({ wage: 0, hours: 0, weeks: 0, age: 16, extra: 75 });
    expect(p.monthlyNet).toBe(75);
  });
});

describe("spending and savings", () => {
  const plan = { wage: 0, hours: 0, weeks: 0, age: 16, extra: 500, expenses: [{ amt: 100 }, { amt: -20 }, { amt: "50" }] };
  it("sums expenses, ignoring negatives", () => expect(spending(plan)).toBe(150));
  it("never reports negative savings", () => {
    expect(monthlySavings(plan)).toBe(350);
    expect(monthlySavings({ ...plan, extra: 0 })).toBe(0);
  });
});

describe("simulate", () => {
  const goal = (id, target, saved = 0, deadline) => ({ id, name: id, target, saved, deadline });

  it("finds the month a single goal is funded", () => {
    const r = simulate({ mode: "split", goals: [goal("a", 1000)] }, 250);
    expect(r.finish).toEqual([4]);
    expect(r.series).toEqual([0, 250, 500, 750, 1000]);
  });

  it("marks already-funded goals as month 0", () => {
    expect(simulate({ mode: "split", goals: [goal("a", 100, 100)] }, 50).finish).toEqual([0]);
  });

  it("returns null when there is nothing to save", () => {
    expect(simulate({ mode: "split", goals: [goal("a", 100)] }, 0).finish).toEqual([null]);
  });

  it("fills goals in order in 'one at a time' mode, spilling leftovers to the next", () => {
    const r = simulate({ mode: "order", goals: [goal("a", 300), goal("b", 300)] }, 200);
    expect(r.finish).toEqual([2, 3]);
    expect(r.alloc).toEqual([200, 0]);
  });

  it("splits evenly between goals with the same deadline", () => {
    const r = simulate({ mode: "split", goals: [goal("a", 300), goal("b", 300)] }, 200);
    expect(r.finish).toEqual([3, 3]);
    expect(r.alloc[0]).toBeCloseTo(100);
    expect(r.alloc[1]).toBeCloseTo(100);
  });

  it("stops after 10 years", () => {
    const r = simulate({ mode: "split", goals: [goal("a", 1e9)] }, 1);
    expect(r.finish).toEqual([null]);
    expect(r.series).toHaveLength(121);
  });
});
