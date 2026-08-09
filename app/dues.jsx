/* Raees Builder App - Dues tab, payment collection + receipt */

RB.ReceiptView = function (p) {
  var t = p.t, r = p.pay, st = p.settings;
  return (
    <div className="rb-bill" id={p.domId}>
      <div className="rb-bill__h">
        <b>{st.shopName || "Raees Builder"}</b>
        <small>{st.addr}</small>
        <small>{st.phone}</small>
        <small style={{ fontWeight: 800, marginTop: 4 }}>{t.receipt}</small>
      </div>
      <div className="rb-tr"><span>{t.receiptNo}</span><span>{r.serial}</span></div>
      <div className="rb-tr"><span>{t.date}</span><span>{RB.dmy(r.date)}</span></div>
      {r.cust ? <div className="rb-tr"><span>{t.customer}</span><span>{r.cust}</span></div> : null}
      <div className="rb-tr"><span>{t.billNo}</span><span>{r.billNo}</span></div>
      <div className="rb-tr"><span>{t.mode}</span><span>{r.mode === "online" ? t.online : t.cash}</span></div>
      <RB.TotalRow big label={t.payNow} value={"Rs " + RB.money(r.amount)} />
      <RB.TotalRow label={t.remaining} value={"Rs " + RB.money(r.after)} />
      {r.note ? <p style={{ fontSize: 12, marginTop: 8 }}>{t.note}: {r.note}</p> : null}
      <div className="rb-bill__f">{t.thanks}</div>
    </div>
  );
};

RB.payText = function (t, r, st) {
  var L = [];
  L.push(st.shopName || "Raees Builder");
  L.push(t.receipt + " " + t.receiptNo + ": " + r.serial + "   " + RB.dmy(r.date));
  if (r.cust) L.push(t.customer + ": " + r.cust);
  L.push(t.billNo + ": " + r.billNo);
  L.push(t.payNow + ": Rs " + RB.money(r.amount));
  L.push(t.remaining + ": Rs " + RB.money(r.after));
  L.push(t.mode + ": " + (r.mode === "online" ? t.online : t.cash));
  if (st.phone) L.push(st.phone);
  L.push(t.thanks);
  return L.join("\n");
};

RB.ReceiptModal = function (p) {
  var t = p.t, r = p.pay;
  return (
    <RB.Modal title={t.receipt + " #" + r.serial} onClose={p.onClose}
      footer={[
        <RB.Btn key="p" icon="print" onClick={function () { RB.printBox("rb-rec-print"); }}>{t.print}</RB.Btn>,
        <RB.Btn key="w" kind="ok" icon="msg" onClick={function () { RB.openWA(r.phone, RB.payText(t, r, p.settings)); }}>{t.wa}</RB.Btn>
      ]}>
      <RB.ReceiptView t={t} pay={r} settings={p.settings} domId="rb-rec-print" />
    </RB.Modal>
  );
};

RB.CollectModal = function (p) {
  var t = p.t, s = p.sale;
  var amt = React.useState(String(RB.num(s.due)));
  var mode = React.useState("cash");
  var note = React.useState("");
  var n = RB.num(amt[0]);
  return (
    <RB.Modal title={t.collectPay + " - #" + s.serial} onClose={p.onClose}
      footer={[
        <RB.Btn key="c" onClick={p.onClose}>{t.cancel}</RB.Btn>,
        <RB.Btn key="s" kind="ok" icon="check" disabled={!(n > 0)}
          onClick={function () { p.onSave(n, mode[0], note[0]); }}>{t.save}</RB.Btn>
      ]}>
      {s.cust ? <RB.TotalRow label={t.customer} value={s.cust} /> : null}
      <RB.TotalRow label={t.grandTotal} value={"Rs " + RB.money(s.total)} />
      <RB.TotalRow label={t.due} value={"Rs " + RB.money(s.due)} />
      <div style={{ marginTop: 10 }}>
        <RB.Field label={t.payNow}>
          <RB.In type="number" im="decimal" value={amt[0]} selectAll onChange={amt[1]} />
        </RB.Field>
        <RB.Field label={t.mode}>
          <RB.Sel value={mode[0]} onChange={mode[1]}
            options={[{ v: "cash", l: t.cash }, { v: "online", l: t.online }]} />
        </RB.Field>
        <RB.Field label={t.note}>
          <RB.In value={note[0]} onChange={note[1]} />
        </RB.Field>
      </div>
      <RB.TotalRow big label={t.remaining} value={"Rs " + RB.money(RB.num(s.due) - n)} />
    </RB.Modal>
  );
};

RB.DuesTab = function (c) {
  var t = c.t;
  var q = React.useState("");
  var only = React.useState("due");
  var coll = React.useState(null);
  var rec = React.useState(null);
  var bill = React.useState(null);

  var list = c.sales.filter(function (s) {
    if (only[0] === "due" && !(RB.num(s.due) > 0)) return false;
    var str = (String(s.serial) + " " + (s.cust || "") + " " + (s.phone || "")).toLowerCase();
    return str.indexOf(q[0].toLowerCase()) >= 0;
  });

  var dueSum = 0, saleSum = 0;
  c.sales.forEach(function (s) { dueSum += RB.num(s.due); saleSum += RB.num(s.total); });

  var collect = function (amount, mode, note) {
    var s = coll[0];
    var after = RB.num(s.due) - amount;
    var serial = (c.counters.pay || 0) + 1;
    var r = {
      id: RB.uid(), serial: serial, date: RB.todayISO(), saleId: s.id,
      billNo: s.serial, cust: s.cust, phone: s.phone, amount: amount,
      after: after, mode: mode, note: note, at: new Date().toISOString()
    };
    c.setSales(function (a) {
      return a.map(function (x) {
        return x.id === s.id
          ? Object.assign({}, x, { paid: RB.num(x.paid) + amount, due: after })
          : x;
      });
    });
    c.setPays(function (a) { return [r].concat(a); });
    c.setCounters(function (o) { return Object.assign({}, o, { pay: serial }); });
    c.addLog(t.collect + " #" + serial + " - Rs " + RB.money(amount) + (s.cust ? " - " + s.cust : ""));
    coll[1](null);
    rec[1](r);
  };

  return (
    <div>
      <div className="rb-stats">
        <RB.Stat label={t.totalDues} tone="red" value={"Rs " + RB.money(dueSum)} />
        <RB.Stat label={t.totalSale} tone="org" value={"Rs " + RB.money(saleSum)} />
        <RB.Stat label={t.records} value={c.sales.length} />
      </div>

      <div className="rb-seg">
        <button className={only[0] === "due" ? "on" : ""} onClick={function () { only[1]("due"); }}>{t.pending}</button>
        <button className={only[0] === "all" ? "on" : ""} onClick={function () { only[1]("all"); }}>{t.all}</button>
      </div>

      <RB.Card title={t.tabDues} icon="wallet">
        <RB.In value={q[0]} ph={t.search} onChange={q[1]} />
        <div className="rb-list" style={{ marginTop: 8 }}>
          {list.length === 0 ? <RB.Empty icon="wallet" text={t.noDues} /> : list.map(function (s) {
            return (
              <div className="rb-item" key={s.id}>
                <div className="rb-item__m">
                  <b>#{s.serial}{s.cust ? " - " + s.cust : ""}</b>
                  <small>{RB.dmy(s.date)} - {t.total}: Rs {RB.money(s.total)}</small>
                </div>
                <div className="rb-item__v">
                  <span className={"rb-badge " + (RB.num(s.due) > 0 ? "rb-badge--red" : "rb-badge--ok")}>
                    Rs {RB.money(s.due)}
                  </span>
                </div>
                <div className="rb-item__a">
                  {RB.num(s.due) > 0 ? (
                    <RB.Btn sm kind="ok" icon="wallet" title={t.collect} onClick={function () { coll[1](s); }} />
                  ) : null}
                  <RB.Btn sm icon="print" title={t.bill} onClick={function () { bill[1](s); }} />
                </div>
              </div>
            );
          })}
        </div>
      </RB.Card>

      <RB.Card title={t.receipt} icon="hist">
        {c.pays.length === 0 ? <RB.Empty icon="wallet" text={t.empty} /> : (
          <div className="rb-list">
            {c.pays.slice(0, 20).map(function (r) {
              return (
                <div className="rb-item" key={r.id}>
                  <div className="rb-item__m">
                    <b>#{r.serial}{r.cust ? " - " + r.cust : ""}</b>
                    <small>{RB.dmy(r.date)} - {t.billNo} {r.billNo}</small>
                  </div>
                  <div className="rb-item__v"><span className="rb-badge rb-badge--ok">Rs {RB.money(r.amount)}</span></div>
                  <RB.Btn sm icon="chev" onClick={function () { rec[1](r); }} />
                </div>
              );
            })}
          </div>
        )}
      </RB.Card>

      {coll[0] ? <RB.CollectModal t={t} sale={coll[0]} onClose={function () { coll[1](null); }} onSave={collect} /> : null}
      {rec[0] ? <RB.ReceiptModal t={t} pay={rec[0]} settings={c.settings} onClose={function () { rec[1](null); }} /> : null}
      {bill[0] ? <RB.BillModal t={t} sale={bill[0]} settings={c.settings} onClose={function () { bill[1](null); }} /> : null}
    </div>
  );
};
