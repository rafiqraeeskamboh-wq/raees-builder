/* lock.js - Raees Builder: alag alag login (Admin / Accountant) */
(function () {
  "use strict";
  var K = { admin: "rb2:pin:admin", accountant: "rb2:pin:accountant" };
  var K_OLD = "rb2:lockHash";
  var SESSION = "rb2:session-role";
  var SALT = "rb-lock-v1:";
  var root = document.getElementById("rb-root");
  if (!root) return;

  var old = localStorage.getItem(K_OLD);
  if (old && !localStorage.getItem(K.admin)) {
    localStorage.setItem(K.admin, old);
    localStorage.removeItem(K_OLD);
  }

  function hash(v) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(SALT + v)).then(function (b) {
      var out = "";
      new Uint8Array(b).forEach(function (x) { out += ("0" + x.toString(16)).slice(-2); });
      return out;
    });
  }

  function setPrefsRole(role) {
    var p = {};
    try { p = JSON.parse(localStorage.getItem("rb2:prefs") || "{}") || {}; } catch (e) { p = {}; }
    p.role = role;
    localStorage.setItem("rb2:prefs", JSON.stringify(p));
  }

  var CARD = "max-width:400px;margin:40px auto;padding:24px;border-radius:14px;background:#1c1c1c;color:#f3ede4;font-family:system-ui,sans-serif;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.4)";
  var IN = "width:100%;box-sizing:border-box;padding:12px;margin-bottom:10px;border-radius:8px;border:1px solid #444;background:#111;color:#fff;text-align:center;font-size:18px;letter-spacing:6px";
  var B1 = "width:100%;padding:12px;margin-bottom:8px;border:0;border-radius:8px;background:#c0392b;color:#fff;font-weight:700;font-size:15px;cursor:pointer";
  var B2 = "width:100%;padding:10px;margin-bottom:8px;border:1px solid #555;border-radius:8px;background:transparent;color:#ccc;font-size:14px;cursor:pointer";

  function card(html) {
    var w = document.createElement("div");
    w.id = "rb-lock";
    w.style.cssText = CARD;
    w.innerHTML = '<div style="font-size:20px;font-weight:800;letter-spacing:1px;margin-bottom:4px">RAEES BUILDER</div>'
      + html
      + '<div id="lkErr" style="margin-top:8px;color:#ff8a80;font-size:13px;min-height:18px"></div>';
    root.parentNode.insertBefore(w, root);
    return w;
  }
  function clearCard() { var e = document.getElementById("rb-lock"); if (e) e.remove(); }
  function msg(txt) { return '<div style="margin:0 0 16px;opacity:.8;font-size:14px">' + txt + '</div>'; }
  function inp(id, ph) { return '<input id="' + id + '" type="password" inputmode="numeric" autocomplete="off" placeholder="' + ph + '" style="' + IN + '">'; }
  function btn(id, label, st) { return '<button id="' + id + '" style="' + st + '">' + label + '</button>'; }

  /* ---------- login ---------- */
  function login() {
    var w = card(msg("Login - apna PIN daalein") + inp("lkP1", "PIN") + btn("lkGo", "Login", B1));
    var e = w.querySelector("#lkErr"), p1 = w.querySelector("#lkP1"), go = w.querySelector("#lkGo");
    var fails = 0;
    p1.focus();
    go.onclick = function () {
      e.textContent = "";
      hash(p1.value.trim()).then(function (h) {
        var role = null;
        if (h === localStorage.getItem(K.admin)) role = "admin";
        else if (h === localStorage.getItem(K.accountant)) role = "accountant";
        if (role) {
          sessionStorage.setItem(SESSION, role);
          setPrefsRole(role);
          location.reload();
          return;
        }
        fails++;
        p1.value = "";
        if (fails >= 5) {
          go.disabled = true;
          e.textContent = "5 ghalat koshishein - 30 second rukein";
          setTimeout(function () { go.disabled = false; fails = 0; e.textContent = ""; }, 30000);
        } else {
          e.textContent = "Ghalat PIN";
        }
      });
    };
    w.addEventListener("keydown", function (ev) { if (ev.key === "Enter") go.click(); });
  }

  /* ---------- pehli baar ---------- */
  function setupAdmin() {
    var w = card(msg("Pehli baar: ADMIN ka PIN set karein") + inp("lkP1", "Admin PIN") + inp("lkP2", "PIN dobara") + btn("lkGo", "Save Admin PIN", B1));
    var e = w.querySelector("#lkErr"), go = w.querySelector("#lkGo");
    go.onclick = function () {
      var v = w.querySelector("#lkP1").value.trim();
      e.textContent = "";
      if (v.length < 4) { e.textContent = "PIN kam az kam 4 digit ka ho"; return; }
      if (v !== w.querySelector("#lkP2").value.trim()) { e.textContent = "Dono PIN match nahi kar rahe"; return; }
      hash(v).then(function (h) { localStorage.setItem(K.admin, h); clearCard(); setupAcct(); });
    };
    w.querySelector("#lkP1").focus();
    w.addEventListener("keydown", function (ev) { if (ev.key === "Enter") go.click(); });
  }

  function setupAcct() {
    var w = card(msg("Ab ACCOUNTANT ka PIN set karein (baad mein bhi ho sakta hai)") + inp("lkP1", "Accountant PIN") + inp("lkP2", "PIN dobara") + btn("lkGo", "Save Accountant PIN", B1) + btn("lkSkip", "Abhi nahi", B2));
    var e = w.querySelector("#lkErr"), go = w.querySelector("#lkGo");
    function done() { sessionStorage.setItem(SESSION, "admin"); setPrefsRole("admin"); location.reload(); }
    go.onclick = function () {
      var v = w.querySelector("#lkP1").value.trim();
      e.textContent = "";
      if (v.length < 4) { e.textContent = "PIN kam az kam 4 digit ka ho"; return; }
      if (v !== w.querySelector("#lkP2").value.trim()) { e.textContent = "Dono PIN match nahi kar rahe"; return; }
      hash(v).then(function (h) {
        if (h === localStorage.getItem(K.admin)) { e.textContent = "Admin wala PIN use na karein"; return; }
        localStorage.setItem(K.accountant, h);
        done();
      });
    };
    w.querySelector("#lkSkip").onclick = done;
    w.querySelector("#lkP1").focus();
    w.addEventListener("keydown", function (ev) { if (ev.key === "Enter") go.click(); });
  }

  /* ---------- PIN settings (sirf admin) ---------- */
  function pinMenu(back) {
    var w = card(msg("PIN settings") + btn("lkA", "Admin PIN change", B1) + btn("lkB", "Accountant PIN set / change", B1) + btn("lkX", "Wapas", B2));
    w.querySelector("#lkA").onclick = function () { clearCard(); changePin("admin", back); };
    w.querySelector("#lkB").onclick = function () { clearCard(); changePin("accountant", back); };
    w.querySelector("#lkX").onclick = function () { clearCard(); back(); };
  }

  function changePin(which, back) {
    var label = which === "admin" ? "ADMIN" : "ACCOUNTANT";
    var w = card(msg(label + " ka naya PIN") + inp("lkOld", "Admin PIN (tasdeeq)") + inp("lkP1", "Naya PIN") + inp("lkP2", "PIN dobara") + btn("lkGo", "Save", B1) + btn("lkX", "Cancel", B2));
    var e = w.querySelector("#lkErr"), go = w.querySelector("#lkGo");
    go.onclick = function () {
      var v = w.querySelector("#lkP1").value.trim();
      e.textContent = "";
      if (v.length < 4) { e.textContent = "PIN kam az kam 4 digit ka ho"; return; }
      if (v !== w.querySelector("#lkP2").value.trim()) { e.textContent = "Dono PIN match nahi kar rahe"; return; }
      hash(w.querySelector("#lkOld").value.trim()).then(function (oh) {
        if (oh !== localStorage.getItem(K.admin)) { e.textContent = "Admin PIN ghalat hai"; return; }
        hash(v).then(function (nh) {
          var other = which === "admin" ? K.accountant : K.admin;
          if (nh === localStorage.getItem(other)) { e.textContent = "Dono roles ka PIN alag rakhein"; return; }
          localStorage.setItem(K[which], nh);
          clearCard();
          back();
        });
      });
    };
    w.querySelector("#lkX").onclick = function () { clearCard(); back(); };
    w.querySelector("#lkOld").focus();
    w.addEventListener("keydown", function (ev) { if (ev.key === "Enter") go.click(); });
  }

  /* ---------- login ke baad chhoti si bar ---------- */
  function toolbar(role) {
    if (document.getElementById("lkBar")) return;
    var bar = document.createElement("div");
    bar.id = "lkBar";
    bar.style.cssText = "max-width:480px;margin:10px auto 24px;display:flex;gap:8px;justify-content:center;font-family:system-ui,sans-serif";
    var BS = "padding:6px 12px;border:1px solid #555;border-radius:8px;background:transparent;color:#888;font-size:12px;cursor:pointer";
    bar.innerHTML = '<span style="padding:6px 12px;border-radius:8px;background:#2a2a2a;color:#bbb;font-size:12px">' + (role === "admin" ? "ADMIN" : "ACCOUNTANT") + '</span>'
      + (role === "admin" ? '<button id="lkPins" style="' + BS + '">PIN settings</button>' : "")
      + '<button id="lkOut" style="' + BS + '">Logout</button>';
    root.parentNode.insertBefore(bar, root.nextSibling);
    bar.querySelector("#lkOut").onclick = function () { sessionStorage.removeItem(SESSION); location.reload(); };
    var pins = bar.querySelector("#lkPins");
    if (pins) {
      pins.onclick = function () {
        root.style.display = "none";
        bar.style.display = "none";
        pinMenu(function () { root.style.display = ""; bar.style.display = "flex"; });
      };
    }
  }

  /* ---------- doosri jagah se admin PIN maangne ke liye ---------- */
  window.RB_ASK_ADMIN_PIN = function (onOk) {
    var bar = document.getElementById("lkBar");
    root.style.display = "none";
    if (bar) bar.style.display = "none";
    function back() { root.style.display = ""; if (bar) bar.style.display = "flex"; }
    var w = card(msg("Ye kaam sirf Admin kar sakta hai - Admin PIN daalein") + inp("lkOld", "Admin PIN") + btn("lkGo", "Confirm", B1) + btn("lkX", "Cancel", B2));
    var e = w.querySelector("#lkErr"), go = w.querySelector("#lkGo");
    go.onclick = function () {
      e.textContent = "";
      hash(w.querySelector("#lkOld").value.trim()).then(function (h) {
        if (h !== localStorage.getItem(K.admin)) { e.textContent = "Admin PIN ghalat hai"; return; }
        clearCard();
        back();
        onOk();
      });
    };
    w.querySelector("#lkX").onclick = function () { clearCard(); back(); };
    w.querySelector("#lkOld").focus();
    w.addEventListener("keydown", function (ev) { if (ev.key === "Enter") go.click(); });
  };

  var session = sessionStorage.getItem(SESSION);
  if (session && localStorage.getItem(K[session])) {
    window.RB_LOCK_ROLE = session;
    setPrefsRole(session);
    toolbar(session);
    return;
  }
  sessionStorage.removeItem(SESSION);
  root.style.display = "none";
  if (localStorage.getItem(K.admin)) { login(); } else { setupAdmin(); }
})();
