/* Raees Builder App - shell, tabs and mount */

RB.App = function () {
  var settings = RB.usePersist("settings", { lang: "ur", shopName: "Raees Builder", phone: "", addr: "" });
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
  }, []);

  var t = RB.T[settings[0].lang] || RB.T.en;

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

  return (
    <div className="rb-app" dir={t.dir}>
      <div className="rb-top rb-noprint">
        <div>
          <h1>{settings[0].shopName || t.appName}</h1>
          <small>{t.sub}</small>
        </div>
        <div className="rb-top__acts">
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
