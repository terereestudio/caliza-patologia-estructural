/* =========================================================
   CALIZA — JS de la landing (sin dependencias, compatible con CSP estricta)
   ========================================================= */
(function(){
  'use strict';
  document.documentElement.classList.add('js');
  // Enlaces de WhatsApp con mensaje prellenado
  document.querySelectorAll('.js-wa').forEach(function(a){
    var msg = a.getAttribute('data-msg');
    if(msg){ a.href = a.href.split('?')[0] + '?text=' + encodeURIComponent(msg); }
    a.target = '_blank'; a.rel = 'noopener noreferrer';
  });

  // Menú mobile
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('nav');
  function closeNav(){ nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Abrir menú'); }
  toggle.addEventListener('click', function(){
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  nav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeNav); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeNav(); });

  // Borde del header al scrollear
  var header = document.querySelector('.site-header');
  function onScroll(){ header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // Revelado progresivo
  var els = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    }, {rootMargin:'0px 0px -8% 0px', threshold:.08});
    els.forEach(function(el){ io.observe(el); });
  } else { els.forEach(function(el){ el.classList.add('in'); }); }

  // Email armado en el navegador (no figura en texto plano en el HTML)
  document.querySelectorAll('.js-mail').forEach(function(a){
    var addr = a.getAttribute('data-u') + '@' + a.getAttribute('data-d');
    var subj = a.getAttribute('data-subject');
    a.href = 'mailto:' + addr + (subj ? '?subject=' + encodeURIComponent(subj) : '');
    var t = a.querySelector('.js-mail-text');
    if(t){ t.textContent = addr; }
  });

  // Formulario → WhatsApp (con honeypot, trampa de tiempo y consentimiento)
  var form = document.getElementById('contact-form');
  var loadedAt = Date.now();
  var errBox = document.getElementById('form-error');
  var showErr = function(msg){ errBox.textContent = msg; errBox.hidden = false; };
  var clean = function(v, max){ return String(v || '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max); };
  form.addEventListener('submit', function(e){
    e.preventDefault();
    errBox.hidden = true;
    // Bots: honeypot completo o envío en menos de 3 segundos → se descarta en silencio
    if(form.website.value !== '' || Date.now() - loadedAt < 3000){ return; }
    var name = clean(form.nombre.value, 60);
    if(!name){ form.nombre.focus(); form.nombre.setAttribute('aria-invalid','true'); showErr('Ingresá tu nombre para continuar.'); return; }
    form.nombre.removeAttribute('aria-invalid');
    if(!form.consentimiento.checked){ form.consentimiento.focus(); showErr('Para enviar la consulta tenés que aceptar la Política de Privacidad.'); return; }
    var lines = ['Hola CALIZA, soy ' + name + '.'];
    var city = clean(form.localidad.value, 60), msg = String(form.mensaje.value || '').replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, ' ').trim().slice(0, 600);
    if(city) lines.push('Localidad: ' + city);
    lines.push('Motivo: ' + clean(form.motivo.value, 60));
    if(msg) lines.push(msg);
    var numeros = ['5493624205886','5493624384988']; // Matías, Germán
    var destino = numeros[Math.random() < .5 ? 0 : 1];
    window.open('https://wa.me/' + destino + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener,noreferrer');
  });

  // Carrusel de servicios (mobile): puntos sincronizados con el scroll
  var track = document.querySelector('.services'), dots = document.getElementById('services-dots');
  if(track && dots){
    var cards = track.children;
    for(var i=0;i<cards.length;i++){
      (function(i){
        var b = document.createElement('button');
        b.type = 'button'; b.setAttribute('aria-label','Servicio ' + (i+1));
        b.addEventListener('click', function(){ track.scrollTo({left: cards[i].offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft), behavior:'smooth'}); });
        dots.appendChild(b);
      })(i);
    }
    var setDot = function(){
      var w = cards[0].getBoundingClientRect().width + 16;
      var idx = Math.min(cards.length - 1, Math.round(track.scrollLeft / w));
      Array.prototype.forEach.call(dots.children, function(d,j){ d.setAttribute('aria-current', j===idx); });
    };
    track.addEventListener('scroll', function(){ window.requestAnimationFrame(setDot); }, {passive:true});
    setDot();
  }

  // Nombres sobre la foto: aparece el cartel y se escribe el nombre (máquina de escribir)
  var photo = document.querySelector('.photo-wrap');
  if(photo){
    var tags = photo.querySelectorAll('.name-tag');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var typeTag = function(tag, delay){
      var name = tag.querySelector('.ghost').textContent, out = tag.querySelector('.tw');
      setTimeout(function(){
        tag.classList.add('on');
        if(reduced){ out.textContent = name; tag.classList.add('done'); return; }
        var i = 0;
        setTimeout(function step(){
          out.textContent = name.slice(0, ++i);
          if(i < name.length){ setTimeout(step, 110); } else { setTimeout(function(){ tag.classList.add('done'); }, 600); }
        }, 380);
      }, delay);
    };
    var go = function(){ Array.prototype.forEach.call(tags, function(t,i){ typeTag(t, i * 900); }); };
    if('IntersectionObserver' in window){
      var pio = new IntersectionObserver(function(en){ if(en[0].isIntersecting){ go(); pio.disconnect(); } }, {threshold:.5});
      pio.observe(photo);
    } else { go(); }
  }

  // Pasos: se destacan de a uno, 2,5 s cada uno, mientras la sección está en pantalla
  var steps = document.querySelectorAll('.step');
  if(steps.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window){
    var cur = -1, timer = null;
    var next = function(){
      if(cur >= 0) steps[cur].classList.remove('active');
      cur = (cur + 1) % steps.length;
      steps[cur].classList.add('active');
    };
    new IntersectionObserver(function(en){
      if(en[0].isIntersecting){ if(!timer){ next(); timer = setInterval(next, 2500); } }
      else if(timer){ clearInterval(timer); timer = null; }
    }, {threshold:.4}).observe(document.querySelector('.steps'));
  }

  // Carruseles (señales e Instagram): flechas a los costados
  document.querySelectorAll('[data-carousel]').forEach(function(car){
    var track = car.querySelector('.car-track'), prev = car.querySelector('.car-btn.prev'), next = car.querySelector('.car-btn.next');
    var stepW = function(){ var c = track.firstElementChild; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 24) : track.clientWidth; };
    var update = function(){
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    prev.addEventListener('click', function(){ track.scrollBy({left: -stepW(), behavior:'smooth'}); });
    next.addEventListener('click', function(){ track.scrollBy({left: stepW(), behavior:'smooth'}); });
    track.addEventListener('scroll', function(){ window.requestAnimationFrame(update); }, {passive:true});
    window.addEventListener('resize', update);
    update(); setTimeout(update, 1500); setTimeout(update, 4000);
  });

  // Movimiento reducido: congela también las animaciones SVG (SMIL)
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.querySelectorAll('.signal-art svg').forEach(function(svg){ if(svg.pauseAnimations) svg.pauseAnimations(); });
  }

  // Sube el botón de WhatsApp cuando se ve la firma, para no taparla
  var firma = document.querySelector('.firma-te'), wa = document.querySelector('.wa-float');
  if('IntersectionObserver' in window && firma && wa){
    new IntersectionObserver(function(e){ wa.classList.toggle('lift', e[0].isIntersecting); }).observe(firma);
  }

  /* Instagram: pegá acá los enlaces de posteos o reels (ej. https://www.instagram.com/p/XXXX/ o /reel/XXXX/).
     Si la lista está vacía se muestra la tarjeta del perfil. */
  var IG_POSTS = [
    'https://www.instagram.com/reel/DewqN7RxznD/',
    'https://www.instagram.com/reel/Dec01E6RCgx/',
    'https://www.instagram.com/reel/DMRDXH2M5_d/',
    'https://www.instagram.com/reel/DHcF9FisT8O/',
    'https://www.instagram.com/reel/DL3RuvtMP4e/'
  ];
  if(IG_POSTS.length){
    var feed = document.getElementById('ig-feed');
    while(feed.firstChild){ feed.removeChild(feed.firstChild); }
    IG_POSTS.forEach(function(url){
      if(!/^https:\/\/www\.instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/$/.test(url)) return;
      var bq = document.createElement('blockquote');
      bq.className = 'instagram-media';
      bq.setAttribute('data-instgrm-permalink', url + '?utm_source=ig_embed');
      bq.setAttribute('data-instgrm-version', '14');
      var a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'Ver en Instagram';
      bq.appendChild(a); feed.appendChild(bq);
    });
    var sc = document.createElement('script'); sc.async = true; sc.src = 'https://www.instagram.com/embed.js'; sc.referrerPolicy = 'strict-origin-when-cross-origin';
    document.body.appendChild(sc);
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
