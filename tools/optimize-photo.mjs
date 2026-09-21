// Genera public/assets/img/dani-<ancho>.webp (retrato 4:5) desde assets-src/dani.*
// Uso: node tools/optimize-photo.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC_DIR = 'assets-src';
const OUT = 'public/assets/img';
// Anchos de salida; el original mide 700 px, no se amplía
const WIDTHS = [480, 700];
// Recorte 4:5 desde la parte alta (deja la cabeza y los hombros)
const CROP_TOP = 60;

const file = ['dani.webp', 'dani.jpg', 'dani.jpeg', 'dani.png'].find((f) => fs.existsSync(path.join(SRC_DIR, f)));
if (!file) {
  console.error('No hay foto en assets-src/ (dani.webp, dani.jpg o dani.png)');
  process.exit(1);
}

const input = path.join(SRC_DIR, file);
const { width, height } = await sharp(input).metadata();
const cropH = Math.min(Math.round(width * 1.25), height - CROP_TOP);
fs.mkdirSync(OUT, { recursive: true });

for (const w of WIDTHS) {
  const out = path.join(OUT, `dani-${w}.webp`);
  await sharp(input)
    .extract({ left: 0, top: CROP_TOP, width, height: cropH })
    .resize({ width: w, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(out);
  console.log('OK', out);
}
