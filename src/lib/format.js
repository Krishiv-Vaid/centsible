export const uid = () => Math.random().toString(36).slice(2, 10);
export const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

const f0 = new Intl.NumberFormat("en-CA", { maximumFractionDigits: 0 });
const f2 = new Intl.NumberFormat("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const $0 = (n) => (n < 0 ? "−" : "") + "$" + f0.format(Math.abs(Math.round(n || 0)));
export const $2 = (n) => (n < 0 ? "−" : "") + "$" + f2.format(Math.abs(n || 0));
export const fmtK = (n) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n || 0)}`);
export const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
export const hex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");

// ─── Dates ───────────────────────────────────────────────────────────────────
// Local dates on purpose: UTC would flip to "tomorrow" in the evening in Ontario.
const pad = (n) => String(n).padStart(2, "0");
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => ymd(new Date());
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const monthLabel = (m) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + m); return d.toLocaleDateString("en-CA", { month: "short", year: "numeric" }); };
export const ym = (m) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + m); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
export const monthsUntil = (s) => { if (!s) return null; const [y, m] = s.split("-").map(Number); const n = new Date(); return (y - n.getFullYear()) * 12 + (m - 1 - n.getMonth()); };
