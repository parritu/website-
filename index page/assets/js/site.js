/* Facette & Co. — interactions (no libraries) */
/* ---- Contact details: edit these two lines only ---- */
var FACETTE_CONTACT = {
  email: "info@facetteandco.com",
  phone: "+91 XXXXX XXXXX"          /* placeholder until the client confirms; WhatsApp uses the same number */
};
(function(){
  var d=document, root=d.documentElement;
  root.classList.add('js');
  /* apply contact constants */
  (function(c){
    var digits=(c.phone||'').replace(/[^0-9+]/g,'');
    var real=/^\+?\d{10,15}$/.test(digits);
    d.querySelectorAll('[data-contact="email"]').forEach(function(a){a.textContent=c.email;a.href='mailto:'+c.email;});
    d.querySelectorAll('[data-contact="email-btn"]').forEach(function(a){a.href='mailto:'+c.email+'?subject=Project%20enquiry';});
    d.querySelectorAll('[data-contact="phone"]').forEach(function(a){a.textContent=c.phone;if(real){a.href='https://wa.me/'+digits.replace('+','');a.target='_blank';a.rel='noopener';}else{a.removeAttribute('href');a.setAttribute('aria-disabled','true');}});
  })(FACETTE_CONTACT);
  var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Veil: remove after its short moment */
  var veil=d.getElementById('veil');
  if(veil){setTimeout(function(){veil.remove();},1600);}

  /* Header state */
  var hdr=d.getElementById('hdr');
  var onScroll=function(){hdr.classList.toggle('scrolled',window.scrollY>40);};
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();

  /* Menu */
  var menu=d.getElementById('menu'),mb=d.getElementById('menuBtn'),mc=d.getElementById('menuClose');
  function setMenu(o){d.body.classList.toggle('menu-open',o);mb.setAttribute('aria-expanded',o);menu.setAttribute('aria-hidden',!o);if(o){mc.focus();}else{mb.focus({preventScroll:true});}}
  mb.addEventListener('click',function(){setMenu(true);});
  mc.addEventListener('click',function(){setMenu(false);});
  menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){d.body.classList.remove('menu-open');mb.setAttribute('aria-expanded',false);menu.setAttribute('aria-hidden',true);});});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'&&d.body.classList.contains('menu-open'))setMenu(false);});

  /* Hero video slider */
  var hero=d.getElementById('hero'),slides=[].slice.call(hero.querySelectorAll('.slide')),dots=[].slice.call(hero.querySelectorAll('.dot'));
  var cur=0,timer=null,DUR=7000,paused=false;
  hero.style.setProperty('--dur',DUR+'ms');
  function vid(i){return slides[i].querySelector('video');}
  function load(i){var v=vid(i);if(v&&!v.getAttribute('src')){v.src=v.dataset.src;v.preload='auto';v.load();}}
  function play(i){var v=vid(i);if(!v||rm)return;load(i);try{v.currentTime=0;}catch(e){}var p=v.play();if(p&&p.catch)p.catch(function(){});}
  function go(n){
    n=(n+slides.length)%slides.length; if(n===cur&&timer)return;
    var prev=cur; cur=n;
    slides.forEach(function(s,i){var on=i===n;s.classList.toggle('is-active',on);if(on)s.removeAttribute('inert');else s.setAttribute('inert','');});
    dots.forEach(function(dt,i){dt.classList.toggle('is-active',i===n);dt.classList.toggle('is-done',i<n);dt.setAttribute('aria-current',i===n?'true':'false');
      var bar=dt.querySelector('i');bar.style.animation='none';void bar.offsetWidth;bar.style.animation='';});
    play(n); setTimeout(function(){load((n+1)%slides.length);},2500);
    setTimeout(function(){var v=vid(prev);if(prev!==cur&&v)v.pause();},1700);
    schedule();
  }
  function schedule(){clearTimeout(timer);if(!paused&&!rm)timer=setTimeout(function(){go(cur+1);},DUR);}
  d.getElementById('next').addEventListener('click',function(){go(cur+1);});
  d.getElementById('prev').addEventListener('click',function(){go(cur-1);});
  dots.forEach(function(dt,i){dt.addEventListener('click',function(){go(i);});});
  function setPaused(p){paused=p;hero.classList.toggle('paused',p);if(p){clearTimeout(timer);}else{schedule();}}
  hero.addEventListener('focusin',function(){setPaused(true);});
  hero.addEventListener('focusout',function(){setPaused(false);});
  d.addEventListener('visibilitychange',function(){var v=vid(cur);if(d.hidden){setPaused(true);if(v)v.pause();}else{setPaused(false);if(v&&!rm){var p=v.play();if(p&&p.catch)p.catch(function(){});}}});
  /* swipe */
  var sx=null;
  hero.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;},{passive:true});
  hero.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50)go(cur+(dx<0?1:-1));sx=null;},{passive:true});
  /* video fallback: if a video errors, the poster stays */
  slides.forEach(function(s){var v=s.querySelector('video');v.addEventListener('error',function(){v.removeAttribute('src');},true);});
  /* pause hero video when off-screen */
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){es.forEach(function(e){var v=vid(cur);if(!v)return;if(e.isIntersecting){if(!rm){var p=v.play();if(p&&p.catch)p.catch(function(){});}}else v.pause();});},{threshold:0.05}).observe(hero);
  }
  go(0);

  /* Scroll reveals */
  var targets=d.querySelectorAll('.statement,.vt,.vt-card,.ev-panel,.rv');
  if('IntersectionObserver' in window&&!rm){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:0.18,rootMargin:'0px 0px -6% 0px'});
    targets.forEach(function(t){io.observe(t);});
  } else { targets.forEach(function(t){t.classList.add('in');}); }

  /* Gentle parallax on editorial images */
  var pars=[].slice.call(d.querySelectorAll('.ev-par'));
  if(!rm&&pars.length){
    var ticking=false;
    var upd=function(){ticking=false;var vh=window.innerHeight;
      pars.forEach(function(p){var r=p.parentNode.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;
        var k=((r.top+r.height/2)-vh/2)/(vh/2+r.height/2);p.style.transform='translate3d(0,'+(k*-6).toFixed(2)+'%,0)';});};
    window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(upd);}},{passive:true});
    window.addEventListener('resize',upd);upd();
  }
})();
