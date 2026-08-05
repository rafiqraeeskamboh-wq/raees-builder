// Raees Builder - site scripts

// Mobile menu toggle
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
burger.addEventListener('click', () => menu.classList.toggle('open'));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));

// Scroll to top button
const topBtn = document.getElementById('top');
topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Active nav link while scrolling
const sections = Array.from(document.querySelectorAll('section[id]'));
const links = Array.from(menu.querySelectorAll('a'));
window.addEventListener('scroll', () => {
  const y = window.scrollY + 150;
  const current = sections.filter(s => s.offsetTop <= y).pop();
  if (current) {
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current.id));
  }
  topBtn.style.display = window.scrollY > 400 ? 'block' : 'none';
});

// Quote form validation
const form = document.getElementById('qform');
form.addEventListener('submit', function (e) {
  const fields = ['name', 'email', 'phone', 'message'];
  for (const n of fields) {
    const el = this[n];
    if (!el.value.trim()) {
      e.preventDefault();
      el.focus();
      el.style.outline = '2px solid #d9534f';
      return;
    }
    el.style.outline = '';
  }
  if (!/^\S+@\S+\.\S+$/.test(this.email.value)) {
    e.preventDefault();
    this.email.focus();
    this.email.style.outline = '2px solid #d9534f';
    return;
  }
  document.getElementById('msg').style.display = 'block';
});
