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

Para apagar el chat: pon `CHAT_ENABLED` a `"false"` en la sección `vars` de `wrangler.jsonc` y despliega (`npx wrangler deploy`); el front muestra entonces solo los botones de contacto.

## Datos

- Proyectos: `public/data/projects.json` (capturas con `node tools/optimize-project-images.mjs`, originales en `assets-src/proyectos/`). Para añadir o editar un proyecto: edita el JSON (respeta los campos existentes; `image: null` y `status: "proximamente"` si aún no tiene captura ni enlaces) y, si tiene captura nueva, colócala en `assets-src/proyectos/<id>.*` y vuelve a correr el script de optimización. Los 3 `featured` de la parada 200 están fijos en los frames de Blender: cambiar cuáles son "featured" en el JSON no cambia lo que se ve ahí, solo la sección `#proyectos`.
- Certificados: `public/data/certificados.json`. Para añadir uno nuevo: copia el PDF a `public/assets/certificados/`, añade una entrada con `id`, `name`, `issuer`, `date`, `fileUrl` (o `verifyUrl` si no hay archivo, nunca los dos). Para actualizar el CV: sustituye `public/assets/docs/cv-daniel-rodriguez-machado.pdf` (mismo nombre de archivo, así no hay que tocar el HTML).
- Base de conocimiento del chat: `knowledge/dani.md`, un único Markdown en primera persona que se incluye entero en el prompt (sin RAG). Edítalo con texto real y en español; lo que no esté ahí, el asistente dice que no lo sabe. Tras editarlo no hace falta redeploy del front, pero sí un `npx wrangler deploy` (o esperar al deploy automático) para que el Worker use la versión nueva.
- Actividad de GitHub: `public/data/github.json`, generado por `.github/workflows/github-stats.yml` (programado a diario + manual) o en local con `GITHUB_TOKEN=… node tools/github-contributions.mjs`.

## Despliegue

1. `npx wrangler login` (una vez, para autorizar la CLI con tu cuenta de Cloudflare).
2. Secreto de producción: `npx wrangler secret put OPENAI_API_KEY`.
3. `npx wrangler deploy`. Comprueba antes que no rompe nada con `npx wrangler deploy --dry-run`.

Alternativa sin `deploy` manual: conectar el repo de GitHub en el dashboard de Cloudflare (**Workers & Pages → Workers Builds**), apuntando a esta rama; cada `git push` a esa rama despliega solo. Esta es la forma recomendada porque republica solo cuando la Action de abajo hace commit.

### Cómo se republica el sitio cuando el bot actualiza `github.json`

La Action `.github/workflows/github-stats.yml` corre a diario, regenera `public/data/github.json` y hace `git commit` + `git push` si hay cambios, sobre la misma rama del repo:

- Con **Workers Builds** conectado (opción recomendada arriba), ese push dispara automáticamente un nuevo `wrangler deploy`: no hace falta nada manual.
- Sin Workers Builds, el commit del bot queda en el repo pero el Worker desplegado sigue sirviendo el `github.json` antiguo hasta el siguiente `npx wrangler deploy` manual.

Nota: la Action necesita que este repo tenga un remoto en GitHub (`git remote add origin …` y `git push`) para poder ejecutarse; con el repo solo en local, como ahora, no corre.
