// Proyectos: un único fetch cacheado; pinta los destacados de la parada 200 y la sección #proyectos
import { CONFIG } from './config.js';

let cache = null;

export function loadProjects() {
  cache ??= fetch(CONFIG.PROJECTS_URL)
    .then((r) => {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then((list) => [...list].sort((a, b) => a.order - b.order));
  return cache;
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function link(href, label, cls) {
  const a = el('a', cls, label);
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  return a;
}

// Si la captura falla, se sustituye por un bloque oscuro con el nombre
function thumb(p) {
  const wrap = el('div', 'project__media');
  const img = document.createElement('img');
  img.src = p.image;
  img.alt = `Captura de ${p.name}`;
  img.width = 800;
  img.height = 500;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.addEventListener('error', () => {
    img.remove();
    wrap.append(el('span', 'project__fallback', p.name));
  });
  wrap.append(img);
  return wrap;
}

function card(p) {
  const art = el('article', 'project');
  art.dataset.tech = p.tech.join('|');
  if (p.status === 'proximamente') {
    art.classList.add('project--soon');
    const body = el('div', 'project__body');
    body.append(el('h3', 'project__name', p.name), el('p', 'project__desc', p.description), el('span', 'badge', 'Próximamente'));
    art.append(body);
    return art;
  }
  const body = el('div', 'project__body');
  body.append(el('h3', 'project__name', p.name), el('p', 'project__desc', p.description));
  if (p.tech.length) {
    const tags = el('ul', 'tags');
    p.tech.forEach((t) => tags.append(el('li', 'tag', t)));
    body.append(tags);
  }
  const actions = el('div', 'project__actions');
  if (p.demoUrl) actions.append(link(p.demoUrl, 'Ver demo', 'btn btn--primary'));
  if (p.repoUrl) actions.append(link(p.repoUrl, 'Código', 'btn'));
  if (p.demoUrl && p.demoCredentials) {
    const c = p.demoCredentials;
    actions.append(el('p', 'project__creds', `${c.label}: ${c.email} / ${c.password}`));
  }
  if (actions.children.length) body.append(actions);
  if (p.image) art.append(thumb(p));
  art.append(body);
  return art;
}

// Parada 200: solo los destacados, en el orden fijo de la escena
export async function renderFeatured(container) {
  const all = await loadProjects();
  container.replaceChildren();
  CONFIG.FEATURED_IDS.map((id) => all.find((p) => p.id === id && p.featured))
    .filter(Boolean)
    .forEach((p) => {
      const li = el('li', 'featured__item');
      li.append(el('span', 'featured__name', p.name));
      const tags = el('span', 'featured__tech', p.tech.join(' · '));
      li.append(tags);
      if (p.demoUrl) li.append(link(p.demoUrl, 'Ver demo', 'btn btn--small'));
      container.append(li);
    });
}

// Sección completa con filtro por tecnología
export async function renderGrid(grid, filters) {
  const all = await loadProjects();
  grid.replaceChildren(...all.map(card));

  const techs = [...new Set(all.flatMap((p) => p.tech))].sort((a, b) => a.localeCompare(b));
  const chips = ['Todos', ...techs].map((t) => {
    const b = el('button', 'chip', t);
    b.type = 'button';
    b.setAttribute('aria-pressed', t === 'Todos' ? 'true' : 'false');
    b.addEventListener('click', () => {
      filters.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
      grid.querySelectorAll('.project').forEach((art) => {
        art.hidden = t !== 'Todos' && !art.dataset.tech.split('|').includes(t);
      });
    });
    return b;
  });
  filters.replaceChildren(...chips);
}
