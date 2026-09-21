// Constantes ajustables del proyecto (única fuente de configuración)
export const CONFIG = {
  // Frames
  FRAME_COUNT: 280,
  MOBILE_MAX_WIDTH: 900, // ≤ este ancho usa la carpeta móvil
  FOLDERS: { desktop: 'frames/1600', mobile: 'frames/1280' },

  // Scroll: alturas en múltiplos del alto de pantalla
  HOLD_VH: 1, // tramo fijo en cada parada
  TRANSITION_VH: 1.5, // tramo entre paradas
  FADE_FRACTION: 0.35, // parte de la transición en la que el texto entra/sale
  FADE_SHIFT_PX: 32, // desplazamiento vertical del texto al entrar/salir
  LERP: 0.15, // suavizado del frame mostrado

  // Carga y memoria
  PRELOAD_STEP: 4, // fase 1: 1 de cada N frames + las paradas
  CONCURRENCY: 6, // descargas simultáneas
  WINDOW: { desktop: 45, mobile: 30 }, // frames decodificados a cada lado
  MAX_DECODING: 4, // decodificaciones simultáneas

  // Canvas
  MAX_DPR: 2,
  FIT: 'cover', // 'cover' o 'contain' (barras negras)

  // Paradas: frame, lado del texto (left | right | bottom) y punto de enfoque horizontal (0–1)
  STOPS: [
    { id: 'hero', frame: 1, side: 'left', focusX: 0.45 },
    { id: 'cifras', frame: 40, side: 'right', focusX: 0.4 },
    { id: 'presentacion', frame: 80, side: 'left', focusX: 0.5 },
    { id: 'skills', frame: 120, side: 'right', focusX: 0.4 },
    { id: 'certificados', frame: 160, side: 'right', focusX: 0.35 },
    { id: 'proyectos-escena', frame: 200, side: 'bottom', focusX: 0.6 },
    { id: 'github', frame: 240, side: 'right', focusX: 0.3 },
    { id: 'contacto-escena', frame: 280, side: 'left', focusX: 0.55 },
  ],

  // Proyectos destacados de la parada 200 (orden fijo, coincide con la tele renderizada)
  FEATURED_IDS: ['construcciones-chamusinos', 'calcufacil', 'cineverse'],
  PROJECTS_URL: 'data/projects.json',

  // GitHub
  GITHUB_USER: 'danniigz',
  GITHUB_DATA_URL: 'data/github.json',

  // Contacto
  CONTACT: {
    email: 'drodriguez.daw@gmail.com',
    phone: '+34674904987',
    phoneLabel: '+34 674 90 49 87',
    linkedin: 'https://www.linkedin.com/in/daniel-rodriguez-machado/',
    github: 'https://github.com/danniigz',
  },

  // URL de Calendly
  CALENDLY_URL: 'https://calendly.com/daniroma05/reunion-con-daniel',
  // Colores del widget de Calendly (hex sin #), a juego con el tema oscuro
  CALENDLY_COLORS: { background_color: '0b0906', text_color: 'f6efe6', primary_color: 'ffc58a' },
  // Clave pública de Web3Forms (no es un secreto)
  WEB3FORMS_ACCESS_KEY: '251da710-573a-4074-98b7-5899748deb16',
  WEB3FORMS_URL: 'https://api.web3forms.com/submit',

  // Contadores (ms)
  COUNTER_MS: 700,
};
