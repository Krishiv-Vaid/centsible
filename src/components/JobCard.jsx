import { useEffect, useRef, useState } from "react";
import { MIN_WAGE, ON_BPA, STUDENT_WAGE } from "../lib/constants.js";
import { $0, $2, clamp, fmtK } from "../lib/format.js";
import { CATALOG, JOB_COUNT, JOBS, studentAdjusted } from "../lib/jobs.js";
import { NumInput } from "./ui.jsx";

function Hl({ text, q }) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return text;
  return <>{text.slice(0, i)}<mark>{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>;
}

// Searchable combobox over the job catalog, with a "use what I typed" fallback
function JobPicker({ S, onPick }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [active, setActive] = useState(0);
  const wrap = useRef(null);
  const list = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (!wrap.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const raw = q.trim();
  const words = raw.toLowerCase().split(/\s+/).filter(Boolean);
  const match = Object.entries(JOBS).filter(([n, j]) => (cat === "All" || j.cat === cat) && words.every((w) => (n + " " + j.cat).toLowerCase().includes(w)));
  const exact = raw && Object.keys(JOBS).some((n) => n.toLowerCase() === raw.toLowerCase());
  const items = [...match.map(([n]) => ({ name: n })), ...(raw && !exact ? [{ name: raw, custom: true }] : [])];
  const act = clamp(active, 0, Math.max(0, items.length - 1));

  useEffect(() => { list.current?.querySelector(".act")?.scrollIntoView({ block: "nearest" }); }, [act, open]);

  const pick = (i) => { const it = items[i]; if (!it) return; onPick(it); setOpen(false); setQ(""); setActive(0); };
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive(Math.min(items.length - 1, act + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(Math.max(0, act - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); if (open) pick(act); }
    else if (e.key === "Escape" || e.key === "Tab") { setOpen(false); setQ(""); }
  };

  let lastCat = null;
  return (
    <div className="jobpick" ref={wrap}>
      <svg className="mag" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke="#9c8470" strokeWidth="1.8" /><path d="M11 11l3.5 3.5" stroke="#9c8470" strokeWidth="1.8" strokeLinecap="round" /></svg>
      <input id="fJob" className="input" role="combobox" aria-expanded={open} aria-controls="jobList" aria-autocomplete="list" autoComplete="off"
        aria-activedescendant={open && items.length ? `jo-${act}` : undefined}
        value={open ? q : S.job || ""} placeholder={open && S.job ? `${S.job} — type to search` : `Search ${JOB_COUNT}+ jobs…`}
        onFocus={() => setOpen(true)} onClick={() => setOpen(true)} onKeyDown={onKey}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }} />
      {open && (
        <div className="jobpanel" onMouseDown={(e) => e.preventDefault()}>
          <div className="jobcats" role="group" aria-label="Job categories">
            {["All", ...Object.keys(CATALOG)].map((c) => (
              <button key={c} type="button" aria-pressed={c === cat} onClick={() => { setCat(c); setActive(0); }}>{c}</button>
            ))}
          </div>
          <div className="joblist" id="jobList" role="listbox" aria-label="Jobs" ref={list}>
            {match.map(([n, j], idx) => {
              const head = j.cat !== lastCat ? <div className="jobgroup">{j.cat}</div> : null;
              lastCat = j.cat;
              return (
                <div key={n}>
                  {head}
                  <div className={"jobopt" + (idx === act ? " act" : "")} role="option" id={`jo-${idx}`} aria-selected={n === S.job} onClick={() => pick(idx)}>
                    <span><Hl text={n} q={words[0] || ""} />{j.tips && <span className="tag">+ tips</span>}</span>
                    <span className="w">${studentAdjusted(j.wage, S.age).toFixed(2)}/hr</span>
                  </div>
                </div>
              );
            })}
            {raw && !exact && (
              <>
                <div className="jobgroup">Not listed?</div>
                <div className={"jobopt" + (match.length === act ? " act" : "")} role="option" id={`jo-${match.length}`} onClick={() => pick(match.length)}>
                  <span>Use “{raw}” as my job</span><span className="w">set your wage</span>
                </div>
              </>
            )}
            {!items.length && <div className="jobgroup">No jobs found</div>}
          </div>
          <div className="jobcount">
            {raw || cat !== "All" ? `${match.length} of ${JOB_COUNT} jobs` : `${JOB_COUNT} jobs`} · typical starting wages, edit yours below
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobCard({ S, p, update, toast }) {
  const wageRef = useRef(null);
  const age = +S.age, w = +S.wage;
  let hint, warn = false;
  if (age < 18 && w < STUDENT_WAGE) { hint = `That's below Ontario's student minimum wage of ${$2(STUDENT_WAGE)}/hr.`; warn = true; }
  else if (age >= 18 && w < MIN_WAGE) { hint = `That's below Ontario's minimum wage of ${$2(MIN_WAGE)}/hr.`; warn = true; }
  else if (age < 18 && S.hours > 28 && w < MIN_WAGE) { hint = `The student rate only covers up to 28 h/week during the school year. Past that you're owed ${$2(MIN_WAGE)}/hr.`; warn = true; }
  else if (age < 18) hint = `Under 18, employers can pay ${$2(STUDENT_WAGE)}/hr for up to 28 h/week during school. Otherwise it's ${$2(MIN_WAGE)}.`;
  else hint = `Ontario minimum wage is ${$2(MIN_WAGE)}/hr.`;
  const jt = JOBS[S.job];
  const m = (v) => $2(v / 12);

  const onPick = (it) => {
    update((d) => {
      d.job = it.name.slice(0, 40);
      if (!it.custom) d.wage = studentAdjusted(JOBS[it.name].wage, d.age);
    });
    if (it.custom) {
      toast(`Job set to ${it.name}. Now enter your wage.`);
      setTimeout(() => { wageRef.current?.focus(); wageRef.current?.select(); }, 0);
    }
  };

  return (
    <div className="card">
      <div className="stack">
        <div>
          <label htmlFor="fJob">Your Job</label>
          <JobPicker S={S} onPick={onPick} />
          <div className="note">${w.toFixed(2)}/hr — approx. {fmtK(p.monthlyPay)}/month take-home{jt?.tips ? " (plus tips)" : ""}{jt ? " · " + jt.cat : ""}</div>
        </div>
        <div className="two">
          <div>
            <label htmlFor="fWage">Hourly Wage</label>
            <div className="money"><NumInput inputRef={wageRef} id="fWage" className="input num" step="0.05" min={0} max={199} value={S.wage} onValue={(v) => update((d) => { d.wage = v; })} /></div>
          </div>
          <div>
            <label htmlFor="fAge">Your Age</label>
            <NumInput id="fAge" className="input num" min={10} max={30} value={S.age} onValue={(v) => update((d) => { d.age = v; })} />
          </div>
        </div>
        <div className={"hint" + (warn ? " warn" : "")} style={{ marginTop: -10 }}>{hint}</div>
        <div>
          <label htmlFor="fHours">Hours per Week: <span className="v">{S.hours}h</span></label>
          <input type="range" id="fHours" min={1} max={40} value={S.hours} onChange={(e) => update((d) => { d.hours = +e.target.value; })} />
          <div className="range-ends"><span>1h</span><span>40h</span></div>
        </div>
        <div>
          <label htmlFor="fWeeks">Weeks Worked per Year: <span className="v">{S.weeks} wks</span></label>
          <input type="range" id="fWeeks" min={4} max={52} value={S.weeks} onChange={(e) => update((d) => { d.weeks = +e.target.value; })} />
          <div className="range-ends"><span>4 wks (summer job: ~10)</span><span>52 wks</span></div>
        </div>
        <div>
          <label htmlFor="fExtra">Tips, Allowance &amp; Gifts per Month</label>
          <div className="money"><NumInput id="fExtra" className="input num" step="5" min={0} max={99999} blankZero placeholder="0" value={S.extra} onValue={(v) => update((d) => { d.extra = v; })} /></div>
          <div className="hint" style={{ marginTop: 6 }}>Added on top of your paycheque.</div>
        </div>
      </div>
      <div className="box">
        <div className="ctitle">Monthly Paycheque</div>
        <div className="row"><span className="k">Gross pay<small>{$2(p.wage)} × {p.hours}h × {p.weeks} wks ÷ 12</small></span><span className="val">{m(p.annual)}</span></div>
        <div className="row"><span className="k">Employment Insurance<small>1.63%, everyone pays</small></span><span className="val minus">−{m(p.ei)}</span></div>
        <div className="row"><span className="k">Canada Pension Plan<small>{age >= 18 ? "5.95% above $3,500/yr" : "Starts when you turn 18"}</small></span><span className={"val" + (p.cpp > 0 ? " minus" : "")}>{p.cpp > 0 ? "−" + m(p.cpp) : "$0.00"}</span></div>
        <div className="row"><span className="k">Income tax (est.)<small>{p.tax > 0 ? "Federal + Ontario" : `None under ${$0(ON_BPA)}/yr`}</small></span><span className={"val" + (p.tax > 0 ? " minus" : "")}>{p.tax > 0 ? "−" + m(p.tax) : "$0.00"}</span></div>
        <div className="row total"><span className="k">Take-home pay</span><span className="val">{m(p.net)}</span></div>
        {p.extra > 0 && (
          <>
            <div className="row"><span className="k">Tips, allowance &amp; gifts</span><span className="val" style={{ color: "var(--good)" }}>+{$2(p.extra)}</span></div>
            <div className="row total"><span className="k">Total money in</span><span className="val">{$2(p.monthlyNet)}</span></div>
          </>
        )}
      </div>
    </div>
  );
}
