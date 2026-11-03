/* Raees Builders - PWA bootstrap: service worker + install button */
(function () {
  'use strict';

  /* ---------- 1. Register the service worker (offline support) ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (err) {
        console.warn('Raees Builders: service worker not registered.', err);
      });
    });
  }

  /* ---------- 1b. Auto update: app wapas kholne par naya version ho to aik dafa reload
     (login 5 ghante yaad rehta hai). Aik version par sirf aik reload - loop nahi. ---------- */
  (function () {
    function curVer() { var m = document.querySelector('meta[name="rb-ver"]'); return m ? m.getAttribute('content') : null; }
    var busy = false, lastCheck = Date.now();
    function check() {
      var now = Date.now(); if (busy || now - lastCheck < 120000) return; lastCheck = now; busy = true;
      try { if (navigator.serviceWorker) navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { r.update(); }); }); } catch (e) {}
      fetch('index.html?chk=' + now, { cache: 'no-store' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) {
        busy = false;
        var m = html.match(/name="rb-ver" content="(\d+)"/); var cur = curVer();
        if (!m || !cur || m[1] === cur) return;
        var tried = null; try { tried = localStorage.getItem('rbupd:tried'); } catch (e) {}
        if (tried === m[1]) return;
        try { localStorage.setItem('rbupd:tried', m[1]); } catch (e) {}
        location.replace(location.pathname + '?u=' + m[1]);
      }).catch(function () { busy = false; });
    }
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') check(); });
  })();

  /* ---------- 2. Install button ---------- */
  var installBtn = document.getElementById('installApp');
  var deferredPrompt = null;

  var isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var isStandalone =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    navigator.standalone === true;

  function showBtn() { if (installBtn) installBtn.hidden = false; }
  function hideBtn() { if (installBtn) installBtn.hidden = true; }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (!isStandalone) showBtn();
  });

  if (installBtn) {
    installBtn.addEventListener('click', function () {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function (choice) {
          if (choice && choice.outcome === 'accepted') hideBtn();
          deferredPrompt = null;
        });
        return;
      }
      /* iOS and some browsers have no prompt API - show the manual steps. */
      alert(
        isIos
          ? 'To install Raees Builders: tap the Share button, then choose "Add to Home Screen".'
          : 'To install Raees Builders: open your browser menu, then choose "Install app" or "Add to Home screen".'
      );
    });
  }

  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    hideBtn();
  });

  /* iOS never fires beforeinstallprompt, so surface the button anyway. */
  if (isIos && !isStandalone) showBtn();
})();
