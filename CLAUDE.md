# Portfolio 3D — reglas del proyecto

- Web estática en `public/` (HTML, CSS y JS vanilla con módulos ES; sin frameworks ni bundler salvo razón clara). Un único Worker de Cloudflare (`src/worker.js`) sirve `public/` como assets estáticos y expone `POST /api/chat`.
- Constantes ajustables solo en `public/js/config.js`. Ningún secreto en el cliente ni en el repo: las claves viven como secretos del Worker y en `.dev.vars` (ignorado por git).
- Web en español (`lang="es"`). Comentarios de código en español, breves.
- Diseño: oscuro y de alto contraste; acento ámbar #FFC58A / #FFA95C. Tipografía coherente con https://danniigz.github.io/portfolio. Contraste AA como mínimo. Respeta prefers-reduced-motion.
- Cuando choquen las guías de diseño manda este orden: 1) este archivo y la especificación de cada fase, 2) impeccable (tipografía, contraste, estructura, espaciado), 3) emil-design-eng (animación de interfaz: solo transform/opacity, menos de 300 ms, curvas ease-out, sin bounce), 4) taste-skill (solo referencia de acabado). El scrub del scroll y los fades de sección son la esencia del proyecto: las reglas de emil se aplican a botones, chat, contadores, etc., no para eliminarlos.
- Las skills piensan en React: aplica sus principios en CSS/JS vanilla y no añadas dependencias nuevas sin razón clara.
- Verificación: antes de dar una tarea por terminada, ábrela con el MCP de Playwright en escritorio (1440×900) y móvil (390×844). Nunca envíes el formulario real ni gastes créditos de OpenAI en pruebas: el Worker tiene modo mock (`CHAT_MOCK=1`).
- Commits pequeños por fase, mensaje en español.
