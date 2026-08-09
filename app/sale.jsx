/* Raees Builder App - New Sale tab, item picker, bill */

RB.itemLabel = function (it) {
  if (!it) return "";
  return it.name + (it.size && it.size !== "-" ? " " + it.size : "");
};

/* ---------- item picker ---------- */
RB.ItemPicker = function (p) {
  var t = p.t;
  var q = React.useState("");
  var cat = React.useState("slab");
  var list = p.items.filter(function (it) {
    if (cat[0] !== "all" && it.cat !== cat[0]) return false;
    var s = (it.name + " " + it.size).toLowerCase();
    return s.indexOf(q[0].toLowerCase()) >= 0;
  });
  return (
    <RB.Modal title={t.pick} onClose={p.onClose}>
      <div className="rb-seg">
        <button className={cat[0] === "slab" ? "on" : ""} onClick={function () { cat[1]("slab"); }}>{t.slab}</button>
        <button className={cat[0] === "garden" ? "on" : ""} onClick={function () { cat[1]("garden"); }}>{t.garden}</button>
        <button className={cat[0] === "all" ? "on" : ""} onClick={function () { cat[1]("all"); }}>{t.all}</button>
      </div>
      <RB.In value={q[0]} ph={t.search} onChange={q[1]} />
      <div className="rb-list" style={{ marginTop: 8 }}>
        {list.length === 0 ? <RB.Empty text={t.empty} /> : list.map(function (it) {
          return (
            <div className="rb-item" key={it.id}>
              <div className="rb-item__m">
                <b>{RB.itemLabel(it)}</b>
                <small>{t.inStock}: {RB.money(it.qty)} {t.pieces} &nbsp;|&nbsp; {t.rate}: {RB.money(it.rate)}</small>
              </div>
              <RB.Btn sm kind="primary" icon="plus" onClick={function () { p.onPick(it); }} />
            </div>
          );
        })}
      </div>
    </RB.Modal>
  );
};

/* ---------- bill view (printable) ---------- */
RB.BillView = function (p) {
  var t = p.t, s = p.sale, st = p.settings;
  return (
    <div className="rb-bill" id={p.domId}>
      <div className="rb-bill__h">
        <b>{st.shopName || "Raees Builder"}</b>
        <small>{st.addr}</small>
        <small>{st.phone}</small>
      </div>
      <div className="rb-tr"><span>{t.billNo}</span><span>{s.serial}</span></div>
      <div className="rb-tr"><span>{t.date}</span><span>{RB.dmy(s.date)}</span></div>
      {s.cust ? <div className="rb-tr"><span>{t.customer}</span><span>{s.cust}</span></div> : null}
      {s.phone ? <div className="rb-tr"><span>{t.phone}</span><span>{s.phone}</span></div> : null}
      {s.addr ? <div className="rb-tr"><span>{t.address}</span><span>{s.addr}</span></div> : null}
      <table style={{ marginTop: 8 }}>
        <thead>
          <tr>
            <th>{t.items}</th>
            <th className="n">{t.qty}</th>
            <th className="n">{t.rate}</th>
            <th className="n">{t.amount}</th>
          </tr>
        </thead>
        <tbody>
          {(s.lines || []).map(function (l, i) {
            return (
              <tr key={i}>
                <td>{RB.itemLabel(l)}</td>
                <td className="n">{RB.money(l.qty)}</td>
                <td className="n">{RB.money(l.rate)}</td>
                <td className="n">{RB.money(RB.num(l.qty) * RB.num(l.rate))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop: 8 }}>
        <RB.TotalRow label={t.subtotal} value={"Rs " + RB.money(s.sub)} />
        {RB.num(s.disc) ? <RB.TotalRow label={t.discount} value={"- Rs " + RB.money(s.disc)} /> : null}
        <RB.TotalRow big label={t.grandTotal} value={"Rs " + RB.money(s.total)} />
        <RB.TotalRow label={t.paid} value={"Rs " + RB.money(s.paid)} />
        <RB.TotalRow label={t.due} value={"Rs " + RB.money(s.due)} />
      </div>
      {s.note ? <p style={{ fontSize: 12, marginTop: 8 }}>{t.note}: {s.note}</p> : null}
      <div className="rb-bill__f">{t.thanks}</div>
    </div>
  );
};

RB.saleText = function (t, s, st) {
  var L = [];
  L.push(st.shopName || "Raees Builder");
  L.push(t.billNo + ": " + s.serial + "   " + RB.dmy(s.date));
  if (s.cust) L.push(t.customer + ": " + s.cust);
  L.push("--------------------");
  (s.lines || []).forEach(function (l) {
    L.push(RB.itemLabel(l) + "  " + RB.money(l.qty) + " x " + RB.money(l.rate) +
      " = " + RB.money(RB.num(l.qty) * RB.num(l.rate)));
  });
  L.push("--------------------");
  L.push(t.subtotal + ": Rs " + RB.money(s.sub));
  if (RB.num(s.disc)) L.push(t.discount + ": Rs " + RB.money(s.disc));
  L.push(t.grandTotal + ": Rs " + RB.money(s.total));
  L.push(t.paid + ": Rs " + RB.money(s.paid));
  L.push(t.due + ": Rs " + RB.money(s.due));
  if (st.phone) L.push(st.phone);
  L.push(t.thanks);
  return L.join("\n");
};

RB.BillModal = function (p) {
  var t = p.t, s = p.sale;
  return (
    <RB.Modal
      title={t.bill + " #" + s.serial}
      onClose={p.onClose}
      footer={[
        <RB.Btn key="p" icon="print" onClick={function () { RB.printBox("rb-bill-print"); }}>{t.print}</RB.Btn>,
        <RB.Btn key="w" kind="ok" icon="msg" onClick={function () { RB.openWA(s.phone, RB.saleText(t, s, p.settings)); }}>{t.wa}</RB.Btn>
      ]}>
      <RB.BillView t={t} sale={s} settings={p.settings} domId="rb-bill-print" />
    </RB.Modal>
  );
};

/* ---------- new sale tab ---------- */
RB.NewSaleTab = function (c) {
  var t = c.t;
  var dr = RB.usePersist("draft", {
    cust: "", phone: "", addr: "", date: RB.todayISO(),
    lines: [], disc: "", paid: "", note: ""
  });
  var d = dr[0], setD = dr[1];
  var pick = React.useState(false);
  var bill = React.useState(null);

  var up = function (k, v) {
    setD(function (o) { var n = Object.assign({}, o); n[k] = v; return n; });
  };
  var upLine = function (i, k, v) {
    setD(function (o) {
      var ls = o.lines.slice();
      ls[i] = Object.assign({}, ls[i]);
      ls[i][k] = v;
      return Object.assign({}, o, { lines: ls });
    });
  };
  var delLine = function (i) {
    setD(function (o) {
      var ls = o.lines.slice(); ls.splice(i, 1);
      return Object.assign({}, o, { lines: ls });
    });
  };
  var addLine = function (it) {
    setD(function (o) {
      var ls = o.lines.slice();
      var at = -1;
      ls.forEach(function (l, i) { if (l.itemId === it.id) at = i; });
      if (at >= 0) {
        ls[at] = Object.assign({}, ls[at], { qty: RB.num(ls[at].qty) + 1 });
      } else {
        ls.push({ itemId: it.id, name: it.name, size: it.size, qty: 1, rate: it.rate });
      }
      return Object.assign({}, o, { lines: ls });
    });
    pick[1](false);
  };

  var sub = 0;
  d.lines.forEach(function (l) { sub += RB.num(l.qty) * RB.num(l.rate); });
  var total = sub - RB.num(d.disc);
  var due = total - RB.num(d.paid);

  var save = function () {
    if (!d.lines.length) return;
    var serial = (c.counters.sale || 0) + 1;
    var sale = {
      id: RB.uid(), serial: serial, date: d.date || RB.todayISO(),
      cust: d.cust, phone: d.phone, addr: d.addr, note: d.note,
      lines: d.lines.map(function (l) { return Object.assign({}, l); }),
      sub: sub, disc: RB.num(d.disc), total: total,
      paid: RB.num(d.paid), due: due, at: new Date().toISOString()
    };
    c.setSales(function (a) { return [sale].concat(a); });
    c.setCounters(function (o) { return Object.assign({}, o, { sale: serial }); });
    c.setItems(function (arr) {
      return arr.map(function (it) {
        var used = 0;
        sale.lines.forEach(function (l) { if (l.itemId === it.id) used += RB.num(l.qty); });
        return used ? Object.assign({}, it, { qty: RB.num(it.qty) - used }) : it;
      });
    });
    c.addLog(t.tabSale + " #" + serial + " - Rs " + RB.money(total) + (sale.cust ? " - " + sale.cust : ""));
    setD({ cust: "", phone: "", addr: "", date: RB.todayISO(), lines: [], disc: "", paid: "", note: "" });
    bill[1](sale);
  };

  var todaySum = 0, dueSum = 0;
  c.sales.forEach(function (s) {
    if (String(s.date).slice(0, 10) === RB.todayISO()) todaySum += RB.num(s.total);
    dueSum += RB.num(s.due);
  });

  return (
    <div>
      <div className="rb-stats">
        <RB.Stat tone="org" label={t.todaySale} value={"Rs " + RB.money(todaySum)} />
        <RB.Stat tone="red" label={t.totalDues} value={"Rs " + RB.money(dueSum)} />
        <RB.Stat label={t.billNo} value={"#" + ((c.counters.sale || 0) + 1)} />
      </div>

      <RB.Card title={t.customer} icon="user">
        <div className="rb-row2">
          <RB.Field label={t.customerName}>
            <RB.In value={d.cust} onChange={function (v) { up("cust", v); }} />
          </RB.Field>
          <RB.Field label={t.phone}>
            <RB.In im="tel" value={d.phone} ph="03xx xxxxxxx" onChange={function (v) { up("phone", v); }} />
          </RB.Field>
          <RB.Field label={t.address} wide>
            <RB.In value={d.addr} onChange={function (v) { up("addr", v); }} />
          </RB.Field>
          <RB.Field label={t.date}>
            <RB.In type="date" value={d.date} onChange={function (v) { up("date", v); }} />
          </RB.Field>
        </div>
      </RB.Card>

      <RB.Card title={t.items} icon="pkg"
        right={<RB.Btn sm kind="primary" icon="plus" onClick={function () { pick[1](true); }}>{t.addItem}</RB.Btn>}>
        {d.lines.length === 0 ? <RB.Empty text={t.noItems} /> : (
          <div className="rb-list">
            {d.lines.map(function (l, i) {
              return (
                <div className="rb-item" key={l.itemId + "-" + i} style={{ flexWrap: "wrap" }}>
                  <div className="rb-item__m">
                    <b>{RB.itemLabel(l)}</b>
                    <small>Rs {RB.money(RB.num(l.qty) * RB.num(l.rate))}</small>
                  </div>
                  <div style={{ width: 78 }}>
                    <RB.In type="number" im="decimal" value={l.qty} selectAll
                      onChange={function (v) { upLine(i, "qty", v); }} />
                  </div>
                  <div style={{ width: 92 }}>
                    <RB.In type="number" im="decimal" value={l.rate} selectAll
                      onChange={function (v) { upLine(i, "rate", v); }} />
                  </div>
                  <RB.Btn sm kind="danger" icon="x" onClick={function () { delLine(i); }} />
                </div>
              );
            })}
          </div>
        )}
      </RB.Card>

      <RB.Card title={t.total} icon="sale">
        <div className="rb-row2">
          <RB.Field label={t.discount}>
            <RB.In type="number" im="decimal" value={d.disc} onChange={function (v) { up("disc", v); }} />
          </RB.Field>
          <RB.Field label={t.paid}>
            <RB.In type="number" im="decimal" value={d.paid} onChange={function (v) { up("paid", v); }} />
          </RB.Field>
          <RB.Field label={t.note} wide>
            <RB.Area value={d.note} onChange={function (v) { up("note", v); }} />
          </RB.Field>
        </div>
        <RB.TotalRow label={t.subtotal} value={"Rs " + RB.money(sub)} />
        <RB.TotalRow big label={t.grandTotal} value={"Rs " + RB.money(total)} />
        <RB.TotalRow label={t.due} value={"Rs " + RB.money(due)} />
        <div style={{ marginTop: 10 }}>
          <RB.Btn block kind="primary" icon="save" disabled={!d.lines.length} onClick={save}>{t.saveSale}</RB.Btn>
        </div>
      </RB.Card>

      {pick[0] ? <RB.ItemPicker t={t} items={c.items} onClose={function () { pick[1](false); }} onPick={addLine} /> : null}
      {bill[0] ? <RB.BillModal t={t} sale={bill[0]} settings={c.settings} onClose={function () { bill[1](null); }} /> : null}
    </div>
  );
};
