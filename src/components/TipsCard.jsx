import { FED_BPA } from "../lib/constants.js";
import { $0, monthLabel, plural } from "../lib/format.js";
import { paycheque, simulate } from "../lib/money.js";

// Personal "what if" tips: re-run the plan with small changes and report the difference
export default function TipsCard({ S, p, save, sim, fi }) {
  const out = [];
  if (fi >= 0 && sim.finish[fi] > 0) {
    const g = S.goals[fi], f = sim.finish[fi];
    const f2 = simulate({ ...S, hours: Math.min(60, S.hours + 2) }).finish[fi];
    out.push(["+2h", f2 && f2 < f
      ? <>Two more hours a week gets you <strong>{g.name}</strong> {plural(f - f2, "month")} sooner ({monthLabel(f2)}).</>
      : <>Two more hours a week adds about <strong>{$0(paycheque({ ...S, hours: S.hours + 2 }).monthlyNet - p.monthlyNet)}</strong> a month.</>]);
    const big = [...S.expenses].sort((a, b) => b.amt - a.amt)[0];
    if (big && big.amt >= 20) {
      const cut = Math.round(big.amt * 0.25);
      const f3 = simulate({ ...S, expenses: S.expenses.map((e) => (e.id === big.id ? { ...e, amt: e.amt - cut } : e)) }).finish[fi];
      out.push(["−25%", f3 && f3 < f
        ? <>Spend {$0(cut)} less on <strong>{big.name || "your biggest expense"}</strong> each month and {g.name} arrives {plural(f - f3, "month")} earlier.</>
        : <>Spending {$0(cut)} less on <strong>{big.name || "your biggest expense"}</strong> each month adds {$0(cut * 12)} a year to your goals.</>]);
    }
  }
  if (p.annual > 0 && p.annual < FED_BPA) out.push(["$", `You earn under ${$0(FED_BPA)} a year, so you likely owe no income tax. If your employer takes any off, file a tax return to get it back.`]);
  if (+S.age < 18) out.push(["18", "At 18 you can open a TFSA, where savings grow tax-free. Until then, a youth savings account with a parent or guardian works well."]);
  out.push(save > 0
    ? ["%", `Saving ${$0(save)} a month is ${$0(save * 12)} a year. An automatic transfer on payday makes it effortless.`]
    : ["!", "Your spending uses up all your take-home pay. Lower a spending line or add hours to start saving."]);
  return (
    <div className="card">
      <div className="ctitle">Ways to Get There Faster</div>
      {out.slice(0, 4).map(([ic, t], i) => <div className="tip" key={i}><span className="ic">{ic}</span><span>{t}</span></div>)}
    </div>
  );
}
