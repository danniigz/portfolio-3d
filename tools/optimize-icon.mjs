// Genera public/assets/img/icono-chat.png: silueta transparente a partir de assets-src/iconoChat.jpg
// (negro sobre blanco → el negro pasa a ser opaco). Se pinta con CSS mask para tomar el color del botón.
// Uso: node tools/optimize-icon.mjs
import sharp from 'sharp';

const SRC = 'assets-src/iconoChat.jpg';
const OUT = 'public/assets/img/icono-chat.png';
const SIZE = 128; // lado del lienzo cuadrado (se muestra a ~26 px, con margen para pantallas 2x/3x)

const { data, info } = await sharp(SRC).grayscale().negate().raw().toBuffer({ resolveWithObject: true });
const alpha = await sharp(data, { raw: { width: info.width, height: info.height, channels: 1 } }).png().toBuffer();
const silueta = await sharp({ create: { width: info.width, height: info.height, channels: 3, background: '#000' } })
  .joinChannel(alpha)
  .png()
  .toBuffer();

await sharp(silueta)
  .trim() // recorta el margen transparente
  .resize(SIZE, SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile(OUT);
console.log('OK', OUT);
