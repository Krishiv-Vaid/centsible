import { useState } from "react";
import { GOAL_IDEAS } from "../lib/constants.js";
import { $0, $2, today, uid, ym } from "../lib/format.js";
import { addPoints, checkMilestones } from "../lib/rewards.js";
import { Modal } from "./ui.jsx";

export function GoalModal({ goal, preset, update, toast, onClose }) {
  const [name, setName] = useState(goal?.name || preset?.name || "");
  const [target, setTarget] = useState(String(goal?.target ?? preset?.price ?? ""));
  const [saved, setSaved] = useState(String(goal?.saved ?? 0));
  const [deadline, setDeadline] = useState(goal ? goal.deadline || "" : ym(6));
  const [err, setErr] = useState("");
  const [sure, setSure] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const nm = name.trim(), t = +target, s = Math.max(0, +saved || 0);
    if (!nm) return setErr("Give your goal a name.");
    if (!(t > 0)) return setErr("Enter a price above $0.");
    update((d, msgs) => {
      let g;
      if (goal) { g = d.goals.find((x) => x.id === goal.id); Object.assign(g, { name: nm, target: t, saved: s, deadline }); }
      else { g = { id: uid(), name: nm, target: t, saved: s, deadline }; d.goals.push(g); d.focus = g.id; }
      checkMilestones(d, g, msgs);
    });
    onClose();
    if (!goal) toast(`${nm} added. You've got this!`);
  };
  // Two taps to delete, so a stray click can't wipe a goal
  const del = () => {
    if (!sure) return setSure(true);
    update((d) => { d.goals = d.goals.filter((x) => x.id !== goal.id); if (d.focus === goal.id) d.focus = null; });
    onClose();
    toast("Goal deleted");
  };

  return (
    <Modal onClose={onClose}>
      <h2 id="mTitle">{goal ? "Edit Goal" : "New Goal"}</h2>
      {!goal && (
        <div>
          <div className="label">Quick picks</div>
          <div className="chips">
            {Object.entries(GOAL_IDEAS).map(([n, pr]) => (
              <button key={n} className="chip" type="button" onClick={() => { setName(n); setTarget(String(pr)); }}>{n}</button>
            ))}
          </div>
        </div>
      )}
      <form onSubmit={submit} style={{ display: "grid", gap: 16 }} noValidate>
        <div><label htmlFor="gName">Your Goal</label><input className="input" id="gName" maxLength={40} value={name} placeholder="e.g. New phone" onChange={(e) => setName(e.target.value)} /></div>
        <div className="two">
          <div><label htmlFor="gTarget">Price</label><div className="money"><input className="input num" id="gTarget" type="number" min="1" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} /></div></div>
          <div><label htmlFor="gSaved">Already Saved</label><div className="money"><input className="input num" id="gSaved" type="number" min="0" inputMode="decimal" value={saved} onChange={(e) => setSaved(e.target.value)} /></div></div>
        </div>
        <div>
          <label htmlFor="gDeadline">Want It By</label>
          <input className="input" id="gDeadline" type="month" min={ym(0)} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <div className="hint" style={{ marginTop: 6 }}>Quick-pick prices are estimates. Check the real price, plus 13% HST, before you buy.</div>
        </div>
        {err && <div className="errbox">{err}</div>}
        <div className="btns">
          {goal && <button className="btn" type="button" style={{ marginRight: "auto", color: "var(--err)" }} onClick={del}>{sure ? "Tap again to delete" : "Delete"}</button>}
          <button className="btn" type="button" onClick={onClose}>Cancel</button>
          <button className="btn deep" type="submit">{goal ? "Save" : "Add Goal"}</button>
        </div>
      </form>
    </Modal>
  );
}

export function DepositModal({ goal, update, onClose }) {
  const [amt, setAmt] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const left = Math.max(0, goal.target - goal.saved);
  const submit = (e) => {
    e.preventDefault();
    const a = Math.round((+amt || 0) * 100) / 100;
    if (!(a > 0)) return setErr("Enter an amount above $0.");
    update((d, msgs) => {
      const g = d.goals.find((x) => x.id === goal.id);
      if (!g) return;
      g.saved = Math.round((g.saved + a) * 100) / 100;
      d.log.push({ id: uid(), goalId: g.id, amt: a, date: today(), note: note.trim() });
      d.log = d.log.slice(-200);
      addPoints(d, 5, `+5 pts · ${$2(a)} added to ${g.name}`, msgs);
      checkMilestones(d, g, msgs);
    });
    onClose();
  };
  return (
    <Modal onClose={onClose}>
      <h2 id="mTitle">Add to {goal.name}</h2>
      <div className="hint" style={{ marginTop: -8 }}>{$0(goal.saved)} saved · {$0(left)} to go</div>
      <form onSubmit={submit} style={{ display: "grid", gap: 16 }} noValidate>
        <div className="chips">
          {[10, 20, 50, 100].filter((v) => v <= Math.max(left, 10)).map((v) => <button key={v} className="chip" type="button" onClick={() => setAmt(String(v))}>${v}</button>)}
          {left > 0 && <button className="chip" type="button" onClick={() => setAmt(left.toFixed(2))}>All {$0(left)}</button>}
        </div>
        <div><label htmlFor="dAmt">Amount</label><div className="money"><input className="input num" id="dAmt" type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="0.00" value={amt} onChange={(e) => setAmt(e.target.value)} /></div></div>
        <div><label htmlFor="dNote">Note (optional)</label><input className="input" id="dNote" maxLength={40} placeholder="e.g. Friday paycheque" value={note} onChange={(e) => setNote(e.target.value)} /></div>
        {err && <div className="errbox">{err}</div>}
        <div className="btns">
          <button className="btn" type="button" onClick={onClose}>Cancel</button>
          <button className="btn deep" type="submit">Add Money</button>
        </div>
      </form>
    </Modal>
  );
}
