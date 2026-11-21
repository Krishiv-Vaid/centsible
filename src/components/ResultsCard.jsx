import { $2, fmtK, monthLabel, monthsUntil, plural } from "../lib/format.js";

function CircleProgress({ pct, saved, target }) {
  const r = 93, C = 2 * Math.PI * r;
  return (
    <div className="circle">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={r} fill="none" stroke="#e8dfd0" strokeWidth="14" />
        <circle className="arc" cx="100" cy="100" r={r} fill="none" stroke="#c8a97e" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${(pct / 100) * C} ${C}`} />
      </svg>
      <div className="in">
        <span className="pct num">{Math.round(pct)}%</span>
        <span style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>of goal</span>
        {target > 0 && <span className="num" style={{ fontSize: 12, color: "var(--soft-text)", marginTop: 2 }}>{fmtK(Math.min(saved, target))} / {fmtK(target)}</span>}
      </div>
    </div>
  );
}

export default function ResultsCard({ S, p, save, sim, fi }) {
  const g = fi >= 0 ? S.goals[fi] : null;
  let feas;
  if (!g) feas = ["no", "Add a goal above to see your plan"];
  else {
    const f = sim.finish[fi], left = monthsUntil(g.deadline);
    if (f === 0) feas = ["ok", "You've reached your goal! 🎉"];
    else if (f === null) feas = ["no", "At this rate you won’t get there. Spend a little less or add hours."];
    else if (left === null || f <= Math.max(left, 0)) feas = ["ok", `You will reach your goal in ${plural(f, "month")}! (${monthLabel(f)})`];
    else feas = ["no", `At this rate, you need about ${plural(f, "month")} (${monthLabel(f)}), ${plural(f - Math.max(left, 0), "month")} past your deadline`];
  }
  const pct = g && g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0;
  const stats = [
    ["Monthly Net", fmtK(p.monthlyNet)], ["Monthly Savings", fmtK(save)],
    ["Already Saved", fmtK(g ? g.saved : 0)], ["Still Needed", fmtK(g ? Math.max(0, g.target - g.saved) : 0)],
  ];
  const daily = [["Save", save / 30], ...S.expenses.map((e) => [e.name || "Untitled", (+e.amt || 0) / 30])];
  return (
    <div className="card">
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: "var(--muted)", letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 500 }}>saving for</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 700, marginTop: 4, overflowWrap: "anywhere" }}>{g ? g.name : "Your first goal"}</div>
      </div>
      <CircleProgress pct={pct} saved={g?.saved || 0} target={g?.target || 0} />
      <div className={"feas " + feas[0]}>{feas[1]}</div>
      <div className="stats">
        {stats.map(([l, v]) => <div className="stat" key={l}><div className="eyebrow">{l}</div><div className="serifnum">{v}</div></div>)}
      </div>
      <div className="box">
        <div className="ctitle">Daily Breakdown</div>
        {daily.map(([k, v], i) => (
          <div className="row" key={i}><span className="k">{k}</span><span className="val" style={i === 0 ? { color: "var(--good)" } : undefined}>{$2(v)}</span></div>
        ))}
      </div>
    </div>
  );
}
