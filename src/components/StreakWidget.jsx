import { DAY_NAMES } from "../lib/constants.js";
import { addDays, clamp, today, ymd } from "../lib/format.js";
import { level } from "../lib/rewards.js";

export default function StreakWidget({ S }) {
  const now = new Date();
  const mon = addDays(now, -((now.getDay() + 6) % 7));
  const t = today();
  const L = level(S.points);
  return (
    <div className="card" style={{ padding: "20px 24px" }}>
      <div className="streak-top">
        <div>
          <div className="eyebrow">Login Streak</div>
          <div className="serifnum" style={{ fontSize: 22 }}>{S.streak} day{S.streak !== 1 ? "s" : ""} 🔥</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="eyebrow">Total Points</div>
          <div className="serifnum" style={{ fontSize: 22, color: "var(--accentDeep)" }}>✦ {S.points}</div>
        </div>
      </div>
      <div className="week">
        {DAY_NAMES.map((n, i) => {
          const k = ymd(addDays(mon, i));
          const on = S.loginDays.includes(k);
          return (
            <div key={k} className={"day" + (on ? " on" : "") + (k === t ? " today" : "")}>
              <div className="b">{on ? "✓" : "·"}</div>
              <div className="n">{n}</div>
            </div>
          );
        })}
      </div>
      <div className="level">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
            <span className="eyebrow">Level {L.n} · <span style={{ color: "var(--accentDeep)" }}>{L.name}</span></span>
            <span className="hint">{L.next ? `${L.next[1] - S.points} pts to ${L.next[0]}` : "Top level!"}</span>
          </div>
          <div className="bar"><div style={{ width: clamp(L.pct, 0, 100) + "%" }}></div></div>
        </div>
      </div>
      <div className="infobox" style={{ marginTop: 12, textAlign: "center" }}>
        +10 pts per login · bonus at 7-day streak 🎁 · +5 per deposit · bonuses at 25/50/75/100% of a goal
      </div>
    </div>
  );
}
