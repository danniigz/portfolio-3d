// Genera public/assets/img/projects/<id>.webp (800×500) desde assets-src/proyectos
// Uso: node tools/optimize-project-images.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'assets-src/proyectos';
const OUT = 'public/assets/img/projects';
const W = 800, H = 500;

// id del proyecto → nombre base del original (si no coincide con el id)
const ORIGINALS = {
  cineverse: 'capCineVerse',
  'harry-potter-quiz': 'capHPQuiz',
  'demo-barberia': 'capZonaCero',
  'construcciones-chamusinos': 'capConstCham',
  'tintoreria-verin': 'capTintoreria',
  calcufacil: 'capCalcuFacil',
  airecruit: 'capAirecruit',
  cumbrera: 'capCumbrera',
};

const projects = JSON.parse(fs.readFileSync('public/data/projects.json', 'utf8'));
const files = fs.existsSync(SRC) ? fs.readdirSync(SRC) : [];
fs.mkdirSync(OUT, { recursive: true });

const escapeXml = (s) => s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]);

for (const p of projects) {
  if (!p.image) continue;
  const bases = [p.id, ORIGINALS[p.id]].filter(Boolean);
  const file = files.find((f) => bases.includes(path.parse(f).name));
  const out = path.join(OUT, `${p.id}.webp`);
  if (file) {
    await sharp(path.join(SRC, file))
      .resize(W, H, { fit: 'cover', position: 'top' })
      .webp({ quality: 80 })
      .toFile(out);
    console.log('OK      ', p.id, '←', file);
  } else {
    // Sin original: fondo oscuro liso con el nombre
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#14100b"/><text x="50%" y="50%" fill="#FFC58A" font-family="sans-serif" font-size="44" font-weight="700" text-anchor="middle" dominant-baseline="middle">${escapeXml(p.name)}</text></svg>`;
    await sharp(Buffer.from(svg)).webp({ quality: 80 }).toFile(out);
    console.log('MARCADOR', p.id, '(falta el original)');
  }
}
