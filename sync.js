/* sync.js - Raees Builders
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

  /* ---------- PENDING: internet na ho to entry isi phone par mehfooz, internet aate hi cloud par ----------
     har badli hui key "pending" mein likhi jati hai (sath us ki pichli cloud wali halat = base).
     cloud par pahunch jaye to pending khatam. beech mein dusre phone ka data aaye to dono mila diye jate hain. */
  var PKEY = "rbsync:pending";
  function pRead() { try { return JSON.parse(localStorage.getItem(PKEY) || "{}") || {}; } catch (e) { return {}; } }
  function pWrite(m) { try { rawSet(PKEY, JSON.stringify(m)); } catch (e) {} }
  function pCount() { return Object.keys(pRead()).length; }
  function isPending(k) { return !!pRead()[k]; }
  function markPending(k, prev) {
    var m = pRead();
    if (!m[k]) { m[k] = { at: Date.now() }; try { rawSet("rbsync:base:" + k, prev === null ? "\u0000" : prev); } catch (e) {} }
    pWrite(m);
  }
  function getBase(k) { var b = localStorage.getItem("rbsync:base:" + k); return b === null || b === "\u0000" ? null : b; }
  function setBase(k, v) { try { rawSet("rbsync:base:" + k, v === null ? "\u0000" : v); } catch (e) {} }
  function clearPending(k) { var m = pRead(); delete m[k]; pWrite(m); rawDel("rbsync:base:" + k); }

  /* 3-tarfa milana: base (pehle), local (is phone), remote (cloud) */
  function jp(x) { try { return x === null || x === undefined || x === "" ? null : JSON.parse(x); } catch (e) { return undefined; } }
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function merge3(baseS, localS, remoteS) {
    var B = jp(baseS), L = jp(localS), Rm = jp(remoteS);
    if (L === undefined || Rm === undefined) return localS;
    if (Rm === null) return localS;
    if (L === null) return remoteS;
    if (typeof L === "number" && typeof Rm === "number") return JSON.stringify(Math.max(L, Rm));
    if (Array.isArray(L) && Array.isArray(Rm)) {
      var hasId = L.concat(Rm).every(function (x) { return x && typeof x === "object" && x.id != null; });
      if (!hasId) return localS;
      var bm = {}; (Array.isArray(B) ? B : []).forEach(function (x) { if (x && x.id != null) bm[x.id] = x; });
      var lm = {}; L.forEach(function (x) { lm[x.id] = x; });
      var rm = {}; Rm.forEach(function (x) { rm[x.id] = x; });
      var out = L.map(function (x) {
        var r = rm[x.id], b = bm[x.id];
        if (r && b && same(x, b) && !same(r, b)) return r; /* yahan nahi badla, wahan badla */
        if (!r && b && same(x, b)) return null;          /* wahan delete hua, yahan nahi badla */
        return x;
      }).filter(function (x) { return x !== null; });
      var add = Rm.filter(function (x) { return !lm[x.id] && !bm[x.id]; }); /* wahan naya bana */
      return JSON.stringify(add.concat(out));
    }
    if (L && Rm && typeof L === "object" && typeof Rm === "object" && !Array.isArray(L) && !Array.isArray(Rm)) {
      var Bo = (B && typeof B === "object" && !Array.isArray(B)) ? B : {};
      var o = {};
      Object.keys(Rm).forEach(function (k) { o[k] = Rm[k]; });
      Object.keys(L).forEach(function (k) { if (!(k in Bo) || !same(L[k], Bo[k])) o[k] = L[k]; });
      Object.keys(Bo).forEach(function (k) { if (!(k in L) && (k in Rm) && same(Rm[k], Bo[k])) delete o[k]; });
      return JSON.stringify(o);
    }
    return localS;
  }

  var pushFn = null; /* cloud tayyar ho to set hota hai */
  localStorage.setItem = function (k, v) {
    var prev = localStorage.getItem(k);
    rawSet(k, v);
    if (!isShared(k) || prev === v) return;
    /* app khulte waqt apni khali halat likhti hai - wo pending nahi; asal entry (touch ke baad) pending */
    if (pushFn || lastTouch > 0) markPending(k, prev);
    if (pushFn) pushFn(k); else pendingBadge();
  };
  localStorage.removeItem = function (k) {
    var prev = localStorage.getItem(k);
    rawDel(k);
    if (!isShared(k) || prev === null) return;
    if (pushFn || lastTouch > 0) markPending(k, prev);
    if (pushFn) pushFn(k); else pendingBadge();
  };
  function pendingBadge() {
    var n = pCount(), b = document.getElementById("rbPend");
    if (!n) { if (b) b.style.display = "none"; return; }
    if (!b) {
      b = document.createElement("div"); b.id = "rbPend";
      b.style.cssText = "position:fixed;right:10px;bottom:76px;z-index:9999;font-family:system-ui,sans-serif;padding:7px 12px;border-radius:8px;background:#7A4E12;color:#fff;font-size:12px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.45)";
      document.body.appendChild(b);
    }
    b.textContent = "Internet ka intezar: " + n + " cheez pending - internet aate hi khud chali jaye gi";
    b.style.display = "block";
  }

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
    w.innerHTML = '<div style="font-size:20px;font-weight:800;letter-spacing:1px;margin-bottom:14px">RAEES BUILDERS</div>'
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
    return; /* side wala Logout button hata diya (app ke andar upar Logout mojood hai) */
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

    function sendNow(k) {
      var v = localStorage.getItem(k);
      return col.doc(toId(k)).set({ v: v === null ? "" : v, dev: DEV, at: Date.now() })
        .then(function () {
          /* cloud tak pahunch gaya - agar beech mein dobara nahi badla to pending khatam */
          if (localStorage.getItem(k) === v) clearPending(k); else setBase(k, v);
          pendingBadge();
          if (!pCount()) note("Cloud pe mehfooz");
        })
        .catch(function (err) { pendingBadge(); note("Cloud save abhi nahi hua - pending hai (" + (err.code || "") + ")"); });
    }
    function push(k) {
      if (!readyToPush) return; /* pehla cloud data aane tak ruko - pending mein mehfooz hai */
      if (timers[k]) clearTimeout(timers[k]);
      timers[k] = setTimeout(function () { timers[k] = null; sendNow(k); }, 900);
    }
    function flushPending() {
      if (!readyToPush) return Promise.resolve(); /* cloud ka pehla data aaye baghair kuch na bhejo */
      var ks = Object.keys(pRead());
      return Promise.all(ks.map(function (k) { return sendNow(k); }));
    }
    window.addEventListener("online", function () { pendingBadge(); flushPending(); });
    setInterval(function () { if (pCount() && navigator.onLine) flushPending(); }, 60000);

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

    /* internet kamzor ho aur cloud ka jawab na aaye to app phir bhi khul jaye - entry pending rahe gi */
    var shownEarly = false;
    setTimeout(function () { if (first) { shownEarly = true; showApp(); pendingBadge(); note("Internet kamzor - entry pending rahe gi, internet aate hi chali jaye gi"); } }, 8000);
    col.onSnapshot(function (snap) {
      var changed = 0;
      snap.docChanges().forEach(function (ch) {
        if (ch.type === "removed") return;
        var d = ch.doc.data() || {};
        if (d.dev === DEV) return;
        if (typeof d.v !== "string") return;
        var k = toKey(ch.doc.id);
        var loc = localStorage.getItem(k);
        if (loc === d.v) { if (isPending(k)) clearPending(k); return; }
        if (isPending(k)) {
          /* is phone ki pending entry + cloud ka naya data - dono mila do, kuch zaya na ho */
          var mg = merge3(getBase(k), loc, d.v);
          setBase(k, d.v);
          if (mg !== loc) { rawSet(k, mg); changed++; }
          return;
        }
        rawSet(k, d.v);
        changed++;
      });
      if (first) {
        first = false;
        if (snap.empty) uploadAll();
        readyToPush = true;
        pushFn = push;
        logoutBtn(auth);
        showApp();
        var fl = flushPending();
        pendingBadge();
        if (changed) {
          /* pending cloud par bhej kar phir reload (zyada se zyada 5 second intezar) */
          Promise.race([fl, new Promise(function (ok) { setTimeout(ok, 5000); })]).then(function () { if (shownEarly) refresh(); else location.reload(); });
        }
        return;
      }
      if (changed) { Object.keys(pRead()).forEach(function (k) { push(k); }); refresh(); }
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
      note("Internet nahi - offline chal raha hai. Entry pending rahe gi");
      showApp();
      pendingBadge();
      /* internet wapas aaye to app dobara khul kar pending entry cloud par bhej de */
      var tried = false;
      function retry() {
        if (tried || !navigator.onLine) return;
        var busy = document.querySelector("input:focus, textarea:focus, select:focus");
        if (busy || Date.now() - lastTouch < 8000) { note("Internet aa gaya - yahan dabayein taake pending entry cloud par jaye", function () { location.reload(); }); return; }
        tried = true; location.reload();
      }
      window.addEventListener("online", retry);
      setInterval(retry, 30000);
    });
})();
