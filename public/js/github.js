// Mapa de contribuciones a partir de data/github.json (generado por una GitHub Action)
import { CONFIG } from './config.js';

export async function renderGithub(container, totalNode) {
  let data;
  try {
    const r = await fetch(CONFIG.GITHUB_DATA_URL);
    if (!r.ok) throw new Error(r.status);
    data = await r.json();
  } catch {
    data = null;
  }
  container.replaceChildren();
  if (!data || !data.weeks?.length) {
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = 'Los datos de actividad se actualizan automáticamente; aún no hay ninguno.';
    container.append(p);
    totalNode?.parentElement.setAttribute('hidden', '');
    return;
  }
  const max = Math.max(1, ...data.weeks.flatMap((w) => w.days.map((d) => d.count)));
  const grid = document.createElement('div');
  grid.className = 'gh-grid';
  grid.style.setProperty('--weeks', data.weeks.length);
  grid.setAttribute('role', 'img');
  grid.setAttribute('aria-label', `Mapa de contribuciones de GitHub: ${data.total} en el último año`);
  data.weeks.forEach((w) => {
    w.days.forEach((d, i) => {
      const cell = document.createElement('span');
      cell.className = 'gh-cell';
      cell.style.gridRow = String(i + 1);
      cell.dataset.level = d.count === 0 ? 0 : Math.min(4, Math.ceil((d.count / max) * 4));
      cell.title = `${d.date}: ${d.count}`;
      grid.append(cell);
    });
  });
  container.append(grid);
  if (totalNode) totalNode.textContent = data.total;
}
