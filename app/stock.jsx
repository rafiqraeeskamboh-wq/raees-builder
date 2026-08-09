/* Raees Builder App - Stock tab and Wastage tab */

/* ---------- add / edit item ---------- */
RB.ItemModal = function (p) {
  var t = p.t;
  var f = React.useState(p.item || { cat: p.cat || "slab", name: "", size: "", rate: "", qty: "", min: 10 });
  var v = f[0];
  var up = function (k, val) { f[1](Object.assign({}, v, (function () { var o = {}; o[k] = val; return o; })())); };
  var ok = String(v.name || "").trim().length > 0;
  return (
    <RB.Modal title={p.item ? t.edit : t.newItem} onClose={p.onClose}
      footer={[
        <RB.Btn key="c" onClick={p.onClose}>{t.cancel}</RB.Btn>,
        <RB.Btn key="s" kind="primary" icon="check" disabled={!ok} onClick={function () {
          p.onSave({
            id: v.id || RB.uid(), cat: v.cat, name: String(v.name).trim(),
            size: String(v.size || "-").trim() || "-",
            rate: RB.num(v.rate), qty: RB.num(v.qty), min: RB.num(v.min) || 10
          }, !!p.item);
        }}>{t.save}</RB.Btn>
      ]}>
      <div className="rb-row2">
        <RB.Field label={t.items} wide>
          <RB.Sel value={v.cat} onChange={function (x) { up("cat", x); }}
            options={[{ v: "slab", l: t.slab }, { v: "garden", l: t.garden }]} />
        </RB.Field>
        <RB.Field label={t.name}>
          <RB.In value={v.name} onChange={function (x) { up("name", x); }} />
        </RB.Field>
        <RB.Field label={t.size}>
          <RB.In value={v.size} ph="8 ft" onChange={function (x) { up("size", x); }} />
        </RB.Field>
        <RB.Field label={t.rate}>
          <RB.In type="number" im="decimal" value={v.rate} onChange={function (x) { up("rate", x); }} />
        </RB.Field>
        <RB.Field label={t.inStock}>
          <RB.In type="number" im="decimal" value={v.qty} onChange={function (x) { up("qty", x); }} />
        </RB.Field>
      </div>
    </RB.Modal>
  );
};

/* ---------- add stock ---------- */
RB.AddStockModal = function (p) {
  var t = p.t;
  var q = React.useState("");
  return (
    <RB.Modal title={t.addStock + " - " + RB.itemLabel(p.item)} onClose={p.onClose}
      footer={[
        <RB.Btn key="c" onClick={p.onClose}>{t.cancel}</RB.Btn>,
        <RB.Btn key="s" kind="primary" icon="plus" disabled={!RB.num(q[0])}
          onClick={function () { p.onAdd(RB.num(q[0])); }}>{t.add}</RB.Btn>
      ]}>
      <RB.TotalRow label={t.inStock} value={RB.money(p.item.qty) + " " + t.pieces} />
      <RB.Field label={t.qty}>
        <RB.In type="number" im="decimal" value={q[0]} onChange={q[1]} />
      </RB.Field>
    </RB.Modal>
  );
};

/* ---------- stock tab ---------- */
RB.StockTab = function (c) {
  var t = c.t;
  var cat = React.useState("slab");
  var q = React.useState("");
  var edit = React.useState(null);
  var adding = React.useState(false);
  var addQty = React.useState(null);

  var list = c.items.filter(function (it) {
    if (cat[0] !== "all" && it.cat !== cat[0]) return false;
    var s = (it.name + " " + it.size).toLowerCase();
    return s.indexOf(q[0].toLowerCase()) >= 0;
  });

  var value = 0, low = 0, pcs = 0;
  c.items.forEach(function (it) {
    value += RB.num(it.qty) * RB.num(it.rate);
    pcs += RB.num(it.qty);
    if (RB.num(it.qty) <= RB.num(it.min || 10)) low += 1;
  });

  var saveItem = function (obj, isEdit) {
    if (isEdit) {
      c.setItems(function (a) { return a.map(function (x) { return x.id === obj.id ? obj : x; }); });
      c.addLog(t.edit + ": " + RB.itemLabel(obj));
    } else {
      c.setItems(function (a) { return a.concat([obj]); });
      c.addLog(t.newItem + ": " + RB.itemLabel(obj));
    }
    edit[1](null); adding[1](false);
  };

  var removeItem = function (it) {
    if (!window.confirm(t.confirmDel + " " + RB.itemLabel(it))) return;
    c.setItems(function (a) { return a.filter(function (x) { return x.id !== it.id; }); });
    c.addLog(t.del + ": " + RB.itemLabel(it));
  };

  return (
    <div>
      <div className="rb-stats">
        <RB.Stat label={t.stockValue} tone="org" value={"Rs " + RB.money(value)} />
        <RB.Stat label={t.inStock} value={RB.money(pcs) + " " + t.pieces} />
        <RB.Stat label={t.lowStock} tone="red" value={low} />
      </div>

      <div className="rb-seg">
        <button className={cat[0] === "slab" ? "on" : ""} onClick={function () { cat[1]("slab"); }}>{t.slab}</button>
        <button className={cat[0] === "garden" ? "on" : ""} onClick={function () { cat[1]("garden"); }}>{t.garden}</button>
        <button className={cat[0] === "all" ? "on" : ""} onClick={function () { cat[1]("all"); }}>{t.all}</button>
      </div>

      <RB.Card title={t.tabStock} icon="pkg"
        right={<RB.Btn sm kind="primary" icon="plus" onClick={function () { adding[1](true); }}>{t.newItem}</RB.Btn>}>
        <RB.In value={q[0]} ph={t.search} onChange={q[1]} />
        <div className="rb-list" style={{ marginTop: 8 }}>
          {list.length === 0 ? <RB.Empty text={t.empty} /> : list.map(function (it) {
            return (
              <div className="rb-item" key={it.id}>
                <div className="rb-item__m">
                  <b>{RB.itemLabel(it)}</b>
                  <small>Rs {RB.money(it.rate)} / {t.pieces}</small>
                </div>
                <div className="rb-item__v">
                  <span className={"rb-badge " + (RB.num(it.qty) <= RB.num(it.min || 10) ? "rb-badge--red" : "rb-badge--ok")}>
                    {RB.money(it.qty)} {t.pieces}
                  </span>
                </div>
                <div className="rb-item__a">
                  <RB.Btn sm kind="soft" icon="plus" title={t.addStock} onClick={function () { addQty[1](it); }} />
                  <RB.Btn sm icon="pencil" title={t.edit} onClick={function () { edit[1](it); }} />
                  <RB.Btn sm kind="danger" icon="waste" title={t.del} onClick={function () { removeItem(it); }} />
                </div>
              </div>
            );
          })}
        </div>
      </RB.Card>

      {adding[0] ? <RB.ItemModal t={t} cat={cat[0] === "all" ? "slab" : cat[0]} onClose={function () { adding[1](false); }} onSave={saveItem} /> : null}
      {edit[0] ? <RB.ItemModal t={t} item={edit[0]} onClose={function () { edit[1](null); }} onSave={saveItem} /> : null}
      {addQty[0] ? (
        <RB.AddStockModal t={t} item={addQty[0]} onClose={function () { addQty[1](null); }}
          onAdd={function (n) {
            var it = addQty[0];
            c.setItems(function (a) {
              return a.map(function (x) { return x.id === it.id ? Object.assign({}, x, { qty: RB.num(x.qty) + n }) : x; });
            });
            c.addLog(t.addStock + ": " + RB.itemLabel(it) + " +" + RB.money(n));
            addQty[1](null);
          }} />
      ) : null}
    </div>
  );
};

/* ---------- wastage helpers ---------- */
RB.WasteModal = function (p) {
  var t = p.t;
  var f = React.useState({ itemId: (p.items[0] || {}).id || "", qty: "", reason: "" });
  var v = f[0];
  var up = function (k, val) { f[1](Object.assign({}, v, (function () { var o = {}; o[k] = val; return o; })())); };
  var opts = p.items.map(function (it) { return { v: it.id, l: RB.itemLabel(it) + " (" + RB.money(it.qty) + ")" }; });
  return (
    <RB.Modal title={t.logWaste} onClose={p.onClose}
      footer={[
        <RB.Btn key="c" onClick={p.onClose}>{t.cancel}</RB.Btn>,
        <RB.Btn key="s" kind="primary" icon="check" disabled={!v.itemId || !RB.num(v.qty)}
          onClick={function () { p.onSave(v); }}>{t.save}</RB.Btn>
      ]}>
      <RB.Field label={t.items}>
        <RB.Sel value={v.itemId} options={opts} onChange={function (x) { up("itemId", x); }} />
      </RB.Field>
      <RB.Field label={t.qty}>
        <RB.In type="number" im="decimal" value={v.qty} onChange={function (x) { up("qty", x); }} />
      </RB.Field>
      <RB.Field label={t.reason}>
        <RB.In value={v.reason} onChange={function (x) { up("reason", x); }} />
      </RB.Field>
    </RB.Modal>
  );
};

RB.ConvertModal = function (p) {
  var t = p.t;
  var f = React.useState({ from: (p.items[0] || {}).id || "", out: "", to: (p.items[1] || {}).id || "", inQ: "" });
  var v = f[0];
  var up = function (k, val) { f[1](Object.assign({}, v, (function () { var o = {}; o[k] = val; return o; })())); };
  var opts = p.items.map(function (it) { return { v: it.id, l: RB.itemLabel(it) + " (" + RB.money(it.qty) + ")" }; });
  return (
    <RB.Modal title={t.convert} onClose={p.onClose}
      footer={[
        <RB.Btn key="c" onClick={p.onClose}>{t.cancel}</RB.Btn>,
        <RB.Btn key="s" kind="primary" icon="swap"
          disabled={!v.from || !v.to || !RB.num(v.out) || !RB.num(v.inQ) || v.from === v.to}
          onClick={function () { p.onSave(v); }}>{t.save}</RB.Btn>
      ]}>
      <RB.Field label={t.from}>
        <RB.Sel value={v.from} options={opts} onChange={function (x) { up("from", x); }} />
      </RB.Field>
      <RB.Field label={t.outQty}>
        <RB.In type="number" im="decimal" value={v.out} onChange={function (x) { up("out", x); }} />
      </RB.Field>
      <RB.Field label={t.to}>
        <RB.Sel value={v.to} options={opts} onChange={function (x) { up("to", x); }} />
      </RB.Field>
      <RB.Field label={t.inQty}>
        <RB.In type="number" im="decimal" value={v.inQ} onChange={function (x) { up("inQ", x); }} />
      </RB.Field>
    </RB.Modal>
  );
};

/* ---------- wastage tab ---------- */
RB.WastageTab = function (c) {
  var t = c.t;
  var w = React.useState(false);
  var cv = React.useState(false);
  var find = function (id) {
    var r = null;
    c.items.forEach(function (x) { if (x.id === id) r = x; });
    return r;
  };
  var totalWaste = 0;
  c.waste.forEach(function (x) { totalWaste += RB.num(x.qty); });

  return (
    <div>
      <div className="rb-stats">
        <RB.Stat label={t.tabWaste} tone="red" value={RB.money(totalWaste) + " " + t.pieces} />
        <RB.Stat label={t.records} value={c.waste.length} />
      </div>

      <RB.Card title={t.tabWaste} icon="waste"
        right={[
          <RB.Btn key="a" sm kind="primary" icon="plus" onClick={function () { w[1](true); }}>{t.logWaste}</RB.Btn>,
          <RB.Btn key="b" sm icon="swap" onClick={function () { cv[1](true); }}>{t.convert}</RB.Btn>
        ]}>
        {c.waste.length === 0 ? <RB.Empty icon="waste" text={t.empty} /> : (
          <div className="rb-list">
            {c.waste.map(function (x) {
              return (
                <div className="rb-item" key={x.id}>
                  <div className="rb-item__m">
                    <b>{x.label}</b>
                    <small>{RB.dmy(x.date)}{x.reason ? " - " + x.reason : ""}</small>
                  </div>
                  <div className="rb-item__v"><span className="rb-badge rb-badge--red">-{RB.money(x.qty)}</span></div>
                </div>
              );
            })}
          </div>
        )}
      </RB.Card>

      {w[0] ? (
        <RB.WasteModal t={t} items={c.items} onClose={function () { w[1](false); }}
          onSave={function (v) {
            var it = find(v.itemId);
            var n = RB.num(v.qty);
            c.setItems(function (a) {
              return a.map(function (x) { return x.id === v.itemId ? Object.assign({}, x, { qty: RB.num(x.qty) - n }) : x; });
            });
            c.setWaste(function (a) {
              return [{ id: RB.uid(), date: RB.todayISO(), itemId: v.itemId, label: RB.itemLabel(it), qty: n, reason: v.reason }].concat(a);
            });
            c.addLog(t.logWaste + ": " + RB.itemLabel(it) + " -" + RB.money(n));
            w[1](false);
          }} />
      ) : null}

      {cv[0] ? (
        <RB.ConvertModal t={t} items={c.items} onClose={function () { cv[1](false); }}
          onSave={function (v) {
            var a1 = find(v.from), a2 = find(v.to);
            var o = RB.num(v.out), i = RB.num(v.inQ);
            c.setItems(function (arr) {
              return arr.map(function (x) {
                if (x.id === v.from) return Object.assign({}, x, { qty: RB.num(x.qty) - o });
                if (x.id === v.to) return Object.assign({}, x, { qty: RB.num(x.qty) + i });
                return x;
              });
            });
            c.addLog(t.convert + ": " + RB.itemLabel(a1) + " -" + RB.money(o) + "  =>  " + RB.itemLabel(a2) + " +" + RB.money(i));
            cv[1](false);
          }} />
      ) : null}
    </div>
  );
};
