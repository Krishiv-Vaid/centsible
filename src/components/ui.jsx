import { useEffect, useRef, useState } from "react";

// Inline error bubble under a field, with an optional one-tap fix
export function Pop({ children, fix, onFix }) {
  return (
    <div className="pop" role="alert">
      {children}
      {fix && <button type="button" className="fix" onClick={onFix}>Use “{fix}”</button>}
    </div>
  );
}

// Number box that lets you clear it or type "16." without fighting you
export function NumInput({ value, onValue, min = 0, max = 1e6, blankZero = false, inputRef, ...rest }) {
  const show = (v) => (blankZero && !v ? "" : v === 0 || v ? String(v) : "");
  const [text, setText] = useState(show(value));
  const focused = useRef(false);
  useEffect(() => { if (!focused.current) setText(show(value)); }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <input
      {...rest}
      ref={inputRef}
      type="number"
      inputMode="decimal"
      value={text}
      onFocus={() => { focused.current = true; }}
      onBlur={() => { focused.current = false; setText(show(value)); }}
      onChange={(e) => {
        const t = e.target.value;
        setText(t);
        if (t === "") { if (min <= 0) onValue(0); return; }
        const v = +t;
        if (v >= min && v <= max) onValue(v);
      }}
    />
  );
}

// Dialog that focuses its first input, closes on Escape or backdrop click,
// and hands focus back to whatever opened it
export function Modal({ onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.querySelector("input")?.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); prev?.focus?.(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle" ref={ref}>{children}</div>
    </div>
  );
}

// Shows queued messages one at a time
export function Toast({ queue, onDone }) {
  const [show, setShow] = useState(false);
  const cur = queue[0];
  useEffect(() => {
    if (!cur) return;
    setShow(true);
    const a = setTimeout(() => setShow(false), 2300);
    const b = setTimeout(onDone, 2560);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [cur?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div className={"toast" + (show && cur ? " show" : "")} role="status">{cur?.m}</div>;
}

export function Header({ children }) {
  return (
    <div className="head" style={children ? undefined : { marginBottom: 16 }}>
      <div className="kicker">financial planner</div>
      <h1>Centsible</h1>
      <p className="tagline">make sense of your cents</p>
      {children}
    </div>
  );
}
