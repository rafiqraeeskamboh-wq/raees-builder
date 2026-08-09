/* Raees Builder App - helpers, icons and shared UI pieces */
window.RB = window.RB || {};

/* ---------- storage + helpers ---------- */
RB.PRE = "rb:";
RB.load = function (k, d) {
  try { var r = localStorage.getItem(RB.PRE + k); return r === null ? d : JSON.parse(r); }
  catch (e) { return d; }
};
RB.save = function (k, v) {
  try { localStorage.setItem(RB.PRE + k, JSON.stringify(v)); } catch (e) {}
};
RB.uid = function () {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
};
RB.num = function (v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; };
RB.money = function (n) {
  return RB.num(n).toLocaleString("en-US", { maximumFractionDigits: 2 });
};
RB.todayISO = function () {
  var d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
RB.dmy = function (s) {
  if (!s) return "";
  var p = String(s).slice(0, 10).split("-");
  return p.length === 3 ? p[2] + "-" + p[1] + "-" + p[0] : String(s);
};
RB.wa = function (phone, text) {
  var d = String(phone || "").replace(/[^0-9]/g, "");
  if (d.charAt(0) === "0") d = "92" + d.slice(1);
  if (d.length && d.charAt(0) !== "9") d = "";
  return "https://wa.me/" + d + "?text=" + encodeURIComponent(text);
};
RB.openWA = function (phone, text) { window.open(RB.wa(phone, text), "_blank"); };

RB.usePersist = function (key, def) {
  var st = React.useState(function () { return RB.load(key, def); });
  React.useEffect(function () { RB.save(key, st[0]); }, [st[0]]);
  return st;
};

RB.seed = function () {
  var out = [];
  [4, 5, 6, 7, 8, 9, 10, 11, 12].forEach(function (f) {
    out.push({ id: RB.uid(), cat: "slab", name: "Chatai", size: f + " ft", rate: 0, qty: 0, min: 10 });
  });
  ["Garden Tile", "Kerb Stone", "Grass Block"].forEach(function (n) {
    out.push({ id: RB.uid(), cat: "garden", name: n, size: "-", rate: 0, qty: 0, min: 10 });
  });
  return out;
};

/* ---------- print ---------- */
RB.printBox = function (id) {
  var el = document.getElementById(id);
  if (!el) { window.print(); return; }
  el.classList.add("rb-printarea");
  document.body.classList.add("rb-printing");
  window.setTimeout(function () { window.print(); }, 60);
  window.setTimeout(function () {
    el.classList.remove("rb-printarea");
    document.body.classList.remove("rb-printing");
  }, 1200);
};

/* ---------- icons (inline svg) ---------- */
RB.P = {
  sale: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6ZM3 6h18M16 10a4 4 0 0 1-8 0",
  pkg: "M12 2 3 7v10l9 5 9-5V7l-9-5ZM3 7l9 5 9-5M12 12v10",
  waste: "M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6",
  truck: "M2 4h13v12H2zM15 8h4l3 3v5h-7zM6 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  wallet: "M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7ZM3 10h18M16 14h3",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14.2 3H9.8l-.4 2.6a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.4 2.7h4.4l.4-2.6a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.3Z",
  plus: "M12 5v14M5 12h14",
  x: "M18 6 6 18M6 6l12 12",
  check: "m20 6-11 11-5-5",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
  print: "M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z",
  chev: "m9 18 6-6-6-6",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z",
  pencil: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z",
  msg: "M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5Z",
  hist: "M3 3v6h6M3.5 13a9 9 0 1 0 2.6-6.4L3 9M12 7v5l4 2",
  swap: "m16 3 4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16",
  sprout: "M7 20h10M12 20V9M12 9C12 5 9 3 6 3c0 3 2 6 6 6ZM12 9c0-4 3-6 6-6 0 3-2 6-6 6Z",
  grid: "M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z",
  alert: "M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
  back: "M19 12H5M12 19l-7-7 7-7",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  save: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2ZM17 21v-8H7v8M7 3v5h8",
  dl: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9.5Z"
};

RB.Ic = function (p) {
  var s = p.s || 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={p.w || 1.9} strokeLinecap="round" strokeLinejoin="round"
      style={p.style} aria-hidden="true">
      <path d={RB.P[p.n] || ""} />
    </svg>
  );
};

/* ---------- small UI pieces ---------- */
RB.Btn = function (p) {
  var cls = "rb-btn";
  if (p.kind) cls += " rb-btn--" + p.kind;
  if (p.block) cls += " rb-btn--block";
  if (p.sm) cls += " rb-btn--sm";
  if (p.className) cls += " " + p.className;
  return (
    <button type="button" className={cls} onClick={p.onClick} disabled={p.disabled} title={p.title} style={p.style}>
      {p.icon ? <RB.Ic n={p.icon} s={p.is || 17} /> : null}
      {p.children ? <span>{p.children}</span> : null}
    </button>
  );
};

RB.Field = function (p) {
  return (
    <label className={"rb-field" + (p.wide ? " rb-field--wide" : "")}>
      <span>{p.label}</span>
      {p.children}
    </label>
  );
};

RB.In = function (p) {
  return (
    <input className="rb-in" type={p.type || "text"} inputMode={p.im}
      value={p.value === undefined || p.value === null ? "" : p.value}
      placeholder={p.ph || ""} min={p.min} step={p.step}
      onFocus={function (e) { if (p.selectAll) e.target.select(); }}
      onChange={function (e) { p.onChange(e.target.value); }} />
  );
};

RB.Area = function (p) {
  return (
    <textarea className="rb-in rb-in--area" rows={p.rows || 2}
      value={p.value || ""} placeholder={p.ph || ""}
      onChange={function (e) { p.onChange(e.target.value); }} />
  );
};

RB.Sel = function (p) {
  return (
    <select className="rb-in" value={p.value} onChange={function (e) { p.onChange(e.target.value); }}>
      {(p.options || []).map(function (o) {
        return <option key={String(o.v)} value={o.v}>{o.l}</option>;
      })}
    </select>
  );
};

RB.Modal = function (p) {
  return (
    <div className="rb-ovl" onClick={function (e) { if (e.target === e.currentTarget && p.onClose) p.onClose(); }}>
      <div className={"rb-modal" + (p.wide ? " rb-modal--wide" : "")}>
        <div className="rb-modal__head rb-noprint">
          <h3>{p.title}</h3>
          <button type="button" className="rb-x" onClick={p.onClose} aria-label="close">
            <RB.Ic n="x" s={18} />
          </button>
        </div>
        <div className="rb-modal__body">{p.children}</div>
        {p.footer ? <div className="rb-modal__foot rb-noprint">{p.footer}</div> : null}
      </div>
    </div>
  );
};

RB.Card = function (p) {
  return (
    <section className={"rb-card" + (p.className ? " " + p.className : "")}>
      {p.title ? (
        <header className="rb-card__t">
          <h2>{p.icon ? <RB.Ic n={p.icon} s={17} /> : null}{p.title}</h2>
          {p.right ? <div className="rb-card__r">{p.right}</div> : null}
        </header>
      ) : null}
      <div className="rb-card__b">{p.children}</div>
    </section>
  );
};

RB.Empty = function (p) {
  return (
    <div className="rb-empty">
      <RB.Ic n={p.icon || "pkg"} s={28} />
      <p>{p.text}</p>
    </div>
  );
};

RB.Stat = function (p) {
  return (
    <div className={"rb-stat" + (p.tone ? " rb-stat--" + p.tone : "")}>
      <small>{p.label}</small>
      <b>{p.value}</b>
    </div>
  );
};

RB.TotalRow = function (p) {
  return (
    <div className={"rb-tr" + (p.big ? " rb-tr--big" : "")}>
      <span>{p.label}</span>
      <span>{p.value}</span>
    </div>
  );
};
