/* Raees Builder - PWA bootstrap: service worker + install button */
(function () {
  'use strict';

  /* ---------- 1. Register the service worker (offline support) ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (err) {
        console.warn('Raees Builder: service worker not registered.', err);
      });
    });
  }

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
          ? 'To install Raees Builder: tap the Share button, then choose "Add to Home Screen".'
          : 'To install Raees Builder: open your browser menu, then choose "Install app" or "Add to Home screen".'
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
