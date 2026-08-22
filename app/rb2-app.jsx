/* Raees Builder App v2 - bill / gate pass / receipt modals + app shell */

function BillModal(p) {
  var t = p.t, role = p.role, permissions = p.permissions, sale = p.sale, onClose = p.onClose, onEdit = p.onEdit, onViewGatePass = p.onViewGatePass, gatePassEntry = p.gatePassEntry;
  var isPaid = (sale.dues || 0) <= 0;
  var isCash = sale.type === "cash";
  var canEdit = hasPerm(role, permissions, "editSale"); /* cash bill bhi edit ho sakta hai (Admin) */
  var headers = isCash
    ? [t("sr"), t("description"), t("qty"), t("rate"), t("amount")]
    : [t("sr"), t("description"), t("qty"), t("length"), t("width"), t("sqft"), t("rate"), t("amount")];
  var waText = t("appName") + NL + (isCash ? t("billNo") : t("gatePassNo")) + ": #" + sale.serial
    + NL + t("customerName") + ": " + sale.customerName
    + NL + t("totalBill") + ": Rs " + rbMoney(sale.totalBill)
    + NL + t("advance") + ": Rs " + rbMoney(sale.advance)
    + NL + t("dues") + ": Rs " + rbMoney(sale.dues);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9080, overflowY: "auto" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", padding: 16 }}>
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, gap: 8 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: TC.cream, display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 13 }}>
            <Ico name="arrowleft" size={16} /> {t("back")}
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            {(canEdit && p.onReturn) ? (
              <button onClick={function () { p.onReturn(sale); }} style={{ background: "transparent", border: "1.5px solid " + TC.stamp, color: TC.stamp, padding: "6px 12px", borderRadius: 7, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
                {t("returnLabel")}
              </button>
            ) : null}
            {canEdit ? (
              <button onClick={function () { onEdit(sale); }} style={{ background: "transparent", border: "1.5px solid " + TC.amber, color: TC.amber, padding: "6px 12px", borderRadius: 7, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
                <Ico name="pencil" size={13} /> {t("edit")}
              </button>
            ) : null}
            <button onClick={function () { window.print(); }} style={{ background: TC.stamp, border: "none", color: TC.cream, padding: "7px 14px", borderRadius: 7, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
              <Ico name="printer" size={14} /> {t("print")}
            </button>
          </div>
        </div>

        {(!isCash && onViewGatePass) ? (
          <button onClick={function () { onViewGatePass(sale); }} className="no-print" style={{
            width: "100%", marginBottom: 12, padding: "12px", borderRadius: 8, border: "1.5px solid " + TC.slab,
            background: "transparent", color: TC.cream, fontSize: 13, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7
          }}>
            <Ico name="truck" size={15} /> {t("viewGatePass")}
          </button>
        ) : null}

        {sale.mobile ? (
          <a href={rbWa(sale.mobile, waText)} target="_blank" rel="noopener noreferrer" className="no-print" style={{
            width: "100%", marginBottom: 12, padding: "12px", borderRadius: 8, border: "none",
            background: "#25D366", color: "#0B2013", fontSize: 13, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7, textDecoration: "none", boxSizing: "border-box"
          }}>
            <Ico name="chat" size={15} /> {t("whatsapp")}
          </a>
        ) : null}

        <div className="print-area">
        <div style={{
          background: TC.paper, borderRadius: 10, padding: 20, position: "relative", overflow: "hidden",
          backgroundImage: "repeating-linear-gradient(45deg, " + TC.paperDark + " 0, " + TC.paperDark + " 1px, transparent 1px, transparent 14px)"
        }}>
          <div style={{ textAlign: "center", marginTop: 8, marginBottom: 14, borderBottom: "2px solid " + TC.ink, paddingBottom: 10 }}>
            <div className="rb-display" style={{ fontSize: 22, fontWeight: 700, color: TC.ink }}>{t("appName")}</div>
            <div style={{ fontSize: 10.5, color: TC.inkSoft, marginTop: 2 }}>{t("tagline")}</div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 12 }}>
            <div>
              <div style={{ color: TC.inkSoft, fontSize: 10 }}>{t("customerName")}</div>
              <div style={{ fontWeight: 700, color: TC.ink }}>{sale.customerName}</div>
              {sale.mobile ? <div className="rb-mono" style={{ color: TC.inkSoft, fontSize: 10.5, marginTop: 2 }}>{sale.mobile}</div> : null}
            </div>
            <div style={{ textAlign: "end" }}>
              <div style={{ color: TC.inkSoft, fontSize: 10 }}>{isCash ? t("billNo") : t("gatePassNo")}</div>
              <div className="rb-mono" style={{ fontWeight: 700, color: TC.stamp }}>#{sale.serial}</div>
              <div style={{ color: TC.inkSoft, fontSize: 10, marginTop: 3 }}>{rbDate(sale.date)}</div>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid " + TC.ink, borderTop: "1.5px solid " + TC.ink }}>
                {headers.map(function (h) {
                  return <th key={h} style={{ padding: "5px 3px", textAlign: "start", color: TC.inkSoft, fontWeight: 600 }}>{h}</th>;
                })}
              </tr>
            </thead>
            <tbody className="rb-mono">
              {sale.items.map(function (it, i) {
                return (
                  <tr key={it.id || i} style={{ borderBottom: "1px dashed " + TC.paperLine }}>
                    <td style={{ padding: "5px 3px" }}>{i + 1}</td>
                    <td style={{ padding: "5px 3px", fontFamily: "Inter, sans-serif" }}>{it.desc}</td>
                    <td style={{ padding: "5px 3px" }}>{it.qty}</td>
                    {!isCash ? <td style={{ padding: "5px 3px" }}>{it.length}</td> : null}
                    {!isCash ? <td style={{ padding: "5px 3px" }}>{it.width}</td> : null}
                    {!isCash ? <td style={{ padding: "5px 3px" }}>{(Number(it.sqft) || 0).toFixed(1)}</td> : null}
                    <td style={{ padding: "5px 3px" }}>{rbMoney(it.rate)}</td>
                    <td style={{ padding: "5px 3px", fontWeight: 700 }}>{rbMoney(it.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {(isCash && sale.labourTotal > 0) ? (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: TC.inkSoft }}>
              <span>{t("roofLabour")}</span>
              <span className="rb-mono" style={{ fontWeight: 700, color: TC.ink }}>Rs {rbMoney(sale.labourTotal)}</span>
            </div>
          ) : null}

          <div style={{ marginTop: 14, borderTop: "2px solid " + TC.ink, paddingTop: 10 }}>
            {sale.discount > 0 ? (<TotalRow label={t("discount")} value={rbMoney(sale.discount)} />) : null}
            <TotalRow label={t("totalBill")} value={rbMoney(sale.totalBill)} bold />
            <TotalRow label={t("advance")} value={rbMoney(sale.advance)} />
            <TotalRow label={t("dues")} value={rbMoney(sale.dues)} accent={sale.dues > 0 ? TC.stamp : TC.success} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 34 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10.5, color: TC.ink, fontWeight: 700, marginBottom: 3 }}>{t("preparedBy")}: {roleName(t, sale.createdBy)}</div>
              <div style={{ width: 130, borderTop: "1.5px solid " + TC.ink, marginBottom: 4 }} />
              <div style={{ fontSize: 10.5, color: TC.inkSoft }}>{t("signature")}</div>
            </div>
          </div>

          <div style={{
            position: "absolute", bottom: 20, left: 20, width: 84, height: 84, borderRadius: "50%",
            border: "3px solid " + (isPaid ? TC.success : TC.amber), display: "flex", alignItems: "center", justifyContent: "center",
            transform: "rotate(-14deg)", opacity: 0.85
          }}>
            <span className="rb-display" style={{ fontSize: 13, fontWeight: 700, color: isPaid ? TC.success : TC.amber }}>{isPaid ? t("paid") : t("due")}</span>
          </div>
        </div>

        {(sale.payments && sale.payments.length > 0) ? (
          <div className="no-print" style={{ textAlign: "center", margin: "16px 0 10px", color: "#8B8577", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ flex: 1, borderTop: "1px dashed #6B6656" }} />
            <Ico name="history" size={13} /> {t("paymentHistory")}
            <span style={{ flex: 1, borderTop: "1px dashed #6B6656" }} />
          </div>
        ) : null}

        {(sale.payments && sale.payments.length > 0) ? (
          <div style={{ background: TC.paper, borderRadius: 10, padding: 16, position: "relative", marginTop: 8 }}>
            {sale.payments.map(function (pay, i) {
              return (
                <div key={pay.id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px", borderBottom: i < sale.payments.length - 1 ? "1px dashed " + TC.paperLine : "none" }}>
                  <div className="rb-mono" style={{ fontSize: 11, color: TC.inkSoft }}>{rbDate(pay.date)}</div>
                  <div className="rb-mono" style={{ fontSize: 13, fontWeight: 700, color: TC.success }}>Rs {rbMoney(pay.amount)}</div>
                </div>
              );
            })}
          </div>
        ) : null}

        {gatePassEntry ? (
          <div className="no-print" style={{ textAlign: "center", margin: "16px 0 10px", color: "#8B8577", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ flex: 1, borderTop: "1px dashed #6B6656" }} />
            <Ico name="truck" size={13} /> {t("gatePassTitle")}
            <span style={{ flex: 1, borderTop: "1px dashed #6B6656" }} />
          </div>
        ) : null}

        {gatePassEntry ? (
          <div style={{ background: TC.paper, borderRadius: 10, padding: 20, position: "relative", marginTop: 8 }}>
            <div style={{ textAlign: "center", marginBottom: 14, borderBottom: "2px solid " + TC.ink, paddingBottom: 10 }}>
              <div className="rb-display" style={{ fontSize: 22, fontWeight: 700, color: TC.ink }}>{t("appName")}</div>
              <div style={{ fontSize: 10.5, color: TC.inkSoft, marginTop: 2 }}>{t("gatePassTitle")}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 12 }}>
              <div>
                <div style={{ color: TC.inkSoft, fontSize: 10 }}>{t("customerName")}</div>
                <div style={{ fontWeight: 700, color: TC.ink }}>{sale.customerName}</div>
                {sale.mobile ? <div className="rb-mono" style={{ color: TC.inkSoft, fontSize: 10.5, marginTop: 2 }}>{sale.mobile}</div> : null}
              </div>
              <div style={{ textAlign: "end" }}>
                <div style={{ color: TC.inkSoft, fontSize: 10 }}>{t("gatePassNo")}</div>
                <div className="rb-mono" style={{ fontWeight: 700, color: TC.slab }}>#{gatePassEntry.serial || sale.serial}</div>
                <div style={{ color: TC.inkSoft, fontSize: 10, marginTop: 3 }}>{rbDate(gatePassEntry.date || sale.date)}</div>
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid " + TC.ink, borderTop: "1.5px solid " + TC.ink }}>
                  {[t("sr"), t("description"), t("qty")].map(function (h) {
                    return <th key={h} style={{ padding: "7px 4px", textAlign: "start", color: TC.inkSoft, fontWeight: 600 }}>{h}</th>;
                  })}
                </tr>
              </thead>
              <tbody className="rb-mono">
                {(gatePassEntry.items || []).map(function (it, i) {
                  return (
                    <tr key={it.id || i} style={{ borderBottom: "1px dashed " + TC.paperLine }}>
                      <td style={{ padding: "7px 4px" }}>{i + 1}</td>
                      <td style={{ padding: "7px 4px", fontFamily: "Inter, sans-serif" }}>{it.desc || "—"}</td>
                      <td style={{ padding: "7px 4px", fontWeight: 700 }}>{it.qty}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 40 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10.5, color: TC.ink, fontWeight: 700, marginBottom: 3 }}>{t("preparedBy")}: {roleName(t, gatePassEntry.createdBy || sale.createdBy)}</div>
                <div style={{ width: 130, borderTop: "1.5px solid " + TC.ink, marginBottom: 4 }} />
                <div style={{ fontSize: 10.5, color: TC.inkSoft }}>{t("signature")}</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      </div>
    </div>
  );
}
function GatePassBuilderModal(p) {
  var t = p.t, lang = p.lang, sale = p.sale, remainingFor = p.remainingFor, variantsFor = p.variantsFor;
  var a = React.useState("garden"), cat = a[0], setCat = a[1];
  var b = React.useState(function () { return (p.initialItems || []).map(function (it) { return Object.assign({}, it); }); });
  var cart = b[0], setCart = b[1];
  var c = React.useState(null), active = c[0], setActive = c[1];
  var d = React.useState(""), qtyInput = d[0], setQtyInput = d[1];
  var urdu = lang === "ur";
  var variants = variantsFor(cat);

  function cartQtyFor(category, variant) {
    return cart.filter(function (x) { return x.category === category && x.variant === variant; })
      .reduce(function (s, x) { return s + Number(x.qty || 0); }, 0);
  }
  function openPrompt(category, variant) { setActive({ category: category, variant: variant }); setQtyInput(""); }
  function confirmAdd() {
    var q = Number(qtyInput);
    if (!q || q <= 0) return;
    var category = active.category, variant = active.variant;
    var desc = variantLabel(t, category, variant);
    setCart(function (prev) {
      var idx = -1;
      prev.forEach(function (x, i) { if (x.category === category && x.variant === variant) idx = i; });
      if (idx >= 0) {
        var next = prev.slice();
        next[idx] = Object.assign({}, next[idx], { qty: Number(next[idx].qty) + q });
        return next;
      }
      return prev.concat([{ id: rbUid(), category: category, variant: variant, qty: q, desc: desc }]);
    });
    setActive(null); setQtyInput("");
  }
  function removeFromCart(id) { setCart(function (x) { return x.filter(function (y) { return y.id !== id; }); }); }
  var totalPieces = cart.reduce(function (s, x) { return s + Number(x.qty || 0); }, 0);
  var title = (p.isEdit ? t("edit") : t("makeGatePass")) + " — " + sale.customerName;

  return (
    <ModalShell onClose={p.onClose} title={title}>
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
          <div style={{ fontSize: 11.5, color: "#A39C8A", marginBottom: 12 }} className={urdu ? "rb-urdu" : ""}>{t("selectItemsToTake")}</div>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxHeight: 260, overflowY: "auto", marginBottom: 14 }}>
            {variants.map(function (v) {
              var inCart = cartQtyFor(cat, v);
              var remaining = remainingFor(cat, v) - inCart;
              return (
                <button key={v} onClick={function () { openPrompt(cat, v); }} style={{
                  textAlign: "start", padding: "10px 12px", borderRadius: 8,
                  border: "1.5px solid " + (inCart > 0 ? TC.garden : "#3A362C"), background: TC.appBg2, cursor: "pointer", position: "relative"
                }}>
                  <div className="rb-mono" style={{ color: TC.cream, fontSize: 15, fontWeight: 700 }}>{v}{cat === "garden" ? " ft" : ""}</div>
                  <div style={{ fontSize: 10.5, color: remaining > 0 ? "#9FBE8A" : TC.stamp, marginTop: 2 }}>{remaining} {t("inStock")}</div>
                  {inCart > 0 ? (
                    <span style={{ position: "absolute", top: 6, right: 6, background: TC.garden, color: TC.cream, fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 6px" }}>+{inCart}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
          {cart.length > 0 ? (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#A39C8A", marginBottom: 6, fontWeight: 600 }}>{t("selected")} ({totalPieces})</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {cart.map(function (x) {
                  return (
                    <div key={x.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: TC.appBg2, borderRadius: 7, padding: "7px 10px" }}>
                      <span style={{ fontSize: 12.5, color: TC.cream }}>{x.desc}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="rb-mono" style={{ fontSize: 12.5, color: "#9FBE8A", fontWeight: 700 }}>x{x.qty}</span>
                        <button onClick={function () { removeFromCart(x.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: TC.stamp, padding: 0 }}>
                          <Ico name="x" size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          <button disabled={cart.length === 0} onClick={function () { p.onCreate(cart); }} style={{
            width: "100%", padding: "13px", borderRadius: 8, border: "none",
            background: cart.length > 0 ? TC.slab : "#4A4638", color: TC.cream, fontSize: 13.5, fontWeight: 700,
            cursor: cart.length > 0 ? "pointer" : "not-allowed"
          }} className={urdu ? "rb-urdu" : ""}>{p.isEdit ? t("updateGatePass") : t("makeGatePass")}</button>
        </div>
      )}
    </ModalShell>
  );
}

function GatePassModal(p) {
  var t = p.t, role = p.role, permissions = p.permissions, sale = p.sale, items = p.items, onClose = p.onClose, onEdit = p.onEdit;
  var canEdit = hasPerm(role, permissions, "gatePass") && !!onEdit;
  var lines = items.map(function (it, i) { return (i + 1) + ". " + (it.desc || "—") + " — " + t("qty") + ": " + it.qty; }).join(NL);
  var waText = t("appName") + NL + t("gatePassTitle") + NL + t("gatePassNo") + ": #" + sale.serial
    + NL + t("customerName") + ": " + sale.customerName + NL + t("date") + ": " + rbDate(sale.date) + NL + NL + lines;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9085, overflowY: "auto" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", padding: 16 }}>
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, gap: 8 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: TC.cream, display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 13 }}>
            <Ico name="arrowleft" size={16} /> {t("back")}
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            {canEdit ? (
              <button onClick={onEdit} style={{ background: "transparent", border: "1.5px solid " + TC.amber, color: TC.amber, padding: "6px 12px", borderRadius: 7, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
                <Ico name="pencil" size={13} /> {t("edit")}
              </button>
            ) : null}
            <button onClick={function () { window.print(); }} style={{ background: TC.slab, border: "none", color: TC.cream, padding: "7px 14px", borderRadius: 7, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
              <Ico name="printer" size={14} /> {t("print")}
            </button>
          </div>
        </div>

        {sale.mobile ? (
          <a href={rbWa(sale.mobile, waText)} target="_blank" rel="noopener noreferrer" className="no-print" style={{
            width: "100%", marginBottom: 12, padding: "12px", borderRadius: 8, border: "none",
            background: "#25D366", color: "#0B2013", fontSize: 13, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7, textDecoration: "none", boxSizing: "border-box"
          }}>
            <Ico name="chat" size={15} /> {t("whatsapp")}
          </a>
        ) : null}

        <div className="print-area" style={{ background: TC.paper, borderRadius: 10, padding: 20, position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: 14, borderBottom: "2px solid " + TC.ink, paddingBottom: 10 }}>
            <div className="rb-display" style={{ fontSize: 22, fontWeight: 700, color: TC.ink }}>{t("appName")}</div>
            <div style={{ fontSize: 10.5, color: TC.inkSoft, marginTop: 2 }}>{t("gatePassTitle")}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 12 }}>
            <div>
              <div style={{ color: TC.inkSoft, fontSize: 10 }}>{t("customerName")}</div>
              <div style={{ fontWeight: 700, color: TC.ink }}>{sale.customerName}</div>
              {sale.mobile ? <div className="rb-mono" style={{ color: TC.inkSoft, fontSize: 10.5, marginTop: 2 }}>{sale.mobile}</div> : null}
            </div>
            <div style={{ textAlign: "end" }}>
              <div style={{ color: TC.inkSoft, fontSize: 10 }}>{t("gatePassNo")}</div>
              <div className="rb-mono" style={{ fontWeight: 700, color: TC.slab }}>#{sale.serial}</div>
              <div style={{ color: TC.inkSoft, fontSize: 10, marginTop: 3 }}>{rbDate(sale.date)}</div>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid " + TC.ink, borderTop: "1.5px solid " + TC.ink }}>
                {[t("sr"), t("description"), t("qty")].map(function (h) {
                  return <th key={h} style={{ padding: "7px 4px", textAlign: "start", color: TC.inkSoft, fontWeight: 600 }}>{h}</th>;
                })}
              </tr>
            </thead>
            <tbody className="rb-mono">
              {items.map(function (it, i) {
                return (
                  <tr key={it.id || i} style={{ borderBottom: "1px dashed " + TC.paperLine }}>
                    <td style={{ padding: "7px 4px" }}>{i + 1}</td>
                    <td style={{ padding: "7px 4px", fontFamily: "Inter, sans-serif" }}>{it.desc || "—"}</td>
                    <td style={{ padding: "7px 4px", fontWeight: 700 }}>{it.qty}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 40 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10.5, color: TC.ink, fontWeight: 700, marginBottom: 3 }}>{t("preparedBy")}: {roleName(t, (p.entry && p.entry.createdBy) || sale.createdBy)}</div>
              <div style={{ width: 130, borderTop: "1.5px solid " + TC.ink, marginBottom: 4 }} />
              <div style={{ fontSize: 10.5, color: TC.inkSoft }}>{t("signature")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceiptLine(p) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px dashed " + TC.paperLine, paddingBottom: 8 }}>
      <span style={{ fontSize: 12, color: TC.inkSoft, fontWeight: 600 }}>{p.label}</span>
      <span className="rb-mono" style={{ fontSize: p.big ? 18 : 13, fontWeight: 700, color: p.color || TC.ink }}>{p.value}</span>
    </div>
  );
}

function PaymentReceiptModal(p) {
  var t = p.t, data = p.data, onClose = p.onClose;
  var sale = data.sale, amount = data.amount, date = data.date;
  var isFullyPaid = (sale.dues || 0) <= 0;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9090, overflowY: "auto" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", padding: 16 }}>
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: TC.cream, display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 13 }}>
            <Ico name="arrowleft" size={16} /> {t("back")}
          </button>
          <button onClick={function () { window.print(); }} style={{ background: TC.stamp, border: "none", color: TC.cream, padding: "7px 14px", borderRadius: 7, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
            <Ico name="printer" size={14} /> {t("print")}
          </button>
        </div>
        <div className="print-area" style={{ background: TC.paper, borderRadius: 10, padding: 22, position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: 16, borderBottom: "2px solid " + TC.ink, paddingBottom: 10 }}>
            <div className="rb-display" style={{ fontSize: 20, fontWeight: 700, color: TC.ink }}>{t("appName")}</div>
            <div style={{ fontSize: 11, color: TC.inkSoft, marginTop: 3 }}>{t("paymentReceiptTitle")}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ReceiptLine label={t("customerName")} value={sale.customerName} />
            <ReceiptLine label={sale.type === "cash" ? t("billNo") : t("gatePassNo")} value={"#" + sale.serial} />
            <ReceiptLine label={t("date")} value={rbDate(date)} />
            <ReceiptLine label={t("amountReceived")} value={"Rs " + rbMoney(amount)} big color={TC.success} />
            <ReceiptLine label={t("totalBill")} value={"Rs " + rbMoney(sale.totalBill)} />
            <ReceiptLine label={t("balanceRemaining")} value={"Rs " + rbMoney(sale.dues)} big color={sale.dues > 0 ? TC.stamp : TC.success} />
          </div>
          {isFullyPaid ? (
            <div style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: TC.success, fontWeight: 700 }}>{t("noDuesOnThis")}</div>
          ) : null}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 34 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10.5, color: TC.ink, fontWeight: 700, marginBottom: 3 }}>{t("preparedBy")}: {roleName(t, p.by)}</div>
              <div style={{ width: 130, borderTop: "1.5px solid " + TC.ink, marginBottom: 4 }} />
              <div style={{ fontSize: 10.5, color: TC.inkSoft }}>{t("signature")}</div>
            </div>
          </div>
          <div style={{
            position: "absolute", bottom: 20, left: 20, width: 78, height: 78, borderRadius: "50%",
            border: "3px solid " + (isFullyPaid ? TC.success : TC.amber), display: "flex", alignItems: "center", justifyContent: "center",
            transform: "rotate(-14deg)", opacity: 0.85
          }}>
            <span className="rb-display" style={{ fontSize: 12, fontWeight: 700, color: isFullyPaid ? TC.success : TC.amber }}>{isFullyPaid ? t("fullyPaid") : t("paid")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
/* ---------------- app shell ---------------- */
function ReturnModal(p) {
  var t = p.t, sale = p.sale, onClose = p.onClose, onSave = p.onSave;
  var a = React.useState(function () {
    return (sale.items || []).map(function (it) {
      var q = Number(it.qty || 0);
      return { key: it.id || rbUid(), category: it.category, variant: it.variant,
        desc: it.desc || variantLabel(t, it.category, it.variant),
        unit: q > 0 ? Number(it.amount || 0) / q : 0, max: q, qty: "" };
    });
  }), rows = a[0], setRows = a[1];
  var b = React.useState(""), reason = b[0], setReason = b[1];
  var total = rows.reduce(function (x, r) { return x + (Number(r.qty) || 0) * r.unit; }, 0);
  var picked = rows.reduce(function (x, r) { return x + (Number(r.qty) || 0); }, 0);
  function setQty(key, v) {
    setRows(function (list) {
      return list.map(function (r) {
        if (r.key !== key) return r;
        if (v === "") return Object.assign({}, r, { qty: "" });
        var n = Number(v) || 0;
        if (n < 0) n = 0;
        if (n > r.max) n = r.max;
        return Object.assign({}, r, { qty: n });
      });
    });
  }
  function save() {
    var list = [];
    rows.forEach(function (r) {
      var q = Number(r.qty) || 0;
      if (q > 0) list.push({ category: r.category, variant: r.variant, desc: r.desc, qty: q, amount: q * r.unit });
    });
    if (!list.length) return;
    onSave(sale, list, reason);
  }
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9090, overflowY: "auto" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: TC.cream, display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 13 }}>
            <Ico name="arrowleft" size={16} /> {t("back")}
          </button>
          <span style={{ color: TC.cream, fontWeight: 700, fontSize: 14 }}>{t("returnItems")}</span>
        </div>
        <div style={{ background: TC.paper, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12.5, color: TC.inkSoft, marginBottom: 10 }}>{sale.customerName} - #{sale.serial}</div>
          {rows.map(function (r) {
            return (
              <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px dashed " + TC.paperLine, padding: "8px 0" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: TC.ink, fontWeight: 600 }}>{r.desc || "-"}</div>
                  <div style={{ fontSize: 11.5, color: TC.inkSoft }}>{t("qty")}: {r.max}</div>
                </div>
                <input type="number" inputMode="numeric" value={r.qty}
                  onChange={function (e) { setQty(r.key, e.target.value); }}
                  placeholder={t("returnQty")} style={Object.assign({}, rbInput(), { width: 92 })} />
              </div>
            );
          })}
          <input value={reason} onChange={function (e) { setReason(e.target.value); }} placeholder={t("returnReason")}
            style={Object.assign({}, rbInput(), { marginTop: 12 })} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontWeight: 700, color: TC.ink }}>
            <span>{t("returnTotal")}</span>
            <span className="rb-mono">Rs {rbMoney(total)}</span>
          </div>
          <button onClick={save} disabled={picked <= 0}
            style={{ width: "100%", marginTop: 12, background: picked > 0 ? TC.stamp : TC.concrete, color: "#FFF", border: "none", borderRadius: 8, padding: "11px 0", fontWeight: 700, fontSize: 14, cursor: picked > 0 ? "pointer" : "default" }}>
            {t("returnLabel")}
          </button>
        </div>
      </div>
    </div>
  );
}

function saleItemsToGateItems(sale) { return (sale.items || []).map(function (it) { var isStock = it.category === "garden" || it.category === "slab"; return { id: rbUid(), category: isStock ? it.category : "custom", variant: isStock ? it.variant : null, qty: Number(it.qty) || 0, desc: it.desc || "" }; }); } function GatePassBuilderModal(p) { var t = p.t, lang = p.lang, sale = p.sale, remainingFor = p.remainingFor, variantsFor = p.variantsFor; var a = React.useState("garden"), cat = a[0], setCat = a[1]; var b = React.useState(function () { var src = p.initialItems || (p.isEdit ? [] : saleItemsToGateItems(p.sale)); return src.map(function (it) { return Object.assign({}, it); }); }); var cart = b[0], setCart = b[1]; var c = React.useState(null), active = c[0], setActive = c[1]; var d = React.useState(""), qtyInput = d[0], setQtyInput = d[1]; var ce = React.useState(""), customDescInput = ce[0], setCustomDescInput = ce[1]; var urdu = lang === "ur"; var variants = variantsFor(cat); function cartQtyFor(category, variant) { return cart.filter(function (x) { return x.category === category && x.variant === variant; }) .reduce(function (s, x) { return s + Number(x.qty || 0); }, 0); } function openPrompt(category, variant) { setActive({ category: category, variant: variant }); setQtyInput(""); } function openCustomPrompt() { setActive({ category: "custom", variant: null }); setQtyInput(""); setCustomDescInput(""); } function confirmAdd() { var q = Number(qtyInput); if (!q || q <= 0) return; var category = active.category, variant = active.variant; if (category === "custom") { var customDesc = customDescInput.trim(); if (!customDesc) return; setCart(function (prev) { return prev.concat([{ id: rbUid(), category: "custom", variant: null, qty: q, desc: customDesc }]); }); setActive(null); setQtyInput(""); setCustomDescInput(""); return; } var desc = variantLabel(t, category, variant); setCart(function (prev) { var idx = -1; prev.forEach(function (x, i) { if (x.category === category && x.variant === variant) idx = i; }); if (idx >= 0) { var next = prev.slice(); next[idx] = Object.assign({}, next[idx], { qty: Number(next[idx].qty) + q }); return next; } return prev.concat([{ id: rbUid(), category: category, variant: variant, qty: q, desc: desc }]); }); setActive(null); setQtyInput(""); } function removeFromCart(id) { setCart(function (x) { return x.filter(function (y) { return y.id !== id; }); }); } var totalPieces = cart.reduce(function (s, x) { return s + Number(x.qty || 0); }, 0); var title = (p.isEdit ? t("edit") : t("makeGatePass")) + " — " + sale.customerName; return ( <ModalShell onClose={p.onClose} title={title}> {active ? ( <div style={{ textAlign: "center", padding: "10px 4px" }}> <div style={{ fontSize: 15, fontWeight: 700, color: TC.cream, marginBottom: 14 }}>{active.category === "custom" ? t("customItem") : variantLabel(t, active.category, active.variant)}</div> {active.category === "custom" ? ( <input value={customDescInput} autoFocus onChange={function (e) { setCustomDescInput(e.target.value); }} placeholder={t("description")} style={Object.assign({}, rbInput(), { marginBottom: 10 })} /> ) : null} <input type="number" inputMode="numeric" autoFocus={active.category !== "custom"} value={qtyInput} onChange={function (e) { setQtyInput(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter") confirmAdd(); }} placeholder={t("enterQty")} style={Object.assign({}, rbInput(), { fontSize: 22, textAlign: "center", padding: "14px", marginBottom: 14 })} /> <div style={{ display: "flex", gap: 8 }}> <button onClick={function () { setActive(null); }} style={{ flex: 1, padding: "12px", borderRadius: 8, border: "1.5px solid #3A362C", background: "transparent", color: "#A39C8A", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{t("cancel")}</button> <button disabled={!(Number(qtyInput) > 0) || (active.category === "custom" && !customDescInput.trim())} onClick={confirmAdd} style={{ flex: 1, padding: "12px", borderRadius: 8, border: "none", background: (Number(qtyInput) > 0 && !(active.category === "custom" && !customDescInput.trim())) ? TC.garden : "#4A4638", color: TC.cream, fontSize: 13, fontWeight: 700, cursor: (Number(qtyInput) > 0 && !(active.category === "custom" && !customDescInput.trim())) ? "pointer" : "not-allowed" }}>{t("add")}</button> </div> </div> ) : ( <div> <div style={{ fontSize: 11.5, color: "#A39C8A", marginBottom: 12 }} className={urdu ? "rb-urdu" : ""}>{t("selectItemsToTake")}</div> <div style={{ display: "flex", gap: 8, marginBottom: 14 }}> {[["garden", t("garden"), TC.garden, "sprout"], ["slab", t("slab"), TC.slab, "grid"]].map(function (o) { var id = o[0], label = o[1], color = o[2], icon = o[3], on = cat === id; return ( <button key={id} onClick={function () { setCat(id); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 8px", borderRadius: 8, border: "2px solid " + (on ? color : "#3A362C"), background: on ? color : "transparent", color: on ? TC.cream : "#A39C8A", fontSize: 13, fontWeight: 600, cursor: "pointer" }} className={urdu ? "rb-urdu" : ""}> <Ico name={icon} size={15} /> {label} </button> ); })} </div> <div style={{ marginBottom: 14 }}> <button onClick={openCustomPrompt} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1.5px dashed #6B6656", background: "transparent", color: "#A39C8A", fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} className={urdu ? "rb-urdu" : ""}> <Ico name="plus" size={14} /> {t("customItem")} </button> </div> <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxHeight: 260, overflowY: "auto", marginBottom: 14 }}> {variants.map(function (v) { var inCart = cartQtyFor(cat, v); var remaining = remainingFor(cat, v) - inCart; return ( <button key={v} onClick={function () { openPrompt(cat, v); }} style={{ textAlign: "start", padding: "10px 12px", borderRadius: 8, border: "1.5px solid " + (inCart > 0 ? TC.garden : "#3A362C"), background: TC.appBg2, cursor: "pointer", position: "relative" }}> <div className="rb-mono" style={{ color: TC.cream, fontSize: 15, fontWeight: 700 }}>{v}{cat === "garden" ? " ft" : ""}</div> <div style={{ fontSize: 10.5, color: remaining > 0 ? "#9FBE8A" : TC.stamp, marginTop: 2 }}>{remaining} {t("inStock")}</div> {inCart > 0 ? ( <span style={{ position: "absolute", top: 6, right: 6, background: TC.garden, color: TC.cream, fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 6px" }}>+{inCart}</span> ) : null} </button> ); })} </div> {cart.length > 0 ? ( <div style={{ marginBottom: 14 }}> <div style={{ fontSize: 11, color: "#A39C8A", marginBottom: 6, fontWeight: 600 }}>{t("selected")} ({totalPieces})</div> <div style={{ display: "flex", flexDirection: "column", gap: 6 }}> {cart.map(function (x) { return ( <div key={x.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: TC.appBg2, borderRadius: 7, padding: "7px 10px" }}> <span style={{ fontSize: 12.5, color: TC.cream }}>{x.desc}</span> <div style={{ display: "flex", alignItems: "center", gap: 8 }}> <span className="rb-mono" style={{ fontSize: 12.5, color: "#9FBE8A", fontWeight: 700 }}>x{x.qty}</span> <button onClick={function () { removeFromCart(x.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: TC.stamp, padding: 0 }}> <Ico name="x" size={14} /> </button> </div> </div> ); })} </div> </div> ) : null} <button disabled={cart.length === 0} onClick={function () { p.onCreate(cart); }} style={{ width: "100%", padding: "13px", borderRadius: 8, border: "none", background: cart.length > 0 ? TC.slab : "#4A4638", color: TC.cream, fontSize: 13.5, fontWeight: 700, cursor: cart.length > 0 ? "pointer" : "not-allowed" }} className={urdu ? "rb-urdu" : ""}>{p.isEdit ? t("updateGatePass") : t("makeGatePass")}</button> </div> )} </ModalShell> ); } function PinPromptModal(p) { var s1 = React.useState(""), val = s1[0], setVal = s1[1]; var s2 = React.useState(""), err = s2[0], setErr = s2[1]; function submit() { if (!val) return; if (p.onSubmit(val)) { setErr(""); setVal(""); } else { setErr("Galat PIN"); setVal(""); } } return (<div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}><div style={{ background: TC.appBg2, borderRadius: 14, padding: 20, width: "100%", maxWidth: 320 }}><div style={{ fontSize: 15, fontWeight: 700, color: TC.cream, marginBottom: 10 }}>{p.title}</div><input type="password" inputMode="numeric" maxLength={6} value={val} onChange={function (e) { setVal(e.target.value.replace(/\D/g, "")); }} onKeyDown={function (e) { if (e.key === "Enter") submit(); }} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 18, letterSpacing: 4, textAlign: "center", marginBottom: 8 }} autoFocus />{err ? <div style={{ color: "#ff8a80", fontSize: 12, marginBottom: 8 }}>{err}</div> : null}<div style={{ display: "flex", gap: 8 }}><button onClick={p.onCancel} style={{ flex: 1, padding: 10, borderRadius: 8, border: "2px solid #3A362C", background: "transparent", color: "#A39C8A", fontWeight: 600 }}>Cancel</button><button onClick={submit} style={{ flex: 1, padding: 10, borderRadius: 8, border: "none", background: TC.stamp, color: TC.cream, fontWeight: 700 }}>Unlock</button></div></div></div>); }
function StartupPinGate(p) { var s1 = React.useState(""), val = s1[0], setVal = s1[1]; var s2 = React.useState(""), err = s2[0], setErr = s2[1]; function submit() { if (!val) return; if (p.onSubmit(val)) { setErr(""); setVal(""); } else { setErr("Galat PIN"); setVal(""); } } return (<div style={{ position: "fixed", inset: 0, background: TC.appBg, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}><div style={{ background: TC.appBg2, borderRadius: 14, padding: 24, width: "100%", maxWidth: 320, textAlign: "center" }}><div style={{ fontSize: 17, fontWeight: 700, color: TC.cream, marginBottom: 4 }}>Raees Builder</div><div style={{ fontSize: 13, color: "#A39C8A", marginBottom: 16 }}>{p.deviceLocked ? "User PIN darj karein" : "Login karne ke liye apna PIN darj karein"}</div><input type="password" inputMode="numeric" maxLength={6} value={val} onChange={function (e) { setVal(e.target.value.replace(/\D/g, "")); }} onKeyDown={function (e) { if (e.key === "Enter") submit(); }} style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "2px solid #3A362C", background: "transparent", color: TC.cream, fontSize: 20, letterSpacing: 6, textAlign: "center", marginBottom: 10 }} autoFocus />{err ? <div style={{ color: "#ff8a80", fontSize: 12, marginBottom: 10 }}>{err}</div> : null}<button onClick={submit} style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: TC.stamp, color: TC.cream, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Login</button>{p.deviceLocked ? (<button onClick={p.onUnlockRequest} style={{ width: "100%", padding: 8, marginTop: 10, border: "none", background: "transparent", color: "#6B6656", fontSize: 11.5, cursor: "pointer", textDecoration: "underline" }}>Admin? Is device ko unlock karein</button>) : null}</div></div>); }

function RaeesBuilderApp() {
  var la = React.useState(function () { var pr = rbGet("prefs", {}); return pr.lang || "en"; }), lang = la[0], setLang = la[1];
  var ro = React.useState(function () { var sr = sessionStorage.getItem(RB_SESSION_ROLE_KEY); if (sr === "admin" || sr === "accountant") return sr; var pr = rbGet("prefs", {}); return pr.role || "admin"; }), role = ro[0], setRole = ro[1]; var pm = React.useState(function () { var pr = rbGet("prefs", {}); return Object.assign({}, DEFAULT_PERMISSIONS, pr.permissions || {}); }), permissions = pm[0], setPermissions = pm[1]; function can(feature) { return hasPerm(role, permissions, feature); } function togglePermission(feature, value) { setPermissions(function (prev) { var next = Object.assign({}, prev); next[feature] = value; return next; }); } var secS = React.useState(function () { return rbGet("security", {}); }), security = secS[0], setSecurity = secS[1]; function setUserPin(pin) { var next = Object.assign({}, security, { userPin: pin }); setSecurity(next); rbSet("security", next); showToast("PIN save ho gaya"); } function setAdminPin(pin) { var next2 = Object.assign({}, security, { adminPin: pin }); setSecurity(next2); rbSet("security", next2); showToast("PIN save ho gaya"); }
  var pmS = React.useState(false), pinModalOpen = pmS[0], setPinModalOpen = pmS[1];
  function confirmUserPin(pin) { var sec = rbGet("security", {}); if (sec.userPin && pin === sec.userPin) { sessionStorage.setItem(RB_SESSION_ROLE_KEY, "accountant"); setRole("accountant"); if (tab === "wastage") setTab("sale"); setPinModalOpen(false); return true; } return false; }
  var apmS = React.useState(false), adminPinModalOpen = apmS[0], setAdminPinModalOpen = apmS[1];
  function confirmAdminPin(pin) { if (deviceLocked) return false; var sec = rbGet("security", {}); if (sec.adminPin && pin === sec.adminPin) { sessionStorage.setItem(RB_SESSION_ROLE_KEY, "admin"); setRole("admin"); setAdminPinModalOpen(false); return true; } return false; }
  var dlS = React.useState(function () { return !!rbGet("deviceLock", false); }), deviceLocked = dlS[0], setDeviceLocked = dlS[1];
  window.RB_LOCK_ROLE = deviceLocked ? "accountant" : null;
  function lockDeviceToUser() {
    var sec = rbGet("security", {});
    if (!sec.adminPin) { showToast("Pehle Admin PIN set karein"); return; }
    rbSet("deviceLock", true);
    setDeviceLocked(true);
    window.RB_LOCK_ROLE = "accountant";
    sessionStorage.setItem(RB_SESSION_ROLE_KEY, "accountant");
    setRole("accountant");
    if (tab === "wastage") setTab("sale");
    showToast("Ye device ab sirf User ke liye lock ho gaya");
  }
  var duS = React.useState(false), deviceUnlockOpen = duS[0], setDeviceUnlockOpen = duS[1];
  function confirmDeviceUnlock(pin) {
    var sec = rbGet("security", {});
    if (sec.adminPin && pin === sec.adminPin) {
      rbSet("deviceLock", false);
      setDeviceLocked(false);
      window.RB_LOCK_ROLE = null;
      setDeviceUnlockOpen(false);
      return true;
    }
    return false;
  }
  var gwS = React.useState(function () { var sec = rbGet("security", {}); var sr = sessionStorage.getItem(RB_SESSION_ROLE_KEY); return !!(sec.adminPin && sr !== "admin" && sr !== "accountant"); }), gateOpen = gwS[0], setGateOpen = gwS[1];
  function confirmStartupPin(pin) {
    var sec = rbGet("security", {});
    if (!deviceLocked && sec.adminPin && pin === sec.adminPin) { sessionStorage.setItem(RB_SESSION_ROLE_KEY, "admin"); setRole("admin"); setGateOpen(false); return true; }
    if (sec.userPin && pin === sec.userPin) { sessionStorage.setItem(RB_SESSION_ROLE_KEY, "accountant"); setRole("accountant"); if (tab === "wastage") setTab("sale"); setGateOpen(false); return true; }
    return false;
  }
  function logoutSession() { sessionStorage.removeItem(RB_SESSION_ROLE_KEY); setPinModalOpen(false); setAdminPinModalOpen(false); setGateOpen(true); }
  var tb = React.useState("sale"), tab = tb[0], setTab = tb[1];
  var sl = React.useState(function () { return rbGet("stock-log", []); }), stockLog = sl[0], setStockLog = sl[1];
  var sa = React.useState(function () { return rbGet("sales", []); }), sales = sa[0], setSales = sa[1];
  var ns = React.useState(function () { return rbGet("next-serial", 1); }), nextSerial = ns[0], setNextSerial = ns[1];
  var gpS = React.useState(function () { return rbGet("gate-passes", []); }), gatePasses = gpS[0], setGatePasses = gpS[1];
  var wl = React.useState(function () { return rbGet("wastage-log", []); }), wastageLog = wl[0], setWastageLog = wl[1];
  var cl = React.useState(function () { return rbGet("conversion-log", []); }), conversionLog = cl[0], setConversionLog = cl[1];
  var cv = React.useState(function () { return rbGet("custom-variants", { garden: [], slab: [] }); }), customVariants = cv[0], setCustomVariants = cv[1];
  var alS = React.useState(function () { return rbGet("activity-log", []); }), activityLog = alS[0], setActivityLog = alS[1];
  var rlS = React.useState(function () { return rbGet("returns", []); }), returnLog = rlS[0], setReturnLog = rlS[1];
  var rfS = React.useState(null), returnFor = rfS[0], setReturnFor = rfS[1];
  var vb = React.useState(null), viewingBill = vb[0], setViewingBill = vb[1];
  var vr = React.useState(null), viewingReceipt = vr[0], setViewingReceipt = vr[1];
  var vg = React.useState(null), viewingGatePass = vg[0], setViewingGatePass = vg[1];
  var gb = React.useState(null), gatePassBuilderFor = gb[0], setGatePassBuilderFor = gb[1];
  var ge = React.useState(null), gatePassEditTarget = ge[0], setGatePassEditTarget = ge[1];
  var esS = React.useState(null), editingSale = esS[0], setEditingSale = esS[1];
  var ts = React.useState(""), toast = ts[0], setToast = ts[1];
  var toastRef = React.useRef(0);

  React.useEffect(function () { rbSet("prefs", { lang: lang, role: role, permissions: permissions }); }, [lang, role, permissions]);
  React.useEffect(function () { rbSet("stock-log", stockLog); }, [stockLog]);
  React.useEffect(function () { rbSet("sales", sales); }, [sales]);
  React.useEffect(function () { rbSet("next-serial", nextSerial); }, [nextSerial]);
  React.useEffect(function () { rbSet("gate-passes", gatePasses); }, [gatePasses]);
  React.useEffect(function () { rbSet("wastage-log", wastageLog); }, [wastageLog]);
  React.useEffect(function () { rbSet("conversion-log", conversionLog); }, [conversionLog]);
  React.useEffect(function () { rbSet("custom-variants", customVariants); }, [customVariants]);
  React.useEffect(function () { rbSet("activity-log", activityLog); }, [activityLog]);
  React.useEffect(function () { rbSet("returns", returnLog); }, [returnLog]);

  function t(k) {
    var dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    return dict[k] || k;
  }
  var dir = lang === "ur" ? "rtl" : "ltr";

  function showToast(msg) {
    setToast(msg);
    window.clearTimeout(toastRef.current);
    toastRef.current = window.setTimeout(function () { setToast(""); }, 2200);
  }

  function logActivity(type, detail) {
    var entry = { id: rbUid(), role: role, type: type, detail: detail, date: rbToday(), createdAt: new Date().toISOString() };
    setActivityLog(function (a) { return [entry].concat(a).slice(0, 300); });
  }

  function saveReturn(sale, retItems, reason) {
    var amount = retItems.reduce(function (a, it) { return a + Number(it.amount || 0); }, 0);
    var entry = { id: rbUid(), saleId: sale.id, serial: sale.serial, customerName: sale.customerName,
      date: rbToday(), reason: reason || "", items: retItems, amount: amount, createdBy: role };
    setReturnLog(function (a) { return [entry].concat(a); });
    setSales(function (list) {
      return list.map(function (x) {
        if (x.id !== sale.id) return x;
        var newItemsTotal = Math.max(0, Number(x.itemsTotal || 0) - amount);
        var newTotal = Math.max(0, Number(x.totalBill || 0) - amount);
        var newAdvance = Math.min(newTotal, Number(x.advance || 0));
        return Object.assign({}, x, { itemsTotal: newItemsTotal, totalBill: newTotal, advance: newAdvance,
          dues: Math.max(0, newTotal - newAdvance), returnedTotal: Number(x.returnedTotal || 0) + amount });
      });
    });
    setReturnFor(null);
    showToast(t("returnSaved"));
    logActivity("return_created", sale.customerName + " - Rs " + rbMoney(amount));
  }

  var stockTotals = React.useMemo(function () {
    var added = { garden: {}, slab: {} };
    stockLog.forEach(function (e) {
      if (!added[e.category]) return;
      added[e.category][e.variant] = (added[e.category][e.variant] || 0) + Number(e.qty || 0);
    });
    var sold = { garden: {}, slab: {} };
    gatePasses.forEach(function (g) {
      (g.items || []).forEach(function (it) {
        if (it.category === "garden" || it.category === "slab") {
          sold[it.category][it.variant] = (sold[it.category][it.variant] || 0) + Number(it.qty || 0);
        }
      });
    });
    var wasted = { garden: {}, slab: {} };
    wastageLog.forEach(function (w) {
      if (!wasted[w.category]) return;
      wasted[w.category][w.variant] = (wasted[w.category][w.variant] || 0) + Number(w.qty || 0);
    });
    var convertedOut = { garden: {}, slab: {} };
    var convertedIn = { garden: {}, slab: {} };
    conversionLog.forEach(function (c) {
      if (!convertedOut[c.category]) return;
      convertedOut[c.category][c.fromVariant] = (convertedOut[c.category][c.fromVariant] || 0) + Number(c.qty || 0);
      convertedIn[c.category][c.toVariant] = (convertedIn[c.category][c.toVariant] || 0) + Number(c.qty || 0);
    });
    returnLog.forEach(function (r) {
      (r.items || []).forEach(function (it) {
        if (sold[it.category]) sold[it.category][it.variant] = (sold[it.category][it.variant] || 0) - Number(it.qty || 0);
      });
    });
    return { added: added, sold: sold, wasted: wasted, convertedOut: convertedOut, convertedIn: convertedIn };
  }, [stockLog, gatePasses, wastageLog, conversionLog, returnLog]);

  function remainingFor(category, variant) {
    var added = stockTotals.added[category][variant] || 0;
    var sold = stockTotals.sold[category][variant] || 0;
    var wasted = stockTotals.wasted[category][variant] || 0;
    var cOut = stockTotals.convertedOut[category][variant] || 0;
    var cIn = stockTotals.convertedIn[category][variant] || 0;
    return added + cIn - sold - wasted - cOut;
  }

  function uniqSorted(category, base, extra) {
    var all = base.concat(extra || []);
    var out = [];
    all.forEach(function (v) { if (out.indexOf(v) < 0) out.push(v); });
    return out.sort(function (a, b) { var aLabeled = !!variantCustomLabel(category, a); var bLabeled = !!variantCustomLabel(category, b); if (aLabeled !== bLabeled) return aLabeled ? 1 : -1; return Number(a) - Number(b); });
  }
  var gardenVariants = uniqSorted("garden", GARDEN_LENGTHS, customVariants.garden);
  var slabVariants = uniqSorted("slab", SLAB_SIZES, customVariants.slab);
  function variantsFor(category) { return category === "garden" ? gardenVariants : slabVariants; }

  function upsertGatePass(sale, items, type, listOverride) {
    var list = listOverride || gatePasses;
    var existing = null;
    list.forEach(function (g) { if (g.saleId === sale.id) existing = g; });
    var entry = existing
      ? Object.assign({}, existing, { items: items, customerName: sale.customerName, date: sale.date, serial: sale.serial, type: type || existing.type, mobile: sale.mobile })
      : { id: rbUid(), saleId: sale.id, serial: sale.serial, customerName: sale.customerName, date: sale.date, items: items, type: type, mobile: sale.mobile, createdBy: role, createdAt: new Date().toISOString() };
    var next = existing
      ? list.map(function (g) { return g.saleId === sale.id ? entry : g; })
      : [entry].concat(list);
    setGatePasses(next);
    return next;
  }

  function createGatePassFromBuilder(sale, items) {
    upsertGatePass(sale, items, "customized");
    setGatePassBuilderFor(null);
    setViewingGatePass({ sale: sale, items: items });
    showToast(t("makeGatePass"));
    logActivity("gatepass_created", sale.customerName + " — #" + sale.serial);
  }

  function saveGatePassEdit(entry, items) {
    var next = gatePasses.map(function (g) { return g.id === entry.id ? Object.assign({}, g, { items: items }) : g; });
    setGatePasses(next);
    setGatePassEditTarget(null);
    setViewingGatePass({ sale: { customerName: entry.customerName, date: entry.date, serial: entry.serial, type: entry.type, mobile: entry.mobile }, items: items });
    showToast(t("billUpdated"));
    logActivity("gatepass_created", entry.customerName + " — #" + entry.serial + " (" + t("edit") + ")");
  }

  function remainingForExcludingEntry(entry) {
    return function (category, variant) {
      var base = remainingFor(category, variant);
      var already = (entry.items || []).filter(function (it) { return it.category === category && it.variant === variant; })
        .reduce(function (s, it) { return s + Number(it.qty || 0); }, 0);
      return base + already;
    };
  }

  function handleRoleChange(r) {
    if (deviceLocked && r === "admin") return;
    var sec0 = rbGet("security", {});
    if (r === "accountant" && role !== "accountant") {
      var unlockedUser = sessionStorage.getItem(RB_SESSION_ROLE_KEY) === "accountant";
      if (sec0.userPin && !unlockedUser) { setPinModalOpen(true); return; }
    }
    if (r === "admin" && role !== "admin") {
      var unlockedAdmin = sessionStorage.getItem(RB_SESSION_ROLE_KEY) === "admin";
      if (sec0.adminPin && !unlockedAdmin) { setAdminPinModalOpen(true); return; }
    }
    sessionStorage.setItem(RB_SESSION_ROLE_KEY, r);
    setRole(r);
    if (r === "accountant" && tab === "wastage") setTab("sale");
  }

  function addStockEntry(category, variant, qty, date) {
    var entry = { id: rbUid(), category: category, variant: variant, qty: Number(qty) || 0, date: date || rbToday() };
    setStockLog(function (a) { return [entry].concat(a); });
    showToast(t("stockUpdated"));
    logActivity("stock_added", variantLabel(t, category, variant) + " +" + entry.qty);
  }
function editStockEntry(id, qty, date) {
    setStockLog(function (a) { return a.map(function (e) { return e.id === id ? Object.assign({}, e, { qty: Number(qty) || 0, date: date || e.date }) : e; }); });
    showToast(t("stockUpdated"));
    logActivity("stock_edited", id);
  }

  function deleteStockEntry(id) {
    setStockLog(function (a) { return a.filter(function (e) { return e.id !== id; }); });
    showToast(t("stockUpdated"));
    logActivity("stock_deleted", id);
  }

  
  function addWastageEntry(category, variant, qty, date, reason) {
    var entry = { id: rbUid(), category: category, variant: variant, qty: Number(qty) || 0, date: date || rbToday(), reason: String(reason || "").trim() };
    setWastageLog(function (a) { return [entry].concat(a); });
    showToast(t("stockUpdated"));
    logActivity("wastage_logged", variantLabel(t, category, variant) + " -" + entry.qty);
  }

  function addConversionEntry(category, fromVariant, toVariant, qty, date) {
    var entry = { id: rbUid(), category: category, fromVariant: fromVariant, toVariant: toVariant, qty: Number(qty) || 0, date: date || rbToday() };
    setConversionLog(function (a) { return [entry].concat(a); });
    showToast(t("stockUpdated"));
    logActivity("stock_converted", variantLabel(t, category, fromVariant) + " → " + toVariant + " (" + entry.qty + ")");
  }

  function addCustomVariant(category, value, label) {
    var v = Number(value);
    if (!v || v <= 0) { showToast(t("invalidSize")); return; }
    var base = category === "garden" ? GARDEN_LENGTHS : SLAB_SIZES;
    var existing = customVariants[category] || [];
    if (base.indexOf(v) >= 0 || existing.indexOf(v) >= 0) { showToast(t("duplicateSize")); return; }
    var next = Object.assign({}, customVariants);
    next[category] = existing.concat([v]);
    setCustomVariants(next);
    var lbl = String(label || "").trim();
    if (lbl) {
      var allLabels = rbGet("variant-labels", {});
      var catLabels = Object.assign({}, allLabels[category] || {});
      catLabels[v] = lbl;
      var nextLabels = Object.assign({}, allLabels);
      nextLabels[category] = catLabels;
      rbSet("variant-labels", nextLabels);
    }
    logActivity("size_added", (category === "garden" ? t("garden") : t("slab")) + " " + v + (category === "garden" ? " ft" : "") + (lbl ? " " + lbl : ""));
    showToast(t("sizeAdded"));
  }

  function startEditSale(sale) {
    setEditingSale(sale);
    setViewingBill(null);
    setTab("sale");
  }

  function saveSale(sale) {
    if (sale.editId) {
      var updated = null;
      var nextSales = sales.map(function (s) {
        if (s.id !== sale.editId) return s;
        updated = Object.assign({}, s, {
          customerName: sale.customerName, date: sale.date, items: sale.items, mobile: sale.mobile,
          roofLabourRate: sale.roofLabourRate, labourTotal: sale.labourTotal,
          itemsTotal: sale.itemsTotal, totalBill: sale.totalBill, discount: sale.discount,
          advance: sale.advance, dues: sale.dues, paidInFull: sale.paidInFull
        });
        return updated;
      });
      setSales(nextSales);
      setEditingSale(null);
      showToast(t("billUpdated"));
      if (updated) {
        /* cash bill edit hone par uska gate pass bhi update ho jaye */
        if (updated.type === "cash") {
          upsertGatePass(updated, updated.items.map(function (it) {
            return { id: it.id, category: it.category, variant: it.variant, qty: it.qty, desc: it.desc };
          }), "cash");
        }
        setViewingBill(updated);
        logActivity("sale_edited", updated.customerName + " — #" + updated.serial);
      }
      return;
    }
    var serial = nextSerial;
    var payments = sale.advance > 0 ? [{ id: rbUid(), amount: sale.advance, date: sale.date }] : [];
    var full = Object.assign({}, sale, { id: rbUid(), serial: serial, payments: payments, createdBy: role, createdAt: new Date().toISOString() });
    setSales([full].concat(sales));
    setNextSerial(serial + 1);
    showToast(t("saleSaved"));
    logActivity("sale_created", full.customerName + " — #" + full.serial);
    if (full.type === "customized") {
      setGatePassBuilderFor(full);
    } else {
      var gpItems = full.items.map(function (it) {
        return { id: it.id, category: it.category, variant: it.variant, qty: it.qty, desc: it.desc };
      });
      upsertGatePass(full, gpItems, "cash");
      setViewingBill(full);
    }
  }

  function collectPayment(saleId, amount, date, discount) {
    var amt = Number(amount) || 0;
    var disc = Math.max(0, Number(discount) || 0);
    if (amt <= 0 && disc <= 0) return null;
    var updated = null;
    var nextSales = sales.map(function (s) {
      if (s.id !== saleId) return s;
      var newTotal = Math.max(0, Number(s.totalBill || 0) - disc);
      var newAdvance = Math.min(newTotal, (s.advance || 0) + amt);
      var newDues = Math.max(0, newTotal - newAdvance);
      var payments = (s.payments || []).concat([{ id: rbUid(), amount: amt, discount: disc, date: date || rbToday(), by: role }]);
      updated = Object.assign({}, s, { totalBill: newTotal, discount: Number(s.discount || 0) + disc, advance: newAdvance, dues: newDues, payments: payments });
      return updated;
    });
    setSales(nextSales);
    showToast(t("recordPayment"));
    if (updated) logActivity("payment_collected", updated.customerName + " — Rs " + rbMoney(amt));
    return updated;
  }

  function clearAllData() {
    if (role !== "admin") return;
    if (window.RB_ASK_ADMIN_PIN) { window.RB_ASK_ADMIN_PIN(doClearAllData); return; }
    doClearAllData();
  }

  function doClearAllData() {
    setStockLog([]); setSales([]); setNextSerial(1); setGatePasses([]);
    setWastageLog([]); setConversionLog([]); setCustomVariants({ garden: [], slab: [] }); setActivityLog([]);
    showToast(t("clearData"));
  }

  var duesCount = sales.filter(function (s) { return (s.dues || 0) > 0; }).length;

  var body = null;
  if (tab === "sale") {
    body = <NewSaleTab t={t} lang={lang} remainingFor={remainingFor} variantsFor={variantsFor} onSave={saveSale}
      editingSale={editingSale} onCancelEdit={function () { setEditingSale(null); }} />;
  } else if (tab === "bills") { body = <BillsTab t={t} sales={sales} gatePasses={gatePasses} onOpen={setViewingBill} canGatePass={can("gatePass")} canSeeSummary={can("billsSummary")} onMakeGatePass={function (sale) { setGatePassBuilderFor(sale); }} onViewGatePass={function (sale, entry) { setViewingGatePass({ sale: sale, items: entry.items, entry: entry }); }} />; } else if (tab === "stock") {
    body = can("stock") ? <StockTab t={t} canEdit={role === "admin"} stockLog={stockLog} stockTotals={stockTotals} remainingFor={remainingFor}
          variantsFor={variantsFor} onAddStock={addStockEntry} onAddVariant={addCustomVariant} onEditStock={editStockEntry} onDeleteStock={deleteStockEntry} />
      : <EmptyState icon={<Ico name="pkg" size={30} color={TC.concrete} />} text={t("accountantNoStock")} />;
  } else if (tab === "wastage") {
    body = can("wastage") ? <WastageTab t={t} stockTotals={stockTotals} remainingFor={remainingFor} variantsFor={variantsFor}
          wastageLog={wastageLog} onLogWastage={addWastageEntry} onConvertStock={addConversionEntry} />
      : <EmptyState icon={<Ico name="trash" size={30} color={TC.concrete} />} text={t("accountantNoStock")} />;
  } else if (tab === "gatepass") {
    body = <GatePassTab t={t} gatePasses={gatePasses} onOpen={function (g) {
      setViewingGatePass({ sale: { customerName: g.customerName, date: g.date, serial: g.serial, type: g.type, mobile: g.mobile }, items: g.items, entry: g });
    }} />;
  } else if (tab === "dues") {
    body = <DuesTab t={t} sales={sales} onOpen={setViewingBill} onCollect={collectPayment} onReceipt={setViewingReceipt} />;
  } else if (tab === "settings") {
    body = <SettingsTab t={t} lang={lang} role={role} onLang={setLang} onRole={handleRoleChange} permissions={permissions} onTogglePermission={togglePermission}
      onClear={clearAllData} activityLog={activityLog} security={security} onSetUserPin={setUserPin} onSetAdminPin={setAdminPin} onLockDevice={lockDeviceToUser} />;
  }

  if (gateOpen) {
    return (
      <React.Fragment>
        <StartupPinGate deviceLocked={deviceLocked} onSubmit={confirmStartupPin} onUnlockRequest={function () { setDeviceUnlockOpen(true); }} />
        {deviceUnlockOpen ? (<PinPromptModal title="Device unlock — Admin PIN darj karein" onSubmit={confirmDeviceUnlock} onCancel={function () { setDeviceUnlockOpen(false); }} />) : null}
      </React.Fragment>
    );
  }

  return (
    <div dir={dir} style={{ background: TC.appBg, minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>
      <FontLoader />
      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: TC.appBg, display: "flex", flexDirection: "column" }}>
        <AppHeader t={t} role={role} onLogout={security.adminPin ? logoutSession : null} />
        <div style={{ flex: 1, paddingBottom: 88 }}>{body}</div>
        <TabBar t={t} tab={tab} setTab={setTab} role={role} permissions={permissions} duesCount={duesCount} />
      </div>

      {pinModalOpen ? (<PinPromptModal title="User PIN darj karein" onSubmit={confirmUserPin} onCancel={function () { setPinModalOpen(false); }} />) : null}{adminPinModalOpen ? (<PinPromptModal title="Admin PIN darj karein" onSubmit={confirmAdminPin} onCancel={function () { setAdminPinModalOpen(false); }} />) : null}{returnFor ? (
        <ReturnModal t={t} sale={returnFor} onClose={function () { setReturnFor(null); }} onSave={saveReturn} />
      ) : null}

      {viewingBill ? (
        <BillModal t={t} lang={lang} role={role} permissions={permissions} sale={viewingBill} onClose={function () { setViewingBill(null); }}
          onEdit={startEditSale}
          onReturn={function (x) { setViewingBill(null); setReturnFor(x); }}
          gatePassEntry={(function () { var found = null; gatePasses.forEach(function (g) { if (g.saleId === viewingBill.id) found = g; }); return found; })()}
          onViewGatePass={function (sale) {
            var found = null;
            gatePasses.forEach(function (g) { if (g.saleId === sale.id) found = g; });
            if (found) setViewingGatePass({ sale: sale, items: found.items, entry: found });
            else setGatePassBuilderFor(sale);
          }} />
      ) : null}

      {gatePassBuilderFor ? (
        <GatePassBuilderModal t={t} lang={lang} sale={gatePassBuilderFor} remainingFor={remainingFor} variantsFor={variantsFor}
          onClose={function () { setGatePassBuilderFor(null); }}
          onCreate={function (items) { createGatePassFromBuilder(gatePassBuilderFor, items); }} />
      ) : null}

      {gatePassEditTarget ? (
        <GatePassBuilderModal t={t} lang={lang}
          sale={{ customerName: gatePassEditTarget.customerName, serial: gatePassEditTarget.serial }}
          remainingFor={remainingForExcludingEntry(gatePassEditTarget)} variantsFor={variantsFor}
          initialItems={gatePassEditTarget.items} isEdit
          onClose={function () { setGatePassEditTarget(null); }}
          onCreate={function (items) { saveGatePassEdit(gatePassEditTarget, items); }} />
      ) : null}

      {viewingGatePass ? (
        <GatePassModal t={t} lang={lang} role={role} permissions={permissions} sale={viewingGatePass.sale} items={viewingGatePass.items} entry={viewingGatePass.entry}
          onClose={function () { setViewingGatePass(null); }}
          onEdit={viewingGatePass.entry ? function () { setGatePassEditTarget(viewingGatePass.entry); setViewingGatePass(null); } : undefined} />
      ) : null}

      {viewingReceipt ? (
        <PaymentReceiptModal t={t} lang={lang} data={viewingReceipt} by={role} onClose={function () { setViewingReceipt(null); }} />
      ) : null}

      {toast ? (
        <div className="no-print" style={{
          position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)",
          background: TC.ink, color: TC.cream, padding: "9px 16px", borderRadius: 20,
          fontSize: 13, boxShadow: "0 4px 14px rgba(0,0,0,0.35)", zIndex: 9060,
          display: "flex", alignItems: "center", gap: 6
        }}>
          <Ico name="check" size={14} color={TC.success} /> {toast}
        </div>
      ) : null}
    </div>
  );
}

(function () {
  var host = document.getElementById("rb-root");
  if (!host) return;
  if (ReactDOM.createRoot) ReactDOM.createRoot(host).render(<RaeesBuilderApp />);
  else ReactDOM.render(<RaeesBuilderApp />, host);
})();
