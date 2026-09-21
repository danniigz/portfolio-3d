// Descarga de frames (blobs en memoria) y ventana de ImageBitmaps decodificados
import { CONFIG } from './config.js';

const pad = (n) => String(n).padStart(4, '0');

export function createLoader({ folder, count, stopFrames, windowSize, onChange }) {
  const blobs = new Array(count + 1).fill(null);
  const bitmaps = new Map();
  const pending = new Set();
  const stopSet = new Set(stopFrames);
  let needed = new Set(stopFrames);
  let lastKey = '';
  let dirty = true;
  let decoding = 0;

  async function fetchFrame(n, retry = 1) {
    try {
      const r = await fetch(`${folder}/frame_${pad(n)}.webp`);
      if (!r.ok) throw new Error(r.status);
      blobs[n] = await r.blob();
      dirty = true;
    } catch (e) {
      if (retry > 0) return fetchFrame(n, retry - 1);
    }
  }

  // Cola con concurrencia limitada
  async function runQueue(list, concurrency, onDone) {
    let i = 0;
    const worker = async () => {
      while (i < list.length) {
        await fetchFrame(list[i++]);
        onDone?.();
      }
    };
    await Promise.all(Array.from({ length: concurrency }, worker));
  }

  // Fase 1: paradas + 1 de cada N. Devuelve la función de la fase 2 (segundo plano)
  async function preload(onProgress) {
    const first = [];
    for (let n = 1; n <= count; n++) {
      if (stopSet.has(n) || (n - 1) % CONFIG.PRELOAD_STEP === 0) first.push(n);
    }
    first.sort((a, b) => stopSet.has(b) - stopSet.has(a) || a - b);
    let done = 0;
    await runQueue(first, CONFIG.CONCURRENCY, () => onProgress?.(++done / first.length));
    const firstSet = new Set(first);
    const rest = [];
    for (let n = 1; n <= count; n++) if (!firstSet.has(n)) rest.push(n);
    return () => runQueue(rest, CONFIG.CONCURRENCY, () => { dirty = true; onChange?.(); });
  }

  function decode(n) {
    pending.add(n);
    decoding++;
    createImageBitmap(blobs[n])
      .then((bmp) => {
        if (needed.has(n)) bitmaps.set(n, bmp);
        else bmp.close();
      })
      .catch(() => {})
      .finally(() => {
        pending.delete(n);
        decoding--;
        dirty = true;
        onChange?.();
      });
  }

  // Ventana alrededor del frame actual, priorizando la dirección de scroll
  function updateWindow(center, dir) {
    const key = `${center}|${dir}`;
    if (key === lastKey && !dirty) return;
    lastKey = key;
    dirty = false;
    const list = [];
    for (let d = -windowSize; d <= windowSize; d++) {
      const n = center + d;
      if (n < 1 || n > count) continue;
      const ahead = dir === 0 || Math.sign(d) === dir;
      list.push([n, Math.abs(d) * (ahead ? 1 : 1.5)]);
    }
    list.sort((a, b) => a[1] - b[1]);
    needed = new Set([...stopSet, ...list.map((x) => x[0])]);
    for (const [n, bmp] of bitmaps) {
      if (!needed.has(n)) { bmp.close(); bitmaps.delete(n); }
    }
    const order = [...list.map((x) => x[0]), ...stopSet];
    for (const n of order) {
      if (decoding >= CONFIG.MAX_DECODING) { dirty = true; break; }
      if (blobs[n] && !bitmaps.has(n) && !pending.has(n)) decode(n);
    }
  }

  // Frame decodificado más cercano al pedido: nunca deja el canvas vacío
  function nearest(n) {
    if (bitmaps.has(n)) return { n, bmp: bitmaps.get(n) };
    for (let d = 1; d <= count; d++) {
      if (bitmaps.has(n - d)) return { n: n - d, bmp: bitmaps.get(n - d) };
      if (bitmaps.has(n + d)) return { n: n + d, bmp: bitmaps.get(n + d) };
    }
    return null;
  }

  return {
    preload,
    updateWindow,
    nearest,
    stats: () => ({ bitmaps: bitmaps.size, blobs: blobs.filter(Boolean).length }),
  };
}
