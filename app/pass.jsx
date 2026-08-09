/* Raees Builder App - Gate Pass tab */

RB.PassView = function (p) {
  var t = p.t, g = p.pass, st = p.settings;
  return (
    <div className="rb-bill" id={p.domId}>
      <div className="rb-bill__h">
        <b>{st.shopName || "Raees Builder"}</b>
        <small>{st.addr}</small>
        <small>{st.phone}</small>
        <small style={{ fontWeight: 800, marginTop: 4 }}>{t.gatePass}</small>
      </div>
      <div className="rb-tr"><span>{t.passNo}</span><span>{g.serial}</span></div>
      <div className="rb-tr"><span>{t.date}</span><span>{RB.dmy(g.date)}</span></div>
      {g.cust ? <div className="rb-tr"><span>{t.customer}</span><span>{g.cust}</span></div> : null}
      {g.phone ? <div className="rb-tr"><span>{t.phone}</span><span>{g.phone}</span></div> : null}
      {g.addr ? <div className="rb-tr"><span>{t.address}</span><span>{g.addr}</span></div> : null}
      {g.vehicle ? <div className="rb-tr"><span>{t.vehicle}</span><span>{g.vehicle}</span></div> : null}
      {g.driver ? <div className="rb-tr"><span>{t.driver}</span><span>{g.driver}</span></div> : null}
      <table style={{ marginTop: 8 }}>
        <thead>
          <tr><th>{t.items}</th><th className="n">{t.qty}</th></tr>
        </thead>
        <tbody>
          {(g.lines || []).map(function (l, i) {
            return <tr key={i}><td>{RB.itemLabel(l)}</td><td className="n">{RB.money(l.qty)}</td></tr>;
          })}
        </tbody>
      </table>
      {g.note ? <p style={{ fontSize: 12, marginTop: 8 }}>{t.note}: {g.note}</p> : null}
      <div className="rb-bill__f">{t.thanks}</div>
    </div>
  );
};

RB.passText = function (t, g, st) {
  var L = [];
  L.push(st.shopName || "Raees Builder");
  L.push(t.gatePass + " " + t.passNo + ": " + g.serial + "   " + RB.dmy(g.date));
  if (g.cust) L.push(t.customer + ": " + g.cust);
  if (g.vehicle) L.push(t.vehicle + ": " + g.vehicle);
  if (g.driver) L.push(t.driver + ": " + g.driver);
  L.push("--------------------");
  (g.lines || []).forEach(function (l) { L.push(RB.itemLabel(l) + "  " + RB.money(l.qty)); });
  if (g.note) L.push(t.note + ": " + g.note);
  if (st.phone) L.push(st.phone);
  return L.join("\n");
};

RB.PassModal = function (p) {
  var t = p.t, g = p.pass;
  return (
    <RB.Modal title={t.gatePass + " #" + g.serial} onClose={p.onClose}
      footer={[
        <RB.Btn key="p" icon="print" onClick={function () { RB.printBox("rb-pass-print"); }}>{t.print}</RB.Btn>,
        <RB.Btn key="w" kind="ok" icon="msg" onClick={function () { RB.openWA(g.phone, RB.passText(t, g, p.settings)); }}>{t.wa}</RB.Btn>
      ]}>
      <RB.PassView t={t} pass={g} settings={p.settings} domId="rb-pass-print" />
    </RB.Modal>
  );
};

RB.NewPassModal = function (p) {
  var t = p.t;
  var f = React.useState({
    cust: "", phone: "", addr: "", vehicle: "", driver: "",
    date: RB.todayISO(), lines: [], note: ""
  });
  var v = f[0];
  var pick = React.useState(false);
  var up = function (k, val) { f[1](Object.assign({}, v, (function () { var o = {}; o[k] = val; return o; })())); };
  var upQty = function (i, val) {
    var ls = v.lines.slice();
    ls[i] = Object.assign({}, ls[i], { qty: val });
    up("lines", ls);
  };
  var del = function (i) { var ls = v.lines.slice(); ls.splice(i, 1); up("lines", ls); };

  return (
    <RB.Modal title={t.newPass} onClose={p.onClose}
      footer={[
        <RB.Btn key="c" onClick={p.onClose}>{t.cancel}</RB.Btn>,
        <RB.Btn key="s" kind="primary" icon="check" disabled={!v.lines.length}
          onClick={function () { p.onSave(v); }}>{t.save}</RB.Btn>
      ]}>
      <div className="rb-row2">
        <RB.Field label={t.customerName}><RB.In value={v.cust} onChange={function (x) { up("cust", x); }} /></RB.Field>
        <RB.Field label={t.phone}><RB.In im="tel" value={v.phone} onChange={function (x) { up("phone", x); }} /></RB.Field>
        <RB.Field label={t.address} wide><RB.In value={v.addr} onChange={function (x) { up("addr", x); }} /></RB.Field>
        <RB.Field label={t.vehicle}><RB.In value={v.vehicle} onChange={function (x) { up("vehicle", x); }} /></RB.Field>
        <RB.Field label={t.driver}><RB.In value={v.driver} onChange={function (x) { up("driver", x); }} /></RB.Field>
        <RB.Field label={t.date}><RB.In type="date" value={v.date} onChange={function (x) { up("date", x); }} /></RB.Field>
      </div>

      <div style={{ margin: "4px 0 10px" }}>
        <RB.Btn block kind="soft" icon="plus" onClick={function () { pick[1](true); }}>{t.addItem}</RB.Btn>
      </div>

      {v.lines.length === 0 ? <RB.Empty text={t.noItems} /> : (
        <div className="rb-list">
          {v.lines.map(function (l, i) {
            return (
              <div className="rb-item" key={i}>
                <div className="rb-item__m"><b>{RB.itemLabel(l)}</b></div>
                <div style={{ width: 80 }}>
                  <RB.In type="number" im="decimal" value={l.qty} selectAll onChange={function (x) { upQty(i, x); }} />
                </div>
                <RB.Btn sm kind="danger" icon="x" onClick={function () { del(i); }} />
              </div>
            );
          })}
        </div>
      )}

      <RB.Field label={t.note}><RB.Area value={v.note} onChange={function (x) { up("note", x); }} /></RB.Field>

      {pick[0] ? (
        <RB.ItemPicker t={t} items={p.items} onClose={function () { pick[1](false); }}
          onPick={function (it) {
            up("lines", v.lines.concat([{ itemId: it.id, name: it.name, size: it.size, qty: 1 }]));
            pick[1](false);
          }} />
      ) : null}
    </RB.Modal>
  );
};

RB.PassTab = function (c) {
  var t = c.t;
  var mk = React.useState(false);
  var view = React.useState(null);
  var q = React.useState("");

  var list = c.passes.filter(function (g) {
    var s = (String(g.serial) + " " + (g.cust || "") + " " + (g.vehicle || "")).toLowerCase();
    return s.indexOf(q[0].toLowerCase()) >= 0;
  });

  var save = function (v) {
    var serial = (c.counters.pass || 0) + 1;
    var g = Object.assign({}, v, { id: RB.uid(), serial: serial, at: new Date().toISOString() });
    c.setPasses(function (a) { return [g].concat(a); });
    c.setCounters(function (o) { return Object.assign({}, o, { pass: serial }); });
    c.addLog(t.gatePass + " #" + serial + (g.cust ? " - " + g.cust : ""));
    mk[1](false);
    view[1](g);
  };

  return (
    <div>
      <div className="rb-stats">
        <RB.Stat label={t.records} value={c.passes.length} />
        <RB.Stat label={t.passNo} tone="org" value={"#" + ((c.counters.pass || 0) + 1)} />
      </div>

      <RB.Card title={t.passList} icon="truck"
        right={<RB.Btn sm kind="primary" icon="plus" onClick={function () { mk[1](true); }}>{t.newPass}</RB.Btn>}>
        <RB.In value={q[0]} ph={t.search} onChange={q[1]} />
        <div className="rb-list" style={{ marginTop: 8 }}>
          {list.length === 0 ? <RB.Empty icon="truck" text={t.empty} /> : list.map(function (g) {
            return (
              <div className="rb-item" key={g.id}>
                <div className="rb-item__m">
                  <b>#{g.serial} {g.cust ? " - " + g.cust : ""}</b>
                  <small>{RB.dmy(g.date)}{g.vehicle ? " - " + g.vehicle : ""} - {(g.lines || []).length} {t.items}</small>
                </div>
                <RB.Btn sm icon="chev" onClick={function () { view[1](g); }} />
              </div>
            );
          })}
        </div>
      </RB.Card>

      {mk[0] ? <RB.NewPassModal t={t} items={c.items} onClose={function () { mk[1](false); }} onSave={save} /> : null}
      {view[0] ? <RB.PassModal t={t} pass={view[0]} settings={c.settings} onClose={function () { view[1](null); }} /> : null}
    </div>
  );
};
