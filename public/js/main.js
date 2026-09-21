// Arranque: carga de frames, escena, secciones y datos
import { CONFIG } from './config.js';
import { createLoader } from './loader.js';
import { initScene } from './scene.js';
import { runCounters, initCopyEmail } from './sections.js';
import { renderFeatured, renderGrid } from './projects.js';
import { renderCertificates } from './certificates.js';
import { renderGithub } from './github.js';
import { initContact } from './contact.js';

const params = new URLSearchParams(location.search);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || params.has('reduced');
const modeLink = document.querySelector('#modo-estatico');
const isMobile = window.innerWidth <= CONFIG.MOBILE_MAX_WIDTH;
const folder = isMobile ? CONFIG.FOLDERS.mobile : CONFIG.FOLDERS.desktop;

const $ = (s) => document.querySelector(s);
const sections = [...document.querySelectorAll('.stop')];

// Contenido dinámico (común a ambos modos)
renderFeatured($('#destacados')).catch(() => {});
renderGrid($('#proyectos-grid'), $('#proyectos-filtros'), $('#proyectos-estado')).catch(() => {
  $('#proyectos-grid').textContent = 'No se pudieron cargar los proyectos.';
});
renderCertificates($('#certificados-lista')).catch(() => {
  $('#certificados-lista').textContent = 'No se pudieron cargar los certificados.';
});
renderGithub($('#github-mapa'), $('#github-total'));
initCopyEmail($('#copiar-email'));

// Contacto: enlaces, Calendly y formulario
initContact();

// Chat: el módulo se carga al primer clic o en reposo, sin competir con los frames
let chatApi = null;
const loadChat = () => (chatApi ??= import('./chat.js').then((m) => m.initChat($('#chat-launcher'))));
$('#chat-launcher').addEventListener('click', () => loadChat().then((c) => c.toggle()));
// Botones del portfolio que invitan a preguntar a la IA
document.querySelectorAll('[data-open-chat]').forEach((b) => b.addEventListener('click', () => loadChat().then((c) => c.open())));
(window.requestIdleCallback || ((f) => setTimeout(f, 3000)))(() => loadChat(), { timeout: 8000 });

// Punto de recorte del retrato
document.documentElement.style.setProperty('--photo-position', CONFIG.PHOTO_POSITION);

// Aplica lado del texto de cada parada
sections.forEach((el, i) => el.classList.add(`side-${CONFIG.STOPS[i].side}`));

// Tabulación a lo largo de todo el scroll: las paradas inactivas están ocultas, así que Tab
// desde el último control de una parada salta a la siguiente que tenga controles (y Mayús+Tab al revés)
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])';
function initKeyboardFlow(scene) {
  const stopControls = (el) => [...el.querySelectorAll(FOCUSABLE)].filter((c) => !c.closest('[hidden]'));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || e.ctrlKey || e.altKey || e.metaKey) return;
    const from = sections.findIndex((s) => s.contains(e.target));
    if (from < 0) return;
    const own = stopControls(sections[from]);
    const edge = e.shiftKey ? own[0] : own[own.length - 1];
    if (e.target !== edge) return;
    const step = e.shiftKey ? -1 : 1;
    for (let j = from + step; j >= 0 && j < sections.length; j += step) {
      const next = stopControls(sections[j]);
      if (!next.length) continue;
      e.preventDefault();
      scene.goToStop(j);
      next[e.shiftKey ? next.length - 1 : 0].focus({ preventScroll: true });
      return;
    }
  });
}

function hideLoader() {
  const l = $('#cargando');
  l.classList.add('is-done');
  document.documentElement.classList.remove('loading');
  setTimeout(() => l.remove(), 250);
}

if (reduced) {
  // Con ?reduced=1 el enlace vuelve a la versión animada; con la preferencia del sistema ya no hace falta
  if (params.has('reduced')) { modeLink.textContent = 'Ver versión animada'; modeLink.href = location.pathname; }
  else modeLink.remove();
  // Sin scrubbing: 8 frames fijos con su texto
  document.documentElement.classList.add('reduced');
  const host = $('#estatico');
  sections.forEach((el, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'static-stop';
    const img = document.createElement('img');
    img.src = `${folder}/frame_${String(CONFIG.STOPS[i].frame).padStart(4, '0')}.webp`;
    img.alt = '';
    img.width = 1600;
    img.height = 900;
    img.loading = i === 0 ? 'eager' : 'lazy';
    img.decoding = 'async';
    wrap.append(img, el);
    host.append(wrap);
  });
  $('#scroll').remove();
  host.hidden = false;
  runCounters($('#cifras'), false);
  hideLoader();
} else {
  const canvas = $('#lienzo');
  let scene;
  const loader = createLoader({
    folder,
    count: CONFIG.FRAME_COUNT,
    stopFrames: CONFIG.STOPS.map((s) => s.frame),
    windowSize: isMobile ? CONFIG.WINDOW.mobile : CONFIG.WINDOW.desktop,
    onChange: () => scene?.kick(),
  });
  const bar = $('#cargando-barra');
  const pct = $('#cargando-pct');
  const progress = $('#cargando [role=progressbar]');
  const status = $('#estado-carga');
  let announced = 0;

  loader.preload((p) => {
    const v = Math.round(p * 100);
    bar.style.transform = `scaleX(${p})`;
    pct.textContent = `${v}%`;
    progress.setAttribute('aria-valuenow', v);
    // Lectores de pantalla: un aviso cada 25 %
    const step = Math.floor(v / 25) * 25;
    if (step > announced && step < 100) { announced = step; status.textContent = `Cargando la escena: ${step} %`; }
  }).then((phase2) => {
    status.textContent = 'Escena lista. Desplaza para recorrer el despacho.';
    scene = initScene({
      canvas,
      container: $('#scroll'),
      sections,
      loader,
      onReveal: (i) => { if (CONFIG.STOPS[i].id === 'cifras') runCounters($('#cifras')); },
    });
    hideLoader();
    phase2();
    initKeyboardFlow(scene);
    if (params.has('debug')) {
      window.__scene = scene;
      const box = document.createElement('pre');
      box.className = 'debug';
      document.body.append(box);
      setInterval(() => { box.textContent = JSON.stringify(scene.stats()); }, 300);
    }
  });
  document.documentElement.classList.add('loading');
}
