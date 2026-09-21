// Scroll-scrubbing: mapea el scroll a frames, dibuja el canvas y gestiona los fades de sección
import { CONFIG } from './config.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function initScene({ canvas, container, sections, loader, onReveal }) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const stops = CONFIG.STOPS;
  const n = stops.length;
  let vh = 0, H = 0, T = 0, period = 0, total = 0;
  let current = stops[0].frame;
  let target = current;
  let dir = 0;
  let drawn = -1;
  let raf = 0;
  let forceDraw = true;
  let lastY = -1;
  const state = sections.map(() => ({ o: -1, revealed: false }));

  function layout() {
    vh = window.innerHeight;
    H = CONFIG.HOLD_VH * vh;
    T = CONFIG.TRANSITION_VH * vh;
    period = H + T;
    total = n * H + (n - 1) * T;
    container.style.height = `${total + vh}px`;
    const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.MAX_DPR);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    forceDraw = true;
    lastY = -1;
  }

  const scrollPos = () => clamp(-container.getBoundingClientRect().top, 0, total);

  // Frame objetivo: lineal dentro de cada tramo (Blender ya aplica el easing)
  function frameAt(y) {
    const i = Math.min(n - 1, Math.floor(y / period));
    if (i >= n - 1) return stops[n - 1].frame;
    const r = y - i * period;
    if (r <= H) return stops[i].frame;
    const t = (r - H) / T;
    return stops[i].frame + (stops[i + 1].frame - stops[i].frame) * t;
  }

  // Punto de enfoque horizontal interpolado entre paradas
  function focusAt(frame) {
    if (frame <= stops[0].frame) return stops[0].focusX ?? 0.5;
    for (let i = 0; i < n - 1; i++) {
      const a = stops[i], b = stops[i + 1];
      if (frame <= b.frame) {
        const t = (frame - a.frame) / (b.frame - a.frame);
        return (a.focusX ?? 0.5) + ((b.focusX ?? 0.5) - (a.focusX ?? 0.5)) * t;
      }
    }
    return stops[n - 1].focusX ?? 0.5;
  }

  function draw(bmp, frame) {
    const cw = canvas.width, ch = canvas.height;
    ctx.imageSmoothingQuality = 'high'; // reescalado más fino (redimensionar el canvas lo reinicia)
    const s = CONFIG.FIT === 'contain'
      ? Math.min(cw / bmp.width, ch / bmp.height)
      : Math.max(cw / bmp.width, ch / bmp.height);
    const dw = bmp.width * s, dh = bmp.height * s;
    if (CONFIG.FIT === 'contain') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cw, ch); }
    ctx.drawImage(bmp, (cw - dw) * focusAt(frame), (ch - dh) / 2, dw, dh);
  }

  function updateSections(y) {
    const fade = T * CONFIG.FADE_FRACTION;
    sections.forEach((el, i) => {
      const start = i * period, end = start + H;
      const d = y < start ? start - y : y > end ? y - end : 0;
      const o = clamp(1 - d / fade);
      const st = state[i];
      if (Math.abs(o - st.o) < 0.005) return;
      st.o = o;
      const sign = y < start ? 1 : -1;
      el.style.opacity = o;
      el.style.transform = `translate3d(0,${(sign * (1 - o) * CONFIG.FADE_SHIFT_PX).toFixed(1)}px,0)`;
      el.style.visibility = o <= 0.01 ? 'hidden' : 'visible';
      el.classList.toggle('is-active', o > 0.6);
      if (o > 0.6 && !st.revealed) { st.revealed = true; onReveal?.(i); }
    });
  }

  function tick() {
    raf = 0;
    const y = scrollPos();
    target = frameAt(y);
    const diff = target - current;
    if (Math.abs(diff) < 0.02) current = target;
    else { current += diff * CONFIG.LERP; dir = Math.sign(diff); }
    const shown = Math.round(current);
    loader.updateWindow(shown, dir);
    const best = loader.nearest(shown);
    if (best && (best.n !== drawn || forceDraw)) {
      draw(best.bmp, current);
      drawn = best.n;
      forceDraw = false;
    }
    if (y !== lastY) { updateSections(y); lastY = y; }
    if (current !== target) raf = requestAnimationFrame(tick);
  }

  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

  // Teclado: salta al centro del tramo fijo de una parada y la muestra al instante (sin esperar al scroll)
  function goToStop(i) {
    const y = i * period + H / 2;
    window.scrollTo({ top: window.scrollY + container.getBoundingClientRect().top + y, behavior: 'instant' });
    updateSections(y);
    lastY = y;
    kick();
  }

  let lastW = window.innerWidth, lastH = window.innerHeight;
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', () => {
    // En móvil la barra del navegador cambia el alto al hacer scroll: se ignora
    const dw = Math.abs(window.innerWidth - lastW), dh = Math.abs(window.innerHeight - lastH);
    if (dw === 0 && dh < 150) return;
    lastW = window.innerWidth; lastH = window.innerHeight;
    layout();
    kick();
  });

  layout();
  sections.forEach((el) => { el.style.visibility = 'hidden'; });
  kick();
  return { kick, goToStop, stats: () => ({ frame: drawn, current: +current.toFixed(1), ...loader.stats() }) };
}
