/* =============================================================
   script.js  -  content, DOM building, canvas effects,
   lightbox, music, intro flow.  (Animations: js/animations.js)
   EDIT THE CONFIG BELOW to personalise the site.
   Paths are relative to index.html.
   ============================================================= */
const CONFIG = {
  name: 'Thangooo',
  from: 'Idiot',
  music: 'audio/Love Me Like You Do.mp3',
  introLine: 'A beautiful day deserves a beautiful story...',
  // Cinematic hero slideshow (any number of photos)
  slides: ['images/slides/ss8.jpg','images/slides/saras.jpg','images/slides/ss9.jpg','images/slides/ss10.jpg'],
  gallery: [
    { src:'images/memories/ss5.jpg', alt:'Memory one',   caption:'The day everything felt like magic', ratio:'r45' },
    { src:'images/memories/ss.jpg', alt:'Memory two',   caption:'A golden evening, just us',        ratio:'r1611' },
    { src:'images/memories/ss6.jpg', alt:'Memory three', caption:'Laughing at nothing at all',         ratio:'r34' },
    { src:'images/memories/ss1.jpg', alt:'Memory four',  caption:'Little moments, big feelings',      ratio:'r34' },
    { src:'images/memories/ss3.jpg', alt:'Memory five',  caption:'Where I want to be, always',        ratio:'r34' },
    { src:'images/memories/ss2.jpg', alt:'Memory six',   caption:'To many more chapters',             ratio:'r1610' }
  ],
  wishes: [
    ['Joy','May laughter find you in the smallest corners of every day.'],
    ['Love','May you always be held by people who see exactly how special you are.'],
    ['Health','May your days be light, your heart steady, and your spirit strong.'],
    ['Dreams','May every quiet dream you carry slowly become real.'],
    ['Peace','May your mind be calm and your evenings gentle.'],
    ['Magic','May this year surprise you in all the most beautiful ways.']
  ],
  gift: {
    title: 'Happy Birthday, {name}',
    text: 'You are the best thing that ever happened to my ordinary days. I hope this year gives you everything you give to others.',
    finalTitle: 'And one more thing...',
    finalText: 'Thank you for being you. I love you more than these words could ever hold.'
  }
};

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a1226"/><stop offset="1" stop-color="#100B10"/></linearGradient></defs>
  <rect width="800" height="1000" fill="url(#g)"/><rect x="40" y="40" width="720" height="920" fill="none" stroke="#D6B779" stroke-opacity=".35"/>
  <text x="400" y="510" text-anchor="middle" fill="#F8F0E8" fill-opacity=".6" font-family="Georgia,serif" font-style="italic" font-size="30">Your photo goes here</text></svg>`);
function makeImg(src, alt, eager) {
  const img = new Image();
  img.alt = alt || '';
  if (!eager) img.loading = 'lazy';
  img.decoding = 'async';
  img.onerror = () => { img.onerror = null; img.src = PLACEHOLDER; };   // never a broken image
  img.src = src;
  return img;
}

/* ---------- personalise text ---------- */
$$('.her-name').forEach(e => e.textContent = CONFIG.name);
$$('.from-name').forEach(e => e.textContent = CONFIG.from);

/* ---------- build slideshow ---------- */
CONFIG.slides.forEach((src, i) => {
  const d = document.createElement('div');
  d.className = 'slide';
  d.appendChild(makeImg(src, '', i === 0));
  $('#slideshow').appendChild(d);
});

/* ---------- build gallery ---------- */
CONFIG.gallery.forEach((g, i) => {
  const f = document.createElement('figure');
  f.className = 'shot';
  const b = document.createElement('button');
  b.type = 'button';
  b.className = g.ratio;
  b.setAttribute('aria-label', 'Open photo: ' + g.caption);
  b.appendChild(makeImg(g.src, g.alt));
  b.addEventListener('click', () => Lightbox.open(i));
  const c = document.createElement('figcaption');
  c.textContent = g.caption;
  f.append(b, c);
  $('#galleryGrid').appendChild(f);
});

/* ---------- build wishes ---------- */
CONFIG.wishes.forEach(([t, p]) => {
  const d = document.createElement('article');
  d.className = 'wish';
  d.innerHTML = `<h3></h3><p></p>`;
  $('h3', d).textContent = t;
  $('p', d).textContent = p;
  $('#wishGrid').appendChild(d);
});

/* ---------- letter flower bloom ---------- */
(() => {
  const g = $('#bloom'), NS = 'http://www.w3.org/2000/svg';
  [0, 72, 144, 216, 288].forEach(a => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', 'M58 64 C46 56 46 38 58 30 C70 38 70 56 58 64Z');
    p.setAttribute('transform', `rotate(${a} 58 64)`);
    p.setAttribute('class', 'draw');
    g.appendChild(p);
  });
})();

/* ---------- split text (letters/words) ---------- */
function splitText(el, by = 'char') {
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  el.textContent = '';
  text.split(' ').forEach((word, wi, arr) => {
    const w = document.createElement('span');
    w.className = 'w'; w.setAttribute('aria-hidden', 'true');
    (by === 'char' ? [...word] : [word]).forEach(u => {
      const c = document.createElement('span');
      c.className = 'c'; c.textContent = u; w.appendChild(c);
    });
    el.appendChild(w);
    if (wi < arr.length - 1) el.appendChild(document.createTextNode(' '));
  });
}
$$('.split').forEach(el => splitText(el, 'word'));

/* ---------- canvas engine ---------- */
function canvasLoop(canvas, setup) {
  if (reduced) { canvas.remove(); return; }
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, visible = true, last = performance.now(), api;
  const fit = () => {
    const d = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.max(1, w * d); canvas.height = Math.max(1, h * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
  };
  fit();
  new ResizeObserver(fit).observe(canvas);
  new IntersectionObserver(e => visible = e[0].isIntersecting).observe(canvas);
  api = setup(ctx, () => w, () => h);
  (function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) { last = now; return; }
    const dt = Math.min((now - last) / 16.667, 3); last = now;
    ctx.clearRect(0, 0, w, h);
    api(dt);
  })(last);
}

function starField(canvas) {
  canvasLoop(canvas, (x, W, H) => {
    const s = Array.from({ length: 120 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + .2, p: Math.random() * 6, v: .01 + Math.random() * .025 }));
    return dt => s.forEach(a => {
      a.p += a.v * dt;
      x.fillStyle = `rgba(248,240,232,${.15 + .65 * Math.abs(Math.sin(a.p))})`;
      x.beginPath(); x.arc(a.x * W(), a.y * H(), a.r, 0, 7); x.fill();
    });
  });
}
function petalField(canvas, count = 22) {
  canvasLoop(canvas, (x, W, H) => {
    const C = ['#B77B85', '#D9A4AC', '#8E4A5A', '#F8F0E8'];
    const mk = init => ({ x: Math.random() * W(), y: init ? Math.random() * H() : -30, s: 6 + Math.random() * 9, v: .35 + Math.random() * .7,
      sw: Math.random() * 6, sws: .006 + Math.random() * .012, d: .1 + Math.random() * .25, r: Math.random() * 6, rs: (Math.random() - .5) * .025,
      f: Math.random() * 6, fs: .015 + Math.random() * .03, c: C[Math.random() * 4 | 0], a: .35 + Math.random() * .45 });
    const p = Array.from({ length: W() < 640 ? Math.ceil(count * .55) : count }, () => mk(true));
    return dt => p.forEach(a => {
      a.y += a.v * dt; a.sw += a.sws * dt; a.x += (Math.sin(a.sw) * .6 + a.d) * dt; a.r += a.rs * dt; a.f += a.fs * dt;
      if (a.y > H() + 30 || a.x > W() + 40) Object.assign(a, mk(false));
      const s = a.s;
      x.save(); x.translate(a.x, a.y); x.rotate(a.r); x.scale(.62, Math.max(.15, Math.abs(Math.cos(a.f))));
      x.globalAlpha = a.a; x.fillStyle = a.c; x.beginPath(); x.moveTo(0, -s);
      x.bezierCurveTo(s * .95, -s * .6, s * .85, s * .7, 0, s); x.bezierCurveTo(-s * .85, s * .7, -s * .95, -s * .6, 0, -s); x.fill(); x.restore();
    });
  });
}
function goldDust(canvas, count = 45) {
  canvasLoop(canvas, (x, W, H) => {
    const mk = init => ({ x: Math.random() * W(), y: init ? Math.random() * H() : H() + 10, r: .6 + Math.random() * 1.8,
      vy: -(.08 + Math.random() * .3), vx: (Math.random() - .5) * .15, p: Math.random() * 6, t: .015 + Math.random() * .03 });
    const d = Array.from({ length: W() < 640 ? Math.ceil(count * .55) : count }, () => mk(true));
    return dt => d.forEach(a => {
      a.x += a.vx * dt; a.y += a.vy * dt; a.p += a.t * dt; if (a.y < -10) Object.assign(a, mk(false));
      const al = .25 + .6 * (.5 + .5 * Math.sin(a.p));
      x.fillStyle = `rgba(214,183,121,${al * .14})`; x.beginPath(); x.arc(a.x, a.y, a.r * 4, 0, 7); x.fill();
      x.fillStyle = `rgba(214,183,121,${al})`;       x.beginPath(); x.arc(a.x, a.y, a.r, 0, 7); x.fill();
    });
  });
}
starField($('#stars'));
petalField($('#introPetals'), 14);
goldDust($('#heroDust'));
goldDust($('#wishDust'), 60);
petalField($('#finalePetals'), 26);

/* ---------- lightbox ---------- */
const Lightbox = (() => {
  const box = $('#lightbox'), img = $('#lbImg'), cap = $('#lbCap');
  let i = 0, lastFocus = null, tx = 0;
  const show = n => {
    i = (n + CONFIG.gallery.length) % CONFIG.gallery.length;
    const g = CONFIG.gallery[i];
    img.onerror = () => { img.onerror = null; img.src = PLACEHOLDER; };
    img.src = g.src; img.alt = g.alt; cap.textContent = g.caption;
  };
  const open = n => {
    lastFocus = document.activeElement; show(n);
    box.hidden = false; requestAnimationFrame(() => box.classList.add('open'));
    window.Anim?.lenis?.stop(); document.body.classList.add('locked');
    $('.lb-close', box).focus();
  };
  const close = () => {
    box.classList.remove('open');
    setTimeout(() => { box.hidden = true; }, 450);
    window.Anim?.lenis?.start(); document.body.classList.remove('locked');
    lastFocus?.focus();
  };
  $('.lb-close', box).onclick = close;
  $('.lb-prev', box).onclick = () => show(i - 1);
  $('.lb-next', box).onclick = () => show(i + 1);
  box.addEventListener('click', e => { if (e.target === box) close(); });
  addEventListener('keydown', e => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });
  box.addEventListener('touchstart', e => tx = e.changedTouches[0].clientX, { passive: true });
  box.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) show(d < 0 ? i + 1 : i - 1); });
  return { open, close };
})();

/* ---------- music (starts only after user click; safe if file missing) ---------- */
const Music = (() => {
  const btn = $('#musicBtn');
  let audio = null, playing = false, ok = true;
  const get = () => {
    if (!audio) {
      audio = new Audio(); audio.loop = true; audio.volume = .5; audio.preload = 'none';
      audio.addEventListener('error', () => { ok = false; playing = false; sync(); });
      audio.src = CONFIG.music;
    }
    return audio;
  };
  const sync = () => {
    btn.textContent = playing ? '❚❚' : '♪';
    btn.classList.toggle('playing', playing);
    btn.classList.toggle('off', !ok);
    btn.setAttribute('aria-label', !ok ? 'No music file found' : playing ? 'Pause music' : 'Play music');
    btn.title = !ok ? 'Add audio/music.mp3 to enable music' : 'Music';
  };
  const play = async () => { try { await get().play(); playing = true; } catch { playing = false; } sync(); };
  const pause = () => { audio?.pause(); playing = false; sync(); };
  btn.addEventListener('click', () => (playing ? pause() : play()));
  sync();
  return { play };
})();

/* ---------- gift box ---------- */
let giftOpened = false;
$('#giftBox').addEventListener('click', () => {
  if (giftOpened) return;
  giftOpened = true;
  $('#giftHint').style.display = 'none';
  window.Anim?.openGift({
    name: CONFIG.name, title: CONFIG.gift.title.replace('{name}', CONFIG.name), text: CONFIG.gift.text,
    finalTitle: CONFIG.gift.finalTitle, finalText: CONFIG.gift.finalText
  });
});

/* ---------- intro flow ---------- */
document.body.classList.add('locked');
(function typeIntro() {
  const el = $('#introType'), line = CONFIG.introLine; let n = 0;
  setTimeout(() => window.Anim?.introLine(), 300);
  const tick = () => {
    if (n <= line.length) { el.textContent = line.slice(0, n++); setTimeout(tick, reduced ? 4 : 55); }
    else setTimeout(() => window.Anim?.introReveal(), 700);
  };
  setTimeout(tick, 1300);
})();
$('#enterBtn').addEventListener('click', () => {
  $('#musicBtn').classList.add('show');
  Music.play();                       // user gesture: allowed to start audio
  window.Anim?.enter();
});
$('#scrollCue').addEventListener('click', () => window.Anim?.scrollBy());
