/* ==========================================================
   JAVASCRIPT
   ========================================================== */
(function(){
  'use strict';

  /* EDIT: YOUR LINKS. Change these three values; every link on the page updates. */
  var SITE = {
    email:    'your-email@example.com',
    github:   'https://github.com/your-username',
    linkedin: 'https://www.linkedin.com/in/your-username'
  };
  var CONTACT_EMAIL = SITE.email;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(s, c){ return (c || document).querySelector(s); };
  var $$ = function(s, c){ return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Footer year ---------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Apply your links from SITE ---------- */
  $$('[data-link]').forEach(function(a){ a.href = SITE[a.dataset.link]; });
  $$('[data-email]').forEach(function(a){
    a.href = 'mailto:' + SITE.email;
    if (a.dataset.email === 'text') a.textContent = SITE.email;
  });

  /* ---------- Header background on scroll ---------- */
  var header = $('header');
  function onScroll(){ header.classList.toggle('scrolled', window.scrollY > 20); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var burger = $('.burger'), links = $('#navLinks');
  function setMenu(open){
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  }
  burger.addEventListener('click', function(){ setMenu(!links.classList.contains('open')); });
  $$('a', links).forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', function(e){
    if (!header.contains(e.target)) setMenu(false);
  });

  /* ---------- Active section indicator ---------- */
  var sections = $$('main section[id]');
  var navAnchors = $$('a', links);
  function setActive(id){
    navAnchors.forEach(function(a){
      var on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  function updateActive(){
    var line = window.innerHeight * 0.4, current = sections[0].id;
    sections.forEach(function(s){ if (s.getBoundingClientRect().top <= line) current = s.id; });
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) current = sections[sections.length - 1].id;
    setActive(current);
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', updateActive);
  updateActive();

  /* ---------- Scroll reveal + skill bars ---------- */
  var revealEls = $$('.reveal');
  function fillBars(root){
    $$('.bar i', root).forEach(function(b){ b.style.width = b.dataset.level + '%'; });
  }
  if ('IntersectionObserver' in window && !reduceMotion){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        fillBars(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function(el, i){
      el.style.transitionDelay = (i % 3) * 90 + 'ms';
      io.observe(el);
    });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
    fillBars(document);
  }

  /* ---------- Typing effect for the headline ---------- */
  var typedEl = $('#typed');
  var roles = typedEl.dataset.roles.split('|');
  if (reduceMotion){
    typedEl.textContent = roles[0];
  } else {
    var r = 0, c = 0, deleting = false;
    (function tick(){
      var word = roles[r];
      typedEl.textContent = word.slice(0, c);
      var delay = deleting ? 45 : 85;
      if (!deleting && c === word.length){ deleting = true; delay = 1600; }
      else if (deleting && c === 0){ deleting = false; r = (r + 1) % roles.length; delay = 350; }
      else { c += deleting ? -1 : 1; }
      setTimeout(tick, delay);
    })();
  }

  /* ---------- Floating particles (canvas) ---------- */
  var canvas = $('#particles'), ctx = canvas.getContext('2d');
  var dots = [], W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), running = true;
  function resize(){
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = Math.min(70, Math.floor(W * H / 22000));
    dots = [];
    for (var i = 0; i < count; i++){
      dots.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + .4,
                  vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, a: Math.random() * .5 + .2 });
    }
  }
  function draw(){
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < dots.length; i++){
      var p = dots[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.2832);
      ctx.fillStyle = 'rgba(180,170,255,' + p.a + ')';
      ctx.fill();
      for (var j = i + 1; j < dots.length; j++){
        var q = dots[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
        if (d < 12000){
          ctx.strokeStyle = 'rgba(139,120,255,' + (0.12 * (1 - d / 12000)) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
    if (running) requestAnimationFrame(draw);
  }
  resize();
  if (reduceMotion){ draw(); running = false; } else { draw(); }
  var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(function(){ resize(); if (reduceMotion) draw(); }, 150); });
  document.addEventListener('visibilitychange', function(){
    if (reduceMotion) return;
    if (document.hidden){ running = false; } else if (!running){ running = true; draw(); }
  });

  /* ---------- Contact form validation ---------- */
  var form = $('#contactForm'), statusEl = $('#formStatus');
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var rules = {
    name:    { el: $('#name'),    err: $('#nameErr'),  check: function(v){ return v.trim().length >= 2 ? '' : 'Enter your name (at least 2 characters).'; } },
    email:   { el: $('#email'),   err: $('#emailErr'), check: function(v){ return emailRe.test(v.trim()) ? '' : 'Enter a valid email address, like name@example.com.'; } },
    message: { el: $('#message'), err: $('#msgErr'),   check: function(v){ return v.trim().length >= 10 ? '' : 'Write a message of at least 10 characters.'; } }
  };
  function validate(key){
    var f = rules[key], msg = f.check(f.el.value);
    f.err.textContent = msg;
    f.el.closest('.field').classList.toggle('invalid', !!msg);
    f.el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  Object.keys(rules).forEach(function(k){
    rules[k].el.addEventListener('blur', function(){ validate(k); });
    rules[k].el.addEventListener('input', function(){ if (rules[k].el.closest('.field').classList.contains('invalid')) validate(k); });
  });
  form.addEventListener('submit', function(e){
    e.preventDefault();
    statusEl.className = 'form-status'; statusEl.textContent = '';
    var results = Object.keys(rules).map(validate);
    if (results.indexOf(false) !== -1){
      var firstBad = Object.keys(rules).filter(function(k){ return rules[k].el.getAttribute('aria-invalid') === 'true'; })[0];
      rules[firstBad].el.focus();
      return;
    }
    /* No backend: open the visitor's email app with the message pre-filled. */
    var subject = 'Portfolio message from ' + rules.name.el.value.trim();
    var body = rules.message.el.value.trim() + '\n\nFrom: ' + rules.name.el.value.trim() + ' <' + rules.email.el.value.trim() + '>';
    if (SITE.email.indexOf('example.com') !== -1){
      statusEl.textContent = 'No email address is set yet. The site owner needs to edit SITE.email in script.js.';
      return;
    }
    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    statusEl.textContent = 'Opening your email app with the message filled in. Nothing has been sent yet: press Send in your email app. If it does not open, email ' + CONTACT_EMAIL + ' directly.';
  });
})();
