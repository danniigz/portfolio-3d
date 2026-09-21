---
name: Portfolio 3D
description: Portfolio de desarrollador web freelance recorrido por scroll en un despacho 3D; oscuro, alto contraste, acento ámbar.
colors:
  bg: "#0b0906"
  surface: "#14100b"
  text: "#f6efe6"
  muted: "#cfc3b3"
  accent: "#ffc58a"
  accent-2: "#ffa95c"
  on-accent: "#1a1206"
  error: "#ffb4ab"
typography:
  display:
    fontFamily: "Bebas Neue, Arial Narrow, sans-serif"
    fontSize: "clamp(2.5rem, 4vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.02em"
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
rounded:
  sm: "10px"
  md: "16px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "14px"
  lg: "clamp(16px, 4vw, 56px)"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
  card:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "clamp(20px, 2.4vw, 32px)"
---

# Design System: Portfolio 3D

## Overview

**Creative North Star: "El despacho a media luz"**

El despacho renderizado es el protagonista; la interfaz son tarjetas oscuras y sobrias que se apoyan sobre los frames, con el ámbar de las lámparas como único color. Alto contraste, poca decoración, jerarquía clara.

**Key Characteristics:**
- Fondo casi negro cálido, texto crema, un solo acento ámbar.
- Titulares condensados en mayúscula visual (Bebas Neue), cuerpo legible (DM Sans), detalles técnicos en mono.
- Tarjetas translúcidas con borde ámbar fino sobre la escena.

## Colors

Paleta cálida y contenida: negros marrones, crema y ámbar.

### Primary
- **Ámbar lámpara** (#ffc58a): botones primarios, títulos de acento, cifras, foco.
- **Ámbar intenso** (#ffa95c): hover del primario y nivel alto del mapa de GitHub.

### Neutral
- **Negro cálido** (#0b0906): fondo y tarjetas (88 % de opacidad sobre el frame).
- **Superficie** (#14100b): tarjetas de proyecto y sección de contacto.
- **Crema** (#f6efe6): texto principal. **Arena** (#cfc3b3): texto secundario.

**The One Voice Rule.** El ámbar es el único acento; nada de segundos colores de marca.

## Typography

**Display:** Bebas Neue. **Body:** DM Sans. **Label:** JetBrains Mono.

### Hierarchy
- **Display** (400, clamp 2.5–3.5rem, 1): títulos de sección; el h1 llega a 5.5rem.
- **Title** (500, 1rem, 1.3, ámbar): subtítulos dentro de tarjetas.
- **Body** (400, 1rem, 1.6): texto; párrafos ≤ 65ch.
- **Label** (400, 0.75rem, mono): tags y credenciales.

## Layout

Escena: tarjeta anclada a un lado (o abajo) según el motivo de cada frame; en móvil, hoja inferior a ancho completo. Secciones normales: contenedor de 1200px, relleno vertical clamp(64px, 10vw, 120px), rejilla auto-fill de 320px.

## Elevation & Depth

Plano. La profundidad la dan el frame de fondo, la opacidad de la tarjeta y el borde ámbar al 28 %. Sin sombras.

## Shapes

Esquinas de 10 px en botones y campos, 16 px en tarjetas, píldora en tags y chips. Bordes de 1px ámbar tenue.

## Components

### Buttons
- **Primary:** ámbar con texto oscuro, 44 px mínimo, hover a #ffa95c solo con puntero fino, `:active` scale(0.97), 160 ms ease-out.
- **Secundario:** transparente con borde ámbar tenue.

### Cards
Fondo negro cálido translúcido, borde ámbar tenue, radio 16 px, relleno clamp(20–32px).

### Inputs
Fondo negro, borde ámbar al 50 %, foco con contorno ámbar de 3px, error en #ffb4ab con texto asociado.

## Do's and Don'ts

### Do:
- **Do** comprobar contraste AA del texto sobre cada frame de parada.
- **Do** animar solo transform y opacity, < 300 ms, ease-out.
### Don't:
- **Don't** añadir colores de acento ni sombras difusas.
- **Don't** quitar el scrub ni los fades de sección.
