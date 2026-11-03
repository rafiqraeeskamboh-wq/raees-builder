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

  /* ---------- 1b. Auto update: app wapas kholne par naya version ho to khud reload
     (login 5 ghante yaad rehta hai, is liye dobara PIN nahi maangega) ---------- */
  (function () {
    function curVer() { var s = document.querySelector('script[src*="i18n.js?v="]'); var m = s && s.getAttribute('src').match(/v=(\d+)/); return m ? m[1] : null; }
    var busy = false, lastCheck = 0;
    function check() {
      var now = Date.now(); if (busy || now - lastCheck < 60000) return; lastCheck = now; busy = true;
      try { if (navigator.serviceWorker) navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { r.update(); }); }); } catch (e) {}
      fetch('index.html?chk=' + now, { cache: 'no-store' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) {
        busy = false; var m = html.match(/i18n\.js\?v=(\d+)/); var cur = curVer();
        if (m && cur && m[1] !== cur) location.reload();
      }).catch(function () { busy = false; });
    }
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') check(); });
    window.addEventListener('focus', check);
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
