/* Raees Builder App - shell, tabs and mount */

RB.PHONE = "03416106462";

RB.P.phone = "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z";

RB.App = function () {
  var settings = RB.usePersist("settings", { lang: "ur", shopName: "Raees Builder", phone: RB.PHONE, addr: "" });
  var items = RB.usePersist("items", []);
  var sales = RB.usePersist("sales", []);
  var passes = RB.usePersist("passes", []);
  var waste = RB.usePersist("waste", []);
  var pays = RB.usePersist("pays", []);
  var counters = RB.usePersist("counters", { sale: 0, pass: 0, pay: 0 });
  var log = RB.usePersist("log", []);
  var tab = React.useState("sale");

  React.useEffect(function () {
    if (!items[0] || items[0].length === 0) items[1](RB.seed());
    if (!settings[0].phone) {
      settings[1](function (o) { return Object.assign({}, o, { phone: RB.PHONE }); });
    }
  }, []);

  var t = RB.T[settings[0].lang] || RB.T.en;
  var tel = settings[0].phone || RB.PHONE;

  var addLog = function (text) {
    log[1](function (a) {
      return [{ id: RB.uid(), at: new Date().toISOString(), text: text }].concat(a).slice(0, 300);
    });
  };

  var c = {
    t: t,
    settings: settings[0], setSettings: settings[1],
    items: items[0], setItems: items[1],
    sales: sales[0], setSales: sales[1],
    passes: passes[0], setPasses: passes[1],
    waste: waste[0], setWaste: waste[1],
    pays: pays[0], setPays: pays[1],
    counters: counters[0], setCounters: counters[1],
    log: log[0], setLog: log[1],
    addLog: addLog,
    go: tab[1]
  };

  var TABS = [
    { k: "sale", l: t.tabSale, i: "sale" },
    { k: "stock", l: t.tabStock, i: "pkg" },
    { k: "waste", l: t.tabWaste, i: "waste" },
    { k: "pass", l: t.tabPass, i: "truck" },
    { k: "dues", l: t.tabDues, i: "wallet" },
    { k: "set", l: t.tabSet, i: "gear" }
  ];

  var body = null;
  if (tab[0] === "sale") body = <RB.NewSaleTab {...c} />;
  else if (tab[0] === "stock") body = <RB.StockTab {...c} />;
  else if (tab[0] === "waste") body = <RB.WastageTab {...c} />;
  else if (tab[0] === "pass") body = <RB.PassTab {...c} />;
  else if (tab[0] === "dues") body = <RB.DuesTab {...c} />;
  else body = <RB.SettingsTab {...c} />;

  var telStyle = {
    display: "inline-flex", alignItems: "center", gap: "6px",
    background: "rgba(255,255,255,.18)", color: "#fff",
    border: "1px solid rgba(255,255,255,.35)", borderRadius: "999px",
    padding: "6px 12px", fontSize: "13px", fontWeight: 700,
    textDecoration: "none", direction: "ltr", whiteSpace: "nowrap"
  };

  return (
    <div className="rb-app" dir={t.dir}>
      <div className="rb-top rb-noprint">
        <div>
          <h1>{settings[0].shopName || t.appName}</h1>
          <small>{t.sub}</small>
        </div>
        <div className="rb-top__acts">
          <a href={"tel:" + tel} style={telStyle} title={tel}>
            <RB.Ic n="phone" s={15} />
            <span>{tel}</span>
          </a>
          <RB.Btn sm icon="globe" title={t.language}
            onClick={function () {
              settings[1](function (o) {
                return Object.assign({}, o, { lang: o.lang === "ur" ? "en" : "ur" });
              });
            }}>{settings[0].lang === "ur" ? "EN" : "UR"}</RB.Btn>
        </div>
      </div>

      {body}

      <nav className="rb-tabs rb-noprint">
        {TABS.map(function (x) {
          return (
            <button key={x.k} className={tab[0] === x.k ? "on" : ""} onClick={function () { tab[1](x.k); }}>
              <RB.Ic n={x.i} s={20} />
              {x.l}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

(function () {
  var host = document.getElementById("rb-root");
  if (!host) return;
  host.innerHTML = "";
  if (ReactDOM.createRoot) {
    ReactDOM.createRoot(host).render(<RB.App />);
  } else {
    ReactDOM.render(<RB.App />, host);
  }
})();
