/* Raees Builder App v2 - tabs: sale, stock, wastage, dues, gate pass, settings */

function blankRow(mode) {
  var base = { id: rbUid(), category: "custom", variant: "", desc: "", qty: 1, rate: "" };
  return mode === "piece" ? base : Object.assign(base, { length: "", width: "" });
}

function variantLabel(t, category, variant) {
  return category === "garden" ? t("garden") + " " + variant + " ft" : t("slab") + " " + variant;
}

function MiniField(p) {
  return (
    <div>
      <div style={{ fontSize: 9.5, color: p.highlight ? TC.stamp : TC.concrete, marginBottom: 2, fontWeight: p.highlight ? 700 : 400 }}>{p.label}</div>
      <input type="number" inputMode="decimal" value={p.value} disabled={p.disabled}
        onChange={function (e) { p.onChange(e.target.value); }}
        style={Object.assign({}, rbInput(), { padding: "5px 6px", fontSize: 12, opacity: p.disabled ? 0.6 : 1, borderColor: p.highlight ? TC.stamp : TC.paperLine })} />
    </div>
  );
}

function ItemRow(p) {
  var t = p.t, row = p.row, mode = p.mode, onChange = p.onChange;
  var isPiece = mode === "piece";
  var sqft = isPiece ? 0 : (Number(row.qty) || 0) * (Number(row.length) || 0) * (Number(row.width) || 0);
  var amount = isPiece ? (Number(row.qty) || 0) * (Number(row.rate) || 0) : sqft * (Number(row.rate) || 0);
  return (
    <div style={{ background: TC.cream, borderRadius: 8, padding: 10, border: "1px solid " + TC.paperLine }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="rb-mono" style={{ fontSize: 11, color: TC.concrete }}>#{p.idx + 1}</span>
          {p.editable ? (
            <input value={row.desc} onChange={function (e) { onChange({ desc: e.target.value }); }}
              placeholder={t("description")} style={Object.assign({}, rbInput(), { padding: "5px 8px", fontSize: 12.5, width: 140 })} />
          ) : (
            <span style={{ fontSize: 12.5, fontWeight: 600, color: TC.ink }}>{row.desc}</span>
          )}
        </div>
        <button onClick={p.onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: TC.stamp, padding: 0 }}>
          <Ico name="trash" size={15} />
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isPiece ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 6 }}>
        <MiniField label={t("qty")} value={row.qty} onChange={function (v) { onChange({ qty: v }); }} />
        {!isPiece ? <MiniField label={t("length")} value={row.length} onChange={function (v) { onChange({ length: v }); }} disabled={row.category !== "custom"} /> : null}
        {!isPiece ? <MiniField label={t("width")} value={row.width} onChange={function (v) { onChange({ width: v }); }} /> : null}
        <MiniField label={t("rate")} value={row.rate} onChange={function (v) { onChange({ rate: v }); }} highlight />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, paddingTop: 7, borderTop: "1px dashed " + TC.paperLine }}>
        {!isPiece
          ? <span className="rb-mono" style={{ fontSize: 11, color: TC.inkSoft }}>{t("sqft")}: {sqft.toFixed(2)}</span>
          : <span className="rb-mono" style={{ fontSize: 11, color: TC.inkSoft }}>{t("qty")}: {Number(row.qty) || 0}</span>}
        <span className="rb-mono" style={{ fontSize: 12.5, fontWeight: 700, color: TC.ink }}>Rs {rbMoney(amount)}</span>
      </div>
    </div>
  );
}

function ItemPickerModal(p) {
  var t = p.t, lang = p.lang, remainingFor = p.remainingFor, variantsFor = p.variantsFor, onPick = p.onPick, onClose = p.onClose;
  var a = React.useState("garden"), cat = a[0], setCat = a[1];
  var b = React.useState(null), active = b[0], setActive = b[1];
  var c = React.useState(""), qtyInput = c[0], setQtyInput = c[1];
  var variants = variantsFor(cat);
  var urdu = lang === "ur";
  function openPrompt(category, variant) { setActive({ category: category, variant: variant }); setQtyInput(""); }
  function confirmAdd() {
    var q = Number(qtyInput);
    if (!q || q <= 0) return;
    onPick(active.category, active.variant, q);
    setActive(null); setQtyInput("");
  }
  return (
    <ModalShell onClose={onClose} title={t("chooseCategory")}>
      {active ? (
        <div style={{ textAlign: "center", padding: "10px 4px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: TC.cream, marginBottom: 14 }}>{variantLabel(t, active.category, active.variant)}</div>
          <input type="number" inputMode="numeric" autoFocus value={qtyInput}
            onChange={function (e) { setQtyInput(e.target.value); }}
            onKeyDown={function (e) { if (e.key === "Enter") confirmAdd(); }}
            placeholder={t("enterQty")}
            style={Object.assign({}, rbInput(), { fontSize: 22, textAlign: "center", padding: "14px", marginBottom: 14 })} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={function () { setActive(null); }} style={{ flex: 1, padding: "12px", borderRadius: 8, border: "1.5px solid #3A362C", background: "transparent", color: "#A39C8A", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{t("cancel")}</button>
            <button disabled={!(Number(qtyInput) > 0)} onClick={confirmAdd} style={{ flex: 1, padding: "12px", borderRadius: 8, border: "none", background: Number(qtyInput) > 0 ? TC.garden : "#4A4638", color: TC.cream, fontSize: 13, fontWeight: 700, cursor: Number(qtyInput) > 0 ? "pointer" : "not-allowed" }}>{t("add")}</button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 11.5, color: "#A39C8A", marginBottom: 12 }} className={urdu ? "rb-urdu" : ""}>{t("tapToAddQty")}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {[["garden", t("garden"), TC.garden, "sprout"], ["slab", t("slab"), TC.slab, "grid"]].map(function (o) {
              var id = o[0], label = o[1], color = o[2], icon = o[3], on = cat === id;
              return (
                <button key={id} onClick={function () { setCat(id); }} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "10px 8px", borderRadius: 8, border: "2px solid " + (on ? color : "#3A362C"),
                  background: on ? color : "transparent", color: on ? TC.cream : "#A39C8A",
                  fontSize: 13, fontWeight: 600, cursor: "pointer"
                }} className={urdu ? "rb-urdu" : ""}>
                  <Ico name={icon} size={15} /> {label}
                </button>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxHeight: 360, overflowY: "auto" }}>
            {variants.map(function (v) {
              var remaining = remainingFor(cat, v);
              return (
                <button key={v} onClick={function () { openPrompt(cat, v); }} style={{
                  textAlign: "start", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #3A362C",
                  background: TC.appBg2, cursor: "pointer"
                }}>
                  <div className="rb-mono" style={{ color: TC.cream, fontSize: 15, fontWeight: 700 }}>{v}{cat === "garden" ? " ft" : ""}</div>
                  <div style={{ fontSize: 10.5, color: remaining > 0 ? "#9FBE8A" : TC.stamp, marginTop: 2 }}>{remaining} {t("inStock")}</div>
                </button>
              );
            })}
          </div>
          <button onClick={onClose} style={{
            width: "100%", marginTop: 14, padding: "12px", borderRadius: 8, border: "none",
            background: TC.stamp, color: TC.cream, fontSize: 13.5, fontWeight: 700, cursor: "pointer"
          }} className={urdu ? "rb-urdu" : ""}>{t("done")}</button>
        </div>
      )}
    </ModalShell>
  );
}
function NewSaleTab(p) {
  var t = p.t, lang = p.lang, remainingFor = p.remainingFor, variantsFor = p.variantsFor;
  var onSave = p.onSave, editingSale = p.editingSale, onCancelEdit = p.onCancelEdit;
  var a = React.useState("cash"), saleType = a[0], setSaleType = a[1];
  var b = React.useState(""), customerName = b[0], setCustomerName = b[1];
  var c = React.useState(""), mobile = c[0], setMobile = c[1];
  var d = React.useState(rbToday()), date = d[0], setDate = d[1];
  var e = React.useState([]), rows = e[0], setRows = e[1];
  var f = React.useState(false), pickerOpen = f[0], setPickerOpen = f[1];
  var g = React.useState(""), labourRate = g[0], setLabourRate = g[1];
  var h = React.useState(false), paidInFull = h[0], setPaidInFull = h[1];
  var i = React.useState(""), advanceInput = i[0], setAdvanceInput = i[1];
  var j = React.useState(false), submitting = j[0], setSubmitting = j[1];
  var mode = saleType === "cash" ? "piece" : "area";
  var isEditing = !!editingSale;
  var urdu = lang === "ur";

  React.useEffect(function () {
    if (editingSale) {
      setSaleType(editingSale.type);
      setCustomerName(editingSale.customerName);
      setMobile(editingSale.mobile || "");
      setDate(editingSale.date);
      setRows(editingSale.items.map(function (it) { return Object.assign({}, it); }));
      setLabourRate(editingSale.roofLabourRate ? String(editingSale.roofLabourRate) : "");
      setPaidInFull(editingSale.paidInFull);
      setAdvanceInput(String(editingSale.advance || 0));
    }
  }, [editingSale]);

  var itemsTotal = rows.reduce(function (sum, r) {
    if (mode === "piece") return sum + (Number(r.qty) || 0) * (Number(r.rate) || 0);
    var sq = (Number(r.qty) || 0) * (Number(r.length) || 0) * (Number(r.width) || 0);
    return sum + sq * (Number(r.rate) || 0);
  }, 0);
  var labourTotal = saleType === "cash" ? (Number(labourRate) || 0) : 0;
  var totalBill = itemsTotal + labourTotal;
  var advance = paidInFull ? totalBill : Math.min(totalBill, Number(advanceInput) || 0);
  var dues = Math.max(0, totalBill - advance);

  function addFromStock(category, variant, qty) {
    var label = variantLabel(t, category, variant);
    var q = qty || 1;
    setRows(function (r) {
      var row = mode === "piece"
        ? { id: rbUid(), category: category, variant: variant, desc: label, qty: q, rate: "" }
        : { id: rbUid(), category: category, variant: variant, desc: label, qty: q, length: variant, width: "", rate: "" };
      return r.concat([row]);
    });
  }
  function addCustomRow() { setRows(function (r) { return r.concat([blankRow(mode)]); }); }
  function updateRow(id, patch) {
    setRows(function (r) { return r.map(function (row) { return row.id === id ? Object.assign({}, row, patch) : row; }); });
  }
  function removeRow(id) { setRows(function (r) { return r.filter(function (row) { return row.id !== id; }); }); }
  function resetForm() {
    setCustomerName(""); setMobile(""); setRows([]); setLabourRate("");
    setPaidInFull(false); setAdvanceInput(""); setDate(rbToday());
  }
  var canSave = customerName.trim() && rows.length > 0 && !submitting;

  function handleSave() {
    if (!canSave) return;
    setSubmitting(true);
    var items = rows.map(function (r) {
      if (mode === "piece") return Object.assign({}, r, { amount: (Number(r.qty) || 0) * (Number(r.rate) || 0) });
      var sq = (Number(r.qty) || 0) * (Number(r.length) || 0) * (Number(r.width) || 0);
      return Object.assign({}, r, { sqft: sq, amount: sq * (Number(r.rate) || 0) });
    });
    var payload = {
      type: saleType, customerName: customerName.trim(), mobile: mobile.trim(), date: date, items: items,
      roofLabourRate: saleType === "cash" ? (Number(labourRate) || 0) : 0,
      labourTotal: labourTotal, itemsTotal: itemsTotal, totalBill: totalBill,
      advance: advance, dues: dues, paidInFull: paidInFull
    };
    if (isEditing) payload.editId = editingSale.id;
    onSave(payload);
    setSubmitting(false);
    resetForm();
  }

  return (
    <div style={{ padding: "14px 14px 4px" }}>
      {isEditing ? (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", background: "#2C424C",
          border: "1.5px solid " + TC.slab, borderRadius: 8, padding: "9px 12px", marginBottom: 12
        }}>
          <span style={{ fontSize: 12.5, color: TC.cream, fontWeight: 600 }}>{t("editingBill")} #{editingSale.serial}</span>
          <button onClick={function () { onCancelEdit(); resetForm(); }} style={{ background: "none", border: "none", color: "#A9C4CE", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t("cancelEdit")}</button>
        </div>
      ) : null}

      <div style={{ display: "flex", background: TC.appBg2, borderRadius: 10, padding: 4, gap: 4, marginBottom: 14, opacity: isEditing ? 0.55 : 1 }}>
        {[["cash", t("cashSale")], ["customized", t("customizedSale")]].map(function (o) {
          var id = o[0], label = o[1], on = saleType === id;
          return (
            <button key={id} disabled={isEditing} onClick={function () { setSaleType(id); }} style={{
              flex: 1, padding: "9px 6px", borderRadius: 7, border: "none", cursor: isEditing ? "default" : "pointer",
              background: on ? TC.stamp : "transparent", color: on ? TC.cream : "#A39C8A",
              fontSize: 13, fontWeight: 600
            }} className={urdu ? "rb-urdu" : ""}>{label}</button>
          );
        })}
      </div>

      <div style={{ background: TC.paper, borderRadius: 10, padding: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, borderBottom: "2px dashed " + TC.paperLine, paddingBottom: 10 }}>
          <div className="rb-display" style={{ color: TC.ink, fontSize: 15, fontWeight: 600 }}>{saleType === "cash" ? t("billNo") : t("gatePassNo")}</div>
          <div className="rb-mono" style={{ color: TC.stamp, fontSize: 13, fontWeight: 700 }}>#—</div>
        </div>

        <Field label={t("customerName")} className={urdu ? "rb-urdu" : ""}>
          <input value={customerName} onChange={function (ev) { setCustomerName(ev.target.value); }} placeholder={t("customerName")} style={rbInput()} />
        </Field>
        <Field label={t("mobileNumber")} className={urdu ? "rb-urdu" : ""}>
          <input type="tel" value={mobile} onChange={function (ev) { setMobile(ev.target.value); }} placeholder="03xx xxxxxxx" style={rbInput()} />
        </Field>
        <Field label={t("date")}>
          <input type="date" value={date} onChange={function (ev) { setDate(ev.target.value); }} style={rbInput()} />
        </Field>

        <div style={{ marginTop: 14 }}>
          <div className="rb-display" style={{ fontSize: 12, color: TC.inkSoft, marginBottom: 8, fontWeight: 600 }}>{t("items")}</div>
          <div style={{ fontSize: 11, color: TC.inkSoft, marginBottom: 8, fontStyle: "italic" }} className={urdu ? "rb-urdu" : ""}>{t("priceNote")}</div>
          {rows.length === 0 ? (
            <div style={{ textAlign: "center", padding: "22px 10px", border: "1.5px dashed " + TC.paperLine, borderRadius: 8 }}>
              <div style={{ color: TC.inkSoft, fontSize: 13, fontWeight: 500 }} className={urdu ? "rb-urdu" : ""}>{t("noItemsYet")}</div>
              <div style={{ color: TC.concrete, fontSize: 11.5, marginTop: 3 }} className={urdu ? "rb-urdu" : ""}>{t("tapAddItem")}</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {rows.map(function (row, idx) {
                return <ItemRow key={row.id} t={t} idx={idx} row={row} mode={mode}
                  onChange={function (patch) { updateRow(row.id, patch); }}
                  onRemove={function () { removeRow(row.id); }}
                  editable={row.category === "custom"} />;
              })}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={function () { setPickerOpen(true); }} style={rbBtnOutline(TC.garden)}>
              <Ico name="sprout" size={14} /> {t("addItem")}
            </button>
            {saleType !== "cash" ? (
              <button onClick={addCustomRow} style={rbBtnOutline(TC.slab)}>
                <Ico name="plus" size={14} /> {t("customItem")}
              </button>
            ) : null}
          </div>
        </div>

        {saleType === "cash" ? (
          <div style={{ marginTop: 16, borderTop: "2px dashed " + TC.paperLine, paddingTop: 12 }}>
            <div className="rb-display" style={{ fontSize: 12, color: TC.inkSoft, marginBottom: 8, fontWeight: 600 }}>{t("roofLabour")}</div>
            <Field label={t("labourRate")}>
              <input type="number" inputMode="decimal" value={labourRate} onChange={function (ev) { setLabourRate(ev.target.value); }} placeholder="0" style={rbInput()} />
            </Field>
          </div>
        ) : (
          <div style={{ marginTop: 14, background: "#EFE6C9", borderRadius: 8, padding: 10, fontSize: 11.5, color: TC.inkSoft }} className={urdu ? "rb-urdu" : ""}>{t("labourNote")}</div>
        )}

        <div style={{ marginTop: 16, borderTop: "2px dashed " + TC.paperLine, paddingTop: 12 }}>
          <TotalRow label={t("totalBill")} value={rbMoney(totalBill)} bold />
          <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0", cursor: "pointer" }}>
            <input type="checkbox" checked={paidInFull} onChange={function (ev) { setPaidInFull(ev.target.checked); }} style={{ width: 16, height: 16, accentColor: TC.success }} />
            <span style={{ fontSize: 12.5, color: TC.ink, fontWeight: 600 }} className={urdu ? "rb-urdu" : ""}>{t("paidInFull")}</span>
          </label>
          {!paidInFull ? (
            <Field label={t("advance")}>
              <input type="number" inputMode="decimal" value={advanceInput} onChange={function (ev) { setAdvanceInput(ev.target.value); }} placeholder="0" style={rbInput()} />
            </Field>
          ) : null}
          <TotalRow label={t("dues")} value={rbMoney(dues)} accent={dues > 0 ? TC.stamp : TC.success} />
        </div>
      </div>

      <button onClick={handleSave} disabled={!canSave} style={{
        width: "100%", marginTop: 16, padding: "14px", borderRadius: 10, border: "none",
        background: canSave ? TC.stamp : "#4A4638", color: TC.cream, fontSize: 14.5, fontWeight: 700,
        cursor: canSave ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
      }} className={urdu ? "rb-urdu" : ""}>
        <Ico name={submitting ? "loader" : "check"} size={16} className={submitting ? "rb2-spin" : ""} />
        {isEditing ? t("updateBill") : t("saveSale")}
      </button>

      {pickerOpen ? (
        <ItemPickerModal t={t} lang={lang} remainingFor={remainingFor} variantsFor={variantsFor}
          onPick={addFromStock} onClose={function () { setPickerOpen(false); }} />
      ) : null}
    </div>
  );
}
/* ---------------- stock ---------------- */
function StockSummaryCard(p) {
  var t = p.t, stockLog = p.stockLog;
  var a = React.useState({ preset: "today" }), range = a[0], setRange = a[1];
  var r = resolveRange(range);
  var filtered = stockLog.filter(function (e) { return inDateRange(e.date, r.from, r.to); });
  var totalGarden = filtered.filter(function (e) { return e.category === "garden"; }).reduce(function (s, e) { return s + Number(e.qty || 0); }, 0);
  var totalSlab = filtered.filter(function (e) { return e.category === "slab"; }).reduce(function (s, e) { return s + Number(e.qty || 0); }, 0);
  var sorted = filtered.slice().sort(function (x, y) { return String(y.date || "").localeCompare(String(x.date || "")); });
  return (
    <div style={{ background: TC.paper, borderRadius: 10, padding: 12, marginBottom: 14 }}>
      <div className="rb-display" style={{ fontSize: 12, color: TC.inkSoft, fontWeight: 600, marginBottom: 8 }}>{t("stockSummary")}</div>
      <RangeFilter t={t} range={range} onChange={setRange} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 8 }}>
        <StatBlock label={t("garden")} value={totalGarden} />
        <StatBlock label={t("slab")} value={totalSlab} />
        <StatBlock label={t("total")} value={totalGarden + totalSlab} bold color={TC.success} />
      </div>
      {sorted.length > 0 ? (
        <div style={{ maxHeight: 150, overflowY: "auto", borderTop: "1px dashed " + TC.paperLine, paddingTop: 8 }}>
          {sorted.map(function (e) {
            return (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "3px 0", color: TC.inkSoft }}>
                <span>{e.date} · {variantLabel(t, e.category, e.variant)}</span>
                <span className="rb-mono" style={{ fontWeight: 700, color: TC.ink }}>+{e.qty}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: 11, color: TC.concrete, textAlign: "center", padding: "6px 0" }}>{t("noEntriesRange")}</div>
      )}
    </div>
  );
}

function AddStockModal(p) {
  var t = p.t;
  var a = React.useState(""), qty = a[0], setQty = a[1];
  var b = React.useState(rbToday()), date = b[0], setDate = b[1];
  var canSave = Number(qty) > 0;
  return (
    <ModalShell onClose={p.onClose} title={t("addStock")}>
      <div style={{ marginBottom: 12, fontSize: 13, color: TC.cream, fontWeight: 600 }}>{variantLabel(t, p.category, p.variant)}</div>
      <Field label={t("qty")}>
        <input type="number" inputMode="numeric" autoFocus value={qty} onChange={function (e) { setQty(e.target.value); }}
          placeholder={t("enterQty")} style={Object.assign({}, rbInput(), { fontSize: 16 })} />
      </Field>
      <Field label={t("date")}>
        <input type="date" value={date} onChange={function (e) { setDate(e.target.value); }} style={rbInput()} />
      </Field>
      <button disabled={!canSave} onClick={function () { p.onSave(qty, date); }} style={{
        width: "100%", marginTop: 6, padding: "12px", borderRadius: 8, border: "none",
        background: canSave ? TC.garden : "#4A4638", color: TC.cream, fontSize: 13.5, fontWeight: 700,
        cursor: canSave ? "pointer" : "not-allowed"
      }}>{t("addStock")}</button>
    </ModalShell>
  );
}

function AddVariantModal(p) {
  var t = p.t;
  var a = React.useState(""), value = a[0], setValue = a[1];
  var canSave = Number(value) > 0;
  return (
    <ModalShell onClose={p.onClose} title={t("addNewSize")}>
      <div style={{ marginBottom: 12, fontSize: 13, color: TC.cream, fontWeight: 600 }}>{p.category === "garden" ? t("garden") : t("slab")}</div>
      <Field label={t("enterNewSize")}>
        <input type="number" inputMode="decimal" autoFocus value={value} onChange={function (e) { setValue(e.target.value); }}
          placeholder={p.category === "garden" ? "21" : "5.0"} style={Object.assign({}, rbInput(), { fontSize: 16 })} />
      </Field>
      <button disabled={!canSave} onClick={function () { p.onSave(value); }} style={{
        width: "100%", marginTop: 6, padding: "12px", borderRadius: 8, border: "none",
        background: canSave ? TC.slab : "#4A4638", color: TC.cream, fontSize: 13.5, fontWeight: 700,
        cursor: canSave ? "pointer" : "not-allowed"
      }}>{t("addNewSize")}</button>
    </ModalShell>
  );
}

function StockTab(p) {
  var t = p.t, stockLog = p.stockLog, stockTotals = p.stockTotals, remainingFor = p.remainingFor;
  var variantsFor = p.variantsFor, onAddStock = p.onAddStock, onAddVariant = p.onAddVariant;
  var a = React.useState("garden"), cat = a[0], setCat = a[1];
  var b = React.useState(null), addingFor = b[0], setAddingFor = b[1];
  var c = React.useState(false), addingVariant = c[0], setAddingVariant = c[1];
  var variants = variantsFor(cat);
  var anyStock = Object.keys(stockTotals.added.garden).length > 0 || Object.keys(stockTotals.added.slab).length > 0;

  function categoryTotal(category) {
    var added = 0, sold = 0, remaining = 0;
    variantsFor(category).forEach(function (v) {
      added += stockTotals.added[category][v] || 0;
      sold += stockTotals.sold[category][v] || 0;
      remaining += remainingFor(category, v);
    });
    return { added: added, sold: sold, remaining: remaining };
  }

  return (
    <div style={{ padding: "14px 14px 4px" }}>
      <StockSummaryCard t={t} stockLog={stockLog} />

      <div style={{ background: TC.paper, borderRadius: 10, padding: 12, marginBottom: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {["garden", "slab"].map(function (cc) {
          var tot = categoryTotal(cc);
          return (
            <div key={cc}>
              <div className="rb-display" style={{ fontSize: 11, color: TC.inkSoft, fontWeight: 600, marginBottom: 5 }}>{t(cc)} {t("total")}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3 }}>
                <StatBlock label={t("added")} value={tot.added} />
                <StatBlock label={t("sold")} value={tot.sold} />
                <StatBlock label={t("remaining")} value={tot.remaining} bold color={tot.remaining > 0 ? TC.success : (tot.remaining < 0 ? TC.stamp : TC.inkSoft)} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[["garden", t("garden"), TC.garden], ["slab", t("slab"), TC.slab]].map(function (o) {
          var id = o[0], label = o[1], color = o[2], on = cat === id;
          return (
            <button key={id} onClick={function () { setCat(id); }} style={{
              flex: 1, padding: "10px 8px", borderRadius: 8, border: "2px solid " + (on ? color : "#3A362C"),
              background: on ? color : "transparent", color: on ? TC.cream : "#A39C8A",
              fontSize: 13, fontWeight: 600, cursor: "pointer"
            }}>{label}</button>
          );
        })}
      </div>

      {!anyStock ? (
        <div style={{ marginBottom: 12, fontSize: 11.5, color: TC.concrete, textAlign: "center" }}>{t("noStockYet")}</div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {variants.map(function (v) {
          var added = stockTotals.added[cat][v] || 0;
          var sold = stockTotals.sold[cat][v] || 0;
          var remaining = remainingFor(cat, v);
          return (
            <div key={v} style={{ background: TC.paper, borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
              <div className="rb-mono" style={{ minWidth: 50, fontSize: 14, fontWeight: 700, color: TC.ink }}>{v}{cat === "garden" ? " ft" : ""}</div>
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
                <StatBlock label={t("added")} value={added} />
                <StatBlock label={t("sold")} value={sold} />
                <StatBlock label={t("remaining")} value={remaining} bold color={remaining > 0 ? TC.success : (remaining < 0 ? TC.stamp : TC.inkSoft)} />
              </div>
              <button onClick={function () { setAddingFor(v); }} style={{
                width: 32, height: 32, borderRadius: 8, border: "none", background: TC.garden,
                color: TC.cream, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <Ico name="plus" size={17} />
              </button>
            </div>
          );
        })}
      </div>

      <button onClick={function () { setAddingVariant(true); }} style={{
        width: "100%", marginTop: 10, padding: "10px", borderRadius: 8, border: "1.5px dashed " + TC.concrete,
        background: "transparent", color: "#A39C8A", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6
      }}>
        <Ico name="plus" size={14} /> {t("addNewSize")} — {cat === "garden" ? t("garden") : t("slab")}
      </button>

      {addingFor !== null ? (
        <AddStockModal t={t} category={cat} variant={addingFor}
          onClose={function () { setAddingFor(null); }}
          onSave={function (qty, date) { onAddStock(cat, addingFor, qty, date); setAddingFor(null); }} />
      ) : null}
      {addingVariant ? (
        <AddVariantModal t={t} category={cat} onClose={function () { setAddingVariant(false); }}
          onSave={function (v) { onAddVariant(cat, v); setAddingVariant(false); }} />
      ) : null}
    </div>
  );
}
/* ---------------- wastage ---------------- */
function WastageSummaryCard(p) {
  var t = p.t, wastageLog = p.wastageLog;
  var a = React.useState({ preset: "today" }), range = a[0], setRange = a[1];
  var r = resolveRange(range);
  var filtered = wastageLog.filter(function (e) { return inDateRange(e.date, r.from, r.to); });
  var totalGarden = filtered.filter(function (e) { return e.category === "garden"; }).reduce(function (s, e) { return s + Number(e.qty || 0); }, 0);
  var totalSlab = filtered.filter(function (e) { return e.category === "slab"; }).reduce(function (s, e) { return s + Number(e.qty || 0); }, 0);
  var sorted = filtered.slice().sort(function (x, y) { return String(y.date || "").localeCompare(String(x.date || "")); });
  return (
    <div style={{ background: TC.paper, borderRadius: 10, padding: 12, marginBottom: 14 }}>
      <div className="rb-display" style={{ fontSize: 12, color: TC.inkSoft, fontWeight: 600, marginBottom: 8 }}>{t("wastageSummary")}</div>
      <RangeFilter t={t} range={range} onChange={setRange} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 8 }}>
        <StatBlock label={t("garden")} value={totalGarden} color={TC.stamp} />
        <StatBlock label={t("slab")} value={totalSlab} color={TC.stamp} />
        <StatBlock label={t("total")} value={totalGarden + totalSlab} bold color={TC.stamp} />
      </div>
      {sorted.length > 0 ? (
        <div style={{ maxHeight: 150, overflowY: "auto", borderTop: "1px dashed " + TC.paperLine, paddingTop: 8 }}>
          {sorted.map(function (e) {
            return (
              <div key={e.id} style={{ padding: "3px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: TC.inkSoft }}>
                  <span>{e.date} · {variantLabel(t, e.category, e.variant)}</span>
                  <span className="rb-mono" style={{ fontWeight: 700, color: TC.stamp }}>-{e.qty}</span>
                </div>
                {e.reason ? <div style={{ fontSize: 10, color: TC.concrete, marginTop: 1 }}>{e.reason}</div> : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: 11, color: TC.concrete, textAlign: "center", padding: "6px 0" }}>{t("noEntriesRange")}</div>
      )}
    </div>
  );
}

function LogWastageModal(p) {
  var t = p.t;
  var a = React.useState(""), qty = a[0], setQty = a[1];
  var b = React.useState(rbToday()), date = b[0], setDate = b[1];
  var c = React.useState(""), reason = c[0], setReason = c[1];
  var canSave = Number(qty) > 0;
  return (
    <ModalShell onClose={p.onClose} title={t("logWastage")}>
      <div style={{ marginBottom: 12, fontSize: 13, color: TC.cream, fontWeight: 600 }}>{variantLabel(t, p.category, p.variant)}</div>
      <Field label={t("qty")}>
        <input type="number" inputMode="numeric" autoFocus value={qty} onChange={function (e) { setQty(e.target.value); }}
          placeholder={t("enterQty")} style={Object.assign({}, rbInput(), { fontSize: 16 })} />
      </Field>
      <Field label={t("date")}>
        <input type="date" value={date} onChange={function (e) { setDate(e.target.value); }} style={rbInput()} />
      </Field>
      <Field label={t("reason")}>
        <input value={reason} onChange={function (e) { setReason(e.target.value); }} placeholder={t("reason")} style={rbInput()} />
      </Field>
      <button disabled={!canSave} onClick={function () { p.onSave(qty, date, reason); }} style={{
        width: "100%", marginTop: 6, padding: "12px", borderRadius: 8, border: "none",
        background: canSave ? TC.stamp : "#4A4638", color: TC.cream, fontSize: 13.5, fontWeight: 700,
        cursor: canSave ? "pointer" : "not-allowed"
      }}>{t("logWastage")}</button>
    </ModalShell>
  );
}

function ConvertStockModal(p) {
  var t = p.t;
  var a = React.useState(""), toVariant = a[0], setToVariant = a[1];
  var b = React.useState(""), qty = b[0], setQty = b[1];
  var c = React.useState(rbToday()), date = c[0], setDate = c[1];
  var options = p.variants.filter(function (v) { return v !== p.fromVariant; });
  var canSave = Number(qty) > 0 && toVariant !== "";
  return (
    <ModalShell onClose={p.onClose} title={t("convertStock")}>
      <div style={{ marginBottom: 12, fontSize: 13, color: TC.cream, fontWeight: 600 }}>{variantLabel(t, p.category, p.fromVariant)}</div>
      <Field label={t("qty")}>
        <input type="number" inputMode="numeric" autoFocus value={qty} onChange={function (e) { setQty(e.target.value); }}
          placeholder={t("enterQty")} style={Object.assign({}, rbInput(), { fontSize: 16 })} />
      </Field>
      <Field label={t("convertTo")}>
        <select value={toVariant} onChange={function (e) { setToVariant(e.target.value); }} style={rbInput()}>
          <option value="">—</option>
          {options.map(function (v) {
            return <option key={v} value={v}>{p.category === "garden" ? v + " ft" : v} ({p.remainingFor(p.category, v)} {t("inStock")})</option>;
          })}
        </select>
      </Field>
      <Field label={t("date")}>
        <input type="date" value={date} onChange={function (e) { setDate(e.target.value); }} style={rbInput()} />
      </Field>
      <button disabled={!canSave} onClick={function () { p.onSave(Number(toVariant), qty, date); }} style={{
        width: "100%", marginTop: 6, padding: "12px", borderRadius: 8, border: "none",
        background: canSave ? TC.slab : "#4A4638", color: TC.cream, fontSize: 13.5, fontWeight: 700,
        cursor: canSave ? "pointer" : "not-allowed"
      }}>{t("convertStock")}</button>
    </ModalShell>
  );
}

function WastageTab(p) {
  var t = p.t, stockTotals = p.stockTotals, remainingFor = p.remainingFor, variantsFor = p.variantsFor;
  var wastageLog = p.wastageLog, onLogWastage = p.onLogWastage, onConvertStock = p.onConvertStock;
  var a = React.useState("garden"), cat = a[0], setCat = a[1];
  var b = React.useState(null), wastingFor = b[0], setWastingFor = b[1];
  var c = React.useState(null), convertingFor = c[0], setConvertingFor = c[1];
  var variants = variantsFor(cat);
  return (
    <div style={{ padding: "14px 14px 4px" }}>
      <WastageSummaryCard t={t} wastageLog={wastageLog} />
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[["garden", t("garden"), TC.garden], ["slab", t("slab"), TC.slab]].map(function (o) {
          var id = o[0], label = o[1], color = o[2], on = cat === id;
          return (
            <button key={id} onClick={function () { setCat(id); }} style={{
              flex: 1, padding: "10px 8px", borderRadius: 8, border: "2px solid " + (on ? color : "#3A362C"),
              background: on ? color : "transparent", color: on ? TC.cream : "#A39C8A",
              fontSize: 13, fontWeight: 600, cursor: "pointer"
            }}>{label}</button>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: TC.concrete, marginBottom: 10 }}>{t("convertHint")}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {variants.map(function (v) {
          var remaining = remainingFor(cat, v);
          var wasted = stockTotals.wasted[cat][v] || 0;
          return (
            <div key={v} style={{ background: TC.paper, borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <div className="rb-mono" style={{ minWidth: 50, fontSize: 14, fontWeight: 700, color: TC.ink }}>{v}{cat === "garden" ? " ft" : ""}</div>
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                <StatBlock label={t("remaining")} value={remaining} bold color={remaining > 0 ? TC.success : (remaining < 0 ? TC.stamp : TC.inkSoft)} />
                <StatBlock label={t("wasted")} value={wasted} color={wasted > 0 ? TC.stamp : TC.inkSoft} />
              </div>
              <button onClick={function () { setConvertingFor(v); }} title={t("convertStock")} style={{
                width: 32, height: 32, borderRadius: 8, border: "none", background: TC.slab,
                color: TC.cream, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <Ico name="swap" size={14} />
              </button>
              <button onClick={function () { setWastingFor(v); }} title={t("logWastage")} style={{
                width: 32, height: 32, borderRadius: 8, border: "none", background: TC.stamp,
                color: TC.cream, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <Ico name="trash" size={15} />
              </button>
            </div>
          );
        })}
      </div>
      {wastingFor !== null ? (
        <LogWastageModal t={t} category={cat} variant={wastingFor}
          onClose={function () { setWastingFor(null); }}
          onSave={function (qty, date, reason) { onLogWastage(cat, wastingFor, qty, date, reason); setWastingFor(null); }} />
      ) : null}
      {convertingFor !== null ? (
        <ConvertStockModal t={t} category={cat} fromVariant={convertingFor} variants={variants} remainingFor={remainingFor}
          onClose={function () { setConvertingFor(null); }}
          onSave={function (toVariant, qty, date) { onConvertStock(cat, convertingFor, toVariant, qty, date); setConvertingFor(null); }} />
      ) : null}
    </div>
  );
}
/* ---------------- dues ---------------- */
function PaymentsSummaryCard(p) {
  var t = p.t, sales = p.sales;
  var a = React.useState({ preset: "today" }), range = a[0], setRange = a[1];
  var r = resolveRange(range);
  var all = [];
  sales.forEach(function (s) {
    (s.payments || []).forEach(function (pay) {
      all.push({ id: pay.id, amount: pay.amount, date: pay.date, customerName: s.customerName, serial: s.serial });
    });
  });
  var filtered = all.filter(function (x) { return inDateRange(x.date, r.from, r.to); });
  var total = filtered.reduce(function (s, x) { return s + Number(x.amount || 0); }, 0);
  var sorted = filtered.slice().sort(function (x, y) { return String(y.date || "").localeCompare(String(x.date || "")); });
  return (
    <div style={{ background: TC.paper, borderRadius: 10, padding: 12, marginBottom: 14 }}>
      <div className="rb-display" style={{ fontSize: 12, color: TC.inkSoft, fontWeight: 600, marginBottom: 8 }}>{t("paymentsSummary")}</div>
      <RangeFilter t={t} range={range} onChange={setRange} />
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: TC.inkSoft }}>{t("totalReceived")}</div>
        <div className="rb-mono" style={{ fontSize: 20, fontWeight: 700, color: TC.success }}>Rs {rbMoney(total)}</div>
      </div>
      {sorted.length > 0 ? (
        <div style={{ maxHeight: 150, overflowY: "auto", borderTop: "1px dashed " + TC.paperLine, paddingTop: 8 }}>
          {sorted.map(function (x, i) {
            return (
              <div key={x.id || i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "3px 0", color: TC.inkSoft }}>
                <span>{x.date} · {x.customerName}</span>
                <span className="rb-mono" style={{ fontWeight: 700, color: TC.success }}>Rs {rbMoney(x.amount)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: 11, color: TC.concrete, textAlign: "center", padding: "6px 0" }}>{t("noEntriesRange")}</div>
      )}
    </div>
  );
}

function CollectPaymentModal(p) {
  var t = p.t, sale = p.sale;
  var a = React.useState(String(sale.dues || 0)), amount = a[0], setAmount = a[1];
  var b = React.useState(rbToday()), date = b[0], setDate = b[1];
  var canSave = Number(amount) > 0 && Number(amount) <= sale.dues + 0.001;
  return (
    <ModalShell onClose={p.onClose} title={t("collectPayment")}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: TC.cream }}>{sale.customerName}</div>
        <div style={{ fontSize: 11.5, color: "#A39C8A", marginTop: 2 }}>#{sale.serial} · {t("dues")}: Rs {rbMoney(sale.dues)}</div>
      </div>
      <Field label={t("amountReceived")}>
        <input type="number" inputMode="decimal" autoFocus value={amount} onChange={function (e) { setAmount(e.target.value); }}
          style={Object.assign({}, rbInput(), { fontSize: 16 })} />
      </Field>
      <Field label={t("date")}>
        <input type="date" value={date} onChange={function (e) { setDate(e.target.value); }} style={rbInput()} />
      </Field>
      <button disabled={!canSave} onClick={function () { p.onCollect(amount, date); }} style={{
        width: "100%", marginTop: 6, padding: "12px", borderRadius: 8, border: "none",
        background: canSave ? TC.success : "#4A4638", color: TC.cream, fontSize: 13.5, fontWeight: 700,
        cursor: canSave ? "pointer" : "not-allowed"
      }}>{t("recordPayment")}</button>
    </ModalShell>
  );
}

function DuesTab(p) {
  var t = p.t, sales = p.sales, onOpen = p.onOpen, onCollect = p.onCollect, onReceipt = p.onReceipt;
  var a = React.useState("dues"), filter = a[0], setFilter = a[1];
  var b = React.useState(""), query = b[0], setQuery = b[1];
  var c = React.useState(null), collectingFor = c[0], setCollectingFor = c[1];
  var filtered = sales.filter(function (s) {
    if (filter === "dues" && (s.dues || 0) <= 0) return false;
    if (query && String(s.customerName).toLowerCase().indexOf(query.toLowerCase()) < 0) return false;
    return true;
  });
  function handleCollect(amount, date) {
    var updated = onCollect(collectingFor.id, amount, date);
    setCollectingFor(null);
    if (updated) onReceipt({ sale: updated, amount: Number(amount), date: date });
  }
  return (
    <div style={{ padding: "14px 14px 4px" }}>
      <PaymentsSummaryCard t={t} sales={sales} />
      <div style={{ position: "relative", marginBottom: 10 }}>
        <span style={{ position: "absolute", left: 12, top: 11, color: TC.concrete }}><Ico name="search" size={15} /></span>
        <input value={query} onChange={function (e) { setQuery(e.target.value); }} placeholder={t("searchCustomer")}
          style={Object.assign({}, rbInput(), { background: TC.appBg2, color: TC.cream, border: "1.5px solid #3A362C", paddingInlineStart: 34 })} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[["dues", t("duesOnly")], ["all", t("allSales")]].map(function (o) {
          var id = o[0], label = o[1], on = filter === id;
          return (
            <button key={id} onClick={function () { setFilter(id); }} style={{
              padding: "6px 14px", borderRadius: 20, border: "1.5px solid " + (on ? TC.amber : "#3A362C"),
              background: on ? TC.amber : "transparent", color: on ? TC.ink : "#A39C8A",
              fontSize: 12, fontWeight: 600, cursor: "pointer"
            }}>{label}</button>
          );
        })}
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={<Ico name="wallet" size={28} color={TC.concrete} />} text={sales.length === 0 ? t("noDues") : t("searchNoResults")} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(function (s) {
            return (
              <div key={s.id} style={{ background: TC.paper, borderRadius: 8, padding: "12px 14px" }}>
                <div onClick={function () { onOpen(s); }} style={{ display: "flex", justifyContent: "space-between", cursor: "pointer" }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: TC.ink }}>{s.customerName}</div>
                    <div style={{ fontSize: 10.5, color: TC.inkSoft, marginTop: 2 }}>
                      #{s.serial} · {s.date} · {s.type === "cash" ? t("cashSale") : t("customizedSale")}
                    </div>
                  </div>
                  <div style={{ textAlign: "end" }}>
                    <div className="rb-mono" style={{ fontSize: 13, fontWeight: 700, color: (s.dues || 0) > 0 ? TC.stamp : TC.success }}>Rs {rbMoney(s.dues || 0)}</div>
                    <div style={{ fontSize: 10, color: TC.concrete, marginTop: 2 }}>{(s.dues || 0) > 0 ? t("due") : t("paid")}</div>
                  </div>
                </div>
                {(s.dues || 0) > 0 ? (
                  <button onClick={function () { setCollectingFor(s); }} style={{
                    marginTop: 9, width: "100%", padding: "8px", borderRadius: 6, border: "1.5px solid " + TC.success,
                    background: "transparent", color: TC.success, fontSize: 11.5, fontWeight: 700, cursor: "pointer"
                  }}>{t("collectPayment")}</button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
      {collectingFor ? (
        <CollectPaymentModal t={t} sale={collectingFor} onClose={function () { setCollectingFor(null); }} onCollect={handleCollect} />
      ) : null}
    </div>
  );
}
/* ---------------- gate pass folder ---------------- */
function GatePassSummaryCard(p) {
  var t = p.t, gatePasses = p.gatePasses;
  var a = React.useState({ preset: "7d" }), range = a[0], setRange = a[1];
  var r = resolveRange(range);
  var filtered = gatePasses.filter(function (g) { return inDateRange(g.date, r.from, r.to); });
  var byVariant = { garden: {}, slab: {} };
  filtered.forEach(function (g) {
    (g.items || []).forEach(function (it) {
      if (it.category === "garden" || it.category === "slab") {
        byVariant[it.category][it.variant] = (byVariant[it.category][it.variant] || 0) + Number(it.qty || 0);
      }
    });
  });
  function sumOf(obj) { return Object.keys(obj).reduce(function (s, k) { return s + obj[k]; }, 0); }
  var gardenEntries = Object.keys(byVariant.garden).sort(function (x, y) { return Number(x) - Number(y); });
  var slabEntries = Object.keys(byVariant.slab).sort(function (x, y) { return Number(x) - Number(y); });
  return (
    <div style={{ background: TC.paper, borderRadius: 10, padding: 12, marginBottom: 14 }}>
      <div className="rb-display" style={{ fontSize: 12, color: TC.inkSoft, fontWeight: 600, marginBottom: 8 }}>{t("gatePassSummary")}</div>
      <RangeFilter t={t} range={range} onChange={setRange} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 8 }}>
        <StatBlock label={t("garden")} value={sumOf(byVariant.garden)} bold color={TC.gardenDark} />
        <StatBlock label={t("slab")} value={sumOf(byVariant.slab)} bold color={TC.slabDark} />
      </div>
      {(gardenEntries.length > 0 || slabEntries.length > 0) ? (
        <div style={{ maxHeight: 150, overflowY: "auto", borderTop: "1px dashed " + TC.paperLine, paddingTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
          {gardenEntries.map(function (v) {
            return (
              <div key={"g" + v} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: TC.inkSoft }}>
                <span>{t("garden")} {v} ft</span>
                <span className="rb-mono" style={{ fontWeight: 700, color: TC.ink }}>{byVariant.garden[v]}</span>
              </div>
            );
          })}
          {slabEntries.map(function (v) {
            return (
              <div key={"s" + v} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: TC.inkSoft }}>
                <span>{t("slab")} {v}</span>
                <span className="rb-mono" style={{ fontWeight: 700, color: TC.ink }}>{byVariant.slab[v]}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: 11, color: TC.concrete, textAlign: "center", padding: "6px 0" }}>{t("noEntriesRange")}</div>
      )}
    </div>
  );
}

function GatePassTab(p) {
  var t = p.t, gatePasses = p.gatePasses, onOpen = p.onOpen;
  var a = React.useState(""), query = a[0], setQuery = a[1];
  var filtered = gatePasses.filter(function (g) {
    return !query || String(g.customerName).toLowerCase().indexOf(query.toLowerCase()) >= 0;
  });
  return (
    <div style={{ padding: "14px 14px 4px" }}>
      <GatePassSummaryCard t={t} gatePasses={gatePasses} />
      <div style={{ position: "relative", marginBottom: 12 }}>
        <span style={{ position: "absolute", left: 12, top: 11, color: TC.concrete }}><Ico name="search" size={15} /></span>
        <input value={query} onChange={function (e) { setQuery(e.target.value); }} placeholder={t("searchCustomer")}
          style={Object.assign({}, rbInput(), { background: TC.appBg2, color: TC.cream, border: "1.5px solid #3A362C", paddingInlineStart: 34 })} />
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={<Ico name="truck" size={28} color={TC.concrete} />} text={gatePasses.length === 0 ? t("noGatePasses") : t("searchNoResults")} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(function (g) {
            return (
              <div key={g.id} onClick={function () { onOpen(g); }} style={{ background: TC.paper, borderRadius: 8, padding: "12px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: TC.ink }}>{g.customerName}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase",
                      background: g.type === "cash" ? TC.stamp : TC.slab, color: TC.cream
                    }}>{g.type === "cash" ? t("cashSale") : t("customizedSale")}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: TC.inkSoft, marginTop: 2 }}>#{g.serial} · {g.date} · {(g.items || []).length} {t("items")}</div>
                </div>
                <Ico name="chev" size={17} color={TC.concrete} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- settings ---------------- */
function SettingsBlock(p) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        {p.icon}
        <span className="rb-display" style={{ color: TC.cream, fontSize: 13, fontWeight: 600 }}>{p.title}</span>
      </div>
      {p.children}
    </div>
  );
}

function SettingsTab(p) {
  var t = p.t, lang = p.lang, role = p.role, onLang = p.onLang, onRole = p.onRole, onClear = p.onClear, activityLog = p.activityLog;
  var a = React.useState(false), confirming = a[0], setConfirming = a[1];
  return (
    <div style={{ padding: "14px 14px 4px", display: "flex", flexDirection: "column", gap: 18 }}>
      <SettingsBlock icon={<Ico name="globe" size={16} color={TC.cream} />} title={t("language")}>
        <div style={{ display: "flex", gap: 8 }}>
          {[["en", "English"], ["ur", "اردو"]].map(function (o) {
            var id = o[0], label = o[1], on = lang === id;
            return (
              <button key={id} onClick={function () { onLang(id); }} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: "2px solid " + (on ? TC.stamp : "#3A362C"),
                background: on ? TC.stamp : "transparent", color: on ? TC.cream : "#A39C8A",
                fontSize: 13, fontWeight: 600, cursor: "pointer"
              }}>{label}</button>
            );
          })}
        </div>
      </SettingsBlock>

      {window.RB_LOCK_ROLE ? null : (
      <SettingsBlock icon={<Ico name="usercog" size={16} color={TC.cream} />} title={t("role")}>
        <div style={{ display: "flex", gap: 8 }}>
          {[["admin", t("admin")], ["accountant", t("accountant")]].map(function (o) {
            var id = o[0], label = o[1], on = role === id;
            return (
              <button key={id} onClick={function () { onRole(id); }} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: "2px solid " + (on ? TC.slab : "#3A362C"),
                background: on ? TC.slab : "transparent", color: on ? TC.cream : "#A39C8A",
                fontSize: 13, fontWeight: 600, cursor: "pointer"
              }}>{label}</button>
            );
          })}
        </div>
      </SettingsBlock>
      )}

      {role === "admin" && window.RB_PIN_SETTINGS ? (
        <SettingsBlock icon={<Ico name="usercog" size={16} color={TC.cream} />} title="PIN / PASSWORD">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={function () { window.RB_PIN_SETTINGS("admin"); }} style={{ padding: "10px", borderRadius: 8, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>Admin PIN change</button>
            <button onClick={function () { window.RB_PIN_SETTINGS("accountant"); }} style={{ padding: "10px", borderRadius: 8, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>Accountant PIN set / change</button>
          </div>
        </SettingsBlock>
      ) : null}

      {role === "admin" ? (
        <SettingsBlock icon={<Ico name="history" size={16} color={TC.cream} />} title={t("activityLog")}>
          {activityLog.length === 0 ? (
            <div style={{ fontSize: 11.5, color: TC.concrete, textAlign: "center", padding: "10px 0" }}>{t("noActivityYet")}</div>
          ) : (
            <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {activityLog.slice(0, 60).map(function (e) {
                return (
                  <div key={e.id} style={{ background: TC.appBg2, borderRadius: 7, padding: "7px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 11.5, color: TC.cream }}>{t(ACTION_LABELS[e.type] || e.type)}</div>
                      <div style={{ fontSize: 10, color: "#8B8577", marginTop: 1 }}>{e.detail}</div>
                    </div>
                    <div style={{ textAlign: "end" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: e.role === "admin" ? TC.stamp : TC.slab }}>{e.role === "admin" ? t("admin") : t("accountant")}</div>
                      <div style={{ fontSize: 9, color: "#6B6656", marginTop: 1 }}>{e.date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SettingsBlock>
      ) : null}

      <div style={{ background: TC.appBg2, borderRadius: 8, padding: 12, fontSize: 11.5, color: "#A39C8A" }}>{t("dataShared")}</div>

      {role !== "admin" ? null : (
      <div>
        {!confirming ? (
          <button onClick={function () { setConfirming(true); }} style={{
            width: "100%", padding: "12px", borderRadius: 8, border: "1.5px solid " + TC.stamp,
            background: "transparent", color: TC.stamp, fontSize: 13, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7
          }}>
            <Ico name="trash" size={15} /> {t("clearData")}
          </button>
        ) : (
          <div style={{ background: "#3A2A22", borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 12, color: "#E8C9B8", marginBottom: 10 }}>{t("clearDataConfirm")}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={function () { setConfirming(false); }} style={{ flex: 1, padding: "9px", borderRadius: 7, border: "1.5px solid #6B6656", background: "transparent", color: "#D8CDA9", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>{t("cancel")}</button>
              <button onClick={function () { onClear(); setConfirming(false); }} style={{ flex: 1, padding: "9px", borderRadius: 7, border: "none", background: TC.stamp, color: TC.cream, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>{t("clearData")}</button>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
