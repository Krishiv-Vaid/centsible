import { $0, fmtK, monthLabel } from "../lib/format.js";

// Round an axis step up to 1, 2, 2.5, 5 or 10 × a power of ten
const nice = (v) => { const p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; };

export default function ChartCard({ S, sim }) {
  const s = sim.series;
  let body;
  if (!S.goals.length || s.length < 2) {
    body = <div className="empty">{S.goals.length ? "Once you’re saving each month, your path shows up here." : "Add a goal to see your savings path."}</div>;
  } else {
    const W = 460, H = 220, L = 50, R = 12, T = 30, B = 26, n = s.length - 1;
    const maxY = Math.max(...s, S.goals.reduce((a, g) => a + (+g.target || 0), 0)) || 1;
    const step = nice(maxY / 4), top = Math.ceil(maxY / step) * step;
    const x = (i) => L + ((W - L - R) * i) / Math.max(n, 1);
    const y = (v) => T + (H - T - B) * (1 - v / top);
    const gridVals = [];
    for (let v = 0; v <= top + 0.01; v += step) gridVals.push(v);
    const ticks = [];
    const ev = Math.max(1, Math.ceil(n / 4));
    for (let i = 0; i <= n; i += ev) ticks.push(i);
    if (ticks[ticks.length - 1] !== n) { if (n - ticks[ticks.length - 1] < ev / 2) ticks.pop(); ticks.push(n); }
    const pts = s.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
    const area = `M${x(0)},${y(0)} L${pts.join(" L")} L${x(n)},${y(0)} Z`;
    // Goals finishing in the same month share one dot
    const by = {};
    S.goals.forEach((g, i) => { const f = sim.finish[i]; if (f > 0) (by[f] = by[f] || []).push(g.name); });
    const marks = Object.keys(by).map(Number).sort((a, b) => a - b);
    body = (
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Projected savings reaching ${$0(s[n])} by ${monthLabel(n)}`}>
        {gridVals.map((v) => (
          <g key={v}>
            <line className="g" x1={L} x2={W - R} y1={y(v)} y2={y(v)} />
            <text x={L - 7} y={y(v) + 4} textAnchor="end">{fmtK(v)}</text>
          </g>
        ))}
        {ticks.map((i) => <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === n ? "end" : "middle"}>{i === 0 ? "Now" : monthLabel(i)}</text>)}
        <path className="area" d={area} />
        <polyline className="ln" points={pts.join(" ")} />
        {marks.map((f, k) => {
          const cx = x(f), cy = y(s[f]), end = cx > W - 140;
          return (
            <g key={f}>
              <circle className="mk" cx={cx} cy={cy} r="5" />
              <text className="ml" x={cx + (end ? -8 : 8)} y={cy - 9 - (k % 2) * 13} textAnchor={end ? "end" : "start"}>{by[f].join(" + ")}</text>
            </g>
          );
        })}
      </svg>
    );
  }
  return (
    <div className="card">
      <div className="ctitle">Where You'll Be</div>
      <div className="hint" style={{ margin: "-8px 0 14px" }}>Total saved if you stick to the plan. Dots mark each goal you finish.</div>
      {body}
    </div>
  );
}
