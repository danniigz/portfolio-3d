# Portfolio 3D

Portfolio de Daniel Rodríguez Machado: scroll-scrubbing sobre 280 frames de Blender. HTML, CSS y JS vanilla (módulos ES) en `public/`.

## Ejecutar en local

```bash
npx --yes serve public -l 5173
```

Abre http://localhost:5173. (En la fase 5 pasará a `wrangler dev`.)

Contacto: `CALENDLY_URL` y `WEB3FORMS_ACCESS_KEY` en `config.js`. `privacidad.html` es un borrador que debes revisar.

Parámetros de depuración: `?debug` (contador de frames/bitmaps), `?reduced=1` (fuerza el modo sin animación).

## Probar en el móvil

Con el móvil en la misma wifi, abre `http://<IP-de-tu-PC>:5173` (`ipconfig` para ver la IP). `serve` ya escucha en la red local.

## Constantes

Todo se ajusta en [public/js/config.js](public/js/config.js): alturas de hold/transición, suavizado, ventana de memoria, `FIT` (`cover`/`contain`), lado del texto y `focusX` de cada parada, proyectos destacados y contacto.

## Datos

- Proyectos: `public/data/projects.json` (capturas con `node tools/optimize-project-images.mjs`, originales en `assets-src/proyectos/`).
- Actividad de GitHub: `public/data/github.json`, generado por `.github/workflows/github-stats.yml` (o `GITHUB_TOKEN=… node tools/github-contributions.mjs`).
