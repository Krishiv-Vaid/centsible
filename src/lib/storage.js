import { STUDENT_WAGE } from "./constants.js";
import { hex, uid } from "./format.js";

// Everything lives in this browser's localStorage. Keep these keys stable:
// changing them would make existing users lose their plans.
export const STORE = "centsible:v3";
export const SESSION = "centsible:session";

export function loadDB() {
  try { const raw = JSON.parse(localStorage.getItem(STORE)); if (raw && raw.users) return raw; } catch (_) {}
  return { users: {} };
}
export function saveDB(db) {
  try { localStorage.setItem(STORE, JSON.stringify(db)); } catch (_) {}
}
export const getSession = () => { try { return localStorage.getItem(SESSION); } catch (_) { return null; } };
export const setSession = (low) => { try { if (low) localStorage.setItem(SESSION, low); else localStorage.removeItem(SESSION); } catch (_) {} };

// Accounts made in the first version of Centsible
export function legacyUser(low) {
  try { const r = localStorage.getItem("centsible_user:" + low); return r ? JSON.parse(r) : null; } catch (_) { return null; }
}

// ─── Password hashing (Web Crypto) ───────────────────────────────────────────
export async function pbkdf2(pw, salt) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 120000, hash: "SHA-256" }, key, 256));
}
export async function sha256(pw) { return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw))); }
export const newSalt = () => hex(crypto.getRandomValues(new Uint8Array(16)));

// ─── Plan shape ──────────────────────────────────────────────────────────────
export function freshPlan() {
  return {
    age: 16, job: "Barista", wage: STUDENT_WAGE, hours: 12, weeks: 50, extra: 0, mode: "split", focus: null,
    expenses: [
      { id: uid(), name: "Food", amt: 120 }, { id: uid(), name: "Transport", amt: 60 },
      { id: uid(), name: "Phone", amt: 40 }, { id: uid(), name: "Fun", amt: 80 },
    ],
    goals: [], log: [], points: 0, streak: 0, lastCheck: null, loginDays: [], badges: [], milestones: {}, updatedAt: Date.now(),
  };
}

// Fill in anything missing from older or damaged saves
export function normalize(p) {
  const o = { ...freshPlan(), ...(p || {}) };
  for (const k of ["expenses", "goals", "log", "loginDays", "badges"]) if (!Array.isArray(o[k])) o[k] = [];
  if (!o.milestones || typeof o.milestones !== "object") o.milestones = {};
  return o;
}
export const clone = (o) => JSON.parse(JSON.stringify(o));
