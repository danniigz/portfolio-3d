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
const isMobile = window.innerWidth <= CONFIG.MOBILE_MAX_WIDTH;
const folder = isMobile ? CONFIG.FOLDERS.mobile : CONFIG.FOLDERS.desktop;

const $ = (s) => document.querySelector(s);
const sections = [...document.querySelectorAll('.stop')];

// Contenido dinámico (común a ambos modos)
renderFeatured($('#destacados')).catch(() => {});
renderGrid($('#proyectos-grid'), $('#proyectos-filtros')).catch(() => {
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

function hideLoader() {
  const l = $('#cargando');
  l.classList.add('is-done');
  document.documentElement.classList.remove('loading');
  setTimeout(() => l.remove(), 250);
}

if (reduced) {
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

  loader.preload((p) => {
    const v = Math.round(p * 100);
    bar.style.transform = `scaleX(${p})`;
    pct.textContent = `${v}%`;
    progress.setAttribute('aria-valuenow', v);
  }).then((phase2) => {
    scene = initScene({
      canvas,
      container: $('#scroll'),
      sections,
      loader,
      onReveal: (i) => { if (CONFIG.STOPS[i].id === 'cifras') runCounters($('#cifras')); },
    });
    hideLoader();
    phase2();
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
