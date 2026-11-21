// Login rules. Messages are JSX so the important part can be bolded.

export function userIssue(v) {
  if (!v) return { msg: "Enter a username." };
  if (/\s/.test(v)) {
    const fix = v.trim().replace(/\s+/g, "_");
    const ok = fix.length >= 3 && fix.length <= 20 && /^[\w.-]+$/.test(fix);
    return { msg: <><b>No spaces allowed</b> in usernames.</>, fix: ok ? fix : null };
  }
  if (v.length < 3) return { msg: <>Username needs <b>at least 3 characters</b> (you have {v.length}).</> };
  if (v.length > 20) return { msg: <>Username can be <b>at most 20 characters</b> (you have {v.length}).</> };
  const bad = v.match(/[^\w.-]/);
  if (bad) return { msg: <><b>“{bad[0]}” isn’t allowed.</b> Use letters, numbers, _ . or -</> };
  return null;
}

export const pwChecks = (v) => ({ len: v.length >= 6, upper: /[A-Z]/.test(v), lower: /[a-z]/.test(v), num: /\d/.test(v), sym: /[^A-Za-z0-9\s]/.test(v) });

export function passIssue(v, mode) {
  if (!v) return "Enter your password.";
  if (mode !== "signup") return null;
  const c = pwChecks(v);
  if (!c.len) return <>Password needs <b>at least 6 characters</b> (you have {v.length}).</>;
  if (!c.upper) return <>Add an <b>uppercase letter</b> (A–Z).</>;
  if (!c.lower) return <>Add a <b>lowercase letter</b> (a–z).</>;
  if (!c.num) return <>Add a <b>number</b> (0–9).</>;
  if (!c.sym) return <>Add a <b>symbol</b> like ! @ # $ % &amp; * ?</>;
  return null;
}

export function pass2Issue(a, b) {
  if (!b) return "Type your password again to confirm it.";
  if (a !== b) return <><b>Passwords don’t match.</b> Check for typos.</>;
  return null;
}

export const PW_RULES = [
  ["len", "At least 6 characters"], ["upper", "An uppercase letter (A–Z)"], ["lower", "A lowercase letter (a–z)"],
  ["num", "A number (0–9)"], ["sym", "A symbol (! @ # $ % & * ?)"],
];
