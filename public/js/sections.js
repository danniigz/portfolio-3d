// Comportamiento de las secciones: contadores y copiar email
import { CONFIG } from './config.js';

// Aproxima la curva --ease-out del CSS (cubic-bezier .23,1,.32,1)
const easeOut = (t) => 1 - Math.pow(1 - t, 5);

// Anima los contadores de la parada de cifras (solo transform/opacity en UI; aquí solo texto)
export function runCounters(root, animate = true) {
  root.querySelectorAll('[data-count]').forEach((node) => {
    const end = Number(node.dataset.count);
    if (!animate) { node.textContent = end; return; }
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / CONFIG.COUNTER_MS);
      node.textContent = Math.round(end * easeOut(t));
      if (t < 1) requestAnimationFrame(step);
    };
    node.textContent = 0;
    requestAnimationFrame(step);
  });
}

export function initCopyEmail(btn) {
  const label = btn.querySelector('span');
  const original = label.textContent;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(CONFIG.CONTACT.email);
      label.textContent = 'Copiado';
    } catch {
      label.textContent = 'Copia manualmente';
    }
    setTimeout(() => { label.textContent = original; }, 1800);
  });
}
