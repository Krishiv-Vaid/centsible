import { CPP_EXEMPT, CPP_RATE, EI_RATE, FED_BPA, FED_RATE, ON_BPA, ON_RATE } from "./constants.js";
import { clamp, monthsUntil } from "./format.js";

// Yearly pay → deductions → monthly take-home
export function paycheque(st) {
  const wage = Math.max(0, +st.wage || 0);
  const hours = clamp(+st.hours || 0, 0, 60);
  const weeks = clamp(+st.weeks || 0, 0, 52);
  const annual = wage * hours * weeks;
  const ei = annual * EI_RATE;
  const cpp = +st.age >= 18 ? Math.max(0, annual - CPP_EXEMPT) * CPP_RATE : 0;
  const fed = Math.max(0, annual - FED_BPA) * FED_RATE;
  const on = Math.max(0, annual - ON_BPA) * ON_RATE;
  // Ontario Health Premium
  let ohp = 0;
  if (annual > 20000) ohp = Math.min(300, (annual - 20000) * 0.06);
  if (annual > 36000) ohp = Math.min(450, 300 + (annual - 36000) * 0.25);
  const tax = fed + on + ohp;
  const net = annual - ei - cpp - tax;
  const extra = Math.max(0, +st.extra || 0);
  return { wage, hours, weeks, annual, ei, cpp, tax, net, extra, monthlyGross: annual / 12, monthlyPay: net / 12, monthlyNet: net / 12 + extra };
}

export const spending = (st) => st.expenses.reduce((a, e) => a + Math.max(0, +e.amt || 0), 0);
export const monthlySavings = (st) => Math.max(0, paycheque(st).monthlyNet - spending(st));

// Month-by-month: how savings fill each goal ("split" by deadline, or "order" one at a time).
// Returns the month each goal finishes (0 = already funded, null = not within 10 years),
// the first month's allocation per goal, and the running total saved.
export function simulate(st, monthly = monthlySavings(st)) {
  const goals = st.goals;
  const rem = goals.map((g) => Math.max(0, (+g.target || 0) - (+g.saved || 0)));
  const finish = rem.map((r) => (r <= 0 ? 0 : null));
  const alloc = goals.map(() => 0);
  let total = goals.reduce((a, g) => a + Math.min(+g.saved || 0, +g.target || 0), 0);
  const series = [total];
  const active = () => rem.map((_, i) => i).filter((i) => rem[i] > 0.005);
  for (let m = 1; m <= 120 && active().length && monthly > 0; m++) {
    let pool = monthly;
    if (st.mode === "order") {
      for (const i of active()) {
        const g = Math.min(pool, rem[i]);
        rem[i] -= g; pool -= g;
        if (m === 1) alloc[i] += g;
        if (pool <= 0) break;
      }
    } else {
      // Weight each goal by what it still needs per remaining month, and
      // re-split leftovers when a goal fills up mid-month.
      for (let guard = 0; pool > 0.005 && active().length && guard < 20; guard++) {
        const act = active();
        const w = act.map((i) => rem[i] / Math.max(1, (monthsUntil(goals[i].deadline) ?? 12) - m + 1));
        const sw = w.reduce((a, b) => a + b, 0) || 1;
        let used = 0;
        act.forEach((i, k) => { const g = Math.min(rem[i], (pool * w[k]) / sw); rem[i] -= g; used += g; if (m === 1) alloc[i] += g; });
        pool -= used;
        if (used < 0.005) break;
      }
    }
    total += monthly - pool;
    series.push(total);
    rem.forEach((r, i) => { if (finish[i] === null && r <= 0.005) finish[i] = m; });
  }
  return { finish, alloc, series };
}
