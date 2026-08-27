/* Raees Builder App v2 - tabs: sale, stock, wastage, dues, gate pass, settings */

function blankRow(mode) {
  var base = { id: rbUid(), category: "custom", variant: "", desc: "", qty: 1, rate: "" };
  return mode === "piece" ? base : Object.assign(base, { length: "", width: "" });
}

function variantLabel(t, category, variant) {
  var base = category === "garden" ? t("garden") + " " + variant + " ft" : t("slab") + " " + variant;
  var custom = variantCustomLabel(category, variant);
  return custom ? base + " " + custom : base;
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
  var w = React.useState(""), warn = w[0], setWarn = w[1];
  var variants = variantsFor(cat);
  var urdu = lang === "ur";
  function availFor(category, variant) { return Math.max(0, (remainingFor(category, variant) || 0) - (p.pickedQty ? p.pickedQty(category, variant) : 0)); }
  function openPrompt(category, variant) { setActive({ category: category, variant: variant }); setQtyInput(""); setWarn(""); }
  function confirmAdd() {
    var q = Number(qtyInput);
    if (!q || q <= 0) return;
    var avail = availFor(active.category, active.variant);
    if (q > avail) { setWarn(t("stockShort") + " \u2014 " + t("onlyLeft") + ": " + avail); return; }
    onPick(active.category, active.variant, q);
    setActive(null); setQtyInput(""); setWarn("");
  }
  return (
    <ModalShell onClose={onClose} title={t("chooseCategory")}>
      {active ? (
        <div style={{ textAlign: "center", padding: "10px 4px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: TC.cream, marginBottom: 4 }}>{variantLabel(t, active.category, active.variant)}</div>
          <div style={{ fontSize: 11.5, color: "#9FBE8A", marginBottom: 12 }}>{t("available")}: {availFor(active.category, active.variant)}</div>
          {warn ? <div style={{ background: TC.stamp, color: TC.cream, borderRadius: 7, padding: "7px 10px", fontSize: 11.5, fontWeight: 700, marginBottom: 10 }}>{warn}</div> : null}
          <input type="number" inputMode="numeric" autoFocus value={qtyInput}
            onChange={function (e) { setQtyInput(e.target.value); setWarn(""); }}
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
                  <div className="rb-mono" style={{ color: TC.cream, fontSize: 15, fontWeight: 700 }}>{v}{cat === "garden" ? " ft" : ""}{variantCustomLabel(cat, v) ? " " + variantCustomLabel(cat, v) : ""}</div>
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
  var nextSerial = p.nextSerial, saleRole = p.role;
  var canEditSerial = saleRole === "admin"; /* bill number sirf Admin badal sakta hai */
  var sn = React.useState(null), serialEdit = sn[0], setSerialEdit = sn[1];
  var a = React.useState("cash"), saleType = a[0], setSaleType = a[1];
  var b = React.useState(""), customerName = b[0], setCustomerName = b[1];
  var c = React.useState(""), mobile = c[0], setMobile = c[1];
  var d = React.useState(rbToday()), date = d[0], setDate = d[1];
  var e = React.useState([]), rows = e[0], setRows = e[1];
  var f = React.useState(false), pickerOpen = f[0], setPickerOpen = f[1];
  var g = React.useState(""), labourRate = g[0], setLabourRate = g[1];
  var h = React.useState(false), paidInFull = h[0], setPaidInFull = h[1];
  var i = React.useState(""), advanceInput = i[0], setAdvanceInput = i[1];
  var dsc = React.useState(""), discountInput = dsc[0], setDiscountInput = dsc[1];
  var j = React.useState(false), submitting = j[0], setSubmitting = j[1];
  var mode = saleType === "cash" ? "piece" : "area";
  var isEditing = !!editingSale;
  var effSerial = serialEdit === null ? String((isEditing && editingSale ? editingSale.serial : nextSerial) || 1) : serialEdit;
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
      setDiscountInput(String(editingSale.discount || 0));
    }
    setSerialEdit(null);
  }, [editingSale]);

  var itemsTotal = rows.reduce(function (sum, r) {
    if (mode === "piece") return sum + (Number(r.qty) || 0) * (Number(r.rate) || 0);
    var sq = (Number(r.qty) || 0) * (Number(r.length) || 0) * (Number(r.width) || 0);
    return sum + sq * (Number(r.rate) || 0);
  }, 0);
  var labourTotal = saleType === "cash" ? (Number(labourRate) || 0) : 0;
  var discount = Math.max(0, Math.min(itemsTotal + labourTotal, Number(discountInput) || 0));
  var totalBill = itemsTotal + labourTotal - discount;
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
    setPaidInFull(false); setAdvanceInput(""); setDiscountInput(""); setDate(rbToday()); setSerialEdit(null);
  }
  /* Rs 0 ka bill save nahi hona chahiye - har item ka rate zaroori hai */
  var hasZeroRate = rows.some(function (r) { return !(Number(r.rate) > 0); });
  var amountInvalid = rows.length > 0 && (hasZeroRate || !(totalBill > 0));
  var amountBlocked = amountInvalid && !canEditSerial; /* Rs 0 ka bill sirf Admin save kar sakta hai */

  /* stock se ziada maal bill mein na ja sake (stock manfi mein na jaye) */
  function rowsQtyFor(category, variant, list) {
    return (list || rows).reduce(function (n, r) {
      return (r.category === category && String(r.variant) === String(variant)) ? n + (Number(r.qty) || 0) : n;
    }, 0);
  }
  function backFromEdit(category, variant) {
    if (!editingSale) return 0;
    return (editingSale.items || []).reduce(function (n, it) {
      return (it.category === category && String(it.variant) === String(variant)) ? n + (Number(it.qty) || 0) : n;
    }, 0);
  }
  function availForRow(category, variant) {
    return (remainingFor(category, variant) || 0) + backFromEdit(category, variant);
  }
  var stockShortList = [];
  if (mode === "piece") {
    var seen = {};
    rows.forEach(function (r) {
      if (r.category !== "garden" && r.category !== "slab") return;
      var k = r.category + "|" + r.variant;
      if (seen[k]) return;
      seen[k] = 1;
      var want = rowsQtyFor(r.category, r.variant);
      var have = availForRow(r.category, r.variant);
      if (want > have) stockShortList.push({ category: r.category, variant: r.variant, want: want, have: Math.max(0, have) });
    });
  }
  var stockBlocked = stockShortList.length > 0;
  var canSave = customerName.trim() && rows.length > 0 && !amountBlocked && !stockBlocked && Number(effSerial) > 0 && !submitting;

  function handleSave() {
    if (!canSave) return;
    setSubmitting(true);
    var items = rows.map(function (r) {
      if (mode === "piece") return Object.assign({}, r, { amount: (Number(r.qty) || 0) * (Number(r.rate) || 0) });
      var sq = (Number(r.qty) || 0) * (Number(r.length) || 0) * (Number(r.width) || 0);
      return Object.assign({}, r, { sqft: sq, amount: sq * (Number(r.rate) || 0) });
    });
    var payload = {
      type: saleType, customerName: customerName.trim(), mobile: mobile.trim(), date: date, items: items, serial: Number(effSerial) || 0,
      roofLabourRate: saleType === "cash" ? (Number(labourRate) || 0) : 0,
      labourTotal: labourTotal, itemsTotal: itemsTotal, totalBill: totalBill,
      discount: discount, advance: advance, dues: dues, paidInFull: paidInFull
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
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}><span className="rb-mono" style={{ color: TC.stamp, fontSize: 14, fontWeight: 700 }}>#</span>{canEditSerial ? ( <input type="number" inputMode="numeric" value={effSerial} onChange={function (ev) { setSerialEdit(ev.target.value); }} className="rb-mono" style={{ width: 74, padding: "4px 6px", borderRadius: 6, border: "1.5px solid " + TC.paperLine, background: "transparent", color: TC.stamp, fontSize: 14, fontWeight: 700, textAlign: "center" }} /> ) : ( <span className="rb-mono" style={{ color: TC.stamp, fontSize: 14, fontWeight: 700 }}>{effSerial}</span> )}</div>
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
          <Field label={t("discount")}>
            <input type="number" inputMode="decimal" value={discountInput} onChange={function (ev) { setDiscountInput(ev.target.value); }} placeholder="0" style={rbInput()} />
          </Field>
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

      {amountInvalid ? (
        <div style={{ marginTop: 10, padding: "9px 11px", borderRadius: 8, background: "rgba(192,57,43,0.15)", border: "1px solid " + TC.stamp, color: TC.stamp, fontSize: 12, fontWeight: 600, textAlign: "center" }}>{t("rateRequired")}</div>
      ) : null}
      {stockBlocked ? (
        <div style={{ marginTop: 10, padding: "9px 11px", borderRadius: 8, background: "rgba(192,57,43,0.15)", border: "1px solid " + TC.stamp, color: TC.stamp, fontSize: 12, fontWeight: 600 }}>
          <div style={{ textAlign: "center", marginBottom: 4 }}>{t("stockShortSave")}</div>
          {stockShortList.map(function (x) {
            return <div key={x.category + x.variant} style={{ fontSize: 11, fontWeight: 600 }}>{variantLabel(t, x.category, x.variant)} &mdash; {t("qty")} {x.want}, {t("available")} {x.have}</div>;
          })}
        </div>
      ) : null}
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
          pickedQty={function (c2, v2) { return mode === "piece" ? Math.max(0, rowsQtyFor(c2, v2) - backFromEdit(c2, v2)) : 0; }}
          onPick={addFromStock} onClose={function () { setPickerOpen(false); }} />
      ) : null}
    </div>
  );
}
/* ---------------- stock ---------------- */
function BillsSummaryCard(p) { var t = p.t; var rg = React.useState({ preset: "all" }), range = rg[0], setRange = rg[1]; var rb = resolveRange(range); var sales = (p.sales || []).filter(function (bs) { return inDateRange(bs.date, rb.from, rb.to); }); var cs = React.useState(false), showCust = cs[0], setShowCust = cs[1]; var byCust = {}; sales.forEach(function (x) { var raw = String(x.customerName || "-").trim(); var k = raw.toLowerCase(); if (!byCust[k]) byCust[k] = { name: raw, count: 0, total: 0, received: 0, dues: 0, opening: 0 }; if (x.isOpening) { byCust[k].opening += Number(x.dues || 0); } else { byCust[k].count += 1; byCust[k].total += Number(x.totalBill || 0); byCust[k].received += Number(x.advance || 0); } byCust[k].dues += Number(x.dues || 0); }); var custList = Object.keys(byCust).map(function (k) { return byCust[k]; }).sort(function (m, n) { return (n.dues - m.dues) || (n.total - m.total); }); var realSales = sales.filter(function (x) { return !x.isOpening; }); var totalBill = realSales.reduce(function (s, x) { return s + Number(x.totalBill || 0); }, 0); var totalReceived = realSales.reduce(function (s, x) { return s + Number(x.advance || 0); }, 0); var totalDue = sales.reduce(function (s, x) { return s + Number(x.dues || 0); }, 0); return ( <div style={{ background: TC.paper, borderRadius: 10, padding: 12, marginBottom: 14 }}> <div className="rb-display" style={{ fontSize: 12, color: TC.inkSoft, fontWeight: 600, marginBottom: 8 }}>{t("billsSummary")}</div> <RangeFilter t={t} range={range} onChange={setRange} /> <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4 }}> <StatBlock label={t("billsCount")} value={realSales.length} bold /> <StatBlock label={t("billsTotal")} value={"Rs " + rbMoney(totalBill)} bold /> <StatBlock label={t("billsReceived")} value={"Rs " + rbMoney(totalReceived)} bold color={TC.success} /> <StatBlock label={t("billsDue")} value={"Rs " + rbMoney(totalDue)} bold color={totalDue > 0 ? TC.stamp : TC.success} /> </div>
      <div style={{ marginTop: 10, borderTop: "1px dashed " + TC.paperLine, paddingTop: 8 }}>
        <button onClick={function () { setShowCust(!showCust); }} style={{ width: "100%", padding: "7px", borderRadius: 6, border: "1.5px solid " + TC.paperLine, background: "transparent", color: TC.inkSoft, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>{showCust ? "▲" : "▼"} {t("byCustomer")} ({custList.length})</button>
        {showCust ? (
          <div style={{ maxHeight: 230, overflowY: "auto", marginTop: 6 }}>
            {custList.length === 0 ? ( <div style={{ fontSize: 11, color: TC.concrete, textAlign: "center", padding: "6px 0" }}>{t("noEntriesRange")}</div> ) : custList.map(function (c) {
              return (
                <div key={c.name} onClick={function () { if (p.onOpenCustomer) p.onOpenCustomer(c.name); }} style={{ padding: "6px 0", borderBottom: "1px dashed " + TC.paperLine, cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: TC.ink }}>{c.name}</span>
                    <span className="rb-mono" style={{ fontSize: 12, fontWeight: 700, color: TC.ink, whiteSpace: "nowrap" }}>Rs {rbMoney(c.total)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 2, gap: 8 }}>
                    <span style={{ color: TC.inkSoft }}>{c.count} {t("billsCount")}</span>
                    <span style={{ whiteSpace: "nowrap" }}><span style={{ color: TC.success }}>{t("billsReceived")} {rbMoney(c.received)}</span> <span style={{ color: TC.concrete }}>·</span> <span style={{ color: c.dues > 0 ? TC.stamp : TC.inkSoft }}>{t("dues")} {rbMoney(c.dues)}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
      </div> ); } function CustomerLedgerModal(p) {
  var t = p.t, name = p.name, onOpen = p.onOpen;
  var list = (p.sales || []).slice().sort(function (x, y) { return String(x.date || "").localeCompare(String(y.date || "")); });
  var totalAll = 0, receivedAll = 0, duesAll = 0, openingAll = 0, billCount = 0;
  list.forEach(function (s) {
    duesAll += Number(s.dues || 0);
    if (s.isOpening) { openingAll += Number(s.dues || 0); return; }
    billCount += 1; totalAll += Number(s.totalBill || 0); receivedAll += Number(s.advance || 0);
  });
  var goods = {};
  list.forEach(function (s) {
    (s.items || []).forEach(function (it) {
      if (!it.category || it.category === "custom") return;
      if (it.variant === "" || it.variant === null || it.variant === undefined) return;
      var k = it.category + "|" + it.variant;
      goods[k] = (goods[k] || 0) + (Number(it.qty) || 0);
    });
  });
  var goodsList = Object.keys(goods).map(function (k) { var pr = k.split("|"); return { category: pr[0], variant: pr[1], qty: goods[k] }; })
    .sort(function (m, n) { return String(m.category).localeCompare(String(n.category)) || (Number(m.variant) - Number(n.variant)); });
  return (
    <ModalShell onClose={p.onClose} title={name}>
      <div style={{ background: TC.paper, borderRadius: 8, padding: 10, marginBottom: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
          <StatBlock label={t("billsTotal")} value={"Rs " + rbMoney(totalAll)} bold />
          <StatBlock label={t("billsReceived")} value={"Rs " + rbMoney(receivedAll)} bold color={TC.success} />
          <StatBlock label={t("dues")} value={"Rs " + rbMoney(duesAll)} bold color={duesAll > 0 ? TC.stamp : TC.success} />
        </div>
        {openingAll ? (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginTop: 6, borderTop: "1px dashed " + TC.paperLine, paddingTop: 5 }}>
            <span style={{ color: TC.inkSoft }}>{t("openingBalance")}</span>
            <span className="rb-mono" style={{ fontWeight: 700, color: openingAll > 0 ? TC.stamp : TC.success }}>{openingAll < 0 ? "-" : ""}Rs {rbMoney(Math.abs(openingAll))}</span>
          </div>
        ) : null}
        <div style={{ fontSize: 10, color: TC.inkSoft, textAlign: "center", marginTop: 6 }}>{billCount} {t("billsCount")}</div>
      </div>

      {goodsList.length > 0 ? (
        <div style={{ background: TC.paper, borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <div className="rb-display" style={{ fontSize: 11.5, color: TC.inkSoft, fontWeight: 700, marginBottom: 6 }}>{t("goodsTaken")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 10px" }}>
            {goodsList.map(function (g) {
              return (
                <div key={g.category + g.variant} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, gap: 6 }}>
                  <span style={{ color: TC.inkSoft }}>{variantLabel(t, g.category, g.variant)}</span>
                  <span className="rb-mono" style={{ fontWeight: 700, color: TC.ink }}>{g.qty}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {list.length === 0 ? (
        <div style={{ fontSize: 12, color: "#A39C8A", textAlign: "center", padding: "16px 0" }}>{t("noBills")}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map(function (s) {
            var pays = (s.payments || []).slice().sort(function (x, y) { return String(x.date || "").localeCompare(String(y.date || "")); });
            return (
              <div key={s.id} style={{ background: TC.paper, borderRadius: 8, padding: "10px 12px" }}>
                <div onClick={function () { if (!s.isOpening) onOpen(s); }} style={{ cursor: s.isOpening ? "default" : "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span className="rb-mono" style={{ fontSize: 11.5, color: TC.inkSoft }}>{s.isOpening ? t("openingTag") : "#" + s.serial} · {rbDate(s.date)}</span>
                    <span className="rb-mono" style={{ fontSize: 12.5, fontWeight: 700, color: TC.ink }}>Rs {rbMoney(s.totalBill || 0)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 3, gap: 8 }}>
                    <span style={{ color: TC.inkSoft }}>{s.isOpening ? (s.openingDir === "adv" ? t("openingCustAdv") : t("openingCustDue")) : (s.type === "cash" ? t("cashSale") : t("customizedSale"))}</span>
                    <span style={{ whiteSpace: "nowrap" }}><span style={{ color: TC.success }}>{t("billsReceived")} {rbMoney(s.advance || 0)}</span> <span style={{ color: TC.concrete }}>·</span> <span style={{ color: (s.dues || 0) > 0 ? TC.stamp : TC.inkSoft }}>{t("dues")} {rbMoney(s.dues || 0)}</span></span>
                  </div>
                </div>
                {pays.length > 0 ? (
                  <div style={{ marginTop: 6, borderTop: "1px dashed " + TC.paperLine, paddingTop: 5 }}>
                    <div style={{ fontSize: 9.5, color: TC.concrete, fontWeight: 700, marginBottom: 2 }}>{t("paymentsList")}</div>
                    {pays.map(function (pay, idx) {
                      return (
                        <div key={pay.id || idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, padding: "1px 0", gap: 8 }}>
                          <span className="rb-mono" style={{ color: TC.inkSoft }}>{rbDate(pay.date)}</span>
                          <span className="rb-mono" style={{ fontWeight: 700, color: TC.success, whiteSpace: "nowrap" }}>+{rbMoney(pay.amount || 0)}{(Number(pay.discount) || 0) > 0 ? " · " + t("discount") + " " + rbMoney(pay.discount) : ""}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </ModalShell>
  );
}
function BillsTab(p) { var t = p.t, sales = p.sales, gatePasses = p.gatePasses, onOpen = p.onOpen, onMakeGatePass = p.onMakeGatePass, onViewGatePass = p.onViewGatePass, canSeeSummary = p.canSeeSummary; var role = p.role, onVerifyBill = p.onVerifyBill; var a = React.useState("all"), filter = a[0], setFilter = a[1]; var lg = React.useState(null), ledgerFor = lg[0], setLedgerFor = lg[1]; var b = React.useState(""), query = b[0], setQuery = b[1]; var gatePassEntryBySale = {}; gatePasses.forEach(function (g) { if (g.saleId) gatePassEntryBySale[g.saleId] = g; }); function needsGatePass(s) { return !s.isOpening && s.type !== "cash" && !gatePassEntryBySale[s.id]; } var filtered = sales.filter(function (s) { if (filter === "missing" && !needsGatePass(s)) return false; if (query && String(s.customerName).toLowerCase().indexOf(query.toLowerCase()) < 0) return false; return true; }); return ( <div style={{ padding: "14px 14px 4px" }}> {canSeeSummary ? <BillsSummaryCard t={t} sales={sales} onOpenCustomer={setLedgerFor} /> : null} <div style={{ position: "relative", marginBottom: 10 }}> <span style={{ position: "absolute", left: 12, top: 11, color: TC.concrete }}><Ico name="search" size={15} /></span> <input value={query} onChange={function (e) { setQuery(e.target.value); }} placeholder={t("searchCustomer")} style={Object.assign({}, rbInput(), { background: TC.appBg2, color: TC.cream, border: "1.5px solid #3A362C", paddingInlineStart: 34 })} /> </div> <div style={{ display: "flex", gap: 8, marginBottom: 12 }}> {[["all", t("allSales")], ["missing", t("makeGatePass")]].map(function (o) { var id = o[0], label = o[1], on = filter === id; return ( <button key={id} onClick={function () { setFilter(id); }} style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid " + (on ? TC.amber : "#3A362C"), background: on ? TC.amber : "transparent", color: on ? TC.ink : "#A39C8A", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{label}</button> ); })} </div> {filtered.length === 0 ? ( <EmptyState icon={<Ico name="history" size={28} color={TC.concrete} />} text={sales.length === 0 ? t("noBills") : t("searchNoResults")} /> ) : ( <div style={{ display: "flex", flexDirection: "column", gap: 8 }}> {filtered.map(function (s) { var missing = needsGatePass(s); var passEntry = gatePassEntryBySale[s.id]; var zeroBill = !s.isOpening && !(Number(s.totalBill) > 0); var gpDiff = (role === "admin" && !s.isOpening) ? gpExtraOverBill(s, passEntry) : []; var billVerified = !!s.verified; var gpOk = billVerified || !!(passEntry && passEntry.verified); var gpExtra = (gpDiff.length > 0 && !gpOk) ? gpDiff : []; return ( <div key={s.id} style={{ background: TC.paper, borderRadius: 8, padding: "12px 14px" }}> <div onClick={function () { if (!s.isOpening) onOpen(s); }} style={{ display: "flex", justifyContent: "space-between", cursor: s.isOpening ? "default" : "pointer" }}> <div> <div style={{ display: "flex", alignItems: "center", gap: 6 }}> <span style={{ fontSize: 13.5, fontWeight: 700, color: TC.ink }}>{s.customerName}</span> {missing ? ( <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase", background: TC.amber, color: TC.ink }}>{t("makeGatePass")}</span> ) : null} {gpExtra.length > 0 ? ( <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase", background: TC.stamp, color: TC.cream }}>{t("gpMoreThanBill")}</span> ) : null} {billVerified ? ( <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase", background: TC.success, color: TC.cream }}>{t("gpVerifiedTag")}</span> ) : null} {zeroBill ? ( <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase", background: TC.stamp, color: TC.cream }}>{t("zeroBillTag")}</span> ) : null} {s.isOpening ? ( <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase", background: TC.slab, color: TC.cream }}>{t("openingTag")}</span> ) : null} </div> <div style={{ fontSize: 10.5, color: TC.inkSoft, marginTop: 2 }}> {s.isOpening ? (t("openingTag") + " · " + rbDate(s.date)) : ("#" + s.serial + " · " + rbDate(s.date) + " · " + (s.type === "cash" ? t("cashSale") : t("customizedSale")))} </div> {gpExtra.length > 0 ? ( <div style={{ marginTop: 4 }}> {gpExtra.map(function (x) { return ( <div key={x.category + x.variant} style={{ fontSize: 10, color: TC.stamp, fontWeight: 600 }}>{variantLabel(t, x.category, x.variant)} — {t("gpVsBill")} {x.bill} / {t("gpVsGate")} {x.gp}</div> ); })} </div> ) : null} </div> <div style={{ textAlign: "end" }}> <div className="rb-mono" style={{ fontSize: 13, fontWeight: 700, color: TC.ink }}>Rs {rbMoney(s.totalBill || 0)}</div> <div style={{ fontSize: 10, color: (s.dues || 0) > 0 ? TC.stamp : TC.success, marginTop: 2 }}>{(s.dues || 0) > 0 ? t("due") : t("paid")}</div> </div> </div> {s.isOpening ? null : passEntry ? ( <button onClick={function () { onViewGatePass(s, passEntry); }} style={{ marginTop: 9, width: "100%", padding: "8px", borderRadius: 6, border: "1.5px solid " + TC.slab, background: "transparent", color: TC.slab, fontSize: 11.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Ico name="truck" size={13} /> {t("viewGatePass")}</button> ) : ( <button onClick={function () { onMakeGatePass(s); }} style={{ marginTop: 9, width: "100%", padding: "8px", borderRadius: 6, border: "1.5px solid " + TC.slab, background: "transparent", color: TC.slab, fontSize: 11.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Ico name="truck" size={13} /> {t("makeGatePass")}</button> )} {(role === "admin" && !billVerified && onVerifyBill && !s.isOpening) ? ( <button onClick={function () { onVerifyBill(s); }} style={{ marginTop: 8, width: "100%", padding: "9px", borderRadius: 6, border: "none", background: TC.success, color: TC.cream, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>{t("verifyGp")}</button> ) : null} </div> ); })} </div> )} {ledgerFor ? ( <CustomerLedgerModal t={t} name={ledgerFor} sales={sales.filter(function (x) { return String(x.customerName || "").trim().toLowerCase() === String(ledgerFor).trim().toLowerCase(); })} onOpen={function (x) { setLedgerFor(null); onOpen(x); }} onClose={function () { setLedgerFor(null); }} /> ) : null} </div> ); } function StockSummaryCard(p) {
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
                <span>{rbDate(e.date)} · {variantLabel(t, e.category, e.variant)}</span>
                <span className="rb-mono" style={{ fontWeight: 700, color: TC.ink }}>{e.verified ? "" : "• "}+{e.qty}</span>
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

function StockSummaryCard(p) { var t = p.t, stockLog = p.stockLog; var a = React.useState({ preset: "today" }), range = a[0], setRange = a[1]; var r = resolveRange(range); var filtered = stockLog.filter(function (e) { return inDateRange(e.date, r.from, r.to); }); var totalGarden = filtered.filter(function (e) { return e.category === "garden"; }).reduce(function (s, e) { return s + Number(e.qty || 0); }, 0); var totalSlab = filtered.filter(function (e) { return e.category === "slab"; }).reduce(function (s, e) { return s + Number(e.qty || 0); }, 0); function sortedFor(category) { return filtered.filter(function (e) { return e.category === category; }) .sort(function (x, y) { return String(y.date || "").localeCompare(String(x.date || "")); }); } var gardenSorted = sortedFor("garden"); var slabSorted = sortedFor("slab"); function renderList(list) { return list.length > 0 ? ( <div style={{ maxHeight: 150, overflowY: "auto" }}> {list.map(function (e) { return ( <div key={e.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "3px 0", color: TC.inkSoft }}> <span>{rbDate(e.date)} · {variantLabel(t, e.category, e.variant)}</span> <span className="rb-mono" style={{ fontWeight: 700, color: TC.ink }}>+{e.qty}</span> </div> ); })} </div> ) : ( <div style={{ fontSize: 11, color: TC.concrete, textAlign: "center", padding: "6px 0" }}>{t("noEntriesRange")}</div> ); } return ( <div style={{ background: TC.paper, borderRadius: 10, padding: 12, marginBottom: 14 }}> <div className="rb-display" style={{ fontSize: 12, color: TC.inkSoft, fontWeight: 600, marginBottom: 8 }}>{t("stockSummary")}</div> <RangeFilter t={t} range={range} onChange={setRange} /> <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 8 }}> <StatBlock label={t("garden")} value={totalGarden} /> <StatBlock label={t("slab")} value={totalSlab} /> <StatBlock label={t("total")} value={totalGarden + totalSlab} bold color={TC.success} /> </div> <div style={{ borderTop: "1px dashed " + TC.paperLine, paddingTop: 8 }}> <div style={{ fontSize: 10.5, color: TC.inkSoft, fontWeight: 700, marginBottom: 4 }}>{t("garden")}</div> {renderList(gardenSorted)} </div> <div style={{ borderTop: "1px dashed " + TC.paperLine, paddingTop: 8, marginTop: 8 }}> <div style={{ fontSize: 10.5, color: TC.inkSoft, fontWeight: 700, marginBottom: 4 }}>{t("slab")}</div> {renderList(slabSorted)} </div> </div> ); } function CatNamesSetter(p) {
  var t = p.t, names = p.names || {};
  var a = React.useState(names.garden || ""), g = a[0], setG = a[1];
  var b = React.useState(names.slab || ""), sl = b[0], setSl = b[1];
  var inp = { width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 13.5 };
  return (
    <div>
      <div style={{ fontSize: 11, color: "#A39C8A", marginBottom: 8 }}>{t("catNamesHint")}</div>
      <input value={g} onChange={function (e) { setG(e.target.value); }} placeholder={t("catNameFirst")} style={Object.assign({}, inp, { marginBottom: 6 })} />
      <input value={sl} onChange={function (e) { setSl(e.target.value); }} placeholder={t("catNameSecond")} style={Object.assign({}, inp, { marginBottom: 8 })} />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={function () { p.onSave(g, sl); }} style={{ flex: 2, padding: "10px", borderRadius: 7, border: "none", background: TC.garden, color: TC.cream, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>{t("save")}</button>
        <button onClick={function () { setG(""); setSl(""); p.onSave("", ""); }} style={{ flex: 1, padding: "10px", borderRadius: 7, border: "1.5px solid #3A362C", background: "transparent", color: "#A39C8A", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{t("resetName")}</button>
      </div>
    </div>
  );
}

function EditVariantModal(p) {
  var t = p.t, cat = p.category, v = p.variant;
  var a = React.useState(String(v)), val = a[0], setVal = a[1];
  var b = React.useState(variantCustomLabel(cat, v) || ""), lbl = b[0], setLbl = b[1];
  var c = React.useState(false), confirmDel = c[0], setConfirmDel = c[1];
  var inp = { width: "100%", boxSizing: "border-box", padding: "10px 11px", borderRadius: 8, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 15 };
  var ok = Number(val) > 0;
  return (
    <div className="no-print" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 9400, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 480, background: TC.appBg, borderRadius: "16px 16px 0 0", padding: 18 }}>
        <div className="rb-display" style={{ color: TC.cream, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{t("editSize")}</div>
        <div style={{ fontSize: 11.5, color: "#A39C8A", marginBottom: 12 }}>{t(cat)} &middot; {v}{cat === "garden" ? " ft" : ""}</div>
        <input type="number" inputMode="decimal" value={val} onChange={function (e) { setVal(e.target.value); }} placeholder={t("sizeValue")} style={Object.assign({}, inp, { marginBottom: 8 })} />
        <input value={lbl} onChange={function (e) { setLbl(e.target.value); }} placeholder={t("sizeLabelOptional")} style={Object.assign({}, inp, { marginBottom: 8 })} />
        <div style={{ fontSize: 10.5, color: "#A39C8A", marginBottom: 12 }}>{t("sizeMoved")}</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button disabled={!ok} onClick={function () { p.onSave(cat, v, val, lbl); p.onClose(); }} style={{ flex: 1, padding: "12px", borderRadius: 8, border: "none", background: ok ? TC.garden : "#4A4638", color: TC.cream, fontSize: 13, fontWeight: 700, cursor: ok ? "pointer" : "not-allowed" }}>{t("save")}</button>
          <button onClick={p.onClose} style={{ flex: 1, padding: "12px", borderRadius: 8, border: "1.5px solid #3A362C", background: "transparent", color: "#A39C8A", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{t("cancel")}</button>
        </div>
        {confirmDel ? (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={function () { p.onDelete(cat, v); p.onClose(); }} style={{ flex: 1, padding: "11px", borderRadius: 8, border: "none", background: TC.stamp, color: TC.cream, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>{t("deleteSize")}</button>
            <button onClick={function () { setConfirmDel(false); }} style={{ flex: 1, padding: "11px", borderRadius: 8, border: "1.5px solid #3A362C", background: "transparent", color: "#A39C8A", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>{t("cancel")}</button>
          </div>
        ) : (
          <button onClick={function () { setConfirmDel(true); }} style={{ width: "100%", padding: "11px", borderRadius: 8, border: "1.5px dashed " + TC.stamp, background: "transparent", color: TC.stamp, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>{t("deleteSize")}</button>
        )}
      </div>
    </div>
  );
}

function CementSummaryCard(p) {
  var t = p.t, stockLog = p.stockLog || [], purchases = p.purchases || [], suppliers = p.suppliers || [];
  var totals = p.cementTotals || { added: 0, used: 0, remaining: 0 };
  var a = React.useState({ preset: "today" }), range = a[0], setRange = a[1];
  var r = resolveRange(range);
  var supName = {}; suppliers.forEach(function (s) { supName[s.id] = s.name; });

  var inRange = stockLog.filter(function (e) { return inDateRange(e.date, r.from, r.to); });
  var buys = purchases.filter(function (x) { return rbMaterialOf(x) === "cement" && inDateRange(x.date, r.from, r.to); })
    .sort(function (x, y) { return String(y.date || "").localeCompare(String(x.date || "")); });
  var bought = buys.reduce(function (n, x) { return n + rbQtyOf(x); }, 0);

  function catRows(cat) {
    return inRange.filter(function (e) { return e.category === cat && (Number(e.cementBags) || 0) > 0; })
      .sort(function (x, y) { return String(y.date || "").localeCompare(String(x.date || "")); });
  }
  function sum(list, key) { return list.reduce(function (n, e) { return n + (Number(e[key]) || 0); }, 0); }
  var gRows = catRows("garden"), sRows = catRows("slab");
  var gBags = sum(gRows, "cementBags"), sBags = sum(sRows, "cementBags");
  var gQty = sum(gRows, "qty"), sQty = sum(sRows, "qty");
  function per(bags, qty) { return qty > 0 ? (Math.round((bags / qty) * 100) / 100) : 0; }

  function entryList(list, color) {
    if (!list.length) return <div style={{ fontSize: 11, color: TC.concrete, textAlign: "center", padding: "6px 0" }}>{t("cementNoUse")}</div>;
    return (
      <div style={{ maxHeight: 150, overflowY: "auto" }}>
        {list.map(function (e) {
          return (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "3px 0", color: TC.inkSoft, gap: 8 }}>
              <span>{rbDate(e.date)} &middot; {variantLabel(t, e.category, e.variant)} &middot; +{e.qty}</span>
              <span className="rb-mono" style={{ fontWeight: 700, color: color, whiteSpace: "nowrap" }}>{e.cementBags} {t("cementBag")}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ background: TC.paper, borderRadius: 10, padding: 12, marginBottom: 14 }}>
      <div className="rb-display" style={{ fontSize: 12, color: TC.inkSoft, fontWeight: 600, marginBottom: 8 }}>{t("cementSummary")}</div>
      <RangeFilter t={t} range={range} onChange={setRange} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 8 }}>
        <StatBlock label={t("bagsAdded")} value={bought} />
        <StatBlock label={t("cementUsedRange")} value={gBags + sBags} />
        <StatBlock label={t("bagsLeft")} value={totals.remaining} bold color={totals.remaining > 0 ? TC.success : (totals.remaining < 0 ? TC.stamp : TC.inkSoft)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, borderTop: "1px dashed " + TC.paperLine, paddingTop: 8 }}>
        {[["garden", t("cementOnGarder"), gBags, gQty, TC.garden], ["slab", t("cementOnSlab"), sBags, sQty, TC.slab]].map(function (o) {
          return (
            <div key={o[0]} style={{ background: TC.paperDark, borderRadius: 8, padding: "8px 9px" }}>
              <div style={{ fontSize: 10, color: TC.inkSoft, fontWeight: 700, marginBottom: 3 }}>{o[1]}</div>
              <div className="rb-mono" style={{ fontSize: 16, fontWeight: 700, color: o[4] }}>{o[2]} <span style={{ fontSize: 10, color: TC.inkSoft }}>{t("cementBag")}</span></div>
              <div style={{ fontSize: 9.5, color: TC.inkSoft, marginTop: 2 }}>{o[3]} {t("pieces")} &middot; {t("cementPerPiece")} {per(o[2], o[3])}</div>
            </div>
          );
        })}
      </div>
      <div style={{ borderTop: "1px dashed " + TC.paperLine, paddingTop: 8, marginTop: 8 }}>
        <div style={{ fontSize: 10.5, color: TC.garden, fontWeight: 700, marginBottom: 4 }}>{t("garden")}</div>
        {entryList(gRows, TC.garden)}
      </div>
      <div style={{ borderTop: "1px dashed " + TC.paperLine, paddingTop: 8, marginTop: 8 }}>
        <div style={{ fontSize: 10.5, color: TC.slab, fontWeight: 700, marginBottom: 4 }}>{t("slab")}</div>
        {entryList(sRows, TC.slab)}
      </div>
      <div style={{ borderTop: "1px dashed " + TC.paperLine, paddingTop: 8, marginTop: 8 }}>
        <div style={{ fontSize: 10.5, color: TC.inkSoft, fontWeight: 700, marginBottom: 4 }}>{t("cementPurchased")}</div>
        {buys.length === 0 ? (
          <div style={{ fontSize: 11, color: TC.concrete, textAlign: "center", padding: "6px 0" }}>{t("cementNoBuy")}</div>
        ) : (
          <div style={{ maxHeight: 120, overflowY: "auto" }}>
            {buys.map(function (x) {
              return (
                <div key={x.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "3px 0", color: TC.inkSoft, gap: 8 }}>
                  <span>{rbDate(x.date)} &middot; {supName[x.supplierId] || "-"}</span>
                  <span className="rb-mono" style={{ fontWeight: 700, color: TC.ink, whiteSpace: "nowrap" }}>+{rbQtyOf(x)} {t("cementBag")}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AddStockModal(p) {
  var t = p.t;
  var a = React.useState(""), qty = a[0], setQty = a[1];
  var b = React.useState(rbToday()), date = b[0], setDate = b[1];
  var s1 = React.useState(""), supId = s1[0], setSupId = s1[1];
  var s2 = React.useState(""), rate = s2[0], setRate = s2[1];
  var s3 = React.useState(""), amount = s3[0], setAmount = s3[1];
  var s4 = React.useState(false), addingSup = s4[0], setAddingSup = s4[1];
  var s5 = React.useState(""), newSup = s5[0], setNewSup = s5[1];
  var suppliers = p.suppliers || [];
  var q = Number(qty) || 0;
  var canSave = q > 0;
  var bought = !!supId;
  function round2(n) { return Math.round(n * 100) / 100; }
  function onQty(v) { setQty(v); var qq = Number(v) || 0; if (rate !== "") setAmount(String(round2((Number(rate) || 0) * qq))); }
  function onRate(v) { setRate(v); setAmount(v === "" ? "" : String(round2((Number(v) || 0) * q))); }
  function onAmount(v) { setAmount(v); setRate((v === "" || q <= 0) ? "" : String(round2((Number(v) || 0) / q))); }
  function pickSup(v) {
    if (v === "__new") { setAddingSup(true); return; }
    setSupId(v); setAddingSup(false);
    if (!v) { setRate(""); setAmount(""); }
  }
  var selStyle = Object.assign({}, rbInput(), { fontSize: 14 });
  return (
    <ModalShell onClose={p.onClose} title={t("addStock")}>
      <div style={{ marginBottom: 12, fontSize: 13, color: TC.cream, fontWeight: 600 }}>{variantLabel(t, p.category, p.variant)}</div>
      <Field label={t("qty")}>
        <input type="number" inputMode="numeric" autoFocus value={qty} onChange={function (e) { onQty(e.target.value); }}
          placeholder={t("enterQty")} style={Object.assign({}, rbInput(), { fontSize: 16 })} />
      </Field>
      {p.canSupplier ? (
        <Field label={t("purchasedFrom")}>
          <select value={supId} onChange={function (e) { pickSup(e.target.value); }} style={selStyle}>
            <option value="">{t("ownFactory")}</option>
            {suppliers.map(function (s) { return <option key={s.id} value={s.id}>{s.name}</option>; })}
            <option value="__new">+ {t("addSupplier")}</option>
          </select>
        </Field>
      ) : null}
      {addingSup ? (
        <div style={{ display: "flex", gap: 6, marginTop: -6, marginBottom: 10 }}>
          <input value={newSup} onChange={function (e) { setNewSup(e.target.value); }} placeholder={t("newSupplierName")}
            style={Object.assign({}, rbInput(), { flex: 1, marginBottom: 0 })} />
          <button disabled={!newSup.trim()} onClick={function () {
            var id = p.onAddSupplier ? p.onAddSupplier(newSup, "") : null;
            if (id) setSupId(id);
            setNewSup(""); setAddingSup(false);
          }} style={{ padding: "0 14px", borderRadius: 8, border: "none", background: newSup.trim() ? TC.garden : "#4A4638", color: TC.cream, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>{t("add")}</button>
        </div>
      ) : null}
      {bought ? (
        <div style={{ background: TC.appBg2, borderRadius: 8, padding: 10, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "#A39C8A", marginBottom: 4 }}>{t("ratePerPiece")}</div>
              <input type="number" inputMode="decimal" value={rate} onChange={function (e) { onRate(e.target.value); }}
                placeholder="0" style={Object.assign({}, rbInput(), { fontSize: 15, marginBottom: 0 })} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "#A39C8A", marginBottom: 4 }}>{t("purchaseTotal")}</div>
              <input type="number" inputMode="decimal" value={amount} onChange={function (e) { onAmount(e.target.value); }}
                placeholder="0" style={Object.assign({}, rbInput(), { fontSize: 15, marginBottom: 0 })} />
            </div>
          </div>
          <div style={{ fontSize: 10, color: "#A39C8A", marginTop: 8 }}>{t("purchaseNote")}</div>
        </div>
      ) : null}
      <Field label={t("date")}>
        <input type="date" value={date} onChange={function (e) { setDate(e.target.value); }} style={rbInput()} />
      </Field>
      <button disabled={!canSave} onClick={function () {
        p.onSave(qty, date, bought ? { supplierId: supId, amount: Number(amount) || 0 } : null);
      }} style={{
        width: "100%", marginTop: 6, padding: "12px", borderRadius: 8, border: "none",
        background: canSave ? TC.garden : "#4A4638", color: TC.cream, fontSize: 13.5, fontWeight: 700,
        cursor: canSave ? "pointer" : "not-allowed"
      }}>{t("addStock")}</button>
    </ModalShell>
  );
}

/* Stock poora add karne ke baad cement - Garder aur Slab ki alag alag */
function CementPromptModal(p) {
  var t = p.t;
  var entries = p.entries || [];
  var blocking = !!p.blocking;
  var g = React.useState(""), gBags = g[0], setGBags = g[1];
  var sl = React.useState(""), sBags = sl[0], setSBags = sl[1];

  function listOf(cat) { return entries.filter(function (e) { return e.category === cat; }); }
  var gList = listOf("garden"), sList = listOf("slab");
  var okG = gList.length === 0 || (gBags !== "" && Number(gBags) >= 0);
  var okS = sList.length === 0 || (sBags !== "" && Number(sBags) >= 0);
  var canSave = okG && okS;
  var left = (p.cementLeft === null || p.cementLeft === undefined) ? null : p.cementLeft;
  var willUse = (Number(gBags) || 0) + (Number(sBags) || 0);

  function section(cat, list, val, setVal, color) {
    if (list.length === 0) return null;
    var totalQty = list.reduce(function (n, e) { return n + (Number(e.qty) || 0); }, 0);
    return (
      <div style={{ background: TC.paper, borderRadius: 10, padding: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div className="rb-display" style={{ fontSize: 12.5, fontWeight: 700, color: color }}>{t(cat)}</div>
          <div className="rb-mono" style={{ fontSize: 11.5, fontWeight: 700, color: TC.inkSoft }}>+{totalQty}</div>
        </div>
        <div style={{ maxHeight: 108, overflowY: "auto", marginBottom: 8 }}>
          {list.map(function (e) {
            return (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "2px 0", color: TC.inkSoft }}>
                <span>{rbDate(e.date)} · {variantLabel(t, e.category, e.variant)}</span>
                <span className="rb-mono" style={{ fontWeight: 700, color: TC.ink }}>+{e.qty}</span>
              </div>
            );
          })}
        </div>
        <input type="number" inputMode="numeric" value={val} onChange={function (ev) { setVal(ev.target.value); }}
          placeholder={t("cementForCat")} style={Object.assign({}, rbInput(), { fontSize: 16 })} />
      </div>
    );
  }

  return (
    <div className="no-print" style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 9200,
      display: "flex", alignItems: "flex-end", justifyContent: "center"
    }}>
      <div style={{ width: "100%", maxWidth: 480, background: TC.appBg, borderRadius: "16px 16px 0 0", padding: 18, maxHeight: "88vh", overflowY: "auto" }}>
        <div className="rb-display" style={{ color: TC.cream, fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{t("cementPromptTitle")}</div>
        <div style={{ fontSize: 11.5, color: "#A39C8A", marginBottom: 12 }}>{t("cementAskLine")}</div>
        {blocking ? (
          <div style={{ background: TC.stamp, color: TC.cream, borderRadius: 8, padding: "9px 11px", fontSize: 11.5, fontWeight: 700, marginBottom: 12 }}>{t("cementBlocked")}</div>
        ) : null}
        {section("garden", gList, gBags, setGBags, TC.garden)}
        {section("slab", sList, sBags, setSBags, TC.slab)}
        <div style={{ fontSize: 10.5, color: "#A39C8A", marginBottom: 10 }}>{t("cementSkipZero")}</div>
        {left !== null ? (
          <div style={{ fontSize: 10.5, color: willUse > left ? TC.stamp : "#A39C8A", marginBottom: 10 }}>
            {t("cement")} {t("bagsLeft")}: <span className="rb-mono" style={{ fontWeight: 700 }}>{left}</span>
          </div>
        ) : null}
        <button disabled={!canSave} onClick={function () { p.onSave({ garden: Number(gBags) || 0, slab: Number(sBags) || 0 }); }} style={{
          width: "100%", padding: "12px", borderRadius: 8, border: "none",
          background: canSave ? TC.garden : "#4A4638", color: TC.cream, fontSize: 13.5, fontWeight: 700,
          cursor: canSave ? "pointer" : "not-allowed"
        }}>{t("saveCementBtn")}</button>
        {!blocking ? (
          <button onClick={p.onLater} style={{
            width: "100%", marginTop: 8, padding: "10px", borderRadius: 8, border: "1.5px solid " + TC.concrete,
            background: "transparent", color: "#A39C8A", fontSize: 12.5, fontWeight: 600, cursor: "pointer"
          }}>{t("laterBtn")}</button>
        ) : null}
      </div>
    </div>
  );
}

function AddVariantModal(p) {
  var t = p.t;
  var a = React.useState(""), value = a[0], setValue = a[1];
  var lb = React.useState(""), label = lb[0], setLabel = lb[1];
  var canSave = Number(value) > 0;
  return (
    <ModalShell onClose={p.onClose} title={t("addNewSize")}>
      <div style={{ marginBottom: 12, fontSize: 13, color: TC.cream, fontWeight: 600 }}>{p.category === "garden" ? t("garden") : t("slab")}</div>
      <Field label={t("enterNewSize")}>
        <input type="number" inputMode="decimal" autoFocus value={value} onChange={function (e) { setValue(e.target.value); }}
          placeholder={p.category === "garden" ? "21" : "5.0"} style={Object.assign({}, rbInput(), { fontSize: 16 })} />
      </Field>
      <Field label={t("sizeLabelOptional")}>
        <input type="text" value={label} onChange={function (e) { setLabel(e.target.value); }}
          placeholder={t("sizeLabelPlaceholder")} style={rbInput()} />
      </Field>
      <button disabled={!canSave} onClick={function () { p.onSave(value, label); }} style={{
        width: "100%", marginTop: 6, padding: "12px", borderRadius: 8, border: "none",
        background: canSave ? TC.slab : "#4A4638", color: TC.cream, fontSize: 13.5, fontWeight: 700,
        cursor: canSave ? "pointer" : "not-allowed"
      }}>{t("addNewSize")}</button>
    </ModalShell>
  );
}

function StockHistoryModal(p) {
  var t = p.t;
  var entries = p.entries;
  var canEdit = p.canEdit !== false;
  var e = React.useState(null), editingId = e[0], setEditingId = e[1];
  var f = React.useState(""), editQty = f[0], setEditQty = f[1];
  var g = React.useState(""), editDate = g[0], setEditDate = g[1];
  function startEdit(entry) {
    setEditingId(entry.id); setEditQty(String(entry.qty)); setEditDate(entry.date);
  }
  function saveEdit() {
    var q = Number(editQty);
    if (!(q > 0)) return;
    p.onEdit(editingId, q, editDate || rbToday());
    setEditingId(null);
  }
  function doDelete(entry) {
    if (window.confirm(t("confirmDeleteStockEntry"))) { p.onDelete(entry.id); }
  }
  return (
    <ModalShell onClose={p.onClose} title={t("stockHistory")}>
      <div style={{ marginBottom: 12, fontSize: 13, color: TC.cream, fontWeight: 600 }}>{variantLabel(t, p.category, p.variant)}</div>
      {entries.length === 0 ? (
        <div style={{ fontSize: 12, color: "#A39C8A", textAlign: "center", padding: "16px 0" }}>{t("noStockYet")}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map(function (entry) {
            var isEditing = editingId === entry.id;
            return (
              <div key={entry.id} style={{ background: TC.paper, borderRadius: 8, padding: "10px 12px" }}>
                {isEditing ? (
                  <div>
                    <Field label={t("qty")}>
                      <input type="number" inputMode="numeric" autoFocus value={editQty} onChange={function (ev) { setEditQty(ev.target.value); }} style={rbInput()} />
                    </Field>
                    <Field label={t("date")}>
                      <input type="date" value={editDate} onChange={function (ev) { setEditDate(ev.target.value); }} style={rbInput()} />
                    </Field>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={saveEdit} style={{ flex: 1, padding: "9px", borderRadius: 7, border: "none", background: TC.garden, color: TC.cream, fontWeight: 700, cursor: "pointer" }}>{t("save")}</button>
                      <button onClick={function () { setEditingId(null); }} style={{ flex: 1, padding: "9px", borderRadius: 7, border: "1.5px solid " + TC.paperLine, background: "transparent", color: TC.inkSoft, fontWeight: 700, cursor: "pointer" }}>{t("cancel")}</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <div>
                      <div className="rb-mono" style={{ fontSize: 14, fontWeight: 700, color: TC.ink }}>{entry.qty}{(Number(entry.cementBags) || 0) > 0 ? <span style={{ fontSize: 10, fontWeight: 600, color: TC.inkSoft }}>  ·  {t("cement")} {entry.cementBags}</span> : null}</div>
                      <div className="rb-mono" style={{ fontSize: 10.5, color: TC.inkSoft, marginTop: 2 }}>{rbDate(entry.date)}</div>
                    </div>
                    {(canEdit && !entry.verified && p.onVerifyStock) ? (
                      <button onClick={function () { p.onVerifyStock(entry.id); }} style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: TC.success, color: TC.cream, fontSize: 10.5, fontWeight: 700, cursor: "pointer" }}>{t("verifyGp")}</button>
                    ) : null}
                    {entry.verified ? (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase", background: TC.success, color: TC.cream }}>{t("gpVerifiedTag")}</span>
                    ) : null}
                    {canEdit ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={function () { startEdit(entry); }} style={{ width: 30, height: 30, borderRadius: 6, border: "none", background: TC.paperDark, color: TC.ink, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name="pencil" size={14} /></button>
                      <button onClick={function () { doDelete(entry); }} style={{ width: 30, height: 30, borderRadius: 6, border: "none", background: TC.stamp, color: TC.cream, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name="trash" size={14} /></button>
                    </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </ModalShell>
  );
}
function InlineShell(p) {
  return (
    <div style={{ padding: "14px 14px 4px" }}>
      {p.title ? (<div className="rb-display" style={{ fontSize: 14, fontWeight: 700, color: TC.cream, marginBottom: 12 }}>{p.title}</div>) : null}
      {p.children}
    </div>
  );
}
function OpeningDirPicker(p) {
  var opts = [["due", p.dueLabel], ["adv", p.advLabel]];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
      {opts.map(function (o) {
        var id = o[0], label = o[1], on = p.value === id;
        return (
          <button key={id} onClick={function () { p.onChange(id); }} style={{
            flex: 1, padding: "8px 6px", borderRadius: 7, border: "1.5px solid " + (on ? TC.amber : "#3A362C"),
            background: on ? TC.amber : "transparent", color: on ? TC.ink : "#A39C8A",
            fontSize: 11, fontWeight: 700, cursor: "pointer"
          }}>{label}</button>
        );
      })}
    </div>
  );
}
function SupplierModal(p) {
  var t = p.t, suppliers = p.suppliers || [], supplierTotals = p.supplierTotals;
  var Shell = p.inline ? InlineShell : ModalShell;
  var o1 = React.useState(""), obAmt = o1[0], setObAmt = o1[1];
  var o2 = React.useState("due"), obDir = o2[0], setObDir = o2[1];
  var o3 = React.useState(rbToday()), obDate = o3[0], setObDate = o3[1];
  var o4 = React.useState(false), obOpen = o4[0], setObOpen = o4[1];
  var n3 = React.useState(""), newOb = n3[0], setNewOb = n3[1];
  var n4 = React.useState("due"), newObDir = n4[0], setNewObDir = n4[1];
  var a = React.useState(null), openId = a[0], setOpenId = a[1];
  var b = React.useState(false), adding = b[0], setAdding = b[1];
  var n1 = React.useState(""), nm = n1[0], setNm = n1[1];
  var n2 = React.useState(""), mob = n2[0], setMob = n2[1];
  var c1 = React.useState(""), pBags = c1[0], setPBags = c1[1];
  var c2 = React.useState(""), pRate = c2[0], setPRate = c2[1];
  var c3 = React.useState(rbToday()), pDate = c3[0], setPDate = c3[1];
  var m1 = React.useState("cement"), pMat = m1[0], setPMat = m1[1];
  var m2 = React.useState(false), addMat = m2[0], setAddMat = m2[1];
  var m3 = React.useState(""), matName = m3[0], setMatName = m3[1];
  var m4 = React.useState(""), matUnit = m4[0], setMatUnit = m4[1];
  var mats = p.materials || [];
  var curMat = null; mats.forEach(function (x) { if (x.id === pMat) curMat = x; });
  var d1 = React.useState(""), payAmt = d1[0], setPayAmt = d1[1];
  var d2 = React.useState(rbToday()), payDate = d2[0], setPayDate = d2[1];
  var current = null;
  suppliers.forEach(function (x) { if (x.id === openId) current = x; });

  if (current) {
    var tot = supplierTotals(current.id);
    var rows = tot.purchases.map(function (x) { return { k: "buy", id: x.id, date: x.date, bags: rbQtyOf(x), unit: x.unit || "", matName: x.materialName || "", rate: x.rate, amount: x.amount }; })
      .concat(tot.payments.map(function (x) { return { k: "pay", id: x.id, date: x.date, amount: x.amount }; }))
      .sort(function (m, n) { return String(m.date || "").localeCompare(String(n.date || "")); });
    return (
      <Shell onClose={p.onClose} title={current.name}>
        <button onClick={function () { setOpenId(null); }} style={{ background: "none", border: "none", color: "#A39C8A", fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 10 }}>&#8592; {t("suppliers")}</button>
        <div style={{ background: TC.paper, borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4 }}>
            <StatBlock label={t("qty")} value={tot.bags} bold />
            <StatBlock label={t("billsTotal")} value={"Rs " + rbMoney(tot.amount)} bold />
            <StatBlock label={t("billsReceived")} value={"Rs " + rbMoney(tot.paid)} bold color={TC.success} />
            <StatBlock label={t("supplierBaqi")} value={"Rs " + rbMoney(tot.dues)} bold color={tot.dues > 0 ? TC.stamp : TC.success} />
          </div>
          {tot.opening ? (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginTop: 6, borderTop: "1px dashed " + TC.paperLine, paddingTop: 5 }}>
              <span style={{ color: TC.inkSoft }}>{t("openingBalance")}{current.openingDate ? " · " + rbDate(current.openingDate) : ""}</span>
              <span className="rb-mono" style={{ fontWeight: 700, color: tot.opening > 0 ? TC.stamp : TC.success }}>{tot.opening < 0 ? "-" : ""}Rs {rbMoney(Math.abs(tot.opening))}</span>
            </div>
          ) : null}
        </div>

        {(p.isAdmin && p.onSetSupplierOpening) ? (
          obOpen ? (
            <div style={{ background: TC.appBg2, borderRadius: 8, padding: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 11.5, color: TC.cream, fontWeight: 700, marginBottom: 6 }}>{t("openingBalance")}</div>
              <div style={{ fontSize: 10, color: "#A39C8A", marginBottom: 8 }}>{t("openingHintSupp")}</div>
              <OpeningDirPicker value={obDir} onChange={setObDir} dueLabel={t("openingSuppDue")} advLabel={t("openingSuppAdv")} />
              <input type="number" inputMode="decimal" value={obAmt} onChange={function (e) { setObAmt(e.target.value); }} placeholder={t("openingAmount")} style={{ width: "100%", boxSizing: "border-box", padding: "8px 9px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 13, marginBottom: 6 }} />
              <input type="date" value={obDate} onChange={function (e) { setObDate(e.target.value); }} style={{ width: "100%", boxSizing: "border-box", padding: "8px 9px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 13, marginBottom: 8 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={function () { p.onSetSupplierOpening(current.id, obAmt, obDir, obDate); setObOpen(false); }} style={{ flex: 1, padding: "9px", borderRadius: 7, border: "none", background: TC.garden, color: TC.cream, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>{t("save")}</button>
                <button onClick={function () { setObOpen(false); }} style={{ flex: 1, padding: "9px", borderRadius: 7, border: "1.5px solid #3A362C", background: "transparent", color: "#A39C8A", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>{t("cancel")}</button>
              </div>
            </div>
          ) : (
            <button onClick={function () { setObAmt(Math.max(0, Number(current.opening) || 0) ? String(Number(current.opening)) : ""); setObDir(current.openingDir === "adv" ? "adv" : "due"); setObDate(current.openingDate || rbToday()); setObOpen(true); }} style={{ width: "100%", marginBottom: 10, padding: "9px", borderRadius: 8, border: "1.5px dashed " + TC.concrete, background: "transparent", color: "#A39C8A", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{tot.opening ? t("openingBalance") + " — " + t("edit") : "+ " + t("openingBalance")}</button>
          )
        ) : null}

        <div style={{ background: TC.appBg2, borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 11.5, color: TC.cream, fontWeight: 700, marginBottom: 8 }}>{t("buyMaterial")}</div>
          <select value={pMat} onChange={function (e) { setPMat(e.target.value); }} style={{ width: "100%", boxSizing: "border-box", padding: "8px 9px", borderRadius: 7, border: "2px solid #3A362C", background: TC.appBg2, color: TC.cream, fontSize: 13, marginBottom: 6 }}>
            {mats.map(function (m) { return <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>; })}
          </select>
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <input type="number" inputMode="numeric" value={pBags} onChange={function (e) { setPBags(e.target.value); }} placeholder={curMat ? curMat.unit : t("qty")} style={{ flex: 1, padding: "8px 9px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 13 }} />
            <input type="number" inputMode="numeric" value={pRate} onChange={function (e) { setPRate(e.target.value); }} placeholder={t("rate")} style={{ flex: 1, padding: "8px 9px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 13 }} />
          </div>
          <input type="date" value={pDate} onChange={function (e) { setPDate(e.target.value); }} style={{ width: "100%", boxSizing: "border-box", padding: "8px 9px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 13, marginBottom: 6 }} />
          <div style={{ fontSize: 10.5, color: "#A39C8A", marginBottom: 6 }}>{t("total")}: <span className="rb-mono" style={{ color: TC.cream, fontWeight: 700 }}>Rs {rbMoney((Number(pBags) || 0) * (Number(pRate) || 0))}</span></div>
          <button disabled={!(Number(pBags) > 0)} onClick={function () { p.onAddPurchase(current.id, pBags, pRate, pDate, pMat); setPBags(""); setPRate(""); }} style={{ width: "100%", padding: "9px", borderRadius: 7, border: "none", background: Number(pBags) > 0 ? TC.garden : "#4A4638", color: TC.cream, fontWeight: 700, fontSize: 12.5, cursor: Number(pBags) > 0 ? "pointer" : "not-allowed" }}>{t("buyMaterial")}</button>
        </div>

        <div style={{ background: TC.appBg2, borderRadius: 8, padding: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 11.5, color: TC.cream, fontWeight: 700, marginBottom: 8 }}>{t("payToSupplier")}</div>
          <div style={{ display: "flex", gap: 6 }}>
            <input type="number" inputMode="numeric" value={payAmt} onChange={function (e) { setPayAmt(e.target.value); }} placeholder="Rs" style={{ flex: 1, padding: "8px 9px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 13 }} />
            <input type="date" value={payDate} onChange={function (e) { setPayDate(e.target.value); }} style={{ flex: 1, padding: "8px 9px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 13 }} />
          </div>
          <button disabled={!(Number(payAmt) > 0)} onClick={function () { p.onPaySupplier(current.id, payAmt, payDate); setPayAmt(""); }} style={{ width: "100%", marginTop: 6, padding: "9px", borderRadius: 7, border: "none", background: Number(payAmt) > 0 ? TC.stamp : "#4A4638", color: TC.cream, fontWeight: 700, fontSize: 12.5, cursor: Number(payAmt) > 0 ? "pointer" : "not-allowed" }}>{t("payToSupplier")}</button>
        </div>

        {rows.length === 0 ? (
          <div style={{ fontSize: 11.5, color: "#A39C8A", textAlign: "center", padding: "10px 0" }}>{t("noEntriesRange")}</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rows.map(function (r) {
              return (
                <div key={r.k + r.id} style={{ background: TC.paper, borderRadius: 7, padding: "8px 11px", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: r.k === "buy" ? TC.ink : TC.success }}>{r.k === "buy" ? (r.matName || t("buyMaterial")) : t("payToSupplier")}</div>
                    <div className="rb-mono" style={{ fontSize: 10, color: TC.inkSoft, marginTop: 1 }}>{rbDate(r.date)}{r.k === "buy" ? " \u00b7 " + r.bags + " " + (r.unit || "") + " \u00d7 " + rbMoney(r.rate) : ""}</div>
                  </div>
                  <span className="rb-mono" style={{ fontSize: 12.5, fontWeight: 700, color: r.k === "buy" ? TC.ink : TC.success, whiteSpace: "nowrap" }}>{r.k === "buy" ? "" : "-"}Rs {rbMoney(r.amount)}</span>
                </div>
              );
            })}
          </div>
        )}
      </Shell>
    );
  }

  return (
    <Shell onClose={p.onClose} title={t("suppliers")}>
      {adding ? (
        <div style={{ background: TC.appBg2, borderRadius: 8, padding: 10, marginBottom: 12 }}>
          <input value={nm} onChange={function (e) { setNm(e.target.value); }} placeholder={t("supplierName")} style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 14, marginBottom: 6 }} />
          <input type="tel" value={mob} onChange={function (e) { setMob(e.target.value); }} placeholder="03xx xxxxxxx" style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 14, marginBottom: 8 }} />
          <div style={{ fontSize: 10.5, color: "#A39C8A", marginBottom: 5 }}>{t("openingBalance")} — {t("openingHintSupp")}</div>
          <OpeningDirPicker value={newObDir} onChange={setNewObDir} dueLabel={t("openingSuppDue")} advLabel={t("openingSuppAdv")} />
          <input type="number" inputMode="decimal" value={newOb} onChange={function (e) { setNewOb(e.target.value); }} placeholder={t("openingAmount")} style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 14, marginBottom: 8 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={function () { p.onAddSupplier(nm, mob, newOb, newObDir, rbToday()); setNm(""); setMob(""); setNewOb(""); setNewObDir("due"); setAdding(false); }} disabled={!nm.trim()} style={{ flex: 1, padding: "9px", borderRadius: 7, border: "none", background: nm.trim() ? TC.garden : "#4A4638", color: TC.cream, fontWeight: 700, fontSize: 12.5, cursor: nm.trim() ? "pointer" : "not-allowed" }}>{t("save")}</button>
            <button onClick={function () { setAdding(false); }} style={{ flex: 1, padding: "9px", borderRadius: 7, border: "1.5px solid #3A362C", background: "transparent", color: "#A39C8A", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>{t("cancel")}</button>
          </div>
        </div>
      ) : (
        <button onClick={function () { setAdding(true); }} style={{ width: "100%", marginBottom: 12, padding: "10px", borderRadius: 8, border: "1.5px dashed " + TC.concrete, background: "transparent", color: "#A39C8A", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>+ {t("addSupplier")}</button>
      )}

      {p.isAdmin ? (addMat ? (
        <div style={{ background: TC.appBg2, borderRadius: 8, padding: 10, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <input value={matName} onChange={function (e) { setMatName(e.target.value); }} placeholder={t("materialLabel")} style={{ flex: 2, minWidth: 0, padding: "9px 10px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 13.5 }} />
            <input value={matUnit} onChange={function (e) { setMatUnit(e.target.value); }} placeholder={t("unitLabel")} style={{ flex: 1, minWidth: 0, padding: "9px 10px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 13.5 }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={function () { p.onAddMaterial(matName, matUnit); setMatName(""); setMatUnit(""); setAddMat(false); }} disabled={!matName.trim()} style={{ flex: 1, padding: "9px", borderRadius: 7, border: "none", background: matName.trim() ? TC.garden : "#4A4638", color: TC.cream, fontWeight: 700, fontSize: 12.5, cursor: matName.trim() ? "pointer" : "not-allowed" }}>{t("save")}</button>
            <button onClick={function () { setAddMat(false); }} style={{ flex: 1, padding: "9px", borderRadius: 7, border: "1.5px solid #3A362C", background: "transparent", color: "#A39C8A", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>{t("cancel")}</button>
          </div>
        </div>
      ) : (
        <button onClick={function () { setAddMat(true); }} style={{ width: "100%", marginBottom: 12, padding: "9px", borderRadius: 8, border: "1.5px dashed " + TC.concrete, background: "transparent", color: "#A39C8A", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ {t("addMaterial")}</button>
      )) : null}

      {suppliers.length > 0 ? (function () {
        var sAll = { amount: 0, paid: 0, dues: 0, bags: 0 };
        suppliers.forEach(function (sp) {
          var q = supplierTotals(sp.id);
          sAll.amount += q.amount; sAll.paid += q.paid; sAll.dues += q.dues; sAll.bags += q.bags;
        });
        return (
          <div style={{ background: TC.paper, borderRadius: 8, padding: 10, marginBottom: 10 }}>
            <div className="rb-display" style={{ fontSize: 11.5, fontWeight: 700, color: TC.ink, marginBottom: 6 }}>{t("supplierSummary")}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
              <StatBlock label={t("supAllBuy")} value={"Rs " + rbMoney(sAll.amount)} bold />
              <StatBlock label={t("supAllPaid")} value={"Rs " + rbMoney(sAll.paid)} bold color={TC.success} />
              <StatBlock label={t("supAllDues")} value={"Rs " + rbMoney(sAll.dues)} bold color={sAll.dues > 0 ? TC.stamp : TC.success} />
            </div>
            <div style={{ borderTop: "1px dashed " + TC.paperLine, marginTop: 6, paddingTop: 5, display: "flex", justifyContent: "space-between", fontSize: 10.5 }}>
              <span style={{ color: TC.inkSoft }}>{t("cementBags")}</span>
              <span className="rb-mono" style={{ fontWeight: 700, color: TC.ink }}>{sAll.bags}</span>
            </div>
          </div>
        );
      })() : null}

      {suppliers.length === 0 ? (
        <div style={{ fontSize: 12, color: "#A39C8A", textAlign: "center", padding: "16px 0" }}>{t("noSuppliers")}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {suppliers.map(function (sp) {
            var tt = supplierTotals(sp.id);
            return (
              <div key={sp.id} onClick={function () { setOpenId(sp.id); }} style={{ background: TC.paper, borderRadius: 8, padding: "10px 12px", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: TC.ink }}>{sp.name}</span>
                  <span className="rb-mono" style={{ fontSize: 12, fontWeight: 700, color: tt.dues > 0 ? TC.stamp : TC.success, whiteSpace: "nowrap" }}>Rs {rbMoney(tt.dues)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 2, gap: 8 }}>
                  <span style={{ color: TC.inkSoft }}>{tt.bags} {t("cementBags")}{tt.opening ? " · " + t("openingBalance") + " " + (tt.opening < 0 ? "-" : "") + rbMoney(Math.abs(tt.opening)) : ""}</span>
                  <span style={{ color: TC.inkSoft }}>{t("billsTotal")} {rbMoney(tt.amount)} · {t("billsReceived")} {rbMoney(tt.paid)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
function SupplierTab(p) {
  return (
    <SupplierModal inline t={p.t} suppliers={p.suppliers} supplierTotals={p.supplierTotals} materials={p.materials}
      isAdmin={p.isAdmin} onAddMaterial={p.onAddMaterial} onAddSupplier={p.onAddSupplier}
      onAddPurchase={p.onAddPurchase} onPaySupplier={p.onPaySupplier} onSetSupplierOpening={p.onSetSupplierOpening} />
  );
}
/* ---- labour: banda kaunsa kaam karta hai (chips) ---- */
function LabourKindChips(p) {
  var t = p.t, value = p.value || [], disabled = !!p.disabled;
  function toggle(id) {
    if (disabled) return;
    var has = value.indexOf(id) >= 0;
    p.onChange(has ? value.filter(function (x) { return x !== id; }) : value.concat([id]));
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
      {LABOUR_KINDS.map(function (k) {
        var on = value.indexOf(k.id) >= 0;
        return (
          <button key={k.id} onClick={function () { toggle(k.id); }} disabled={disabled} style={{
            padding: "5px 9px", borderRadius: 20, border: "1.5px solid " + (on ? TC.amber : "#3A362C"),
            background: on ? TC.amber : "transparent", color: on ? TC.ink : "#A39C8A",
            fontSize: 10.5, fontWeight: 700, cursor: disabled ? "default" : "pointer"
          }}>{t(k.labelKey)}</button>
        );
      })}
    </div>
  );
}

function LabourKindTags(p) {
  var t = p.t, kinds = p.kinds || [];
  if (!kinds.length) return <span style={{ fontSize: 9.5, color: TC.concrete }}>{t("labourNoKind")}</span>;
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 4 }}>
      {kinds.map(function (k) {
        return <span key={k} style={{ fontSize: 9, fontWeight: 700, color: TC.ink, background: "#E3D9BC", borderRadius: 20, padding: "2px 7px" }}>{t(labourKind(k).labelKey)}</span>;
      })}
    </span>
  );
}

/* ---- har kism ka muqarrar banda + rate (ek dafa set) ---- */
function LabourConfigCard(p) {
  var t = p.t, labourers = p.labourers || [], config = p.config || {};
  var o = React.useState(false), open = o[0], setOpen = o[1];
  var d = React.useState({}), draft = d[0], setDraft = d[1];
  var inp = { width: "100%", boxSizing: "border-box", padding: "8px 9px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 13 };
  function val(kind, field) {
    var k = draft[kind];
    if (k && k[field] !== undefined) return k[field];
    var c = labourCfgOf(config, kind);
    return field === "rate" ? (c.rate ? String(c.rate) : "") : c.labourerId;
  }
  function set(kind, field, v) {
    setDraft(function (x) { var n = Object.assign({}, x); n[kind] = Object.assign({}, n[kind] || {}); n[kind][field] = v; return n; });
  }
  var dirty = Object.keys(draft).length > 0;
  return (
    <div style={{ background: TC.appBg2, borderRadius: 8, padding: 10, marginBottom: 10 }}>
      <button onClick={function () { setOpen(!open); }} style={{ width: "100%", background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11.5, color: TC.cream, fontWeight: 700 }}>{t("labourSettings")}</span>
        <span style={{ color: "#A39C8A", fontSize: 12 }}>{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 10, color: "#A39C8A", marginBottom: 8, lineHeight: 1.5 }}>{t("labourSettingsHint")}</div>
          {LABOUR_KINDS.map(function (k) {
            if (k.id === "custom") return null;
            return (
              <div key={k.id} style={{ background: TC.paper, borderRadius: 7, padding: 8, marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: TC.ink }}>{t(k.labelKey)}</span>
                  <span style={{ fontSize: 9.5, color: TC.inkSoft }}>{t("labourRatePer")} / {t(k.unitKey)}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <select value={val(k.id, "labourerId")} onChange={function (e) { set(k.id, "labourerId", e.target.value); }}
                    style={Object.assign({}, inp, { flex: 2, color: TC.ink, background: "#F3EAD3", border: "1.5px solid " + TC.paperLine })}>
                    <option value="">{t("labourNoOne")}</option>
                    {labourers.map(function (lb) { return <option key={lb.id} value={lb.id}>{lb.name}</option>; })}
                  </select>
                  <input type="number" inputMode="decimal" value={val(k.id, "rate")} onChange={function (e) { set(k.id, "rate", e.target.value); }}
                    placeholder={t("labourRatePer")} style={Object.assign({}, inp, { flex: 1, color: TC.ink, background: "#F3EAD3", border: "1.5px solid " + TC.paperLine })} />
                </div>
              </div>
            );
          })}
          <button disabled={!dirty} onClick={function () {
            Object.keys(draft).forEach(function (kind) {
              var c = labourCfgOf(config, kind);
              var lid = draft[kind].labourerId !== undefined ? draft[kind].labourerId : c.labourerId;
              var rt = draft[kind].rate !== undefined ? draft[kind].rate : c.rate;
              p.onSave(kind, lid, rt);
            });
            setDraft({});
          }} style={{ width: "100%", padding: "10px", borderRadius: 7, border: "none", background: dirty ? TC.garden : "#4A4638", color: TC.cream, fontWeight: 700, fontSize: 12.5, cursor: dirty ? "pointer" : "not-allowed" }}>{t("save")}</button>
        </div>
      ) : null}
    </div>
  );
}

/* ---- jin par mazdoori reh gayi: ek ek kar ke darj karein ---- */
function LabourPendingRow(p) {
  var t = p.t, item = p.item, labourers = p.labourers || [], cfg = labourCfgOf(p.config, item.kind);
  var a = React.useState(cfg.labourerId), lid = a[0], setLid = a[1];
  var b = React.useState(cfg.rate ? String(cfg.rate) : ""), rate = b[0], setRate = b[1];
  var c = React.useState(""), extra = c[0], setExtra = c[1];
  var kk = labourKind(item.kind);
  var amt = labourEntryAmount(item.qty, rate, extra, 0);
  var inp = { width: "100%", boxSizing: "border-box", padding: "8px 9px", borderRadius: 7, border: "1.5px solid " + TC.paperLine, background: "#F3EAD3", color: TC.ink, fontSize: 13 };
  return (
    <div style={{ background: TC.paper, borderRadius: 8, padding: 10, marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: TC.ink }}>{t(kk.labelKey)}</span>
        <span className="rb-mono" style={{ fontSize: 10.5, color: TC.inkSoft }}>{rbDate(item.date)}</span>
      </div>
      <div style={{ fontSize: 10.5, color: TC.inkSoft, marginBottom: 6 }}>
        {item.label} &middot; <span className="rb-mono" style={{ fontWeight: 700, color: TC.ink }}>{item.qty} {t(kk.unitKey)}</span>
      </div>
      <select value={lid} onChange={function (e) { setLid(e.target.value); }} style={Object.assign({}, inp, { marginBottom: 6 })}>
        <option value="">{t("labourNoOne")}</option>
        {labourers.map(function (lb) { return <option key={lb.id} value={lb.id}>{lb.name}</option>; })}
      </select>
      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        <input type="number" inputMode="decimal" value={rate} onChange={function (e) { setRate(e.target.value); }} placeholder={t("labourRatePer")} style={Object.assign({}, inp, { flex: 1 })} />
        <input type="number" inputMode="decimal" value={extra} onChange={function (e) { setExtra(e.target.value); }} placeholder={t("labourExtra")} style={Object.assign({}, inp, { flex: 1 })} />
      </div>
      <div style={{ fontSize: 10.5, color: TC.inkSoft, marginBottom: 6 }}>{t("total")}: <span className="rb-mono" style={{ fontWeight: 700, color: TC.ink }}>Rs {rbMoney(amt)}</span></div>
      <div style={{ display: "flex", gap: 6 }}>
        <button disabled={!(lid && amt > 0)} onClick={function () { p.onPost(item, lid, rate, extra, item.date, item.label, true); }}
          style={{ flex: 2, padding: "9px", borderRadius: 7, border: "none", background: (lid && amt > 0) ? TC.garden : "#C9BFA4", color: TC.cream, fontWeight: 700, fontSize: 12, cursor: (lid && amt > 0) ? "pointer" : "not-allowed" }}>{t("labourPendingOne")}</button>
        {p.onSkip ? (
          <button onClick={function () { p.onSkip(item); }} style={{ flex: 1, padding: "9px", borderRadius: 7, border: "1.5px solid " + TC.paperLine, background: "transparent", color: TC.inkSoft, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{t("openingDelete")}</button>
        ) : null}
      </div>
    </div>
  );
}

function LabourPromptModal(p) {
  var t = p.t, items = p.items || [];
  return (
    <div className="no-print" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 9200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 480, background: TC.appBg, borderRadius: "16px 16px 0 0", padding: 18, maxHeight: "88vh", overflowY: "auto" }}>
        <div className="rb-display" style={{ color: TC.cream, fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{t("labourPromptTitle")}</div>
        <div style={{ fontSize: 11.5, color: "#A39C8A", marginBottom: 12 }}>{t("labourAskLine")}</div>
        {p.blocking ? (
          <div style={{ background: TC.stamp, color: TC.cream, borderRadius: 8, padding: "9px 11px", fontSize: 11.5, fontWeight: 700, marginBottom: 12 }}>{t("labourBlocked")}</div>
        ) : null}
        {items.slice(0, 8).map(function (it) {
          return <LabourPendingRow key={it.key} t={t} item={it} labourers={p.labourers} config={p.labourConfig} onPost={p.onPost} onSkip={p.isAdmin ? p.onSkip : null} />;
        })}
        {items.length > 8 ? <div style={{ fontSize: 10.5, color: "#A39C8A", marginBottom: 10 }}>+{items.length - 8}</div> : null}
        {!p.blocking ? (
          <button onClick={p.onLater} style={{ width: "100%", marginTop: 4, padding: "10px", borderRadius: 8, border: "1.5px solid #3A362C", background: "transparent", color: "#A39C8A", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>{t("laterBtn")}</button>
        ) : null}
      </div>
    </div>
  );
}

/* ---- admin: kisi bhi labour entry ki tarmeem ---- */
function LabourWorkEditModal(p) {
  var t = p.t, w = p.entry, labourers = p.labourers || [];
  var a = React.useState(w.kind || "garder"), kind = a[0], setKind = a[1];
  var b = React.useState(w.labourerId), lid = b[0], setLid = b[1];
  var c = React.useState(w.qty ? String(w.qty) : ""), qty = c[0], setQty = c[1];
  var d = React.useState(w.rate ? String(w.rate) : ""), rate = d[0], setRate = d[1];
  var e2 = React.useState(w.extra ? String(w.extra) : ""), extra = e2[0], setExtra = e2[1];
  var f = React.useState(w.date || rbToday()), date = f[0], setDate = f[1];
  var g = React.useState(w.note || ""), note = g[0], setNote = g[1];
  var h = React.useState(""), direct = h[0], setDirect = h[1];
  var kk = labourKind(kind);
  var amt = labourEntryAmount(qty, rate, extra, direct);
  var inp = { width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 13.5 };
  return (
    <div className="no-print" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 9300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 480, background: TC.appBg, borderRadius: "16px 16px 0 0", padding: 18, maxHeight: "88vh", overflowY: "auto" }}>
        <div className="rb-display" style={{ color: TC.cream, fontSize: 15, fontWeight: 600, marginBottom: 10 }}>{t("labourEditEntry")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
          {LABOUR_KINDS.map(function (k) {
            var on = kind === k.id;
            return <button key={k.id} onClick={function () { setKind(k.id); }} style={{ padding: "8px 6px", borderRadius: 7, border: "1.5px solid " + (on ? TC.amber : "#3A362C"), background: on ? TC.amber : "transparent", color: on ? TC.ink : "#A39C8A", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{t(k.labelKey)}</button>;
          })}
        </div>
        <select value={lid} onChange={function (ev) { setLid(ev.target.value); }} style={Object.assign({}, inp, { marginBottom: 6 })}>
          {labourers.map(function (lb) { return <option key={lb.id} value={lb.id} style={{ color: "#000" }}>{lb.name}</option>; })}
        </select>
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <input type="number" inputMode="decimal" value={qty} onChange={function (ev) { setQty(ev.target.value); }} placeholder={t(kk.unitKey)} style={Object.assign({}, inp, { flex: 1 })} />
          <input type="number" inputMode="decimal" value={rate} onChange={function (ev) { setRate(ev.target.value); }} placeholder={t("rate")} style={Object.assign({}, inp, { flex: 1 })} />
        </div>
        <input type="number" inputMode="decimal" value={extra} onChange={function (ev) { setExtra(ev.target.value); }} placeholder={t("labourExtra")} style={Object.assign({}, inp, { marginBottom: 6 })} />
        <input type="number" inputMode="decimal" value={direct} onChange={function (ev) { setDirect(ev.target.value); }} placeholder={t("purchaseTotal")} style={Object.assign({}, inp, { marginBottom: 6 })} />
        <input type="date" value={date} onChange={function (ev) { setDate(ev.target.value); }} style={Object.assign({}, inp, { marginBottom: 6 })} />
        <input value={note} onChange={function (ev) { setNote(ev.target.value); }} placeholder={t("labourNote")} style={Object.assign({}, inp, { marginBottom: 8 })} />
        <div style={{ fontSize: 11, color: "#A39C8A", marginBottom: 10 }}>{t("total")}: <span className="rb-mono" style={{ color: TC.cream, fontWeight: 700 }}>Rs {rbMoney(amt)}</span></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button disabled={!(amt > 0)} onClick={function () { p.onSave(w.id, { kind: kind, labourerId: lid, qty: qty, rate: rate, extra: extra, amount: direct, date: date, note: note }); p.onClose(); }}
            style={{ flex: 1, padding: "11px", borderRadius: 8, border: "none", background: amt > 0 ? TC.garden : "#4A4638", color: TC.cream, fontWeight: 700, fontSize: 13, cursor: amt > 0 ? "pointer" : "not-allowed" }}>{t("save")}</button>
          <button onClick={p.onClose} style={{ flex: 1, padding: "11px", borderRadius: 8, border: "1.5px solid #3A362C", background: "transparent", color: "#A39C8A", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{t("cancel")}</button>
        </div>
      </div>
    </div>
  );
}

function LabourKhataModal(p) {
  var t = p.t, lb = p.labourer, tot = p.totals;
  var showToast = p.showToast || function () {};
  var shotRef = React.useRef(null);
  var note = function (k) { showToast(k === "busy" ? t("shareBusy") : (k === "saved" ? t("imageSaved") : t("shareFail2"))); };
  var rows = tot.works.map(function (x) { return { k: "work", id: x.id, date: x.date, kind: x.kind, qty: x.qty, rate: x.rate, extra: x.extra, note: x.note, amount: x.amount }; })
    .concat(tot.payments.map(function (x) { return { k: "pay", id: x.id, date: x.date, amount: x.amount, note: x.note }; }))
    .sort(function (m, n) { return String(m.date || "").localeCompare(String(n.date || "")); });
  var waText = t("khataTitle") + " - " + lb.name + "\n" + t("labourWorkTotal") + ": Rs " + rbMoney(tot.work)
    + "\n" + t("labourPaidTotal") + ": Rs " + rbMoney(tot.paid) + "\n" + t("labourBaqi") + ": Rs " + rbMoney(tot.dues);
  var btn = { width: "100%", marginBottom: 10, padding: "12px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxSizing: "border-box" };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9095, overflowY: "auto" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", padding: 16 }}>
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button onClick={p.onClose} style={{ background: "none", border: "none", color: TC.cream, fontSize: 13, cursor: "pointer", padding: 0 }}>&#8592; {t("back")}</button>
          <button onClick={function () { window.print(); }} style={{ padding: "8px 14px", borderRadius: 7, border: "none", background: TC.stamp, color: TC.cream, fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Ico name="printer" size={14} /> {t("print")}
          </button>
        </div>

        <button onClick={function () { rbShareNode(shotRef.current, "khata.png", waText, lb.mobile || "", note); }} className="no-print" style={Object.assign({}, btn, { background: "#128C7E", color: "#FFFFFF" })}>
          <Ico name="chat" size={15} /> {t("khataShare")}
        </button>
        <button onClick={function () { rbSaveNode(shotRef.current, "khata.png", note); }} className="no-print" style={Object.assign({}, btn, { padding: "10px", border: "1.5px solid " + TC.concrete, background: "transparent", color: "#A39C8A", fontSize: 12.5 })}>
          <Ico name="printer" size={14} /> {t("saveImage")}
        </button>

        <div className="print-area" ref={shotRef} style={{
          background: TC.paper, borderRadius: 10, padding: 20, position: "relative", overflow: "hidden",
          backgroundImage: "repeating-linear-gradient(45deg, " + TC.paperDark + " 0, " + TC.paperDark + " 1px, transparent 1px, transparent 14px)"
        }}>
          <div style={{ textAlign: "center", marginBottom: 6 }}>
            <div className="rb-display" style={{ fontSize: 21, fontWeight: 700, color: TC.ink, letterSpacing: .5 }}>{t("appName")}</div>
            <div className="rb-urdu" style={{ fontSize: 12, color: TC.inkSoft, marginTop: 2 }}>{TRANSLATIONS.en.tagline}</div>
          </div>
          <div style={{ borderTop: "2px solid " + TC.ink, margin: "10px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: TC.inkSoft }}>{t("labourWorker")}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: TC.ink }}>{lb.name}</div>
              {lb.mobile ? <div className="rb-mono" style={{ fontSize: 10.5, color: TC.inkSoft }}>{lb.mobile}</div> : null}
            </div>
            <div style={{ textAlign: "end" }}>
              <div style={{ fontSize: 10, color: TC.inkSoft }}>{t("khataTitle")}</div>
              <div className="rb-mono" style={{ fontSize: 11.5, color: TC.ink }}>{rbDate(rbToday())}</div>
            </div>
          </div>
          {labourKindsOf(lb).length ? (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: TC.inkSoft }}>{t("labourKindsLabel")}: </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: TC.ink }}>{labourKindsOf(lb).map(function (k) { return t(labourKind(k).labelKey); }).join(" · ")}</span>
            </div>
          ) : null}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid " + TC.ink }}>
                <th style={{ textAlign: "start", padding: "5px 3px", color: TC.inkSoft, fontWeight: 700 }}>{t("date")}</th>
                <th style={{ textAlign: "start", padding: "5px 3px", color: TC.inkSoft, fontWeight: 700 }}>{t("khataDetail")}</th>
                <th style={{ textAlign: "end", padding: "5px 3px", color: TC.inkSoft, fontWeight: 700 }}>{t("khataAmount")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: "10px 3px", textAlign: "center", color: TC.concrete }}>{t("khataNoRows")}</td></tr>
              ) : rows.map(function (r) {
                var kk = r.k === "work" ? labourKind(r.kind) : null;
                var detail = r.k === "work"
                  ? t(kk.labelKey) + (r.qty ? " " + r.qty + " " + t(kk.unitKey) + (r.rate ? " × " + rbMoney(r.rate) : "") : "") + (Number(r.extra) > 0 ? " + " + rbMoney(r.extra) : "")
                  : t("khataAdvance");
                return (
                  <tr key={r.k + r.id} style={{ borderBottom: "1px dashed " + TC.paperLine }}>
                    <td className="rb-mono" style={{ padding: "5px 3px", color: TC.inkSoft, whiteSpace: "nowrap" }}>{rbDate(r.date)}</td>
                    <td style={{ padding: "5px 3px", color: TC.ink }}>{detail}{r.note ? " · " + r.note : ""}</td>
                    <td className="rb-mono" style={{ padding: "5px 3px", textAlign: "end", fontWeight: 700, color: r.k === "work" ? TC.ink : TC.success, whiteSpace: "nowrap" }}>{r.k === "work" ? "" : "-"}{rbMoney(r.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ borderTop: "2px solid " + TC.ink, marginTop: 10, paddingTop: 8 }}>
            {tot.opening ? (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "2px 0" }}>
                <span style={{ color: TC.inkSoft }}>{t("openingBalance")}</span>
                <span className="rb-mono" style={{ fontWeight: 700, color: TC.ink }}>{tot.opening < 0 ? "-" : ""}Rs {rbMoney(Math.abs(tot.opening))}</span>
              </div>
            ) : null}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "2px 0" }}>
              <span style={{ fontWeight: 700, color: TC.ink }}>{t("labourWorkTotal")}</span>
              <span className="rb-mono" style={{ fontWeight: 700, color: TC.ink }}>Rs {rbMoney(tot.work)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "2px 0" }}>
              <span style={{ fontWeight: 700, color: TC.ink }}>{t("labourPaidTotal")}</span>
              <span className="rb-mono" style={{ fontWeight: 700, color: TC.success }}>Rs {rbMoney(tot.paid)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, padding: "6px 0 2px" }}>
              <span style={{ fontWeight: 700, color: tot.dues > 0 ? TC.stamp : TC.success }}>{t("labourBaqi")}</span>
              <span className="rb-mono" style={{ fontWeight: 700, color: tot.dues > 0 ? TC.stamp : TC.success }}>Rs {rbMoney(tot.dues)}</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: "1px solid " + TC.ink, paddingTop: 3, fontSize: 10.5, color: TC.inkSoft, minWidth: 130 }}>{t("signature")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LabourTab(p) {
  var t = p.t, labourers = p.labourers || [], labourTotals = p.labourTotals;
  var pendingItems = p.pendingItems || [];
  var a = React.useState(null), openId = a[0], setOpenId = a[1];
  var b = React.useState(false), adding = b[0], setAdding = b[1];
  var n1 = React.useState(""), nm = n1[0], setNm = n1[1];
  var n2 = React.useState(""), mob = n2[0], setMob = n2[1];
  var n3 = React.useState(""), newOb = n3[0], setNewOb = n3[1];
  var n4 = React.useState("due"), newObDir = n4[0], setNewObDir = n4[1];
  var n5 = React.useState([]), newKinds = n5[0], setNewKinds = n5[1];
  var w1 = React.useState("garder"), wKind = w1[0], setWKind = w1[1];
  var w2 = React.useState(""), wQty = w2[0], setWQty = w2[1];
  var w3 = React.useState(""), wRate = w3[0], setWRate = w3[1];
  var w4 = React.useState(""), wAmt = w4[0], setWAmt = w4[1];
  var w5 = React.useState(rbToday()), wDate = w5[0], setWDate = w5[1];
  var w6 = React.useState(""), wNote = w6[0], setWNote = w6[1];
  var w7 = React.useState(""), wExtra = w7[0], setWExtra = w7[1];
  var d1 = React.useState(""), payAmt = d1[0], setPayAmt = d1[1];
  var d2 = React.useState(rbToday()), payDate = d2[0], setPayDate = d2[1];
  var o1 = React.useState(""), obAmt = o1[0], setObAmt = o1[1];
  var o2 = React.useState("due"), obDir = o2[0], setObDir = o2[1];
  var o3 = React.useState(rbToday()), obDate = o3[0], setObDate = o3[1];
  var o4 = React.useState(false), obOpen = o4[0], setObOpen = o4[1];
  var e1 = React.useState(null), editEntry = e1[0], setEditEntry = e1[1];
  var s1 = React.useState(false), settleAsk = s1[0], setSettleAsk = s1[1];
  var s2 = React.useState(false), showOld = s2[0], setShowOld = s2[1];
  var s3 = React.useState(false), khataOpen = s3[0], setKhataOpen = s3[1];
  var inp = { width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 13.5 };
  var current = null;
  labourers.forEach(function (x) { if (x.id === openId) current = x; });

  if (current) {
    var tot = labourTotals(current.id);
    var kindInfo = labourKind(wKind);
    var autoAmt = labourEntryAmount(wQty, wRate, wExtra, wAmt);
    var rows = tot.works.map(function (x) { return { k: "work", id: x.id, date: x.date, kind: x.kind, qty: x.qty, rate: x.rate, extra: x.extra, note: x.note, amount: x.amount, auto: x.auto, src: x.src, verified: x.verified, raw: x }; })
      .concat(tot.payments.map(function (x) { return { k: "pay", id: x.id, date: x.date, amount: x.amount, note: x.note }; }))
      .sort(function (m, n) { return String(n.date || "").localeCompare(String(m.date || "")); });
    var unver = tot.works.filter(function (x) { return !x.verified; }).length;
    return (
      <InlineShell title={current.name}>
        <button onClick={function () { setOpenId(null); }} style={{ background: "none", border: "none", color: "#A39C8A", fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 10 }}>&#8592; {t("labourers")}</button>
        <button onClick={function () { setKhataOpen(true); }} style={{ width: "100%", marginBottom: 10, padding: "10px", borderRadius: 8, border: "none", background: "#128C7E", color: "#FFFFFF", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
          <Ico name="chat" size={14} /> {t("khataOpen")}
        </button>
        <div style={{ background: TC.paper, borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9.5, color: TC.inkSoft, marginBottom: 4 }}>{t("labourKindsLabel")}</div>
            {p.isAdmin
              ? <LabourKindChips t={t} value={labourKindsOf(current)} onChange={function (v) { p.onSetKinds(current.id, v); }} />
              : <LabourKindTags t={t} kinds={labourKindsOf(current)} />}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
            <StatBlock label={t("labourWorkTotal")} value={"Rs " + rbMoney(tot.work)} bold />
            <StatBlock label={t("labourPaidTotal")} value={"Rs " + rbMoney(tot.paid)} bold color={TC.success} />
            <StatBlock label={t("labourBaqi")} value={"Rs " + rbMoney(tot.dues)} bold color={tot.dues > 0 ? TC.stamp : TC.success} />
          </div>
          {tot.opening ? (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginTop: 6, borderTop: "1px dashed " + TC.paperLine, paddingTop: 5 }}>
              <span style={{ color: TC.inkSoft }}>{t("openingBalance")}{current.openingDate ? " · " + rbDate(current.openingDate) : ""}</span>
              <span className="rb-mono" style={{ fontWeight: 700, color: tot.opening > 0 ? TC.stamp : TC.success }}>{tot.opening < 0 ? "-" : ""}Rs {rbMoney(Math.abs(tot.opening))}</span>
            </div>
          ) : null}
          {Object.keys(tot.byKind).length > 0 ? (
            <div style={{ marginTop: 6, borderTop: "1px dashed " + TC.paperLine, paddingTop: 5 }}>
              {LABOUR_KINDS.map(function (k) {
                var v = tot.byKind[k.id];
                if (!v) return null;
                return (
                  <div key={k.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, padding: "1px 0" }}>
                    <span style={{ color: TC.inkSoft }}>{t(k.labelKey) + " · " + v.qty + " " + t(k.unitKey)}</span>
                    <span className="rb-mono" style={{ fontWeight: 700, color: TC.ink }}>Rs {rbMoney(v.amount)}</span>
                  </div>
                );
              })}
            </div>
          ) : null}
          {p.isAdmin && unver > 0 ? (
            <button onClick={function () { p.onVerifyAll(current.id); }} style={{ width: "100%", marginTop: 8, padding: "8px", borderRadius: 7, border: "none", background: TC.amber, color: TC.ink, fontWeight: 700, fontSize: 11.5, cursor: "pointer" }}>{t("labourVerifyAll")} ({unver})</button>
          ) : null}
          {tot.lastSettled ? (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginTop: 6, borderTop: "1px dashed " + TC.paperLine, paddingTop: 5 }}>
              <span style={{ color: TC.inkSoft }}>{t("lastSettled")} &middot; {rbDate(tot.lastSettled.date)}</span>
              <span className="rb-mono" style={{ fontWeight: 700, color: TC.ink }}>Rs {rbMoney(tot.lastSettled.amount)}</span>
            </div>
          ) : null}
        </div>

        {p.isAdmin && p.onSettle ? (settleAsk ? (
          <div style={{ background: TC.appBg2, borderRadius: 8, padding: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "#A39C8A", marginBottom: 8, lineHeight: 1.5 }}>{t("settleHint")}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={function () { p.onSettle(current.id, rbToday()); setSettleAsk(false); }} style={{ flex: 1, padding: "10px", borderRadius: 7, border: "none", background: TC.stamp, color: TC.cream, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>{t("settleLabour")}</button>
              <button onClick={function () { setSettleAsk(false); }} style={{ flex: 1, padding: "10px", borderRadius: 7, border: "1.5px solid #3A362C", background: "transparent", color: "#A39C8A", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>{t("cancel")}</button>
            </div>
          </div>
        ) : (
          <button onClick={function () { setSettleAsk(true); }} style={{ width: "100%", marginBottom: 10, padding: "9px", borderRadius: 8, border: "1.5px dashed " + TC.stamp, background: "transparent", color: TC.stamp, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{t("settleLabour")}</button>
        )) : null}

        {p.isAdmin ? (obOpen ? (
          <div style={{ background: TC.appBg2, borderRadius: 8, padding: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 11.5, color: TC.cream, fontWeight: 700, marginBottom: 6 }}>{t("openingBalance")}</div>
            <OpeningDirPicker value={obDir} onChange={setObDir} dueLabel={t("openingSuppDue")} advLabel={t("openingSuppAdv")} />
            <input type="number" inputMode="decimal" value={obAmt} onChange={function (e) { setObAmt(e.target.value); }} placeholder={t("openingAmount")} style={Object.assign({}, inp, { marginBottom: 6 })} />
            <input type="date" value={obDate} onChange={function (e) { setObDate(e.target.value); }} style={Object.assign({}, inp, { marginBottom: 8 })} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={function () { p.onSetOpening(current.id, obAmt, obDir, obDate); setObOpen(false); }} style={{ flex: 1, padding: "9px", borderRadius: 7, border: "none", background: TC.garden, color: TC.cream, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>{t("save")}</button>
              <button onClick={function () { setObOpen(false); }} style={{ flex: 1, padding: "9px", borderRadius: 7, border: "1.5px solid #3A362C", background: "transparent", color: "#A39C8A", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>{t("cancel")}</button>
            </div>
          </div>
        ) : (
          <button onClick={function () { setObAmt(Math.max(0, Number(current.opening) || 0) ? String(Number(current.opening)) : ""); setObDir(current.openingDir === "adv" ? "adv" : "due"); setObDate(current.openingDate || rbToday()); setObOpen(true); }} style={{ width: "100%", marginBottom: 10, padding: "9px", borderRadius: 8, border: "1.5px dashed " + TC.concrete, background: "transparent", color: "#A39C8A", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{tot.opening ? t("openingBalance") + " — " + t("edit") : "+ " + t("openingBalance")}</button>
        )) : null}

        <div style={{ background: TC.appBg2, borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 11.5, color: TC.cream, fontWeight: 700, marginBottom: 8 }}>{t("addLabourWork")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
            {LABOUR_KINDS.map(function (k) {
              var on = wKind === k.id;
              return (
                <button key={k.id} onClick={function () { setWKind(k.id); }} style={{
                  padding: "9px 6px", borderRadius: 7, border: "1.5px solid " + (on ? TC.amber : "#3A362C"),
                  background: on ? TC.amber : "transparent", color: on ? TC.ink : "#A39C8A",
                  fontSize: 11.5, fontWeight: 700, cursor: "pointer"
                }}>{t(k.labelKey)}<div style={{ fontSize: 9, fontWeight: 500, opacity: .8 }}>{t(k.unitKey)}</div></button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <input type="number" inputMode="decimal" value={wQty} onChange={function (e) { setWQty(e.target.value); }} placeholder={t(kindInfo.unitKey)} style={Object.assign({}, inp, { flex: 1 })} />
            <input type="number" inputMode="decimal" value={wRate} onChange={function (e) { setWRate(e.target.value); }} placeholder={t("rate")} style={Object.assign({}, inp, { flex: 1 })} />
          </div>
          <input type="number" inputMode="decimal" value={wExtra} onChange={function (e) { setWExtra(e.target.value); }} placeholder={t("labourExtra")} style={Object.assign({}, inp, { marginBottom: 6 })} />
          <input type="number" inputMode="decimal" value={wAmt} onChange={function (e) { setWAmt(e.target.value); }} placeholder={t("purchaseTotal")} style={Object.assign({}, inp, { marginBottom: 6 })} />
          <input type="date" value={wDate} onChange={function (e) { setWDate(e.target.value); }} style={Object.assign({}, inp, { marginBottom: 6 })} />
          <input value={wNote} onChange={function (e) { setWNote(e.target.value); }} placeholder={wKind === "custom" ? t("labourCustomLabel") : t("labourNote")} style={Object.assign({}, inp, { marginBottom: 6 })} />
          <div style={{ fontSize: 10.5, color: "#A39C8A", marginBottom: 6 }}>{t("total")}: <span className="rb-mono" style={{ color: TC.cream, fontWeight: 700 }}>Rs {rbMoney(autoAmt)}</span></div>
          <button disabled={!(autoAmt > 0)} onClick={function () { p.onAddWork(current.id, wKind, wQty, wRate, wAmt, wDate, wNote, wExtra); setWQty(""); setWRate(""); setWAmt(""); setWNote(""); setWExtra(""); }} style={{ width: "100%", padding: "10px", borderRadius: 7, border: "none", background: autoAmt > 0 ? TC.garden : "#4A4638", color: TC.cream, fontWeight: 700, fontSize: 12.5, cursor: autoAmt > 0 ? "pointer" : "not-allowed" }}>{t("addLabourWork")}</button>
        </div>

        <div style={{ background: TC.appBg2, borderRadius: 8, padding: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 11.5, color: TC.cream, fontWeight: 700, marginBottom: 8 }}>{t("labourAdvance")}</div>
          <div style={{ display: "flex", gap: 6 }}>
            <input type="number" inputMode="decimal" value={payAmt} onChange={function (e) { setPayAmt(e.target.value); }} placeholder="Rs" style={Object.assign({}, inp, { flex: 1 })} />
            <input type="date" value={payDate} onChange={function (e) { setPayDate(e.target.value); }} style={Object.assign({}, inp, { flex: 1 })} />
          </div>
          <button disabled={!(Number(payAmt) > 0)} onClick={function () { p.onAddPayment(current.id, payAmt, payDate); setPayAmt(""); }} style={{ width: "100%", marginTop: 6, padding: "10px", borderRadius: 7, border: "none", background: Number(payAmt) > 0 ? TC.stamp : "#4A4638", color: TC.cream, fontWeight: 700, fontSize: 12.5, cursor: Number(payAmt) > 0 ? "pointer" : "not-allowed" }}>{t("labourAdvance")}</button>
        </div>

        {rows.length === 0 ? (
          <div style={{ fontSize: 11.5, color: "#A39C8A", textAlign: "center", padding: "10px 0" }}>{t("noLabourEntries")}</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rows.map(function (r) {
              var kk = r.k === "work" ? labourKind(r.kind) : null;
              return (
                <div key={r.k + r.id} style={{ background: TC.paper, borderRadius: 7, padding: "8px 11px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: r.k === "work" ? TC.ink : TC.success, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                      <span>{r.k === "work" ? t(kk.labelKey) : t("labourAdvance")}</span>
                      {r.k === "work" && r.auto ? <span style={{ fontSize: 8.5, fontWeight: 700, color: TC.cream, background: TC.garden, borderRadius: 20, padding: "1px 6px" }}>{r.src === "sale" ? t("labourFromSale") : t("labourFromStock")}</span> : null}
                      {r.k === "work" && !r.verified ? <span style={{ fontSize: 8.5, fontWeight: 700, color: TC.cream, background: TC.stamp, borderRadius: 20, padding: "1px 6px" }}>{t("labourUnverified")}</span> : null}
                    </div>
                    <div className="rb-mono" style={{ fontSize: 10, color: TC.inkSoft, marginTop: 1 }}>{rbDate(r.date)}{r.k === "work" && r.qty ? " · " + r.qty + " " + t(kk.unitKey) + (r.rate ? " × " + rbMoney(r.rate) : "") : ""}{r.k === "work" && Number(r.extra) > 0 ? " + " + rbMoney(r.extra) : ""}{r.note ? " · " + r.note : ""}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="rb-mono" style={{ fontSize: 12.5, fontWeight: 700, color: r.k === "work" ? TC.ink : TC.success, whiteSpace: "nowrap" }}>{r.k === "work" ? "" : "-"}Rs {rbMoney(r.amount)}</span>
                    {p.isAdmin && r.k === "work" ? (
                      <label title={t("labourVerify")} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                        <input type="checkbox" checked={!!r.verified} onChange={function (ev) { p.onVerifyWork(r.id, ev.target.checked); }} style={{ width: 16, height: 16, accentColor: TC.garden, cursor: "pointer" }} />
                      </label>
                    ) : null}
                    {p.isAdmin && r.k === "work" ? (
                      <button onClick={function () { setEditEntry(r.raw); }} style={{ background: "none", border: "none", cursor: "pointer", color: TC.inkSoft, padding: 0 }}><Ico name="pencil" size={14} /></button>
                    ) : null}
                    {p.isAdmin && p.onDeleteEntry ? (
                      <button onClick={function () { p.onDeleteEntry(r.k === "work" ? "work" : "pay", r.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: TC.stamp, padding: 0 }}><Ico name="trash" size={14} /></button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {(tot.oldWorks.length + tot.oldPayments.length) > 0 ? (
          <div style={{ marginTop: 12 }}>
            <button onClick={function () { setShowOld(!showOld); }} style={{ width: "100%", padding: "9px", borderRadius: 8, border: "1.5px solid #3A362C", background: "transparent", color: "#A39C8A", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {t("oldLedger")} ({tot.oldWorks.length + tot.oldPayments.length}) {showOld ? "\u2212" : "+"}
            </button>
            {showOld ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {tot.oldWorks.map(function (x) { return { k: "work", id: x.id, date: x.date, kind: x.kind, qty: x.qty, amount: x.amount, settledAt: x.settledAt }; })
                  .concat(tot.oldPayments.map(function (x) { return { k: "pay", id: x.id, date: x.date, amount: x.amount, settledAt: x.settledAt }; }))
                  .sort(function (m, n) { return String(n.date || "").localeCompare(String(m.date || "")); })
                  .map(function (r) {
                    var kk = r.k === "work" ? labourKind(r.kind) : null;
                    return (
                      <div key={"o" + r.k + r.id} style={{ background: TC.paperDark, borderRadius: 7, padding: "7px 11px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, opacity: .75 }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: TC.inkSoft }}>{r.k === "work" ? t(kk.labelKey) : t("labourAdvance")} <span style={{ fontSize: 8.5, background: TC.concrete, color: TC.cream, borderRadius: 20, padding: "1px 6px" }}>{t("settledTag")}</span></div>
                          <div className="rb-mono" style={{ fontSize: 9.5, color: TC.concrete, marginTop: 1 }}>{rbDate(r.date)}{r.k === "work" && r.qty ? " \u00b7 " + r.qty + " " + t(kk.unitKey) : ""}</div>
                        </div>
                        <span className="rb-mono" style={{ fontSize: 12, fontWeight: 700, color: TC.inkSoft }}>{r.k === "work" ? "" : "-"}Rs {rbMoney(r.amount)}</span>
                      </div>
                    );
                  })}
              </div>
            ) : null}
          </div>
        ) : null}
        {khataOpen ? (
          <LabourKhataModal t={t} labourer={current} totals={tot} showToast={p.showToast} onClose={function () { setKhataOpen(false); }} />
        ) : null}
        {editEntry ? (
          <LabourWorkEditModal t={t} entry={editEntry} labourers={labourers} onSave={p.onEditWork} onClose={function () { setEditEntry(null); }} />
        ) : null}
      </InlineShell>
    );
  }

  /* ---- sab bandon ka khulasa ---- */
  var sumWork = 0, sumPaid = 0, sumDues = 0, sumKind = {}, sumUnver = 0;
  labourers.forEach(function (lb) {
    var tt = labourTotals(lb.id);
    sumWork += tt.work; sumPaid += tt.paid; sumDues += tt.dues;
    tt.works.forEach(function (x) { if (!x.verified) sumUnver++; });
    Object.keys(tt.byKind).forEach(function (k) {
      if (!sumKind[k]) sumKind[k] = { qty: 0, amount: 0 };
      sumKind[k].qty += tt.byKind[k].qty; sumKind[k].amount += tt.byKind[k].amount;
    });
  });

  return (
    <InlineShell title={t("labourers")}>
      {pendingItems.length > 0 ? (
        <div style={{ background: TC.stamp, borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 11.5, color: TC.cream, fontWeight: 700, marginBottom: 8 }}>{t("labourPendingBanner")} ({pendingItems.length})</div>
          {pendingItems.slice(0, 5).map(function (it) {
            return <LabourPendingRow key={it.key} t={t} item={it} labourers={labourers} config={p.labourConfig} onPost={p.onPostPending} onSkip={p.isAdmin ? p.onSkipPending : null} />;
          })}
          {pendingItems.length > 5 ? <div style={{ fontSize: 10, color: TC.cream }}>+{pendingItems.length - 5}</div> : null}
        </div>
      ) : null}

      {labourers.length > 0 ? (
        <div style={{ background: TC.paper, borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <div className="rb-display" style={{ fontSize: 11.5, fontWeight: 700, color: TC.ink, marginBottom: 6 }}>{t("labourSummaryTitle")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
            <StatBlock label={t("labourAllWork")} value={"Rs " + rbMoney(sumWork)} bold />
            <StatBlock label={t("labourAllPaid")} value={"Rs " + rbMoney(sumPaid)} bold color={TC.success} />
            <StatBlock label={t("labourAllDues")} value={"Rs " + rbMoney(sumDues)} bold color={sumDues > 0 ? TC.stamp : TC.success} />
          </div>
          {Object.keys(sumKind).length > 0 ? (
            <div style={{ marginTop: 6, borderTop: "1px dashed " + TC.paperLine, paddingTop: 5 }}>
              {LABOUR_KINDS.map(function (k) {
                var v = sumKind[k.id];
                if (!v) return null;
                return (
                  <div key={k.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, padding: "1px 0" }}>
                    <span style={{ color: TC.inkSoft }}>{t(k.labelKey) + " · " + Math.round(v.qty * 100) / 100 + " " + t(k.unitKey)}</span>
                    <span className="rb-mono" style={{ fontWeight: 700, color: TC.ink }}>Rs {rbMoney(v.amount)}</span>
                  </div>
                );
              })}
            </div>
          ) : null}
          {p.isAdmin && sumUnver > 0 ? (
            <button onClick={function () { p.onVerifyAll(null); }} style={{ width: "100%", marginTop: 8, padding: "8px", borderRadius: 7, border: "none", background: TC.amber, color: TC.ink, fontWeight: 700, fontSize: 11.5, cursor: "pointer" }}>{t("labourVerifyAll")} ({sumUnver})</button>
          ) : null}
        </div>
      ) : null}

      {p.isAdmin ? <LabourConfigCard t={t} labourers={labourers} config={p.labourConfig} onSave={p.onSaveConfig} /> : null}

      {adding ? (
        <div style={{ background: TC.appBg2, borderRadius: 8, padding: 10, marginBottom: 12 }}>
          <input value={nm} onChange={function (e) { setNm(e.target.value); }} placeholder={t("labourerName")} style={Object.assign({}, inp, { marginBottom: 6 })} />
          <input type="tel" value={mob} onChange={function (e) { setMob(e.target.value); }} placeholder="03xx xxxxxxx" style={Object.assign({}, inp, { marginBottom: 8 })} />
          <div style={{ fontSize: 10.5, color: "#A39C8A", marginBottom: 5 }}>{t("labourPickKinds")}</div>
          <div style={{ marginBottom: 8 }}><LabourKindChips t={t} value={newKinds} onChange={setNewKinds} /></div>
          <div style={{ fontSize: 10.5, color: "#A39C8A", marginBottom: 5 }}>{t("openingBalance")}</div>
          <OpeningDirPicker value={newObDir} onChange={setNewObDir} dueLabel={t("openingSuppDue")} advLabel={t("openingSuppAdv")} />
          <input type="number" inputMode="decimal" value={newOb} onChange={function (e) { setNewOb(e.target.value); }} placeholder={t("openingAmount")} style={Object.assign({}, inp, { marginBottom: 8 })} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={function () { p.onAddLabourer(nm, mob, newOb, newObDir, rbToday(), newKinds); setNm(""); setMob(""); setNewOb(""); setNewObDir("due"); setNewKinds([]); setAdding(false); }} disabled={!nm.trim()} style={{ flex: 1, padding: "9px", borderRadius: 7, border: "none", background: nm.trim() ? TC.garden : "#4A4638", color: TC.cream, fontWeight: 700, fontSize: 12.5, cursor: nm.trim() ? "pointer" : "not-allowed" }}>{t("save")}</button>
            <button onClick={function () { setAdding(false); }} style={{ flex: 1, padding: "9px", borderRadius: 7, border: "1.5px solid #3A362C", background: "transparent", color: "#A39C8A", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>{t("cancel")}</button>
          </div>
        </div>
      ) : (
        <button onClick={function () { setAdding(true); }} style={{ width: "100%", marginBottom: 12, padding: "10px", borderRadius: 8, border: "1.5px dashed " + TC.concrete, background: "transparent", color: "#A39C8A", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>+ {t("addLabourer")}</button>
      )}
      {labourers.length === 0 ? (
        <div style={{ fontSize: 12, color: "#A39C8A", textAlign: "center", padding: "16px 0" }}>{t("noLabourers")}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {labourers.map(function (lb) {
            var tt = labourTotals(lb.id);
            return (
              <div key={lb.id} onClick={function () { setOpenId(lb.id); }} style={{ background: TC.paper, borderRadius: 8, padding: "10px 12px", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: TC.ink }}>{lb.name}</span>
                  <span className="rb-mono" style={{ fontSize: 12, fontWeight: 700, color: tt.dues > 0 ? TC.stamp : TC.success, whiteSpace: "nowrap" }}>Rs {rbMoney(tt.dues)}</span>
                </div>
                <div style={{ marginTop: 4 }}><LabourKindTags t={t} kinds={labourKindsOf(lb)} /></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 4, gap: 8 }}>
                  <span style={{ color: TC.inkSoft }}>{t("labourWorkTotal")} {rbMoney(tt.work)}</span>
                  <span style={{ color: TC.inkSoft }}>{t("labourPaidTotal")} {rbMoney(tt.paid)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </InlineShell>
  );
}
function StockTab(p) {
  var t = p.t, stockLog = p.stockLog, stockTotals = p.stockTotals, remainingFor = p.remainingFor;
  var variantsFor = p.variantsFor, onAddStock = p.onAddStock, onAddVariant = p.onAddVariant, onEditStock = p.onEditStock, onDeleteStock = p.onDeleteStock;
  var evS = React.useState(null), editingVariant = evS[0], setEditingVariant = evS[1];
  var canEdit = p.canEdit !== false; /* sirf admin: size add, edit, delete */
  var canAdd = p.canAdd === undefined ? canEdit : !!p.canAdd; /* stock add karna - admin ya ijazat wala user */
  var cementTotals = p.cementTotals || { added: 0, used: 0, remaining: 0 };
  var sm = React.useState(false), supplierOpen = sm[0], setSupplierOpen = sm[1];
  var a = React.useState("garden"), cat = a[0], setCat = a[1];
  var b = React.useState(null), addingFor = b[0], setAddingFor = b[1];
  var h = React.useState(null), historyFor = h[0], setHistoryFor = h[1];
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

      <CementSummaryCard t={t} stockLog={stockLog} purchases={p.purchases} suppliers={p.suppliers} cementTotals={p.cementTotals} />

      {(p.pendingCement && p.pendingCement.length > 0) ? (
        <div onClick={p.onOpenCement} style={{
          background: TC.stamp, color: TC.cream, borderRadius: 10, padding: "10px 12px", marginBottom: 14,
          display: "flex", alignItems: "center", gap: 8, cursor: "pointer"
        }}>
          <div style={{ flex: 1, fontSize: 11.5, fontWeight: 700 }}>{t("cementPendingBanner")} ({p.pendingCement.length})</div>
          <div style={{ fontSize: 11, fontWeight: 800, background: "rgba(0,0,0,0.22)", padding: "6px 10px", borderRadius: 6 }}>{t("cementPromptTitle")}</div>
        </div>
      ) : null}

      {p.canSupplier ? (
      <div style={{ background: TC.paper, borderRadius: 10, padding: 12, marginBottom: 14 }}>
        <div className="rb-display" style={{ fontSize: 12, color: TC.inkSoft, fontWeight: 600, marginBottom: 8 }}>{t("materials")}</div>
        {(p.materials || []).map(function (m) {
          var mt = p.materialTotals ? p.materialTotals(m.id) : { added: 0, used: 0, remaining: 0 };
          return (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px dashed " + TC.paperLine }}>
              <div style={{ minWidth: 74 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: TC.ink }}>{m.name}</div>
                <div style={{ fontSize: 9, color: TC.concrete }}>{m.unit}</div>
              </div>
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
                <StatBlock label={t("bagsAdded")} value={mt.added} />
                <StatBlock label={t("bagsUsed")} value={mt.used} />
                <StatBlock label={t("bagsLeft")} value={mt.remaining} bold color={mt.remaining > 0 ? TC.success : (mt.remaining < 0 ? TC.stamp : TC.inkSoft)} />
              </div>
            </div>
          );
        })}
      </div>
      ) : null}

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
              <div className="rb-mono" style={{ minWidth: 50, fontSize: 14, fontWeight: 700, color: TC.ink }}>{v}{cat === "garden" ? " ft" : ""}{variantCustomLabel(cat, v) ? " " + variantCustomLabel(cat, v) : ""}</div>
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
                <StatBlock label={t("added")} value={added} />
                <StatBlock label={t("sold")} value={sold} />
                <StatBlock label={t("remaining")} value={remaining} bold color={remaining > 0 ? TC.success : (remaining < 0 ? TC.stamp : TC.inkSoft)} />
              </div>
              {canEdit ? (
              <button onClick={function () { setEditingVariant(v); }} style={{
                width: 28, height: 32, borderRadius: 8, border: "none", background: "transparent",
                color: TC.inkSoft, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <Ico name="pencil" size={15} />
              </button>
              ) : null}
              {canAdd ? (
              <button onClick={function () { setAddingFor(v); }} style={{
                width: 32, height: 32, borderRadius: 8, border: "none", background: TC.garden,
                color: TC.cream, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <Ico name="plus" size={17} />
              </button>
              ) : null}
              <button onClick={function () { setHistoryFor(v); }} style={{
                width: 32, height: 32, borderRadius: 8, border: "none", background: TC.paperDark,
                color: TC.ink, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <Ico name="history" size={17} />
              </button>
            </div>
          );
        })}
      </div>

      {canEdit ? (
      <button onClick={function () { setAddingVariant(true); }} style={{
        width: "100%", marginTop: 10, padding: "10px", borderRadius: 8, border: "1.5px dashed " + TC.concrete,
        background: "transparent", color: "#A39C8A", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6
      }}>
        <Ico name="plus" size={14} /> {t("addNewSize")} — {cat === "garden" ? t("garden") : t("slab")}
      </button>
      ) : null}

      {editingVariant !== null ? (
        <EditVariantModal t={t} category={cat} variant={editingVariant}
          onSave={p.onEditVariant} onDelete={p.onDeleteVariant}
          onClose={function () { setEditingVariant(null); }} />
      ) : null}
      {addingFor !== null ? (
        <AddStockModal t={t} category={cat} variant={addingFor} canSupplier={p.canSupplier} suppliers={p.suppliers} onAddSupplier={p.onAddSupplier}
          onClose={function () { setAddingFor(null); }}
          onSave={function (qty, date, purchase) { onAddStock(cat, addingFor, qty, date, purchase); setAddingFor(null); }} />
      ) : null}
      {historyFor !== null ? (
        <StockHistoryModal t={t} canEdit={canEdit} category={cat} variant={historyFor}
          entries={stockLog.filter(function (e) { return e.category === cat && e.variant === historyFor; }).sort(function (x, y) { return (y.date || "").localeCompare(x.date || ""); })}
          onClose={function () { setHistoryFor(null); }}
          onVerifyStock={p.onVerifyStock}
          onEdit={function (id, qty, date) { onEditStock(id, qty, date); }}
          onDelete={function (id) { onDeleteStock(id); }} />
      ) : null}
      {addingVariant ? (
        <AddVariantModal t={t} category={cat} onClose={function () { setAddingVariant(false); }}
          onSave={function (v, label) { onAddVariant(cat, v, label); setAddingVariant(false); }} />
      ) : null}
      {supplierOpen ? (
        <SupplierModal t={t} suppliers={p.suppliers} supplierTotals={p.supplierTotals} materials={p.materials} isAdmin={p.isAdmin} onAddMaterial={p.onAddMaterial}
          onAddSupplier={p.onAddSupplier} onAddPurchase={p.onAddPurchase} onPaySupplier={p.onPaySupplier}
          onClose={function () { setSupplierOpen(false); }} />
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
                  <span>{rbDate(e.date)} · {variantLabel(t, e.category, e.variant)}</span>
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
  var avail = Math.max(0, Number(p.remaining) || 0);
  var over = Number(qty) > avail;
  var canSave = Number(qty) > 0 && !over;
  return (
    <ModalShell onClose={p.onClose} title={t("logWastage")}>
      <div style={{ marginBottom: 4, fontSize: 13, color: TC.cream, fontWeight: 600 }}>{variantLabel(t, p.category, p.variant)}</div>
      <div style={{ marginBottom: 12, fontSize: 11.5, color: "#9FBE8A" }}>{t("available")}: {avail}</div>
      {over ? <div style={{ background: TC.stamp, color: TC.cream, borderRadius: 7, padding: "7px 10px", fontSize: 11.5, fontWeight: 700, marginBottom: 10 }}>{t("stockShort")} &mdash; {t("onlyLeft")}: {avail}</div> : null}
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
  var avail = Math.max(0, (p.remainingFor(p.category, p.fromVariant) || 0));
  var over = Number(qty) > avail;
  var canSave = Number(qty) > 0 && toVariant !== "" && !over;
  return (
    <ModalShell onClose={p.onClose} title={t("convertStock")}>
      <div style={{ marginBottom: 4, fontSize: 13, color: TC.cream, fontWeight: 600 }}>{variantLabel(t, p.category, p.fromVariant)}</div>
      <div style={{ marginBottom: 12, fontSize: 11.5, color: "#9FBE8A" }}>{t("available")}: {avail}</div>
      {over ? <div style={{ background: TC.stamp, color: TC.cream, borderRadius: 7, padding: "7px 10px", fontSize: 11.5, fontWeight: 700, marginBottom: 10 }}>{t("stockShort")} &mdash; {t("onlyLeft")}: {avail}</div> : null}
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
              <div className="rb-mono" style={{ minWidth: 50, fontSize: 14, fontWeight: 700, color: TC.ink }}>{v}{cat === "garden" ? " ft" : ""}{variantCustomLabel(cat, v) ? " " + variantCustomLabel(cat, v) : ""}</div>
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
        <LogWastageModal t={t} category={cat} variant={wastingFor} remaining={remainingFor(cat, wastingFor)}
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
                <span>{rbDate(x.date)} · {x.customerName}</span>
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
  var dsc = React.useState(""), discountInput = dsc[0], setDiscountInput = dsc[1];
  var discAmt = Math.max(0, Number(discountInput) || 0);
  var canSave = (Number(amount) > 0 || discAmt > 0) && (Number(amount) || 0) + discAmt <= sale.dues + 0.001;
  return (
    <ModalShell onClose={p.onClose} title={t("collectPayment")}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: TC.cream }}>{sale.customerName}</div>
        <div style={{ fontSize: 11.5, color: "#A39C8A", marginTop: 2 }}>{sale.isOpening ? t("openingTag") : "#" + sale.serial} · {t("dues")}: Rs {rbMoney(sale.dues)}</div>
      </div>
      <Field label={t("amountReceived")}>
        <input type="number" inputMode="decimal" autoFocus value={amount} onChange={function (e) { setAmount(e.target.value); }}
          style={Object.assign({}, rbInput(), { fontSize: 16 })} />
      </Field>
      <Field label={t("date")}>
        <input type="date" value={date} onChange={function (e) { setDate(e.target.value); }} style={rbInput()} />
      </Field>
      <Field label={t("discount")}>
        <input type="number" inputMode="decimal" value={discountInput} onChange={function (e) { setDiscountInput(e.target.value); }} placeholder="0" style={rbInput()} />
      </Field>
      <button disabled={!canSave} onClick={function () { p.onCollect(amount, date, discountInput); }} style={{
        width: "100%", marginTop: 6, padding: "12px", borderRadius: 8, border: "none",
        background: canSave ? TC.success : "#4A4638", color: TC.cream, fontSize: 13.5, fontWeight: 700,
        cursor: canSave ? "pointer" : "not-allowed"
      }}>{t("recordPayment")}</button>
    </ModalShell>
  );
}

function CustomerOpeningModal(p) {
  var t = p.t;
  var a = React.useState(""), nm = a[0], setNm = a[1];
  var b = React.useState(""), amt = b[0], setAmt = b[1];
  var c = React.useState("due"), dirn = c[0], setDirn = c[1];
  var d = React.useState(rbToday()), dt = d[0], setDt = d[1];
  var names = {};
  (p.sales || []).forEach(function (x) { var n = String(x.customerName || "").trim(); if (n) names[n.toLowerCase()] = n; });
  var nameList = Object.keys(names).map(function (k) { return names[k]; }).sort();
  var openings = (p.sales || []).filter(function (x) { return x.isOpening; })
    .slice().sort(function (m, n) { return String(n.date || "").localeCompare(String(m.date || "")); });
  var canSave = nm.trim() && Number(amt) > 0;
  return (
    <ModalShell onClose={p.onClose} title={t("openingBalance")}>
      <div style={{ fontSize: 10.5, color: "#A39C8A", marginBottom: 10 }}>{t("openingHintCust")}</div>
      <div style={{ background: TC.appBg2, borderRadius: 8, padding: 10, marginBottom: 12 }}>
        <input list="rb-cust-names" value={nm} onChange={function (e) { setNm(e.target.value); }} placeholder={t("openingCustomer")}
          style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 14, marginBottom: 6 }} />
        <datalist id="rb-cust-names">{nameList.map(function (n) { return <option key={n} value={n} />; })}</datalist>
        <OpeningDirPicker value={dirn} onChange={setDirn} dueLabel={t("openingCustDue")} advLabel={t("openingCustAdv")} />
        <input type="number" inputMode="decimal" value={amt} onChange={function (e) { setAmt(e.target.value); }} placeholder={t("openingAmount")}
          style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 14, marginBottom: 6 }} />
        <input type="date" value={dt} onChange={function (e) { setDt(e.target.value); }}
          style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 14, marginBottom: 8 }} />
        <button disabled={!canSave} onClick={function () { p.onAdd(nm, amt, dirn, dt); setNm(""); setAmt(""); setDirn("due"); }}
          style={{ width: "100%", padding: "11px", borderRadius: 8, border: "none", background: canSave ? TC.garden : "#4A4638", color: TC.cream, fontWeight: 700, fontSize: 13, cursor: canSave ? "pointer" : "not-allowed" }}>{t("save")}</button>
      </div>
      {openings.length === 0 ? (
        <div style={{ fontSize: 12, color: "#A39C8A", textAlign: "center", padding: "12px 0" }}>{t("openingNone")}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {openings.map(function (x) {
            var adv = x.openingDir === "adv";
            var val = adv ? (Number(x.advance) || 0) : (Number(x.dues) || 0);
            return (
              <div key={x.id} style={{ background: TC.paper, borderRadius: 7, padding: "9px 11px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: TC.ink }}>{x.customerName}</div>
                  <div className="rb-mono" style={{ fontSize: 10, color: TC.inkSoft, marginTop: 1 }}>{rbDate(x.date)} · {adv ? t("openingCustAdv") : t("openingCustDue")}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="rb-mono" style={{ fontSize: 12.5, fontWeight: 700, color: adv ? TC.success : TC.stamp, whiteSpace: "nowrap" }}>Rs {rbMoney(Math.abs(val))}</span>
                  {p.canDelete ? (
                    <button onClick={function () { p.onDelete(x.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: TC.stamp, padding: 0 }}><Ico name="trash" size={14} /></button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ModalShell>
  );
}
function DuesTab(p) {
  var t = p.t, sales = p.sales, onOpen = p.onOpen, onCollect = p.onCollect, onReceipt = p.onReceipt;
  var a = React.useState("dues"), filter = a[0], setFilter = a[1];
  var b = React.useState(""), query = b[0], setQuery = b[1];
  var c = React.useState(null), collectingFor = c[0], setCollectingFor = c[1];
  var ob = React.useState(false), obOpen = ob[0], setObOpen = ob[1];
  var filtered = sales.filter(function (s) {
    if (filter === "dues" && (s.dues || 0) <= 0) return false;
    if (query && String(s.customerName).toLowerCase().indexOf(query.toLowerCase()) < 0) return false;
    return true;
  });
  function handleCollect(amount, date, discount) {
    var updated = onCollect(collectingFor.id, amount, date, discount);
    setCollectingFor(null);
    if (updated) onReceipt({ sale: updated, amount: Number(amount) || 0, date: date, discount: Number(discount) || 0 });
  }
  return (
    <div style={{ padding: "14px 14px 4px" }}>
      <PaymentsSummaryCard t={t} sales={sales} />
      {p.onAddOpening ? (
        <button onClick={function () { setObOpen(true); }} style={{
          width: "100%", marginBottom: 10, padding: "10px", borderRadius: 8,
          border: "1.5px dashed " + TC.concrete, background: "transparent", color: "#A39C8A",
          fontSize: 12.5, fontWeight: 600, cursor: "pointer"
        }}>+ {t("openingAdd")}</button>
      ) : null}
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
                <div onClick={function () { if (!s.isOpening) onOpen(s); }} style={{ display: "flex", justifyContent: "space-between", cursor: s.isOpening ? "default" : "pointer" }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: TC.ink }}>{s.customerName}</div>
                    <div style={{ fontSize: 10.5, color: TC.inkSoft, marginTop: 2 }}>
                      {s.isOpening ? (t("openingTag") + " · " + rbDate(s.date)) : ("#" + s.serial + " · " + rbDate(s.date) + " · " + (s.type === "cash" ? t("cashSale") : t("customizedSale")))}
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
      {obOpen ? (
        <CustomerOpeningModal t={t} sales={sales} canDelete={p.role === "admin"}
          onAdd={function (nm, amt, dirn, dt) { p.onAddOpening(nm, amt, dirn, dt); }}
          onDelete={p.onDeleteOpening}
          onClose={function () { setObOpen(false); }} />
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
                  <div style={{ fontSize: 10.5, color: TC.inkSoft, marginTop: 2 }}>#{g.serial} · {rbDate(g.date)} · {(g.items || []).length} {t("items")}</div>
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
function SettingsBlock(p) { return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        {p.icon}
        <span className="rb-display" style={{ color: TC.cream, fontSize: 13, fontWeight: 600 }}>{p.title}</span>
      </div>
      {p.children}
    </div>
  );
}

function PermissionCheckRow(p) { var label = p.label, checked = p.checked, onChange = p.onChange; return ( <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 2px", cursor: "pointer" }}> <input type="checkbox" checked={!!checked} onChange={function (ev) { onChange(ev.target.checked); }} style={{ width: 17, height: 17, accentColor: TC.slab, flexShrink: 0 }} /> <span style={{ fontSize: 12.5, color: TC.cream }}>{label}</span> </label> ); } function UserPinSetter(p) { var s1 = React.useState(""), val = s1[0], setVal = s1[1]; var hasPin = !!(p.security && p.security.userPin); function save() { if (val.length < 4) return; p.onSetPin(val); setVal(""); } return (<div><div style={{ fontSize: 11, color: "#A39C8A", marginBottom: 8 }}>{hasPin ? "User PIN set hai. Naya PIN dalkar change kar sakte hain." : "Abhi koi PIN set nahi - User role kisi bhi mobile pe bina roktok mil jata hai."}</div><div style={{ display: "flex", gap: 8 }}><input type="password" inputMode="numeric" maxLength={6} value={val} onChange={function (e) { setVal(e.target.value.replace(/\D/g, "")); }} placeholder="4-6 digit PIN" style={{ flex: 1, padding: "9px 10px", borderRadius: 8, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 14 }} /><button onClick={save} style={{ padding: "9px 14px", borderRadius: 8, border: "none", background: TC.stamp, color: TC.cream, fontWeight: 700, fontSize: 12.5 }}>{hasPin ? "Change" : "Set"}</button></div></div>); } function AdminPinSetter(p) { var s1 = React.useState(""), val = s1[0], setVal = s1[1]; var hasPin = !!(p.security && p.security.adminPin); function save() { if (val.length < 4) return; p.onSetPin(val); setVal(""); } return (<div><div style={{ fontSize: 11, color: "#A39C8A", marginBottom: 8 }}>{hasPin ? "Admin PIN set hai. Naya PIN dalkar change kar sakte hain." : "Abhi koi Admin PIN set nahi - naye mobile par Admin bhi bina roktok mil jata hai."}</div><div style={{ display: "flex", gap: 8 }}><input type="password" inputMode="numeric" maxLength={6} value={val} onChange={function (e) { setVal(e.target.value.replace(/\D/g, "")); }} placeholder="4-6 digit PIN" style={{ flex: 1, padding: "9px 10px", borderRadius: 8, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 14 }} /><button onClick={save} style={{ padding: "9px 14px", borderRadius: 8, border: "none", background: TC.stamp, color: TC.cream, fontWeight: 700, fontSize: 12.5 }}>{hasPin ? "Change" : "Set"}</button></div></div>); }

function NextSerialSetter(p) {
  var t = p.t;
  var a = React.useState(""), val = a[0], setVal = a[1];
  var n = Number(val);
  return (
    <div>
      <div style={{ fontSize: 11, color: "#A39C8A", marginBottom: 8 }}>{t("nextBillNo")}: <span className="rb-mono" style={{ color: TC.cream, fontWeight: 700 }}>#{p.nextSerial}</span></div>
      <div style={{ display: "flex", gap: 8 }}>
        <input type="number" inputMode="numeric" value={val} onChange={function (e) { setVal(e.target.value.replace(/[^0-9]/g, "")); }} placeholder={String(p.nextSerial || 1)}
          style={{ flex: 1, padding: "9px 10px", borderRadius: 8, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 14 }} />
        <button onClick={function () { if (n > 0) { p.onSet(n); setVal(""); } }} style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: n > 0 ? TC.stamp : "#4A4638", color: TC.cream, fontWeight: 700, fontSize: 12.5, cursor: n > 0 ? "pointer" : "not-allowed" }}>{t("setBtn")}</button>
      </div>
    </div>
  );
}
function ReportsTab(p) {
  var t = p.t;
  var a = React.useState({ preset: "today" }), range = a[0], setRange = a[1];
  var v = React.useState("book"), view = v[0], setView = v[1];
  var e1 = React.useState(""), expDetail = e1[0], setExpDetail = e1[1];
  var e2 = React.useState(""), expAmt = e2[0], setExpAmt = e2[1];
  var e3 = React.useState(rbToday()), expDate = e3[0], setExpDate = e3[1];
  var r = resolveRange(range);
  function inR(d) { return inDateRange(d, r.from, r.to); }
  var supName = {};
  (p.suppliers || []).forEach(function (x) { supName[x.id] = x.name; });

  var sales = (p.sales || []).filter(function (x) { return !x.isOpening && inR(x.date); });
  var payments = [];
  (p.sales || []).forEach(function (s) {
    (s.payments || []).forEach(function (pay) {
      if (inR(pay.date)) payments.push({ date: pay.date, amount: Number(pay.amount) || 0, name: s.customerName, serial: s.serial });
    });
  });
  var purchases = (p.purchases || []).filter(function (x) { return inR(x.date); });
  var supPays = (p.supplierPayments || []).filter(function (x) { return inR(x.date); });
  var stockAdds = (p.stockLog || []).filter(function (x) { return inR(x.date); });
  var wast = (p.wastageLog || []).filter(function (x) { return inR(x.date); });
  var exps = (p.expenses || []).filter(function (x) { return inR(x.date); });
  var labName = {};
  (p.labourers || []).forEach(function (x) { labName[x.id] = x.name; });
  var labWork = (p.labourWork || []).filter(function (x) { return inR(x.date); });
  var labPays = (p.labourPayments || []).filter(function (x) { return inR(x.date); });
  var labourCost = labWork.reduce(function (n, x) { return n + (Number(x.amount) || 0); }, 0);

  var salesTotal = sales.reduce(function (n, x) { return n + (Number(x.totalBill) || 0); }, 0);
  var received = payments.reduce(function (n, x) { return n + x.amount; }, 0);
  var cementCost = purchases.reduce(function (n, x) { return n + (Number(x.amount) || 0); }, 0);
  var expTotal = exps.reduce(function (n, x) { return n + (Number(x.amount) || 0); }, 0);
  var paidOut = supPays.reduce(function (n, x) { return n + (Number(x.amount) || 0); }, 0);
  var net = salesTotal - cementCost - expTotal - labourCost;

  var rows = [];
  sales.forEach(function (x) { rows.push({ id: "s" + x.id, date: x.date, kind: t("saleAmount"), title: x.customerName + " · #" + x.serial, val: Number(x.totalBill) || 0, dir: "in", soft: true }); });
  payments.forEach(function (x, i) { rows.push({ id: "p" + i + x.date, date: x.date, kind: t("receivedAmount"), title: x.name + " · #" + x.serial, val: x.amount, dir: "in" }); });
  purchases.forEach(function (x) { rows.push({ id: "c" + x.id, date: x.date, kind: rbMaterialOf(x) === "cement" ? t("buyCement") : t("buyMaterial"), title: (supName[x.supplierId] || "-") + " · " + (x.materialName || t("cement")) + " " + rbQtyOf(x) + " " + (x.unit || ""), val: Number(x.amount) || 0, dir: "out", soft: true }); });
  supPays.forEach(function (x) { rows.push({ id: "sp" + x.id, date: x.date, kind: t("payToSupplier"), title: supName[x.supplierId] || "-", val: Number(x.amount) || 0, dir: "out" }); });
  exps.forEach(function (x) { rows.push({ id: "e" + x.id, date: x.date, kind: t("expenses"), title: x.detail || "-", val: Number(x.amount) || 0, dir: "out" }); });
  labWork.forEach(function (x) { var kk = labourKind(x.kind); rows.push({ id: "lw" + x.id, date: x.date, kind: t("labourWork"), title: (labName[x.labourerId] || "-") + " \u00b7 " + t(kk.labelKey) + (x.qty ? " " + x.qty + " " + t(kk.unitKey) : ""), val: Number(x.amount) || 0, dir: "out", soft: true }); });
  labPays.forEach(function (x) { rows.push({ id: "lp" + x.id, date: x.date, kind: t("labourAdvance"), title: labName[x.labourerId] || "-", val: Number(x.amount) || 0, dir: "out" }); });
  stockAdds.forEach(function (x) { rows.push({ id: "st" + x.id, date: x.date, kind: t("stockMade"), title: variantLabel(t, x.category, x.variant) + " +" + x.qty + ((Number(x.cementBags) || 0) > 0 ? " · " + t("cement") + " " + x.cementBags : ""), val: null }); });
  wast.forEach(function (x) { rows.push({ id: "w" + x.id, date: x.date, kind: t("wastageOut"), title: variantLabel(t, x.category, x.variant) + " -" + x.qty, val: null }); });
  rows.sort(function (m, n) { return String(n.date || "").localeCompare(String(m.date || "")); });

  return (
    <div style={{ padding: "14px 14px 4px" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[["book", t("dayBook")], ["pl", t("profitLoss")]].map(function (o) {
          var id = o[0], label = o[1], on = view === id;
          return (
            <button key={id} onClick={function () { setView(id); }} style={{
              flex: 1, padding: "10px 8px", borderRadius: 8, border: "2px solid " + (on ? TC.amber : "#3A362C"),
              background: on ? TC.amber : "transparent", color: on ? TC.ink : "#A39C8A",
              fontSize: 13, fontWeight: 700, cursor: "pointer"
            }}>{label}</button>
          );
        })}
      </div>

      <div style={{ background: TC.paper, borderRadius: 10, padding: 12, marginBottom: 14 }}>
        <RangeFilter t={t} range={range} onChange={setRange} />
        {view === "pl" ? (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 8 }}>
              <StatBlock label={t("saleAmount")} value={"Rs " + rbMoney(salesTotal)} bold />
              <StatBlock label={t("receivedAmount")} value={"Rs " + rbMoney(received)} bold color={TC.success} />
              <StatBlock label={t("purchases")} value={"Rs " + rbMoney(cementCost)} color={TC.stamp} />
              <StatBlock label={t("labourWork")} value={"Rs " + rbMoney(labourCost)} color={TC.stamp} />
              <StatBlock label={t("expenses")} value={"Rs " + rbMoney(expTotal)} color={TC.stamp} />
            </div>
            <div style={{ borderTop: "2px dashed " + TC.paperLine, paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="rb-display" style={{ fontSize: 13, fontWeight: 700, color: TC.inkSoft }}>{net >= 0 ? t("netProfit") : t("netLoss")}</span>
              <span className="rb-mono" style={{ fontSize: 17, fontWeight: 700, color: net >= 0 ? TC.success : TC.stamp }}>Rs {rbMoney(Math.abs(net))}</span>
            </div>
            <div style={{ fontSize: 9.5, color: TC.concrete, marginTop: 6 }}>{t("saleAmount")} &minus; {t("purchases")} &minus; {t("labourWork")} &minus; {t("expenses")}</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
            <StatBlock label={t("receivedAmount")} value={"Rs " + rbMoney(received)} bold color={TC.success} />
            <StatBlock label={t("expenseTotal")} value={"Rs " + rbMoney(expTotal + paidOut + labPays.reduce(function (n, x) { return n + (Number(x.amount) || 0); }, 0))} bold color={TC.stamp} />
            <StatBlock label={t("saleAmount")} value={"Rs " + rbMoney(salesTotal)} bold />
          </div>
        )}
      </div>

      {p.canAddExpense ? (
        <div style={{ background: TC.appBg2, borderRadius: 8, padding: 10, marginBottom: 14 }}>
          <div style={{ fontSize: 11.5, color: TC.cream, fontWeight: 700, marginBottom: 8 }}>{t("addExpense")}</div>
          <input value={expDetail} onChange={function (ev) { setExpDetail(ev.target.value); }} placeholder={t("expenseDetail")} style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 13.5, marginBottom: 6 }} />
          <div style={{ display: "flex", gap: 6 }}>
            <input type="number" inputMode="numeric" value={expAmt} onChange={function (ev) { setExpAmt(ev.target.value); }} placeholder="Rs" style={{ flex: 1, padding: "9px 10px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 13.5 }} />
            <input type="date" value={expDate} onChange={function (ev) { setExpDate(ev.target.value); }} style={{ flex: 1, padding: "9px 10px", borderRadius: 7, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 13.5 }} />
          </div>
          <button disabled={!(Number(expAmt) > 0 && expDetail.trim())} onClick={function () { p.onAddExpense(expDetail, expAmt, expDate); setExpDetail(""); setExpAmt(""); }} style={{ width: "100%", marginTop: 6, padding: "9px", borderRadius: 7, border: "none", background: (Number(expAmt) > 0 && expDetail.trim()) ? TC.stamp : "#4A4638", color: TC.cream, fontWeight: 700, fontSize: 12.5, cursor: (Number(expAmt) > 0 && expDetail.trim()) ? "pointer" : "not-allowed" }}>{t("addExpense")}</button>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState icon={<Ico name="grid" size={28} color={TC.concrete} />} text={t("noEntriesRange")} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {rows.map(function (x) {
            return (
              <div key={x.id} style={{ background: TC.paper, borderRadius: 8, padding: "9px 12px", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: TC.ink }}>{x.kind}</div>
                  <div style={{ fontSize: 10, color: TC.inkSoft, marginTop: 1 }}>{rbDate(x.date)} &middot; {x.title}</div>
                </div>
                {x.val === null ? null : (
                  <span className="rb-mono" style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap", color: x.dir === "in" ? (x.soft ? TC.inkSoft : TC.success) : TC.stamp }}>
                    {x.dir === "in" ? "+" : "-"}{rbMoney(x.val)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
  function SettingsTab(p) {
  var t = p.t, lang = p.lang, role = p.role, onLang = p.onLang, onRole = p.onRole, onClear = p.onClear, activityLog = p.activityLog; var permissions = p.permissions || DEFAULT_PERMISSIONS, onTogglePermission = p.onTogglePermission; var security = p.security || {}, onSetUserPin = p.onSetUserPin; var nextSerial = p.nextSerial, onSetNextSerial = p.onSetNextSerial; var onSetAdminPin = p.onSetAdminPin; var onLockDevice = p.onLockDevice;
  var a = React.useState(false), confirming = a[0], setConfirming = a[1];
  return (
    <div style={{ padding: "14px 14px 4px", display: "flex", flexDirection: "column", gap: 18 }}>
      {role === "admin" && onSetNextSerial ? (
        <SettingsBlock icon={<Ico name="receipt" size={16} color={TC.cream} />} title={t("nextBillNo")}>
          <NextSerialSetter t={t} nextSerial={nextSerial} onSet={onSetNextSerial} />
        </SettingsBlock>
      ) : null}
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

      {role === "admin" && p.onSaveCatNames ? (
        <SettingsBlock icon={<Ico name="pkg" size={16} color={TC.cream} />} title={t("catNamesTitle")}>
          <CatNamesSetter t={t} names={p.catNames} onSave={p.onSaveCatNames} />
        </SettingsBlock>
      ) : null}

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

      {role === "admin" ? ( <SettingsBlock icon={<Ico name="usercog" size={16} color={TC.cream} />} title={t("permissions")}> <div style={{ fontSize: 11, color: "#A39C8A", marginBottom: 4 }}>{t("permissionsHint")}</div> <div style={{ background: TC.appBg2, borderRadius: 8, padding: "2px 10px" }}> <PermissionCheckRow label={t("userCanTabSale")} checked={permissions.tabSale !== false} onChange={function (v) { onTogglePermission("tabSale", v); }} /> <PermissionCheckRow label={t("userCanTabBills")} checked={permissions.tabBills !== false} onChange={function (v) { onTogglePermission("tabBills", v); }} /> <PermissionCheckRow label={t("userCanTabGatePass")} checked={permissions.tabGatePass !== false} onChange={function (v) { onTogglePermission("tabGatePass", v); }} /> <PermissionCheckRow label={t("userCanTabDues")} checked={permissions.tabDues !== false} onChange={function (v) { onTogglePermission("tabDues", v); }} /> <PermissionCheckRow label={t("userCanStockAdd")} checked={permissions.stockAdd} onChange={function (v) { onTogglePermission("stockAdd", v); }} /> <PermissionCheckRow label={t("userCanSupplier")} checked={permissions.supplier} onChange={function (v) { onTogglePermission("supplier", v); }} /> <PermissionCheckRow label={t("userCanLabour")} checked={permissions.labour} onChange={function (v) { onTogglePermission("labour", v); }} /> <PermissionCheckRow label={t("userCanReports")} checked={permissions.reports} onChange={function (v) { onTogglePermission("reports", v); }} /> <PermissionCheckRow label={t("userCanWastage")} checked={permissions.wastage} onChange={function (v) { onTogglePermission("wastage", v); }} /> <PermissionCheckRow label={t("userCanEditSale")} checked={permissions.editSale} onChange={function (v) { onTogglePermission("editSale", v); }} /> <PermissionCheckRow label={t("userCanGatePass")} checked={permissions.gatePass} onChange={function (v) { onTogglePermission("gatePass", v); }} /> <PermissionCheckRow label={t("userCanBillsSummary")} checked={permissions.billsSummary} onChange={function (v) { onTogglePermission("billsSummary", v); }} /> </div> </SettingsBlock> ) : null} {role === "admin" ? (
        <SettingsBlock icon={<Ico name="usercog" size={16} color={TC.cream} />} title="PIN Security">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <AdminPinSetter security={security} onSetPin={onSetAdminPin} />
            <UserPinSetter security={security} onSetPin={onSetUserPin} />
            
          </div>
        </SettingsBlock>
      ) : null}

            {role === "admin" && onLockDevice ? (
        <SettingsBlock icon={<Ico name="usercog" size={16} color={TC.cream} />} title="Device Security">
          {security.adminPin ? (
            <div>
              <div style={{ fontSize: 11, color: "#A39C8A", marginBottom: 8 }}>
                Ye phone jis worker ke pas rahega, us pe Admin access poori tarah band karne ke liye ye device lock kar dein — is ke baad is phone par sirf User PIN kaam karega, Admin PIN nahi (Admin PIN se bhi wapas unlock kiya ja sakta hai).
              </div>
              <button onClick={function () { if (window.confirm("Is device ko sirf User tak mehdood kar dein? Is phone par Admin PIN se login nahi ho sakega jab tak aap Admin PIN se dobara unlock na karein.")) onLockDevice(); }} style={{
                width: "100%", padding: "10px", borderRadius: 8, border: "1.5px solid " + TC.stamp,
                background: "transparent", color: TC.stamp, fontSize: 12.5, fontWeight: 600, cursor: "pointer"
              }}>Is device ko sirf User tak mehdood karein</button>
            </div>
          ) : (
            <div style={{ fontSize: 11, color: "#A39C8A" }}>
              Pehle upar Admin PIN set karein — device lock karne ke baad usi Admin PIN se dobara unlock hota hai, is liye PIN set kiye baghair lock karna mumkin nahi.
            </div>
          )}
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
                      <div style={{ fontSize: 9, color: "#6B6656", marginTop: 1 }}>{rbDate(e.date)}</div>
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
