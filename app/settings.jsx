/* Raees Builder App - Settings tab */

RB.SettingsTab = function (c) {
  var t = c.t;
  var st = c.settings;
  var up = function (k, v) {
    c.setSettings(function (o) {
      var n = Object.assign({}, o); n[k] = v; return n;
    });
  };

  var backup = function () {
    var data = {
      app: "raees-builder", version: 1, at: new Date().toISOString(),
      settings: c.settings, items: c.items, sales: c.sales,
      passes: c.passes, waste: c.waste, pays: c.pays,
      counters: c.counters, log: c.log
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "raees-builder-backup-" + RB.todayISO() + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  };

  var restore = function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var d = JSON.parse(String(fr.result));
        if (d.settings) c.setSettings(d.settings);
        if (d.items) c.setItems(d.items);
        if (d.sales) c.setSales(d.sales);
        if (d.passes) c.setPasses(d.passes);
        if (d.waste) c.setWaste(d.waste);
        if (d.pays) c.setPays(d.pays);
        if (d.counters) c.setCounters(d.counters);
        if (d.log) c.setLog(d.log);
        c.addLog("Backup restore");
        window.alert(t.save + " - " + t.records + ": " + ((d.sales || []).length));
      } catch (err) {
        window.alert("File error");
      }
    };
    fr.readAsText(file);
    e.target.value = "";
  };

  var wipe = function () {
    if (!window.confirm(t.clearMsg)) return;
    c.setItems(RB.seed());
    c.setSales([]);
    c.setPasses([]);
    c.setWaste([]);
    c.setPays([]);
    c.setCounters({ sale: 0, pass: 0, pay: 0 });
    c.setLog([]);
    RB.save("draft", { cust: "", phone: "", addr: "", date: RB.todayISO(), lines: [], disc: "", paid: "", note: "" });
    window.location.reload();
  };

  return (
    <div>
      <RB.Card title={t.language} icon="globe">
        <div className="rb-seg" style={{ marginBottom: 0 }}>
          <button className={st.lang === "ur" ? "on" : ""} onClick={function () { up("lang", "ur"); }}>Urdu</button>
          <button className={st.lang === "en" ? "on" : ""} onClick={function () { up("lang", "en"); }}>English</button>
        </div>
      </RB.Card>

      <RB.Card title={t.shopInfo} icon="home">
        <RB.Field label={t.shopName}>
          <RB.In value={st.shopName} onChange={function (v) { up("shopName", v); }} />
        </RB.Field>
        <RB.Field label={t.phone}>
          <RB.In im="tel" value={st.phone} onChange={function (v) { up("phone", v); }} />
        </RB.Field>
        <RB.Field label={t.address}>
          <RB.Area value={st.addr} onChange={function (v) { up("addr", v); }} />
        </RB.Field>
      </RB.Card>

      <RB.Card title={t.exportData} icon="dl">
        <RB.Btn block icon="dl" onClick={backup}>{t.exportData}</RB.Btn>
        <label className="rb-btn rb-btn--block" style={{ marginTop: 8, cursor: "pointer" }}>
          <RB.Ic n="save" s={17} />
          <span>Restore</span>
          <input type="file" accept="application/json" style={{ display: "none" }} onChange={restore} />
        </label>
      </RB.Card>

      <RB.Card title={t.activity} icon="hist">
        {c.log.length === 0 ? <RB.Empty icon="hist" text={t.empty} /> : (
          <div className="rb-log">
            {c.log.slice(0, 60).map(function (x) {
              return (
                <div key={x.id}>
                  {x.text}
                  <span>{new Date(x.at).toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        )}
      </RB.Card>

      <RB.Card title={t.clearData} icon="alert">
        <RB.Btn block kind="danger" icon="waste" onClick={wipe}>{t.clearData}</RB.Btn>
        <p style={{ fontSize: 12, color: "#68758a", marginTop: 8, marginBottom: 0 }}>
          {t.clearMsg}
        </p>
      </RB.Card>
    </div>
  );
};
