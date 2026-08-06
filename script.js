/* Raees Builder - site scripts */
(function () {
  'use strict';

  /* ---- mobile navigation ---- */
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', nav.classList.contains('open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); }
    });
  }

  /* ---- highlight the nav link of the section in view ---- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function onScroll() {
    var pos = window.scrollY + 140;
    var current = -1;
    sections.forEach(function (s, i) {
      if (s && s.offsetTop <= pos) { current = i; }
    });
    links.forEach(function (a, i) { a.classList.toggle('active', i === current); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement;
      var body = item.querySelector('.faq-a');
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (it) {
        it.classList.remove('open');
        it.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  /* ---- estimate form -> opens WhatsApp with a ready-made message ---- */
  var form = document.getElementById('estimateForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var phone = (form.getAttribute('data-whatsapp') || '').replace(/[^0-9]/g, '');
      var v = function (id) {
        var el = document.getElementById(id);
        return el ? el.value.trim() : '';
      };
      var msg = 'Assalam-o-Alaikum Raees Builder,' + '\n\n' +
        'Name: ' + v('cName') + '\n' +
        'Phone: ' + v('cPhone') + '\n' +
        'City / Area: ' + v('cCity') + '\n' +
        'Service: ' + v('cService') + '\n' +
        'Approx. area (sq ft): ' + v('cArea') + '\n' +
        'Details: ' + v('cMsg') + '\n\n' +
        'Please share an estimate. Shukriya.';
      window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank');
    });
  }

  /* ---- footer year ---- */
  var y = document.getElementById('year');
  if (y) { y.textContent = new Date().getFullYear(); }

  /* ---- reveal elements on scroll ---- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.opacity = 1;
          en.target.style.transform = 'none';
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.card, .step, .feature, .gallery div').forEach(function (el) {
      el.style.opacity = 0;
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
      io.observe(el);
    });
  }
})();
// cleared
