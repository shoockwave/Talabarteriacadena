/* ============================================================
   TALABARTERÍA CADENA — main.js  v3.0
   
   CAMBIOS v3.0:
   [FIX-01] Todos los módulos en IIFE con 'use strict'
   [FIX-02] Before/After: corregido cálculo de ancho de imagen
             para evitar deformación al recortar
   [FIX-03] Mobile menu: cierre con Escape y click-fuera corregido
   [FIX-04] FAQ: aria-expanded sincronizado correctamente
   [FIX-05] NavLink active: limpia style.color antes de setear
   [FIX-06] Scroll reveal: IntersectionObserver con cleanup
   ============================================================ */

/* ─── 01 · NAVBAR — aparición al hacer scroll ──────────────────── */
try { (function () {
  'use strict';
  var nb = document.getElementById('navbar');
  if (!nb) return;

  function onScroll() {
    /* Agrega clase 'scrolled' cuando se pasa de 60px de scroll */
    nb.classList.toggle('scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); /* Verificar estado inicial */
}()); } catch (err) { if (window.console) console.error(err); }

/* ─── 02 · NAV LINK ACTIVO — via IntersectionObserver ──────────── */
try { (function () {
  'use strict';
  var sections = document.querySelectorAll('section[id]');
  var links    = document.querySelectorAll('.nav-link');
  if (!sections.length || !links.length || !('IntersectionObserver' in window)) return;

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var id = entry.target.id;
      links.forEach(function (link) {
        var active = link.getAttribute('href') === '#' + id;
        link.classList.toggle('active', active);
        /* [FIX-05] Limpiar color inline antes de setear */
        link.style.color = active
          ? 'var(--oro)'
          : 'rgba(240,232,216,0.6)';
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(function (s) { obs.observe(s); });
}()); } catch (err) { if (window.console) console.error(err); }

/* ─── 03 · MENÚ MÓVIL ───────────────────────────────────────────── */
try { (function () {
  'use strict';
  var btn  = document.getElementById('menuBtn');
  var menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  function openMenu() {
    menu.classList.add('is-open');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Cerrar menú');
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Abrir menú');
  }

  /* Toggle al click del botón */
  btn.addEventListener('click', function () {
    menu.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  /* Cierra al navegar */
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  /* [FIX-03] Cierra con Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
  });

  /* [FIX-03] Cierra al click fuera del menú y del botón */
  ['click', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      if (!btn.contains(e.target) && !menu.contains(e.target)) closeMenu();
    }, { passive: true });
  });
}()); } catch (err) { if (window.console) console.error(err); }

/* ─── 04 · SCROLL REVEAL — IntersectionObserver ────────────────── */
try { (function () {
  'use strict';
  var els = document.querySelectorAll('.rv, .rvl, .rvr');
  if (!els.length) return;

  /* Respeta prefers-reduced-motion */
  if (!window.matchMedia || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(function (el) { el.classList.add('vis'); });
    return;
  }

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      /* Tomar delay del atributo data-delay */
      var delay = entry.target.dataset.delay || '0s';
      entry.target.style.setProperty('--delay', delay);
      entry.target.classList.add('vis');
      /* [FIX-06] Cleanup: dejar de observar una vez visible */
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  els.forEach(function (el) { obs.observe(el); });
}()); } catch (err) { if (window.console) console.error(err); }

/* ─── 05 · BEFORE/AFTER SLIDER ─────────────────────────────────────
   [FIX-02] Corregido el cálculo de ancho de la imagen interna.
   La imagen dentro de .ba-after debe tener el ancho del contenedor
   padre (no de .ba-after, que se recorta), para evitar deformación.
   ─────────────────────────────────────────────────────────────── */
try { (function () {
  'use strict';
  var container = document.getElementById('baSlider');
  var after     = document.getElementById('baAfter');
  var handle    = document.getElementById('baHandle');
  var afterImg  = after ? after.querySelector('img') : null;
  if (!container || !after || !handle) return;

  var dragging = false;

  function updateAfterImage() {
    /* [FIX-02] Pasar el ancho real del contenedor a la imagen
       mediante CSS custom property para que no se deforme */
    if (afterImg) {
      afterImg.style.width = container.offsetWidth + 'px';
    }
  }

  function setPosition(clientX) {
    var rect = container.getBoundingClientRect();
    var pct  = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(2, Math.min(98, pct));     /* clamp 2-98% */
    after.style.width = pct + '%';
    handle.style.left = pct + '%';
  }

  /* Mouse */
  container.addEventListener('mousedown', function (e) {
    dragging = true;
    setPosition(e.clientX);
  });
  document.addEventListener('mousemove', function (e) {
    if (dragging) setPosition(e.clientX);
  });
  document.addEventListener('mouseup', function () { dragging = false; });

  /* Touch */
  container.addEventListener('touchstart', function (e) {
    dragging = true;
    setPosition(e.touches[0].clientX);
  }, { passive: true });
  document.addEventListener('touchmove', function (e) {
    if (dragging) setPosition(e.touches[0].clientX);
  }, { passive: true });
  document.addEventListener('touchend', function () { dragging = false; });

  /* Inicializar dimensiones y recalcular al resize */
  updateAfterImage();
  window.addEventListener('resize', updateAfterImage, { passive: true });
}()); } catch (err) { if (window.console) console.error(err); }

/* ─── 06 · FAQ / PREGUNTAS FRECUENTES — acordeón ───────────────── */
try { (function () {
  'use strict';
  var btns = document.querySelectorAll('.faq-btn');
  if (!btns.length) return;

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var answer = btn.nextElementSibling;
      var icon   = btn.querySelector('.faq-icon');
      var isOpen = !answer.classList.contains('hidden');

      /* Cerrar todos los ítems abiertos */
      document.querySelectorAll('.faq-answer').forEach(function (a) {
        a.classList.add('hidden');
      });
      document.querySelectorAll('.faq-icon').forEach(function (i) {
        i.classList.remove('rot');
      });
      /* [FIX-04] Sincronizar aria-expanded en todos los botones */
      document.querySelectorAll('.faq-btn').forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
      });

      /* Si no estaba abierto, abrir éste */
      if (!isOpen) {
        answer.classList.remove('hidden');
        if (icon) icon.classList.add('rot');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}()); } catch (err) { if (window.console) console.error(err); }

/* ─── 07 · FORMULARIO DE CONTACTO ──────────────────────────────── */
try { (function () {
  'use strict';
  var form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    /* [CAMBIO v3.4] Validación nativa: no deja pasar campos obligatorios vacíos */
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var f = form.elements;
    var msg = 'Hola, soy ' + f.nombre.value + ' ' + f.apellido.value + '. Me gustaría solicitar una cotización.' +
      (f.tipo.value ? '\nMe interesa: ' + f.tipo.options[f.tipo.selectedIndex].text + '.' : '') +
      '\n' + f.mensaje.value + '\nMi correo: ' + f.email.value;
    var url = 'https://wa.me/5529706567?text=' + encodeURIComponent(msg);
    if (!window.open(url, '_blank', 'noopener')) window.location.href = url;
    form.classList.add('hidden');
    var success = document.getElementById('formSuccess');
    if (success) success.classList.remove('hidden');
  });
}()); } catch (err) { if (window.console) console.error(err); }