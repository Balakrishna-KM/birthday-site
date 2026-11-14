/* =============================================================
   animations.js  -  GSAP + ScrollTrigger + Lenis
   Exposes window.Anim for script.js to call.
   ============================================================= */
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const EASE = 'power3.out';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) gsap.globalTimeline.timeScale(50);

  /* ---------- Lenis smooth scroll (synced with GSAP) ---------- */
  let lenis = null;
  if (!reduceMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();                       // locked until the intro is dismissed
  }

  /* ---------- initial hidden states ---------- */
  gsap.set('#introGreet', { opacity: 0, y: 16, filter: 'blur(10px)' });
  gsap.set('.split .c', { opacity: 0, y: '0.6em', filter: 'blur(8px)' });
  gsap.set('.hero-in', { opacity: 0, y: 30 });
  gsap.set('#scrollCue', { opacity: 0 });
  $$('.draw').forEach(p => {
    const l = p.getTotalLength();
    gsap.set(p, { strokeDasharray: l, strokeDashoffset: l });
  });

  /* ---------- intro ---------- */
  function introLine() { gsap.to('#introLine', { height: 70, duration: 1.6, ease: 'power2.inOut' }); }
  function introReveal() {
    gsap.to('#introGreet', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.6, ease: EASE });
    gsap.set('#enterBtn', { visibility: 'visible' });
    gsap.to('#enterBtn', { opacity: 1, duration: 1.2, delay: 1.1 });
  }

  /* ---------- hero slideshow (cross-fade + slow zoom) ---------- */
  const slides = $$('.slide');
  let cur = 0;
  function showSlide(n, first) {
    const next = slides[n], prev = slides[cur];
    gsap.fromTo(next.firstElementChild, { scale: 1.14 }, { scale: 1, duration: 9, ease: 'none' });
    gsap.to(next, { opacity: 1, duration: first ? 0.01 : 2.2, ease: 'power1.inOut' });
    if (prev && prev !== next) gsap.to(prev, { opacity: 0, duration: 2.2, ease: 'power1.inOut' });
    cur = n;
  }
  function startSlideshow() {
    if (!slides.length) return;
    showSlide(0, true);
    if (slides.length < 2 || reduceMotion) return;
    const loop = () => gsap.delayedCall(6, () => { showSlide((cur + 1) % slides.length); loop(); });
    loop();
  }
  startSlideshow();

  /* ---------- enter the experience ---------- */
  function enter() {
    const tl = gsap.timeline();
    tl.to('#intro', { opacity: 0, filter: 'blur(16px)', scale: 1.04, duration: 1.5, ease: 'power2.inOut' })
      .add(() => {
        $('#intro').remove();
        document.body.classList.remove('locked');
        lenis?.start();
        ScrollTrigger.refresh();
      }, '-=0.3')
      .to('.hero-in', { opacity: 1, y: 0, duration: 1.4, stagger: 0.28, ease: EASE }, '-=0.1')
      .to('#scrollCue', { opacity: 1, duration: 1 }, '-=0.4');
  }

  /* ---------- scroll storytelling ---------- */
  // Hero parallax
  gsap.to('.slideshow', { yPercent: 12, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-content', { yPercent: -18, opacity: 0.2, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: '70% top', scrub: true } });

  // Section headings: letters/words rise in with blur
  $$('.split').forEach(el => {
    gsap.to($$('.c', el), { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, stagger: 0.09, ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });
  $$('.rule').forEach(r => gsap.fromTo(r, { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 1.3, ease: EASE,
    scrollTrigger: { trigger: r, start: 'top 90%', once: true } }));

  // Letter: lines appear one by one (handwritten feel) + flower draws itself
  const letterTl = gsap.timeline({ scrollTrigger: { trigger: '#letterCard', start: 'top 65%', once: true } });
  letterTl.from('#letterCard', { y: 50, opacity: 0, duration: 1.2, ease: EASE })
    .to('.flower .draw', { strokeDashoffset: 0, duration: 1.6, stagger: 0.18, ease: 'power2.inOut' }, 0.3)
    .to('.card .line', { opacity: 1, y: 0, duration: 1.1, stagger: 1.0, ease: EASE }, 0.8);
  gsap.set('.card .line', { y: 12 });
  gsap.to('.flower', { rotate: 2, transformOrigin: '50% 100%', yoyo: true, repeat: -1, duration: 3.5, ease: 'sine.inOut' });

  // Gallery: clip-path reveal + image scale on scroll
  $$('.shot').forEach(fig => {
    const btn = $('button', fig), img = $('img', fig);
    gsap.fromTo(btn, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'power3.inOut',
      scrollTrigger: { trigger: fig, start: 'top 85%', once: true } });
    gsap.fromTo(img, { scale: 1.3 }, { scale: 1, ease: 'none',
      scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom 40%', scrub: true } });
    gsap.from($('figcaption', fig), { opacity: 0, y: 14, duration: 1, delay: 0.5,
      scrollTrigger: { trigger: fig, start: 'top 80%', once: true } });
  });

  // Wishes: cards reveal as you scroll
  ScrollTrigger.batch('.wish', {
    start: 'top 88%', once: true,
    onEnter: els => gsap.fromTo(els, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: EASE })
  });

  // Finale
  gsap.to('.closing', { opacity: 1, y: 0, duration: 1.8, delay: 0.6, ease: EASE,
    scrollTrigger: { trigger: '#finale h2', start: 'top 60%', once: true } });
  gsap.set('.closing', { y: 20 });

  /* ---------- gift box ---------- */
  function confetti() {
    if (reduceMotion) return;
    const c = document.createElement('canvas');
    Object.assign(c.style, { position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 150, pointerEvents: 'none' });
    document.body.appendChild(c);
    c.width = innerWidth; c.height = innerHeight;
    const x = c.getContext('2d'), COL = ['#D6B779', '#F0DCAE', '#F8F0E8', '#B77B85', '#8E4A5A'];
    const p = Array.from({ length: 150 }, () => ({ x: innerWidth / 2, y: innerHeight * 0.55, vx: (Math.random() - .5) * 18, vy: -Math.random() * 17 - 4,
      s: Math.random() * 7 + 3, c: COL[Math.random() * 5 | 0], r: Math.random() * 6, vr: (Math.random() - .5) * .4 }));
    let n = 0;
    (function f() {
      x.clearRect(0, 0, c.width, c.height);
      p.forEach(a => { a.vy += .3; a.x += a.vx; a.y += a.vy; a.vx *= .99; a.r += a.vr;
        x.save(); x.translate(a.x, a.y); x.rotate(a.r); x.fillStyle = a.c; x.fillRect(-a.s / 2, -a.s / 4, a.s, a.s / 2); x.restore(); });
      if (++n < 220) requestAnimationFrame(f); else c.remove();
    })();
  }

  function showMessage(title, text) {
    const m = $('#giftMsg');
    m.innerHTML = '<h2 class="gold"></h2><p></p>';
    $('h2', m).textContent = title; $('p', m).textContent = text;
    gsap.fromTo(m, { opacity: 0, y: 24, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.5, ease: EASE });
  }

  function openGift(msg) {
    const NS = 'http://www.w3.org/2000/svg';
    const box = $('#giftBox'), scene = $('#cakeScene'), fx = $('#fx');
    const r = box.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const FULL = Math.hypot(innerWidth, innerHeight);
    lenis?.stop();

    /* --- jointed arms: the hands drive the knife, arms bend to follow --- */
    const rig = { x: 483, y: 205 }, SG = [270, 244], SB = [546, 246];
    const arm = (S, dx) => `M${S[0]} ${S[1]} Q${(S[0] + rig.x) / 2 + dx} ${(S[1] + rig.y) / 2 + 55} ${rig.x} ${rig.y}`;
    const renderRig = () => {
      const g = arm(SG, -6), b = arm(SB, 8);
      $('#gArm').setAttribute('d', g); $('#gArmRim').setAttribute('d', g);
      $('#bArm').setAttribute('d', b); $('#bArmRim').setAttribute('d', b);
      $('#knife').setAttribute('transform', `translate(${rig.x} ${rig.y})`);
    };
    renderRig();

    /* --- build the "cut" version of the bottom tier (same art, wedge removed) --- */
    let cutTier = $('#bottomCut');
    if (!cutTier) {
      cutTier = $('#bottomFull').cloneNode(true);
      cutTier.id = 'bottomCut'; cutTier.setAttribute('clip-path', 'url(#cutClip)'); cutTier.style.display = 'none';
      $('#bottomFull').after(cutTier);
    }

    gsap.set(scene, { display: 'block', opacity: 1, clipPath: `circle(0px at ${cx}px ${cy}px)` });
    gsap.set('#cakeAll', { y: 120, opacity: 0 });
    gsap.set('#spotlight', { opacity: 0, transformOrigin: '50% 50%', scale: 0.6 });
    gsap.set('.flame', { transformOrigin: '50% 100%', scale: 0 });
    gsap.set('.smoke', { opacity: 0 });
    gsap.set('#slice', { x: 0, y: 0, opacity: 0 });
    $('#sceneCap').textContent = ''; $('#sceneSub').textContent = '';
    gsap.to('#bokeh circle', { opacity: '+=0.12', duration: 2.4, yoyo: true, repeat: -1, stagger: 0.3, ease: 'sine.inOut' });

    const setCap = (t, s = '') => {
      $('#sceneCap').textContent = t; $('#sceneSub').textContent = s;
      gsap.fromTo('#sceneCap', { opacity: 0, y: 16, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.4, ease: EASE });
      gsap.fromTo('#sceneSub', { opacity: 0 }, { opacity: 1, duration: 1.4, delay: 0.5 });
    };
    const fadeCap = () => gsap.to('#sceneCap,#sceneSub', { opacity: 0, duration: 0.7 });
    const sparkle = (x, y) => {
      for (let i = 0; i < 18; i++) {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 1.5 + Math.random() * 2.5); c.setAttribute('fill', '#F0DCAE');
        fx.appendChild(c);
        const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 90;
        gsap.to(c, { x: Math.cos(a) * d, y: Math.sin(a) * d - 30, opacity: 0, duration: 1.4 + Math.random(), ease: 'power2.out', onComplete: () => c.remove() });
      }
    };

    let flicker, done = false;
    const finish = () => {
      if (done) return; done = true;
      flicker?.kill();
      scene.style.display = 'none';
      lenis?.start();
      showMessage(msg.title, msg.text);
      setTimeout(() => gsap.to('#giftMsg', { opacity: 0, y: -16, duration: 0.8, onComplete: () => { showMessage(msg.finalTitle, msg.finalText); confetti(); } }), 6500);
    };
    const rigTo = (vars, at) => tl.to(rig, { ...vars, onUpdate: renderRig }, at);

    const tl = gsap.timeline({ onComplete: finish });

    /* 1 · the box opens with a golden burst */
    tl.to('.lid', { y: -80, rotate: -20, opacity: 0, duration: 1, ease: 'power3.out' }, 0)
      .fromTo('.glow-burst', { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 2.4, duration: 0.9, ease: EASE }, 0)
      .to('.glow-burst', { opacity: 0, duration: 1.2 }, 0.9)
      .add(() => {
        for (let i = 0; i < 34; i++) {
          const d = document.createElement('span'); d.className = 'burst';
          d.style.left = '50%'; d.style.top = '35%'; box.appendChild(d);
          const a = Math.random() * Math.PI * 2, rad = 90 + Math.random() * 190;
          gsap.to(d, { x: Math.cos(a) * rad, y: Math.sin(a) * rad - 40, opacity: 0, scale: Math.random() * 1.5 + 0.4,
            duration: 1.6 + Math.random(), ease: 'power2.out', onComplete: () => d.remove() });
        }
      }, 0.15);

    /* 2 · the light swells into the scene */
    tl.to(scene, { clipPath: `circle(${FULL}px at ${cx}px ${cy}px)`, duration: 1.7, ease: 'power2.inOut' }, 0.9)
      .add(() => { goldDust($('#sceneDust'), 70); petalField($('#scenePetals'), 16); }, 1.5)
      .to('#spotlight', { opacity: 1, scale: 1, duration: 2.2, ease: EASE }, 2.0);

    /* 3 · cake rises, couple appears behind the table */
    tl.to('#cakeAll', { y: 0, opacity: 1, duration: 1.6, ease: 'power3.out' }, 2.2)
      .to('.person', { opacity: 1, duration: 1.8, ease: 'power1.inOut', stagger: 0.3 }, 3.0)
      .to('#servePlate', { opacity: 1, duration: 1 }, 3.2)
      .to('.arm', { opacity: 1, duration: 1.2 }, 3.8);

    /* 4 · candles, make a wish */
    tl.add(() => setCap('Make a wish…', 'Close your eyes, love.'), 4.0)
      .to('.candle', { opacity: 1, duration: 0.8, stagger: 0.15 }, 4.2)
      .to('.flame', { opacity: 1, scale: 1, duration: 0.7, stagger: 0.25, ease: 'back.out(2)' }, 4.7)
      .add(() => { flicker = gsap.to('.flame', { scaleY: 1.18, scaleX: 0.9, duration: 0.16, yoyo: true, repeat: -1, stagger: 0.05, ease: 'sine.inOut' }); }, 5.4);

    /* 5 · flames out in soft smoke */
    tl.add(() => { flicker?.kill(); fadeCap(); }, 7.0)
      .to('.flame', { scale: 0, opacity: 0, duration: 0.5, stagger: 0.12, ease: 'power2.in' }, 7.1)
      .fromTo('.smoke', { opacity: 0.55, y: 0, scale: 0.6 }, { opacity: 0, y: -50, scale: 2.4, duration: 1.8, stagger: 0.12 }, 7.3);

    /* 6 · first cut (right side), lift, move across, second cut */
    rigTo({ y: 300, duration: 1.2, ease: 'power2.in' }, 8.2);
    tl.to('#slit1', { strokeDashoffset: 0, duration: 0.9, ease: 'none' }, 8.6);
    rigTo({ y: 225, duration: 0.7, ease: 'power2.out' }, 9.5);
    rigTo({ x: 422, duration: 0.8, ease: 'power2.inOut' }, 10.2);
    rigTo({ y: 300, duration: 1.1, ease: 'power2.in' }, 11.0);
    tl.to('#slit2', { strokeDashoffset: 0, duration: 0.9, ease: 'none' }, 11.3);

    /* 7 · the wedge comes free, the knife lifts out, a server carries the slice to the plate */
    tl.add(() => {
        $('#bottomFull').style.display = 'none'; cutTier.style.display = '';
        gsap.set('#slit1,#slit2', { opacity: 0 });
        gsap.set('#slice', { opacity: 1 });
        sparkle(463, 440);
      }, 12.1);
    rigTo({ y: 205, duration: 1.0, ease: 'power2.out' }, 12.1);
    tl.to('#slice', { keyframes: { x: [0, 110, 205], y: [-30, -82, -43], easeEach: 'sine.inOut' }, duration: 2.0 }, 12.5)
      .add(() => { confetti(); setCap('Happy Birthday, ' + msg.name, 'The first slice is yours.'); }, 13.8)
      .add(confetti, 15.4)
      .to(scene, { opacity: 0, duration: 1.4, ease: 'power2.inOut' }, 17.2);

    $('#sceneSkip').onclick = () => {
      tl.kill(); flicker?.kill();
      gsap.to(scene, { opacity: 0, duration: 0.6, onComplete: finish });
    };
  }

  /* ---------- public API ---------- */
  window.Anim = {
    lenis, introLine, introReveal, enter, openGift,
    scrollBy: () => {
      const y = scrollY + innerHeight;
      lenis ? lenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: 'smooth' });
    }
  };
})();
