import { GOAL_IDEAS } from "../lib/constants.js";
import { $0, clamp, fmtK, monthLabel, monthsUntil, plural } from "../lib/format.js";

function MiniRing({ pct, done }) {
  const r = 22, c = 2 * Math.PI * r, d = (clamp(pct, 0, 100) / 100) * c;
  return (
    <div className="mini">
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#e8dfd0" strokeWidth="6" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={done ? "#5a8f50" : "#c8a97e"} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${d} ${c}`} />
      </svg>
      <span>{Math.floor(pct)}%</span>
    </div>
  );
}

export default function GoalsCard({ S, sim, fi, update, setModal }) {
  return (
    <div className="card">
      <div className="chead">
        <div className="ctitle">Your Goals</div>
        <div className="tabs sm" role="group" aria-label="How to split savings">
          <button type="button" aria-pressed={S.mode === "split"} title="Each goal gets a share based on its deadline" onClick={() => update((d) => { d.mode = "split"; })}>Split</button>
          <button type="button" aria-pressed={S.mode === "order"} title="Finish the top goal first" onClick={() => update((d) => { d.mode = "order"; })}>One at a time</button>
        </div>
      </div>
      {!S.goals.length ? (
        <div className="empty">
          <span>What are you saving for?</span>
          <div className="chips" style={{ justifyContent: "center" }}>
            {Object.entries(GOAL_IDEAS).slice(0, 6).map(([n, pr]) => (
              <button key={n} className="chip" type="button" onClick={() => setModal({ type: "goal", preset: { name: n, price: pr } })}>{n}</button>
            ))}
          </div>
        </div>
      ) : S.goals.map((g, i) => {
        const pct = g.target > 0 ? (g.saved / g.target) * 100 : 0;
        const done = g.target > 0 && g.saved >= g.target;
        const f = sim.finish[i];
        const left = monthsUntil(g.deadline);
        let st;
        if (done) st = <span className="pill ok">Funded</span>;
        else if (f === null) st = <span className="pill no">Not reachable yet</span>;
        else if (left === null) st = <span className="pill mu">{monthLabel(f)}</span>;
        else if (f <= Math.max(left, 0)) st = <span className="pill ok">On track</span>;
        else st = <span className="pill no">{plural(f - Math.max(left, 0), "month")} late</span>;
        return (
          <div key={g.id} className={"goal" + (i === fi ? " sel" : "")} onClick={() => update((d) => { d.focus = g.id; })}>
            <MiniRing pct={pct} done={done} />
            <div style={{ minWidth: 0, display: "grid", gap: 3 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><span className="gname">{g.name}</span>{st}</div>
              <div className="gmeta">
                <span className="num">{fmtK(g.saved)} / {fmtK(g.target)}</span>
                {!done && f ? <span>ready {monthLabel(f)}</span> : null}
                {!done && sim.alloc[i] > 0 ? <span className="num">{$0(sim.alloc[i])}/mo</span> : null}
              </div>
            </div>
            <div className="gact" onClick={(e) => e.stopPropagation()}>
              <button className="btn deep" type="button" onClick={() => setModal({ type: "deposit", goal: g })}>+ Add $</button>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                {i > 0 && S.mode === "order" && (
                  <button className="btn ghost" type="button" aria-label="Move up" onClick={() => update((d) => { [d.goals[i - 1], d.goals[i]] = [d.goals[i], d.goals[i - 1]]; })}>↑</button>
                )}
                <button className="btn ghost" type="button" onClick={() => setModal({ type: "goal", goal: g })}>Edit</button>
              </div>
            </div>
          </div>
        );
      })}
      <button className="btn-main" type="button" style={{ marginTop: 16 }} onClick={() => setModal({ type: "goal" })}>+ Add a Goal</button>
    </div>
  );
}
