// Worker: sirve public/ como assets y atiende POST /api/chat (streaming SSE)
import KNOWLEDGE from '../knowledge/dani.md';
import { buildInstructions } from './prompt.js';

const MAX_BODY = 8 * 1024;
const MAX_CHARS = 500;
const MAX_PREVIOUS = 6; // mensajes previos, además del último del usuario
const MAX_OUTPUT_TOKENS = 350;
const MOCK_TEXT =
  'Esto es una respuesta simulada del asistente de IA del portfolio. Con el modo mock activo no se llama a OpenAI, así que puedes probar la interfaz sin gastar créditos.';

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });

const fail = (status, error, extra = {}, headers = {}) => json({ error, ...extra }, status, headers);

function originAllowed(request, url, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return false;
  try {
    if (new URL(origin).host === url.host) return true;
  } catch {
    return false;
  }
  return (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean).includes(origin);
}

// Valida y limpia los mensajes del cliente; devuelve null si no son válidos
function cleanMessages(raw) {
  if (!Array.isArray(raw)) return null;
  const msgs = raw
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant')) // descarta system y cualquier otro rol
    .map((m) => ({ role: m.role, content: typeof m.content === 'string' ? m.content.trim() : '' }));
  if (!msgs.length || msgs.some((m) => !m.content || m.content.length > MAX_CHARS)) return null;
  if (msgs[msgs.length - 1].role !== 'user') return null;
  return msgs.slice(-(MAX_PREVIOUS + 1));
}

const sse = (obj) => `data: ${JSON.stringify(obj)}\n\n`;
const streamHeaders = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Accel-Buffering': 'no',
};

// Respuesta fija que simula streaming
function mockStream() {
  const enc = new TextEncoder();
  const words = MOCK_TEXT.split(' ');
  return new Response(
    new ReadableStream({
      async start(controller) {
        for (const w of words) {
          controller.enqueue(enc.encode(sse({ t: w + ' ' })));
          await new Promise((r) => setTimeout(r, 35));
        }
        controller.enqueue(enc.encode('data: [DONE]\n\n'));
        controller.close();
      },
    }),
    { headers: streamHeaders },
  );
}

// Reenvía el SSE de OpenAI al navegador con un formato mínimo: {t} por fragmento y [DONE] al final
function relay(upstream) {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  return new Response(
    new ReadableStream({
      async start(controller) {
        const out = (s) => controller.enqueue(enc.encode(s));
        let buf = '';
        let finished = false;
        const handle = (block) => {
          const line = block.split('\n').find((l) => l.startsWith('data:'));
          if (!line) return;
          let ev;
          try {
            ev = JSON.parse(line.slice(5));
          } catch {
            return;
          }
          if (ev.type === 'response.output_text.delta' && ev.delta) out(sse({ t: ev.delta }));
          else if (['response.failed', 'response.incomplete', 'error'].includes(ev.type)) {
            out(sse({ error: 'El asistente no pudo completar la respuesta.' }));
            finished = true;
          } else if (ev.type === 'response.completed') finished = true;
        };
        try {
          const reader = upstream.body.getReader();
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            let i;
            while ((i = buf.indexOf('\n\n')) !== -1) {
              handle(buf.slice(0, i));
              buf = buf.slice(i + 2);
            }
          }
          if (buf.trim()) handle(buf);
        } catch {
          out(sse({ error: 'Se cortó la conexión con el asistente.' }));
          finished = true;
        }
        if (!finished) out(sse({ error: 'Respuesta incompleta.' }));
        out('data: [DONE]\n\n');
        controller.close();
      },
    }),
    { headers: streamHeaders },
  );
}

async function handleChat(request, env, url) {
  if (request.method !== 'POST') return fail(405, 'Método no permitido.', {}, { Allow: 'POST' });
  if (env.CHAT_ENABLED === 'false') return fail(503, 'El chat está desactivado por ahora.', { disabled: true });
  if (!originAllowed(request, url, env)) return fail(403, 'Origen no permitido.');

  if (env.CHAT_LIMITER) {
    const key = request.headers.get('CF-Connecting-IP') || 'local';
    const { success } = await env.CHAT_LIMITER.limit({ key });
    if (!success) return fail(429, 'Demasiadas preguntas seguidas. Espera un minuto e inténtalo de nuevo.');
  }

  const declared = Number(request.headers.get('Content-Length'));
  if (declared > MAX_BODY) return fail(413, 'El mensaje es demasiado largo.');
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY) return fail(413, 'El mensaje es demasiado largo.');

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return fail(400, 'Petición no válida.');
  }
  const messages = cleanMessages(body?.messages);
  if (!messages) return fail(400, `Mensaje no válido (máximo ${MAX_CHARS} caracteres).`);

  if (env.CHAT_MOCK === '1') return mockStream();
  if (!env.OPENAI_API_KEY) return fail(503, 'El asistente no está disponible ahora mismo.');

  let upstream;
  try {
    upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || 'gpt-4o-mini',
        instructions: buildInstructions(KNOWLEDGE),
        input: messages,
        store: false,
        stream: true,
        max_output_tokens: MAX_OUTPUT_TOKENS,
      }),
    });
  } catch {
    return fail(502, 'No se pudo contactar con el asistente.');
  }
  if (!upstream.ok || !upstream.body) {
    // Solo el código de estado: nunca el contenido de los mensajes
    console.error('openai status', upstream.status);
    return fail(upstream.status === 429 ? 503 : 502, 'El asistente no está disponible ahora mismo.');
  }
  return relay(upstream);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/chat') return handleChat(request, env, url);
    if (url.pathname.startsWith('/api/')) return fail(404, 'No encontrado.');
    return env.ASSETS.fetch(request);
  },
};
