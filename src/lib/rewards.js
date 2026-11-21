import { BADGES, LEVELS } from "./constants.js";
import { addDays, today, ymd } from "./format.js";

// These mutate a draft plan and push toast messages into `msgs`.

export function level(p) {
  let i = 0;
  LEVELS.forEach((l, k) => { if (p >= l[1]) i = k; });
  const cur = LEVELS[i], next = LEVELS[i + 1];
  return { n: i + 1, name: cur[0], next, pct: next ? ((p - cur[1]) / (next[1] - cur[1])) * 100 : 100 };
}

// Every way of earning points goes through here, so level-ups are never missed
export function addPoints(S, n, msg, msgs) {
  const before = level(S.points).n;
  S.points += n;
  if (msg) msgs.push(msg);
  const L = level(S.points);
  if (L.n > before) msgs.push(`Level up! You're a ${L.name} now ✦`);
}

export function checkIn(S, msgs, isNew) {
  const t = today();
  if (S.lastCheck === t) return;
  const y = ymd(addDays(new Date(), -1));
  const hadYesterday = S.lastCheck === y || S.loginDays.includes(y);
  S.streak = hadYesterday ? (S.streak || 0) + 1 : 1;
  S.lastCheck = t;
  if (!S.loginDays.includes(t)) S.loginDays.push(t);
  S.loginDays = S.loginDays.slice(-60);
  let pts = 10, why = isNew ? "Welcome to Centsible!" : "Daily login";
  if (S.streak % 7 === 0) { pts += 50; why = `${S.streak}-day streak bonus 🎁`; }
  addPoints(S, pts, `+${pts} pts · ${why}`, msgs);
}

export function checkBadges(S, msgs) {
  const tot = S.goals.reduce((a, g) => a + (+g.saved || 0), 0);
  const want = {
    first: S.log.length > 0, streak7: S.streak >= 7, hundred: tot >= 100, thousand: tot >= 1000,
    half: S.goals.some((g) => g.target > 0 && g.saved >= g.target / 2),
    done: S.goals.some((g) => g.target > 0 && g.saved >= g.target),
  };
  for (const b of BADGES) if (want[b.id] && !S.badges.includes(b.id)) { S.badges.push(b.id); msgs.push(`Badge unlocked: ${b.name}`); }
}

export function checkMilestones(S, g, msgs) {
  const pct = g.target > 0 ? (g.saved / g.target) * 100 : 0;
  const hit = S.milestones[g.id] || [];
  for (const [m, pts] of [[25, 15], [50, 25], [75, 35], [100, 100]]) {
    if (pct >= m && !hit.includes(m)) {
      hit.push(m);
      addPoints(S, pts, m === 100 ? `You did it! ${g.name} is fully funded. +${pts} pts` : `${g.name} hit ${m}%! +${pts} pts`, msgs);
    }
  }
  S.milestones[g.id] = hit;
}

// The goal shown in the big results card: the one you tapped, else the soonest to finish
export function focusIndex(S, sim) {
  const i = S.goals.findIndex((g) => g.id === S.focus);
  if (i >= 0) return i;
  let best = -1;
  S.goals.forEach((g, k) => {
    const f = sim.finish[k];
    if (f !== 0 && (best < 0 || (f ?? 999) < (sim.finish[best] ?? 999))) best = k;
  });
  return best >= 0 ? best : S.goals.length ? 0 : -1;
}
