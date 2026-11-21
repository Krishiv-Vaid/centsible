import { useRef, useState } from "react";
import { legacyUser } from "../lib/storage.js";
import { PW_RULES, pass2Issue, passIssue, pwChecks, userIssue } from "../lib/validation.jsx";
import { Header, Pop } from "./ui.jsx";

export default function LoginPage({ onSignup, onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [touched, setTouched] = useState({ name: false, pass: false, pass2: false });
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nameRef = useRef(null);

  const su = mode === "signup";
  // Old accounts may have usernames that break today's rules, so let them log in
  const ui = !su && name.trim() && legacyUser(name.toLowerCase().trim()) ? null : userIssue(name);
  const pi = passIssue(pw, mode);
  const p2 = su ? pass2Issue(pw, pw2) : null;
  const checks = pwChecks(pw);
  const showName = (touched.name || (ui && /\s/.test(name))) && ui;
  const showPass = touched.pass && pi;
  const showP2 = su && p2 && (touched.pass2 || (pw2.length > 0 && pw2.length >= pw.length));
  const ready = name && pw && (!su || pw2);

  const switchMode = (m) => { setMode(m); setTouched({ name: false, pass: false, pass2: false }); setPw2(""); setErr(""); };
  const blur = (k, v) => { if (v) setTouched((t) => ({ ...t, [k]: true })); };

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, pass: true, pass2: true });
    if (ui || pi || p2) return;
    if (!(window.crypto && crypto.subtle)) { setErr("This browser can't secure passwords. Try another browser."); return; }
    setLoading(true);
    try {
      const r = su ? await onSignup(name.trim(), pw) : await onLogin(name.trim(), pw);
      if (r) setErr(r);
    } finally { setLoading(false); }
  };

  const cls = (bad, good) => "input" + (bad ? " bad" : good ? " good" : "");

  return (
    <div className="page center">
      <div className="col narrow">
        <Header />
        <div className="card big">
          <div className="tabs" role="group" aria-label="Log in or sign up" style={{ marginBottom: 28 }}>
            <button type="button" aria-pressed={!su} onClick={() => switchMode("login")}>Log In</button>
            <button type="button" aria-pressed={su} onClick={() => switchMode("signup")}>Sign Up</button>
          </div>
          <form onSubmit={submit} style={{ display: "grid", gap: 18 }} noValidate>
            <div>
              <label htmlFor="uName">Username</label>
              <input ref={nameRef} id="uName" className={cls(showName, su && !ui)} value={name} maxLength={24} placeholder="yourname"
                autoComplete="username" spellCheck={false} autoCapitalize="off" aria-invalid={!!showName}
                onChange={(e) => { setName(e.target.value); setErr(""); }} onBlur={(e) => blur("name", e.target.value)} />
              <div className="fhint">(no spaces · 3–20 characters · letters, numbers, _ . -)</div>
              {showName && <Pop fix={ui.fix} onFix={() => { setName(ui.fix); nameRef.current?.focus(); }}>{ui.msg}</Pop>}
            </div>
            <div>
              <label htmlFor="uPass">Password</label>
              <div className="pw">
                <input id="uPass" className={cls(showPass, su && !pi)} type={showPw ? "text" : "password"} value={pw} placeholder="••••••••"
                  autoComplete={su ? "new-password" : "current-password"} aria-invalid={!!showPass}
                  onChange={(e) => { setPw(e.target.value); setErr(""); }} onBlur={(e) => blur("pass", e.target.value)} />
                <button type="button" className="pwtoggle" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? "Hide password" : "Show password"}>{showPw ? "Hide" : "Show"}</button>
              </div>
              {su && <div className="fhint">(at least 6 characters, with uppercase, lowercase, a number and a symbol)</div>}
              {showPass && <Pop>{pi}</Pop>}
              {su && (
                <ul className="rules">
                  {PW_RULES.map(([k, t]) => <li key={k} className={checks[k] ? "ok" : ""}>{t}</li>)}
                </ul>
              )}
            </div>
            {su && (
              <div>
                <label htmlFor="uPass2">Confirm Password</label>
                <input id="uPass2" className={cls(showP2, pw2 && !p2)} type={showPw ? "text" : "password"} value={pw2} placeholder="••••••••"
                  autoComplete="new-password" aria-invalid={!!showP2}
                  onChange={(e) => { setPw2(e.target.value); setErr(""); }} onBlur={(e) => blur("pass2", e.target.value)} />
                {showP2 && <Pop>{p2}</Pop>}
              </div>
            )}
            {err && <div className="errbox">{err}</div>}
            <button className="btn-main" type="submit" disabled={!ready || loading}>
              {loading ? "..." : su ? "Create Account →" : "Log In →"}
            </button>
          </form>
          {su && (
            <div className="infobox" style={{ marginTop: 18 }}>
              ✦ Earn <strong>10 pts</strong> for every daily login &nbsp;·&nbsp; <strong>+50 bonus</strong> at 7-day streak!
            </div>
          )}
        </div>
        <div className="footer">Made by Teens, for Teens</div>
      </div>
    </div>
  );
}
