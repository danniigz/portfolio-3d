# Portfolio 3D

Portfolio de Daniel Rodríguez Machado: scroll-scrubbing sobre 280 frames de Blender. HTML, CSS y JS vanilla (módulos ES) en `public/`.

## Ejecutar en local

```bash
npx wrangler dev
```

Abre http://localhost:8787. Sirve `public/` y el Worker con `POST /api/chat`.

## Chat con IA

- Secretos locales en `.dev.vars` (ignorado por git; plantilla en `.dev.vars.example`): `OPENAI_API_KEY=` con tu clave y `CHAT_MOCK=1` para respuestas simuladas sin gastar créditos (pon `0` o bórralo para usar OpenAI de verdad).
- En producción la clave es un secreto del Worker: `npx wrangler secret put OPENAI_API_KEY`.
- Variables en `wrangler.jsonc`: `OPENAI_MODEL`, `CHAT_ENABLED` (`"false"` apaga el chat) y `ALLOWED_ORIGINS`.
- El asistente responde solo con [knowledge/dani.md](knowledge/dani.md): rellena los `TODO(Dani)`.

Contacto: `CALENDLY_URL` y `WEB3FORMS_ACCESS_KEY` en `config.js`. `privacidad.html` es un borrador que debes revisar.

Parámetros de depuración: `?debug` (contador de frames/bitmaps), `?reduced=1` (fuerza el modo sin animación).

## Probar en el móvil

Con el móvil en la misma wifi: `npx wrangler dev --ip 0.0.0.0` y abre `http://<IP-de-tu-PC>:8787` (`ipconfig` para ver la IP). El chat funciona porque el origen coincide con el host de la petición.

## Constantes

Todo se ajusta en [public/js/config.js](public/js/config.js): alturas de hold/transición, suavizado, ventana de memoria, `FIT` (`cover`/`contain`), lado del texto y `focusX` de cada parada, proyectos destacados y contacto.

## Datos

- Proyectos: `public/data/projects.json` (capturas con `node tools/optimize-project-images.mjs`, originales en `assets-src/proyectos/`).
- Actividad de GitHub: `public/data/github.json`, generado por `.github/workflows/github-stats.yml` (o `GITHUB_TOKEN=… node tools/github-contributions.mjs`).
