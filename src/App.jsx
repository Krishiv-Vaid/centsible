import { useCallback, useEffect, useRef, useState } from "react";
import { uid } from "./lib/format.js";
import { checkBadges, checkIn } from "./lib/rewards.js";
import { clone, freshPlan, getSession, legacyUser, loadDB, newSalt, normalize, pbkdf2, saveDB, setSession, sha256 } from "./lib/storage.js";
import { Toast } from "./components/ui.jsx";
import LoginPage from "./components/LoginPage.jsx";
import Planner from "./components/Planner.jsx";

export default function App() {
  const [db, setDb] = useState(loadDB);
  const dbRef = useRef(db);
  const [current, setCurrent] = useState(null);
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((m) => { if (m) setToasts((t) => [...t, { id: uid(), m }]); }, []);
  const commit = useCallback((next) => {
    dbRef.current = next;
    setDb(next);
    saveDB(next);
  }, []);

  const enter = useCallback((low, isNew, record) => {
    const base = record ? { ...dbRef.current, users: { ...dbRef.current.users, [low]: record } } : dbRef.current;
    const u = base.users[low];
    if (!u) return;
    const data = normalize(clone(u.data));
    const msgs = [];
    checkIn(data, msgs, isNew);
    checkBadges(data, msgs); // a login can complete a streak badge
    data.updatedAt = Date.now();
    commit({ ...base, users: { ...base.users, [low]: { ...u, data } } });
    setCurrent(low);
    setSession(low);
    setTimeout(() => msgs.forEach(toast), 400);
    window.scrollTo(0, 0);
  }, [commit, toast]);

  // Stay logged in across refreshes
  useEffect(() => {
    const last = getSession();
    if (last && dbRef.current.users[last]) enter(last, false);
  }, [enter]);

  // Every edit runs on a copy of the plan, then badges are rechecked and it's saved
  const updatePlan = useCallback((fn) => {
    const prev = dbRef.current;
    const u = prev.users[current];
    if (!u) return;
    const next = normalize(clone(u.data));
    const msgs = [];
    fn(next, msgs);
    checkBadges(next, msgs);
    next.updatedAt = Date.now();
    commit({ ...prev, users: { ...prev.users, [current]: { ...u, data: next } } });
    msgs.forEach(toast);
  }, [current, commit, toast]);

  const signup = async (username, pw) => {
    const low = username.toLowerCase();
    if (dbRef.current.users[low] || legacyUser(low)) return "Username already taken. Try logging in!";
    const salt = newSalt();
    enter(low, true, { username, salt, hash: await pbkdf2(pw, salt), createdAt: new Date().toISOString(), data: freshPlan() });
    return null;
  };

  const login = async (username, pw) => {
    const low = username.toLowerCase();
    const u = dbRef.current.users[low];
    if (!u) {
      // Accounts made in the first version of Centsible: upgrade them to PBKDF2 on login
      const old = legacyUser(low);
      if (old && old.passwordHash === (await sha256(pw))) {
        const salt = newSalt();
        const data = freshPlan();
        data.points = old.points || 0;
        data.loginDays = (old.loginDays || []).slice(-60);
        enter(low, false, { username: old.username || username, salt, hash: await pbkdf2(pw, salt), createdAt: old.createdAt, data });
        return null;
      }
      return old ? "Wrong password. Try again!" : "User not found. Sign up first!";
    }
    if (u.hash !== (await pbkdf2(pw, u.salt))) return "Wrong password. Try again!";
    enter(low, false);
    return null;
  };

  const logout = () => {
    setCurrent(null);
    setSession(null);
  };

  const user = current ? db.users[current] : null;
  return (
    <>
      {user
        ? <Planner username={user.username} plan={normalize(user.data)} update={updatePlan} onLogout={logout} toast={toast} />
        : <LoginPage onSignup={signup} onLogin={login} />}
      <Toast queue={toasts} onDone={() => setToasts((t) => t.slice(1))} />
    </>
  );
}
