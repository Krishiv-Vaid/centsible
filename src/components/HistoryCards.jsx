import { BADGES } from "../lib/constants.js";
import { $2 } from "../lib/format.js";

export function BadgesCard({ S }) {
  return (
    <div className="card">
      <div className="ctitle">Badges</div>
      <div className="badges">
        {BADGES.map((b) => (
          <div key={b.id} className={"badge" + (S.badges.includes(b.id) ? " got" : "")}>
            <span className="md">{b.short}</span><b>{b.name}</b><span>{b.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LogCard({ S }) {
  const names = Object.fromEntries(S.goals.map((g) => [g.id, g.name]));
  const items = [...S.log].reverse().slice(0, 6);
  return (
    <div className="card">
      <div className="ctitle">Recent Deposits</div>
      <div className="log">
        {items.length ? items.map((l) => (
          <div className="r" key={l.id}>
            <span>{names[l.goalId] || "Removed goal"}<br /><span className="hint">{new Date(l.date + "T12:00").toLocaleDateString("en-CA", { month: "short", day: "numeric" })}{l.note ? " · " + l.note : ""}</span></span>
            <span className="amt">+{$2(l.amt)}</span>
          </div>
        )) : <div className="hint">Tap “+ Add $” on a goal when you put money aside, and it shows up here.</div>}
      </div>
    </div>
  );
}
