import { useEffect, useRef } from "react";
import { EXP_COLORS, GOAL_GREEN } from "../lib/constants.js";
import { $0, uid } from "../lib/format.js";
import { spending } from "../lib/money.js";
import { NumInput } from "./ui.jsx";

export default function SpendingCard({ S, p, update }) {
  const total = spending(S);
  const net = Math.max(0, p.monthlyNet);
  const save = Math.max(0, net - total);
  const denom = Math.max(net, total) || 1;
  const pct = net > 0 ? Math.round((total / net) * 100) : 0;

  // Focus the name box of a freshly added row
  const lastAdded = useRef(null);
  useEffect(() => {
    if (lastAdded.current) { document.getElementById("en-" + lastAdded.current)?.focus(); lastAdded.current = null; }
  });

  const setExp = (id, fn) => update((d) => { const e = d.expenses.find((x) => x.id === id); if (e) fn(e); });
  return (
    <div className="card">
      <div className="chead">
        <div className="ctitle">Monthly Spending</div>
        <button className="btn" type="button" onClick={() => { const id = uid(); lastAdded.current = id; update((d) => { d.expenses.push({ id, name: "", amt: 0 }); }); }}>+ Add</button>
      </div>
      <div className="split" aria-hidden="true">
        {S.expenses.map((e, i) => <div key={e.id} style={{ width: ((Math.max(0, e.amt) / denom) * 100).toFixed(2) + "%", background: EXP_COLORS[i % EXP_COLORS.length] }}></div>)}
        <div style={{ width: ((save / denom) * 100).toFixed(2) + "%", background: GOAL_GREEN }}></div>
      </div>
      <div className="legend">
        {S.expenses.map((e, i) => <span key={e.id}><i style={{ background: EXP_COLORS[i % EXP_COLORS.length] }}></i>{e.name || "Untitled"}</span>)}
        <span><i style={{ background: GOAL_GREEN }}></i>Goals {$0(save)}</span>
      </div>
      {S.expenses.length ? S.expenses.map((e, i) => (
        <div className="exp" key={e.id}>
          <input className="input" id={"en-" + e.id} value={e.name} maxLength={30} placeholder="e.g. Food" aria-label={`Spending category ${i + 1}`}
            onChange={(ev) => { const v = ev.target.value; setExp(e.id, (x) => { x.name = v; }); }} />
          <div className="money"><NumInput className="input num" step="5" min={0} max={99999} value={e.amt} aria-label="Amount per month" onValue={(v) => setExp(e.id, (x) => { x.amt = v; })} /></div>
          <button className="btn ghost" type="button" aria-label="Remove" onClick={() => update((d) => { d.expenses = d.expenses.filter((x) => x.id !== e.id); })}>×</button>
        </div>
      )) : <div className="hint">Add the things you pay for each month.</div>}
      <div className="hint" style={{ marginTop: 12 }}>
        {total > net
          ? <span className="hint warn">You're spending {$0(total - net)} more than you take home.</span>
          : `Spending ${$0(total)}/month (${pct}% of take-home). A good target is saving at least 20%.`}
      </div>
    </div>
  );
}
