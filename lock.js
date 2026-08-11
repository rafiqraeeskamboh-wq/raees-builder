/* lock.js - Raees Builder: PIN lock for the sale & inventory app */
(function () {
  "use strict";
  var KEY = "rb2:lockHash";
  var SALT = "rb-lock-v1:";
  var SESSION = "rb2:unlocked";
  var root = document.getElementById("rb-root");
  if (!root) return;

  function hash(v) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(SALT + v)).then(function (b) {
      var out = "";
      new Uint8Array(b).forEach(function (x) { out += ("0" + x.toString(16)).slice(-2); });
      return out;
    });
  }

  var IN = "width:100%;box-sizing:border-box;padding:12px;margin-bottom:10px;border-radius:8px;border:1px solid #444;background:#111;color:#fff;text-align:center;font-size:18px;letter-spacing:6px";
  var BTN = "width:100%;padding:12px;border:0;border-radius:8px;background:#c0392b;color:#fff;font-weight:700;font-size:16px;cursor:pointer";

  function showPanel(mode, done) {
    var needOld = mode === "change";
    var needConfirm = mode !== "unlock";
    var wrap = document.createElement("div");
    wrap.id = "rb-lock";
    wrap.style.cssText = "max-width:400px;margin:40px auto;padding:24px;border-radius:14px;background:#1c1c1c;color:#f3ede4;font-family:system-ui,sans-serif;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.4)";
    wrap.innerHTML =
      '<div style="font-size:20px;font-weight:800;letter-spacing:1px">RAEES BUILDER</div>' +
      '<div id="lkMsg" style="margin:6px 0 18px;opacity:.8;font-size:14px"></div>' +
      (needOld ? '<input id="lkOld" type="password" inputmode="numeric" autocomplete="off" placeholder="Purana PIN" style="' + IN + '">' : "") +
      '<input id="lkP1" type="password" inputmode="numeric" autocomplete="off" placeholder="' + (mode === "unlock" ? "PIN" : "Naya PIN") + '" style="' + IN + '">' +
      (needConfirm ? '<input id="lkP2" type="password" inputmode="numeric" autocomplete="off" placeholder="PIN dobara" style="' + IN + '">' : "") +
      '<button id="lkBtn" style="' + BTN + '">' + (mode === "unlock" ? "Unlock" : "Save PIN") + '</button>' +
      (needOld ? '<button id="lkCancel" style="margin-top:8px;width:100%;padding:10px;border:0;border-radius:8px;background:#333;color:#ddd;cursor:pointer">Cancel</button>' : "") +
      '<div id="lkErr" style="margin-top:10px;color:#ff8a80;font-size:13px;min-height:18px"></div>';
    root.parentNode.insertBefore(wrap, root);

    function q(sel) { return wrap.querySelector(sel); }
    q("#lkMsg").textContent = mode === "setup" ? "Pehli baar: apna naya PIN set karein"
      : (mode === "unlock" ? "App kholne ke liye PIN daalein" : "PIN tabdeel karein");

    var fails = 0;
    function err(m) { q("#lkErr").textContent = m; }
    function finish() { wrap.remove(); done(); }

    q("#lkBtn").onclick = function () {
      var v = q("#lkP1").value.trim();
      err("");
      if (mode === "unlock") {
        hash(v).then(function (h) {
          if (h === localStorage.getItem(KEY)) { finish(); return; }
          fails++;
          q("#lkP1").value = "";
          if (fails >= 5) {
            q("#lkBtn").disabled = true;
            err("5 ghalat koshishein - 30 second rukein");
            setTimeout(function () { q("#lkBtn").disabled = false; fails = 0; err(""); }, 30000);
          } else {
            err("Ghalat PIN");
          }
        });
        return;
      }
      if (v.length < 4) { err("PIN kam az kam 4 digit ka ho"); return; }
      if (v !== q("#lkP2").value.trim()) { err("Dono PIN match nahi kar rahe"); return; }
      if (mode === "change") {
        hash(q("#lkOld").value.trim()).then(function (h) {
          if (h !== localStorage.getItem(KEY)) { err("Purana PIN ghalat hai"); return; }
          hash(v).then(function (nh) { localStorage.setItem(KEY, nh); finish(); });
        });
        return;
      }
      hash(v).then(function (nh) { localStorage.setItem(KEY, nh); finish(); });
    };

    if (needOld) { q("#lkCancel").onclick = function () { wrap.remove(); done(); }; }
    wrap.addEventListener("keydown", function (e) { if (e.key === "Enter") { q("#lkBtn").click(); } });
    (q("#lkOld") || q("#lkP1")).focus();
  }

  function addChangeBtn() {
    if (document.getElementById("lkChange")) return;
    var b = document.createElement("button");
    b.id = "lkChange";
    b.textContent = "PIN change";
    b.style.cssText = "display:block;margin:10px auto 24px;padding:6px 14px;border:1px solid #555;border-radius:8px;background:transparent;color:#888;font-size:12px;cursor:pointer";
    root.parentNode.insertBefore(b, root.nextSibling);
    b.onclick = function () {
      root.style.display = "none";
      b.style.display = "none";
      showPanel("change", function () { root.style.display = ""; b.style.display = "block"; });
    };
  }

  function unlocked() {
    sessionStorage.setItem(SESSION, "1");
    root.style.display = "";
    addChangeBtn();
  }

  if (localStorage.getItem(KEY) && sessionStorage.getItem(SESSION) === "1") { addChangeBtn(); return; }
  root.style.display = "none";
  showPanel(localStorage.getItem(KEY) ? "unlock" : "setup", unlocked);
})();
