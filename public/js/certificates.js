// Certificados: un único fetch cacheado; pinta la parada 160
import { CONFIG } from './config.js';

let cache = null;

export function loadCertificates() {
  cache ??= fetch(CONFIG.CERTIFICATES_URL).then((r) => {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  });
  return cache;
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

export async function renderCertificates(container) {
  const list = await loadCertificates();
  container.replaceChildren(...list.map((c) => {
    const li = el('li', 'cert');
    const info = el('div', 'cert__info');
    info.append(el('span', 'cert__name', c.name), el('span', 'cert__issuer', c.issuer));
    li.append(info);
    // Nunca los dos a la vez: el archivo tiene prioridad sobre el enlace de verificación
    const href = c.fileUrl || c.verifyUrl;
    if (href) {
      const a = el('a', 'btn btn--small', 'Ver certificado');
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', `Ver certificado: ${c.name}`);
      li.append(a);
    }
    return li;
  }));
}
