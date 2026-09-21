// Chat con IA: panel accesible con streaming SSE. La conversación vive solo en memoria.
import { CONFIG } from './config.js';
import { openCalendly } from './contact.js';

const MAX_HISTORY = 6; // mensajes previos que se envían al Worker

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text; // siempre textContent, nunca innerHTML
  return e;
}

export function initChat(launcher) {
  const history = [];
  let busy = false;

  // --- Estructura del panel ---
  const panel = el('section', 'chat');
  panel.id = 'chat-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Asistente de IA');

  const head = el('div', 'chat__head');
  const close = el('button', 'chat__close', '×');
  close.type = 'button';
  close.setAttribute('aria-label', 'Cerrar el asistente');
  head.append(el('h2', 'chat__title', 'Asistente de IA'), close);

  const notice = el('p', 'chat__notice', 'Asistente de IA: puede equivocarse. Tus mensajes se envían a OpenAI para generar la respuesta; no escribas datos personales. ');
  const policy = el('a', null, 'Privacidad');
  policy.href = 'privacidad.html';
  policy.target = '_blank';
  policy.rel = 'noopener';
  notice.append(policy);

  const list = el('ul', 'chat__list');
  list.setAttribute('role', 'log');
  list.setAttribute('aria-live', 'polite');
  list.setAttribute('aria-label', 'Conversación');

  const chips = el('ul', 'chat__chips');
  CONFIG.CHAT_QUICK.forEach((q) => {
    const li = el('li');
    const b = el('button', 'chip', q.label);
    b.type = 'button';
    b.addEventListener('click', () => {
      if (q.action === 'calendly') openCalendly();
      else send(q.ask);
    });
    li.append(b);
    chips.append(li);
  });

  const form = el('form', 'chat__form');
  form.noValidate = true;
  const label = el('label', 'visually-hidden', 'Tu pregunta');
  label.htmlFor = 'chat-input';
  const input = el('textarea', 'chat__input');
  input.id = 'chat-input';
  input.rows = 1;
  input.maxLength = CONFIG.CHAT_MAX_CHARS;
  input.placeholder = 'Escribe tu pregunta…';
  const sendBtn = el('button', 'btn btn--primary chat__send', 'Enviar');
  sendBtn.type = 'submit';
  const count = el('p', 'chat__count', `0/${CONFIG.CHAT_MAX_CHARS}`);
  count.id = 'chat-count';
  input.setAttribute('aria-describedby', 'chat-count');
  form.append(label, input, sendBtn, count);

  panel.append(head, notice, list, chips, form);
  document.body.append(panel);

  // --- Mensajes ---
  const scrollDown = () => { list.scrollTop = list.scrollHeight; };
  function addMsg(role, text) {
    const li = el('li', `msg msg--${role === 'user' ? 'user' : 'bot'}`, text);
    list.append(li);
    scrollDown();
    return li;
  }

  // Botones de contacto para los estados de error o chat desactivado
  function addFallback(text) {
    const li = addMsg('bot', text);
    li.classList.add('msg--error');
    const actions = el('div', 'msg__actions');
    const mail = el('a', 'btn btn--small', 'Escribir por email');
    mail.href = `mailto:${CONFIG.CONTACT.email}`;
    const cal = el('button', 'btn btn--small btn--primary', 'Agendar reunión');
    cal.type = 'button';
    cal.addEventListener('click', () => openCalendly());
    actions.append(mail, cal);
    li.append(actions);
    scrollDown();
  }

  function setBusy(v) {
    busy = v;
    sendBtn.disabled = v;
    list.setAttribute('aria-busy', String(v));
    chips.querySelectorAll('button').forEach((b) => { b.disabled = v; });
  }

  // Lee el SSE del Worker: {t} por fragmento, {error} y [DONE]
  async function readStream(res, bubble) {
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    let text = '';
    let error = null;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf('\n\n')) !== -1) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 2);
        if (!line.startsWith('data:') || line.includes('[DONE]')) continue;
        try {
          const ev = JSON.parse(line.slice(5));
          if (ev.t) {
            text += ev.t;
            bubble.classList.remove('msg--typing');
            bubble.textContent = text;
            scrollDown();
          } else if (ev.error) error = ev.error;
        } catch { /* fragmento incompleto */ }
      }
    }
    return { text: text.trim(), error };
  }

  async function send(raw) {
    const question = raw.trim();
    if (!question || busy) return;
    input.value = '';
    updateCount();
    addMsg('user', question);
    history.push({ role: 'user', content: question });
    setBusy(true);
    const bubble = addMsg('bot', '');
    bubble.classList.add('msg--typing');
    try {
      const res = await fetch(CONFIG.CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-(MAX_HISTORY + 1)) }),
      });
      if (!res.ok) {
        bubble.remove();
        history.pop();
        let data = {};
        try { data = await res.json(); } catch { /* sin cuerpo JSON */ }
        if (res.status === 429) addFallback('Has hecho muchas preguntas seguidas. Espera un minuto o escribe directamente a Dani.');
        else if (data.disabled) addFallback('El asistente está desactivado por ahora. Puedes contactar con Dani directamente.');
        else addFallback(data.error || 'No he podido responder ahora mismo. Puedes contactar con Dani directamente.');
        return;
      }
      const { text, error } = await readStream(res, bubble);
      bubble.classList.remove('msg--typing');
      if (text) history.push({ role: 'assistant', content: text });
      else {
        bubble.remove();
        history.pop();
      }
      if (error || !text) addFallback(error || 'No he podido responder. Inténtalo de nuevo o contacta con Dani.');
    } catch {
      bubble.remove();
      history.pop();
      addFallback('No hay conexión con el asistente. Inténtalo de nuevo o contacta con Dani directamente.');
    } finally {
      setBusy(false);
      if (!panel.hidden) input.focus();
    }
  }

  function updateCount() {
    count.textContent = `${input.value.length}/${CONFIG.CHAT_MAX_CHARS}`;
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });
  input.addEventListener('input', updateCount);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      send(input.value);
    }
  });

  // --- Abrir / cerrar ---
  function open() {
    panel.hidden = false;
    panel.classList.add('is-open');
    launcher.setAttribute('aria-expanded', 'true');
    if (!list.children.length) addMsg('bot', 'Hola, soy el asistente de IA de Dani. Pregúntame por su experiencia, sus puntos fuertes o cómo trabaja.');
    input.focus();
  }
  function closePanel() {
    panel.hidden = true;
    panel.classList.remove('is-open');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  }
  close.addEventListener('click', closePanel);
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); closePanel(); }
  });

  // La rueda sobre el panel no mueve la escena: solo la lista y el campo hacen scroll
  panel.addEventListener('wheel', (e) => {
    if (!e.target.closest('.chat__list, textarea')) e.preventDefault();
  }, { passive: false });

  return { toggle: () => (panel.hidden ? open() : closePanel()), open, close: closePanel };
}
