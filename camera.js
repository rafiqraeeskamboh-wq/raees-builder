/* Raees Builder - in-app live camera */
(function () {
  'use strict';

  var video   = document.getElementById('camVideo');
  if (!video) return;

  var photo   = document.getElementById('camPhoto');
  var msg     = document.getElementById('camMsg');
  var bStart  = document.getElementById('camStart');
  var bShot   = document.getElementById('camShot');
  var bFlip   = document.getElementById('camFlip');
  var bStop   = document.getElementById('camStop');
  var bRetake = document.getElementById('camRetake');
  var bSave   = document.getElementById('camSave');
  var bShare  = document.getElementById('camShare');

  var stream = null;
  var facing = 'environment';
  var shot   = null;

  function show(el, on) { if (el) el.hidden = !on; }
  function say(t) { msg.textContent = t || ''; msg.hidden = !t; }

  function stopStream() {
    if (stream) {
      stream.getTracks().forEach(function (t) { t.stop(); });
      stream = null;
    }
    video.srcObject = null;
  }

  function modeIdle(text) {
    show(video, false); show(photo, false);
    show(bStart, true); show(bShot, false); show(bFlip, false); show(bStop, false);
    show(bRetake, false); show(bSave, false); show(bShare, false);
    say(text || 'Camera is off. Tap Open Camera to start.');
  }

  function modeLive() {
    show(video, true); show(photo, false);
    show(bStart, false); show(bShot, true); show(bFlip, true); show(bStop, true);
    show(bRetake, false); show(bSave, false); show(bShare, false);
    say('');
  }

  function modePhoto() {
    show(video, false); show(photo, true);
    show(bStart, false); show(bShot, false); show(bFlip, false); show(bStop, false);
    show(bRetake, true); show(bSave, true);
    show(bShare, typeof navigator.canShare === 'function');
    say('');
  }

  function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      modeIdle('This browser does not support the camera.');
      return;
    }
    stopStream();
    say('Starting camera...');
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false
    }).then(function (s) {
      stream = s;
      video.srcObject = s;
      video.style.transform = (facing === 'user') ? 'scaleX(-1)' : 'none';
      return video.play();
    }).then(function () {
      modeLive();
    }).catch(function (err) {
      var t = 'The camera could not be opened.';
      if (err && err.name === 'NotAllowedError') {
        t = 'Camera permission was blocked. Allow camera access for this site in your browser settings.';
      } else if (err && err.name === 'NotFoundError') {
        t = 'No camera was found on this device.';
      } else if (err && err.name === 'NotReadableError') {
        t = 'The camera is busy in another app. Close it and try again.';
      }
      stopStream();
      modeIdle(t);
    });
  }

  function takePhoto() {
    var w = video.videoWidth;
    var h = video.videoHeight;
    if (!w || !h) return;
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    if (facing === 'user') { ctx.translate(w, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, 0, 0, w, h);
    canvas.toBlob(function (blob) {
      if (!blob) return;
      if (photo.src) { URL.revokeObjectURL(photo.src); }
      shot = blob;
      photo.src = URL.createObjectURL(blob);
      stopStream();
      modePhoto();
    }, 'image/jpeg', 0.92);
  }

  function fileName() {
    var d = new Date();
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return 'raees-builder-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) +
           '-' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds()) + '.jpg';
  }

  if (bStart)  bStart.addEventListener('click', startCamera);
  if (bShot)   bShot.addEventListener('click', takePhoto);
  if (bFlip)   bFlip.addEventListener('click', function () {
    facing = (facing === 'environment') ? 'user' : 'environment';
    startCamera();
  });
  if (bStop)   bStop.addEventListener('click', function () { stopStream(); modeIdle(); });
  if (bRetake) bRetake.addEventListener('click', function () { shot = null; startCamera(); });

  if (bSave) bSave.addEventListener('click', function () {
    if (!shot) return;
    var a = document.createElement('a');
    a.href = photo.src;
    a.download = fileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  if (bShare) bShare.addEventListener('click', function () {
    if (!shot) return;
    var file = new File([shot], fileName(), { type: 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'Raees Builder', text: 'Site photo' })
        .catch(function () { /* user cancelled */ });
    } else {
      alert('This browser cannot share files. Please use Save instead.');
    }
  });

  window.addEventListener('pagehide', stopStream);

  modeIdle();
})();
