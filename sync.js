/* sync.js - Raees Builder
   Aik hi login (Firebase). Dono phone hamesha aik hi data dekhte hain.
   Purana PIN wala lock.js ab load nahi hota. */
(function () {
  "use strict";

  var root = document.getElementById("rb-root");
  if (!root) return;

  var CFG = {
    apiKey: "AIzaSyCfHmLTv04A7eogFgTV9x6oPtuZfoSrPqo",
    authDomain: "raees-builder.firebaseapp.com",
    projectId: "raees-builder",
    storageBucket: "raees-builder.firebasestorage.app",
    messagingSenderId: "344962195185",
    appId: "1:344962195185:web:6f12bf2f289d95c99b9350"
  };

  var SDK = "https://www.gstatic.com/firebasejs/10.12.5/";

  /* ye keys sirf isi phone ki hain - cloud pe nahi jatin */
  var SKIP = {
    "rb2:prefs": 1,
    "rb2:device-id": 1,
    "rb2:session-role": 1,
    "rb2:pin:admin": 1,
    "rb2:pin:accountant": 1,
    "rb2:lockHash": 1,
    "rb:draft": 1
  };

  var rawSet = localStorage.setItem.bind(localStorage);
  var rawDel = localStorage.removeItem.bind(localStorage);

  var DEV = localStorage.getItem("rb2:device-id");
  if (!DEV) {
    DEV = Math.random().toString(36).slice(2) + Date.now().toString(36);
    rawSet("rb2:device-id", DEV);
  }

  var lastTouch = 0;
  window.addEventListener("keydown", function () { lastTouch = Date.now(); }, true);
  window.addEventListener("pointerdown", function () { lastTouch = Date.now(); }, true);

  function isShared(k) {
    if (!k || SKIP[k]) return false;
    return k.indexOf("rb2:") === 0 || k.indexOf("rb:") === 0;
  }
  function toId(k) { return k.split(":").join("__"); }
  function toKey(id) { return id.split("__").join(":"); }

  /* ---------- chhoti si UI ---------- */
  var CARD = "max-width:400px;margin:40px auto;padding:24px;border-radius:14px;background:#1c1c1c;color:#f3ede4;font-family:system-ui,sans-serif;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.4)";
  var IN = "width:100%;box-sizing:border-box;padding:12px;margin-bottom:10px;border-radius:8px;border:1px solid #444;background:#111;color:#fff;text-align:center;font-size:16px";
  var B1 = "width:100%;padding:12px;border:0;border-radius:8px;background:#c0392b;color:#fff;font-weight:700;font-size:15px;cursor:pointer";
  var PILL = "padding:7px 12px;border:1px solid #666;border-radius:8px;background:#242424;color:#eee;font-size:12px;font-weight:600;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.45)";

  function card(html) {
    clearCard();
    var w = document.createElement("div");
    w.id = "rbSyncCard";
    w.style.cssText = CARD;
    w.innerHTML = '<div style="font-size:20px;font-weight:800;letter-spacing:1px;margin-bottom:14px">RAEES BUILDER</div>'
      + html
      + '<div id="rbErr" style="margin-top:8px;color:#ff8a80;font-size:13px;min-height:18px"></div>';
    root.parentNode.insertBefore(w, root);
    return w;
  }
  function clearCard() {
    var e = document.getElementById("rbSyncCard");
    if (e) e.remove();
  }
  function showApp() { root.style.display = ""; }

  var noteTimer = null;
  function note(txt, onTap) {
    var b = document.getElementById("rbNote");
    if (!b) {
      b = document.createElement("div");
      b.id = "rbNote";
      b.style.cssText = "position:fixed;left:10px;bottom:76px;z-index:9999;font-family:system-ui,sans-serif;" + PILL;
      document.body.appendChild(b);
    }
    b.textContent = txt;
    b.onclick = onTap || null;
    b.style.display = "block";
    if (noteTimer) clearTimeout(noteTimer);
    if (!onTap) noteTimer = setTimeout(function () { b.style.display = "none"; }, 2500);
  }

  function logoutBtn(auth) {
    if (document.getElementById("rbBar")) return;
    var d = document.createElement("div");
    d.id = "rbBar";
    d.style.cssText = "position:fixed;right:10px;bottom:76px;z-index:9999;font-family:system-ui,sans-serif";
    d.innerHTML = '<button id="rbOut" style="' + PILL + '">Logout</button>';
    document.body.appendChild(d);
    d.querySelector("#rbOut").onclick = function () {
      auth.signOut().then(function () { location.reload(); });
    };
  }

  /* ---------- login screen ---------- */
  function loginCard(auth) {
    root.style.display = "none";
    var w = card('<div style="margin:0 0 16px;opacity:.8;font-size:14px">Login karein</div>'
      + '<input id="rbEm" type="email" autocomplete="username" placeholder="Email" style="' + IN + '">'
      + '<input id="rbPw" type="password" autocomplete="current-password" placeholder="Password" style="' + IN + '">'
      + '<button id="rbGo" style="' + B1 + '">Login</button>');
    var e = w.querySelector("#rbErr");
    var go = w.querySelector("#rbGo");
    go.onclick = function () {
      e.textContent = "";
      go.disabled = true;
      auth.signInWithEmailAndPassword(w.querySelector("#rbEm").value.trim(), w.querySelector("#rbPw").value)
        .catch(function (err) {
          go.disabled = false;
          var c = err.code || "";
          if (c.indexOf("invalid-credential") > -1 || c.indexOf("wrong-password") > -1 || c.indexOf("user-not-found") > -1) {
            e.textContent = "Email ya password ghalat hai";
          } else if (c.indexOf("network") > -1) {
            e.textContent = "Internet nahi mil raha";
          } else {
            e.textContent = "Error: " + c;
          }
        });
    };
    w.addEventListener("keydown", function (ev) { if (ev.key === "Enter") go.click(); });
    w.querySelector("#rbEm").focus();
  }

  /* ---------- data sync ---------- */
  function begin(db, auth) {
    var col = db.collection("rb");
    var timers = {};
    var first = true;
    /* Guards against a real data-loss bug: the app can render (and write its
       empty starting state to localStorage) before this function's very
       first Firestore snapshot has come back and corrected local storage
       with the real cloud data. Until that first snapshot has been
       processed, local writes must NOT be pushed up - otherwise a fresh
       device/tab can silently overwrite everyone's real data with an empty
       one. Flips to true once, right after the first snapshot is handled. */
    var readyToPush = false;

    localStorage.setItem = function (k, v) {
      rawSet(k, v);
      if (isShared(k) && readyToPush) push(k);
    };
    localStorage.removeItem = function (k) {
      rawDel(k);
      if (isShared(k) && readyToPush) push(k);
    };

    function push(k) {
      if (timers[k]) clearTimeout(timers[k]);
      timers[k] = setTimeout(function () {
        timers[k] = null;
        var v = localStorage.getItem(k);
        col.doc(toId(k)).set({ v: v === null ? "" : v, dev: DEV, at: Date.now() })
          .then(function () { note("Cloud pe mehfooz"); })
          .catch(function (err) { note("Cloud save fail: " + (err.code || "")); });
      }, 900);
    }

    function uploadAll() {
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (isShared(k)) keys.push(k);
      }
      keys.forEach(function (k) {
        col.doc(toId(k)).set({ v: localStorage.getItem(k), dev: DEV, at: Date.now() });
      });
    }

    function refresh() {
      var busy = document.querySelector("input:focus, textarea:focus, select:focus");
      if (busy || Date.now() - lastTouch < 15000) {
        note("Naya data aaya - yahan dabayein", function () { location.reload(); });
        return;
      }
      location.reload();
    }

    col.onSnapshot(function (snap) {
      var changed = 0;
      snap.docChanges().forEach(function (ch) {
        if (ch.type === "removed") return;
        var d = ch.doc.data() || {};
        if (d.dev === DEV) return;
        if (typeof d.v !== "string") return;
        var k = toKey(ch.doc.id);
        if (localStorage.getItem(k) === d.v) return;
        rawSet(k, d.v);
        changed++;
      });
      if (first) {
        first = false;
        if (snap.empty) uploadAll();
        readyToPush = true;
        logoutBtn(auth);
        showApp();
        if (changed) location.reload();
        return;
      }
      if (changed) refresh();
    }, function (err) {
      note("Cloud error: " + (err.code || ""));
      logoutBtn(auth);
      showApp();
    });
  }

  /* ---------- shuru ---------- */
  function loadScript(src) {
    return new Promise(function (ok, bad) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = ok;
      s.onerror = function () { bad(new Error(src)); };
      document.head.appendChild(s);
    });
  }

  root.style.display = "none";

  loadScript(SDK + "firebase-app-compat.js")
    .then(function () {
      return Promise.all([
        loadScript(SDK + "firebase-auth-compat.js"),
        loadScript(SDK + "firebase-firestore-compat.js")
      ]);
    })
    .then(function () {
      firebase.initializeApp(CFG);
      var auth = firebase.auth();
      var db = firebase.firestore();
      var running = false;
      auth.onAuthStateChanged(function (u) {
        if (u) {
          if (running) return;
          running = true;
          clearCard();
          begin(db, auth);
        } else {
          running = false;
          auth.signInWithEmailAndPassword("raees@raees.local", "161064").catch(function () { loginCard(auth); });
        }
      });
    })
    .catch(function () {
      note("Internet nahi - offline chal raha hai");
      showApp();
    });
})();
