import { describe, expect, it } from "vitest";
import { pass2Issue, passIssue, userIssue } from "./validation.jsx";
import { JOBS, studentAdjusted } from "./jobs.js";
import { MIN_WAGE, STUDENT_WAGE } from "./constants.js";

describe("usernames", () => {
  it("accepts valid names", () => expect(userIssue("cash_queen.07")).toBeNull());
  it("rejects short, long and symbol names", () => {
    expect(userIssue("ab")).not.toBeNull();
    expect(userIssue("a".repeat(21))).not.toBeNull();
    expect(userIssue("hey!")).not.toBeNull();
  });
  it("offers an underscore fix for spaces", () => expect(userIssue("big saver").fix).toBe("big_saver"));
});

describe("passwords", () => {
  it("only enforces rules on sign-up", () => {
    expect(passIssue("abc", "login")).toBeNull();
    expect(passIssue("abc", "signup")).not.toBeNull();
    expect(passIssue("Abcde1!", "signup")).toBeNull();
  });
  it("checks the confirmation matches", () => {
    expect(pass2Issue("Abcde1!", "Abcde1!")).toBeNull();
    expect(pass2Issue("Abcde1!", "Abcde1?")).not.toBeNull();
  });
});

describe("jobs", () => {
  it("defaults unlisted wages to minimum wage and lowers them for under-18s", () => {
    expect(JOBS.Cashier.wage).toBe(MIN_WAGE);
    expect(studentAdjusted(JOBS.Cashier.wage, 16)).toBe(STUDENT_WAGE);
    expect(studentAdjusted(JOBS.Lifeguard.wage, 16)).toBe(18.5);
    expect(JOBS.Barista.tips).toBe(true);
  });
});
