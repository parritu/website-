/* The Making of Fine Jewellery — Facette & Co. */
(function () {
  var d = document, body = d.body;
  body.classList.remove('no-js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var story = d.getElementById('story'), stage = d.getElementById('stage');
  var scenes = [].slice.call(stage.querySelectorAll('.scene'));
  var N = scenes.length;
  var dots = [].slice.call(d.querySelectorAll('#dots a'));
  var menuLinks = [].slice.call(d.querySelectorAll('#menu a'));
  var bar = d.getElementById('progress');
  var dotsBox = d.getElementById('dots');

  /* Images: load the scene in view and the next two, nothing more (fast on phones) */
  function markLoaded(img) {
    if (img.complete && img.naturalWidth) img.classList.add('is-loaded');
    else img.addEventListener('load', function () { img.classList.add('is-loaded') }, { once: true });
  }
  function loadScene(i) {
    var s = scenes[i]; if (!s || s._loaded) return; s._loaded = true;
    [].slice.call(s.querySelectorAll('source[data-srcset]')).forEach(function (el) { el.srcset = el.getAttribute('data-srcset'); el.removeAttribute('data-srcset') });
    var img = s.querySelector('.scene__media img');
    if (img.hasAttribute('data-srcset')) { img.srcset = img.getAttribute('data-srcset'); img.removeAttribute('data-srcset') }
    if (img.hasAttribute('data-src')) { img.src = img.getAttribute('data-src'); img.removeAttribute('data-src') }
    markLoaded(img);
  }
  function loadAround(i) { for (var k = Math.max(0, i - 1); k <= Math.min(N - 1, i + 2); k++) loadScene(k) }
  loadAround(0);

  if (!reduce) {
    scenes.forEach(function (s, i) {
      if (i === 0) return;
      var eb = s.querySelector('.eyebrow');
      if (eb) { var r = d.createElement('span'); r.className = 'rule'; r.setAttribute('aria-hidden', 'true'); eb.parentNode.insertBefore(r, eb.nextSibling); }
      var h = s.querySelector('h2'), txt = h.textContent.trim();
      h.setAttribute('aria-label', txt);
      var l2 = h.getAttribute('data-l2'), l1 = l2 ? txt.slice(0, txt.length - l2.length).trim() : txt;
      var wr = function (t, c) { return t.split(/\s+/).map(function (w) { return '<span class="w' + c + '" aria-hidden="true"><span>' + w.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span></span>' }).join(' ') };
      h.innerHTML = wr(l1, '') + (l2 ? '<br>' + wr(l2, ' w--it') : '');
    });
  }
  var items = scenes.map(function (s) {
    var img = s.querySelector('.scene__media img');
    return {
      el: s, img: img, media: s.querySelector('.scene__media'),
      dim: s.querySelector('.scene__dim'), eb: s.querySelector('.eyebrow'), rule: s.querySelector('.rule'), h2: s.querySelector('h2'),
      words: [].slice.call(s.querySelectorAll('h2 .w>span')), body: s.querySelector('p.body'), count: s.querySelector('.scene__count'),
      base: parseFloat(img.style.getPropertyValue('--sc') || 1) || 1
    };
  });

  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)) };
  var ease = function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2 };
  var out = function (x) { return 1 - Math.pow(1 - x, 3) };

  var staticMode = false, vh = 0, R = 0, top0 = 0, target = 0, cur = 0, raf = 0, active = -1, mobile = false;

  function layout() {
    if (staticMode) { story.style.height = ''; return; }
    mobile = innerWidth < 760;
    vh = stage.offsetHeight || innerHeight;
    R = vh * (mobile ? 1.35 : 1.7);
    story.style.height = Math.round(vh + (N - 1 + .6) * R) + 'px';
    top0 = story.getBoundingClientRect().top + scrollY;
    readTarget();
  }
  function readTarget() { target = clamp((scrollY - top0) / R, 0, N - 1 + .6); }

  var inFilm = false;
  function setActive(act) {
    if (act === active || inFilm) return;
    active = act;
    dots.forEach(function (a, i) { a.classList.toggle('is-active', i === act); if (i === act) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current') });
    menuLinks.forEach(function (a, i) { a.classList.toggle('is-active', i === act) });
    loadAround(act);
  }

  /* Pinned cinematic stage: the viewport never moves. Chapters dissolve into each other —
     the outgoing stone keeps breathing forward and dims, the incoming stone fades in on top
     while settling from a slight zoom, a soft champagne light passes across, and the text
     hands over word by word. Nothing translates vertically as a panel. */
  var W = .45; /* share of each chapter's scroll spent dissolving */
  var sweep = d.createElement('div'); sweep.className = 'sweep'; sweep.setAttribute('aria-hidden', 'true');
  stage.appendChild(sweep);
  function render(t) {
    setActive(clamp(Math.floor(t + .25), 0, N - 1));
    if (bar) bar.style.transform = 'scaleX(' + clamp(t / (N - 1), 0, 1).toFixed(4) + ')';
    var sw = 0;
    items.forEach(function (it, i) {
      var e = i === 0 ? 1 : ease(clamp((t - (i - W)) / W, 0, 1));              /* dissolving in */
      var cv = i < N - 1 ? ease(clamp((t - (i + 1 - W)) / W, 0, 1)) : 0;        /* dissolving out */
      if (i > 0 && e > 0 && e < 1) sw = clamp((t - (i - W)) / W, 0, 1);
      var hidden = e <= 0 || cv >= 1;
      it.el.style.visibility = hidden ? 'hidden' : 'visible';
      if (hidden) return;
      it.el.style.opacity = i === 0 ? '1' : e.toFixed(4);
      it.el.style.transform = 'none';
      it.media.style.transform = 'none';
      if (!reduce) {
        var dwell = clamp(t - i, 0, 1), B = mobile ? 1 : it.base;
        var zi = mobile ? .06 : .08, zo = mobile ? .04 : .06, zd = mobile ? .015 : .03;
        if (i > 0) it.img.style.setProperty('--sc', (B * (1 + zi * (1 - e) + zd * dwell + zo * cv)).toFixed(4));
        else it.media.style.transform = 'scale(' + (1 + zo * cv).toFixed(4) + ')';
      }
      if (it.dim) it.dim.style.opacity = (cv * .5).toFixed(3);
      if (i === 0) {
        var hi = stage.querySelector('.hero__inner');
        if (hi) {
          var hf = clamp(t / .45, 0, 1);
          hi.style.opacity = (1 - hf).toFixed(3);
          hi.style.transform = reduce ? 'none' : 'translate3d(0,' + (-hf * 24).toFixed(1) + 'px,0)';
        }
        return;
      }
      /* text: outgoing lines fade and lift softly away; incoming heading reveals word by word */
      var fade = i < N - 1 ? 1 - ease(clamp((t - (i + .5)) / .14, 0, 1)) : 1;
      var lift = reduce ? 0 : (1 - fade) * -14;
      var pe = out(clamp((t - (i - .3)) / .2, 0, 1));
      var pr = out(clamp((t - (i - .25)) / .25, 0, 1));
      var pb = out(clamp((t - (i - .12)) / .25, 0, 1));
      var rise = function (p, px) { return reduce ? 'none' : 'translate3d(0,' + (((1 - p) * px) + lift).toFixed(2) + 'px,0)' };
      if (it.eb) { it.eb.style.opacity = (pe * fade).toFixed(3); it.eb.style.transform = rise(pe, 12); }
      if (it.rule) {
        it.rule.style.opacity = (pr * fade).toFixed(3);
        it.rule.style.transform = 'translate3d(0,' + lift.toFixed(2) + 'px,0) scaleX(' + pr.toFixed(3) + ')';
      }
      if (it.words.length) {
        it.h2.style.opacity = fade.toFixed(3);
        it.h2.style.transform = 'translate3d(0,' + lift.toFixed(2) + 'px,0)';
        it.words.forEach(function (w, j) {
          var pw = out(clamp((t - (i - .3 + j * .035)) / .24, 0, 1));
          w.style.opacity = (.15 + .85 * pw).toFixed(3);
          w.style.transform = 'translate3d(0,' + ((1 - pw) * 105).toFixed(2) + '%,0)';
        });
      } else {
        var ph = out(clamp((t - (i - .25)) / .25, 0, 1));
        it.h2.style.opacity = (ph * fade).toFixed(3);
        it.h2.style.transform = rise(ph, 0);
      }
      it.body.style.opacity = (pb * fade).toFixed(3);
      it.body.style.transform = rise(pb, 14);
      if (it.count) { it.count.style.opacity = (pb * fade).toFixed(3); it.count.style.transform = 'none'; }
    });
    /* a soft champagne light passes across the frame at the heart of each dissolve */
    if (reduce || sw <= 0 || sw >= 1) { sweep.style.opacity = '0'; }
    else {
      sweep.style.opacity = (Math.sin(Math.PI * sw) * (mobile ? .7 : .85)).toFixed(3);
      sweep.style.transform = 'translate3d(' + (-55 + 110 * sw).toFixed(2) + '%,0,0)';
    }
  }

  function loop() {
    cur += (target - cur) * (mobile ? .16 : .1);
    if (Math.abs(target - cur) < .0004) cur = target;
    render(cur);
    raf = cur === target ? 0 : requestAnimationFrame(loop);
  }
  function onScroll() { if (staticMode) return; readTarget(); if (!raf) raf = requestAnimationFrame(loop); }

  if (staticMode) {
    body.classList.add('static');
    scenes.forEach(function (s, i) { loadScene(i); s.style.visibility = 'visible' });
    if (dotsBox) dotsBox.classList.add('is-on');
  } else {
    layout(); cur = target; render(cur);
    addEventListener('scroll', onScroll, { passive: true });
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { layout(); cur = target; render(cur); }, 120) });
    addEventListener('load', function () { layout(); cur = target; render(cur); });
    setTimeout(function () { if (dotsBox) dotsBox.classList.add('is-on') }, 1400);
  }

  /* Chapter navigation (native smooth scroll, no hijacking) */
  function go(i) {
    loadAround(i);
    var y = staticMode ? scenes[i].getBoundingClientRect().top + scrollY : top0 + (i ? i + .2 : 0) * R;
    scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  }
  d.addEventListener('click', function (e) {
    var a = e.target.closest('[data-go]'); if (a) { e.preventDefault(); toggle(false); go(+a.getAttribute('data-go')); return; }
    var fl = e.target.closest('[data-film]'); if (fl) {
      e.preventDefault(); toggle(false);
      d.getElementById('film').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      return;
    }
    var h = e.target.closest('a[href="#inquire"]'); if (h) {
      e.preventDefault(); toggle(false);
      d.getElementById('inquire').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    }
  });

  /* Header: wordmark -> mark on scroll */
  (function () {
    var h = d.getElementById('hdr'); if (!h) return;
    var compact = false, ticking = false;
    function update() {
      var y = scrollY || d.documentElement.scrollTop || 0;
      if (!compact && y > 60) compact = true; else if (compact && y < 24) compact = false;
      h.classList.toggle('is-compact', compact);
      if (dotsBox) {
        var f = d.getElementById('inquire').getBoundingClientRect().top;
        dotsBox.style.visibility = f < innerHeight * .6 ? 'hidden' : '';
      }
      ticking = false;
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  })();

  /* Menu */
  var b = d.getElementById('burger');
  function toggle(open) {
    body.classList.toggle('menu-open', open);
    b.setAttribute('aria-expanded', open);
    b.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    b.querySelector('.menu-label').textContent = open ? 'Close' : 'Menu';
  }
  b.addEventListener('click', function () { toggle(!body.classList.contains('menu-open')) });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });

  /* ------------------------------------------------------------------
     Manufacture film: framed player below the story.
     Drop your file at assets/video/manufacture.mp4, or set data-embed on
     #filmScreen to a YouTube / Vimeo embed URL (see the HTML comment).
     ------------------------------------------------------------------ */
  (function () {
    var film = d.getElementById('film'); if (!film) return;
    var stageEl = d.getElementById('filmStage'), screen = d.getElementById('filmScreen'), vid = d.getElementById('filmVideo');
    var playBtn = d.getElementById('filmPlay'), label = d.getElementById('filmLabel'), bar = d.getElementById('filmBar');
    var bPlay = d.getElementById('filmToggle'), bMute = d.getElementById('filmMute'), bFs = d.getElementById('filmFs');
    var seek = d.getElementById('filmSeek'), tm = d.getElementById('filmTime'), dur = d.getElementById('filmDur');
    var note = d.getElementById('filmNote'), mark = film.querySelector('.film__mark');
    var embed = screen.getAttribute('data-embed') || '';
    var started = false, hideT = 0, noteT = 0;

    vid.removeAttribute('controls');

    /* Heading: word-by-word reveal, same language as the chapters */
    var ft = d.getElementById('filmTitle');
    if (!reduce) {
      var txt = ft.textContent.trim(); ft.setAttribute('aria-label', txt);
      ft.innerHTML = txt.split(/\s+/).map(function (w, i) {
        return '<span class="w" aria-hidden="true" style="--d:' + i + '"><span>' + w.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span></span>';
      }).join(' ');
    }
    if ('IntersectionObserver' in window && !reduce) {
      var inObs = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { film.classList.add('is-in'); inObs.disconnect(); } }, { threshold: .3 });
      inObs.observe(d.querySelector('.film__head'));
    } else film.classList.add('is-in');

    /* Scroll-linked entrance: the frame grows into place and its hairline draws around it */
    var fticking = false;
    function filmUpdate() {
      fticking = false;
      var p = 1;
      if (!reduce && !started) {
        var r = stageEl.getBoundingClientRect();
        p = ease(clamp((innerHeight - r.top) / (innerHeight * .74), 0, 1));
      }
      var q = p * 4;
      stageEl.style.setProperty('--p', p.toFixed(4));
      stageEl.style.setProperty('--e1', clamp(q, 0, 1).toFixed(3));
      stageEl.style.setProperty('--e2', clamp(q - 1, 0, 1).toFixed(3));
      stageEl.style.setProperty('--e3', clamp(q - 2, 0, 1).toFixed(3));
      stageEl.style.setProperty('--e4', clamp(q - 3, 0, 1).toFixed(3));
      if (mark && !reduce) mark.style.setProperty('--r', ((scrollY || 0) * .012).toFixed(2));
    }
    function reqFilm() { if (!fticking) { fticking = true; requestAnimationFrame(filmUpdate); } }
    addEventListener('scroll', reqFilm, { passive: true });
    addEventListener('resize', reqFilm);
    filmUpdate();

    /* Chapter dots and menu follow the reader into the film */
    var fd = dots[N], fm = menuLinks[N];
    if (fd && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        var on = es[0].isIntersecting;
        inFilm = on;
        if (on) {
          dots.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
          menuLinks.forEach(function (a) { a.classList.remove('is-active'); });
          fd.classList.add('is-active'); fd.setAttribute('aria-current', 'step');
          if (fm) fm.classList.add('is-active');
          active = -2;
        } else if (active === -2) { active = -1; render(cur); }
      }, { threshold: .35 }).observe(film);
    }

    /* Player */
    function fmt(s) { if (!isFinite(s) || s < 0) return '0:00'; var m = Math.floor(s / 60), x = Math.floor(s % 60); return m + ':' + (x < 10 ? '0' : '') + x; }
    function setUI(on) { screen.classList.toggle('is-ui', on); }
    function showUI() { setUI(true); clearTimeout(hideT); if (!vid.paused && !vid.ended) hideT = setTimeout(function () { setUI(false); }, 2600); }
    function say(msg) { note.textContent = msg; note.classList.add('is-on'); clearTimeout(noteT); noteT = setTimeout(function () { note.classList.remove('is-on'); }, 3600); }
    function reset() { started = false; screen.classList.remove('is-started', 'is-playing', 'is-ui'); label.textContent = 'Replay Film'; filmUpdate(); }

    function start() {
      if (embed) {
        var f = d.createElement('iframe');
        f.src = embed + (embed.indexOf('?') > -1 ? '&' : '?') + 'autoplay=1';
        f.title = 'Manufacture film'; f.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture'); f.setAttribute('allowfullscreen', '');
        screen.appendChild(f); screen.classList.add('is-embed', 'is-started'); started = true; return;
      }
      var pr = vid.play();
      if (pr && pr.catch) pr.catch(function () { say('Film coming soon'); });
    }
    function toggle() { if (!started) start(); else if (vid.paused) vid.play(); else vid.pause(); }

    playBtn.addEventListener('click', function (e) { e.stopPropagation(); start(); });
    bPlay.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
    screen.addEventListener('click', function (e) {
      if (!started || embed || e.target.closest('.film__bar')) return;
      if (!screen.classList.contains('is-ui')) { showUI(); return; }   /* touch: first tap shows the controls */
      toggle();
    });
    screen.addEventListener('mousemove', function () { if (started) showUI(); });
    screen.addEventListener('focusin', function () { if (started) showUI(); });
    screen.addEventListener('touchstart', function () { if (started) showUI(); }, { passive: true });

    vid.addEventListener('play', function () { started = true; screen.classList.add('is-started', 'is-playing'); showUI(); filmUpdate(); });
    vid.addEventListener('pause', function () { if (vid.ended) return; screen.classList.remove('is-playing'); clearTimeout(hideT); setUI(true); });
    vid.addEventListener('ended', function () { vid.currentTime = 0; seek.value = 0; seek.style.setProperty('--v', '0%'); reset(); });
    vid.addEventListener('loadedmetadata', function () { dur.innerHTML = '<b>' + fmt(vid.duration) + '</b> &middot; Manufacture Film'; tm.textContent = '0:00 / ' + fmt(vid.duration); });
    vid.addEventListener('timeupdate', function () {
      if (!vid.duration) return;
      var v = vid.currentTime / vid.duration * 1000;
      seek.value = v; seek.style.setProperty('--v', (v / 10).toFixed(2) + '%');
      tm.textContent = fmt(vid.currentTime) + ' / ' + fmt(vid.duration);
    });
    function failed() { if (!started) return; reset(); label.textContent = 'Play Film'; say('Film coming soon'); }
    vid.addEventListener('error', failed);
    [].slice.call(vid.querySelectorAll('source')).forEach(function (s) { s.addEventListener('error', function () { if (!started) return; failed(); }); });

    seek.addEventListener('input', function () { if (vid.duration) vid.currentTime = seek.value / 1000 * vid.duration; seek.style.setProperty('--v', (seek.value / 10).toFixed(2) + '%'); });
    bMute.addEventListener('click', function (e) { e.stopPropagation(); vid.muted = !vid.muted; screen.classList.toggle('is-muted', vid.muted); bMute.setAttribute('aria-label', vid.muted ? 'Unmute' : 'Mute'); });
    bPlay.addEventListener('keydown', function (e) { e.stopPropagation(); });

    var canFs = screen.requestFullscreen || screen.webkitRequestFullscreen || vid.webkitEnterFullscreen;
    if (!canFs) bFs.style.display = 'none';
    bFs.addEventListener('click', function (e) {
      e.stopPropagation();
      if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); }
      else if (screen.requestFullscreen) screen.requestFullscreen();
      else if (screen.webkitRequestFullscreen) screen.webkitRequestFullscreen();
      else if (vid.webkitEnterFullscreen) vid.webkitEnterFullscreen();
    });

    /* Pause when the frame scrolls away (not while full screen) */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting && !vid.paused && !(d.fullscreenElement || d.webkitFullscreenElement)) vid.pause();
      }, { threshold: .15 }).observe(screen);
    }
  })();

  /* Footer reveal */
  var rv = d.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-visible'); io.unobserve(x.target) } }) }, { threshold: .2 });
    rv.forEach(function (el) { io.observe(el) });
  } else rv.forEach(function (el) { el.classList.add('is-visible') });
})();
