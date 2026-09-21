# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Reclutadores y clientes pequeños (negocios locales) que evalúan en pocos minutos si Daniel Rodríguez Machado (Dani) es la persona adecuada para desarrollar su web o incorporarse a su equipo. Llegan desde LinkedIn, CV o una recomendación, en escritorio o móvil, y quieren ver proyectos reales, skills, certificados y una vía directa de contacto.

## Product Purpose

Portfolio de un desarrollador web fullstack freelance. Éxito: que el visitante vea proyectos reales, resuelva sus dudas rápidas (con el asistente de IA) y agende una reunión, escriba un mensaje o descargue el CV.

## Positioning

Recorrido por scroll a lo largo de un despacho 3D renderizado en Blender (280 frames), con una sección del portfolio en cada parada, y un asistente de IA que responde a reclutadores sobre Dani en tercera persona, presentándose como IA.

## Operating Context

Web estática en `public/` servida por un Worker de Cloudflare que también expone `POST /api/chat`. Formulario con Web3Forms, reuniones con Calendly, chat con la API de OpenAI (clave solo como secreto del Worker).

## Capabilities and Constraints

- Ocho paradas: Hero, Cifras, Presentación, Skills, Certificados, Proyectos destacados, GitHub, Contacto; después `#proyectos` (9 proyectos) y `#contacto`.
- Datos en `public/data/*.json`; constantes solo en `public/js/config.js`.
- HTML, CSS y JS vanilla con módulos ES, sin frameworks ni bundler. Web en español.
- El scrub del scroll y los fades de sección son esenciales y no se eliminan.

## Brand Commitments

Oscuro y de alto contraste; acento ámbar #FFC58A / #FFA95C a juego con las luces de la escena; tipografía coherente con https://danniigz.github.io/portfolio. Registro: marca.

## Evidence on Hand

Nueve proyectos reales o de clase (`public/data/projects.json`), tres certificados (`public/data/certificados.json`), CV en PDF, retrato, mapa de contribuciones de GitHub. No hay testimonios ni cifras de clientes que inventar.

## Product Principles

1. El despacho 3D es el protagonista; la interfaz se aparta.
2. Legibilidad sobre cada frame antes que ornamento.
3. Honestidad: el asistente solo dice lo que hay en la base de conocimiento.
4. Contacto siempre a un paso.

## Accessibility & Inclusion

Contraste AA como mínimo, objetivos táctiles ≥ 44 px, foco visible, uso con teclado y respeto de prefers-reduced-motion.
