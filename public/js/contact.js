// Contacto: Calendly (carga diferida), formulario Web3Forms y enlaces desde la configuración
import { CONFIG } from './config.js';

const $ = (s) => document.querySelector(s);
const calendlyUrl = () => `${CONFIG.CALENDLY_URL}?${new URLSearchParams({ ...CONFIG.CALENDLY_COLORS, hide_gdpr_banner: 1 })}`;

let calendlyPromise = null;

// Inyecta CSS y JS de Calendly una sola vez; rechaza si falla o está bloqueado
export function loadCalendly() {
  calendlyPromise ??= new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://assets.calendly.com/assets/external/widget.css';
    const js = document.createElement('script');
    js.src = 'https://assets.calendly.com/assets/external/widget.js';
    js.async = true;
    js.onload = () => (window.Calendly ? resolve(window.Calendly) : reject(new Error('Calendly')));
    js.onerror = () => reject(new Error('Calendly'));
    document.head.append(css, js);
  }).catch((e) => {
    calendlyPromise = null;
    throw e;
  });
  return calendlyPromise;
}

const fallback = () => window.open(CONFIG.CALENDLY_URL, '_blank', 'noopener');

// Ventana emergente; si el script falla, abre Calendly en pestaña nueva
export async function openCalendly() {
  try {
    const c = await loadCalendly();
    c.initPopupWidget({ url: calendlyUrl() });
  } catch {
    fallback();
  }
}

async function showInline(btn, box) {
  btn.disabled = true;
  try {
    const c = await loadCalendly();
    box.hidden = false;
    c.initInlineWidget({ url: calendlyUrl(), parentElement: box });
    btn.hidden = true;
  } catch {
    btn.disabled = false;
    fallback();
  }
}

// Mensajes de validación en español
function errorText(input) {
  const v = input.validity;
  if (v.valueMissing) return { name: 'Escribe tu nombre.', email: 'Escribe tu email.', message: 'Escribe tu mensaje.' }[input.name];
  if (v.typeMismatch) return 'Escribe un email válido, por ejemplo nombre@dominio.com.';
  return '';
}

function initForm(form) {
  const status = $('#f-estado');
  const btn = $('#f-enviar');
  const fields = [...form.querySelectorAll('input[required], textarea[required]')];
  const errBox = (i) => $(`#${i.id}-err`);

  const validate = (input) => {
    const msg = errorText(input);
    const box = errBox(input);
    box.textContent = msg;
    box.hidden = !msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  };
  fields.forEach((i) => {
    i.addEventListener('blur', () => { if (i.value) validate(i); });
    i.addEventListener('input', () => { if (i.getAttribute('aria-invalid') === 'true') validate(i); });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form__status';
    const invalid = fields.filter((i) => !validate(i));
    if (invalid.length) {
      status.textContent = 'Revisa los campos marcados.';
      status.classList.add('is-error');
      invalid[0].focus();
      return;
    }
    const data = new FormData(form);
    btn.disabled = true;
    btn.textContent = 'Enviando…';
    status.textContent = '';
    try {
      const res = await fetch(CONFIG.WEB3FORMS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: CONFIG.WEB3FORMS_ACCESS_KEY,
          subject: 'Nuevo mensaje desde el portfolio 3D',
          from_name: data.get('name'),
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
          botcheck: data.get('botcheck') ? true : '',
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error('envio');
      form.reset();
      fields.forEach((i) => i.setAttribute('aria-invalid', 'false'));
      status.textContent = 'Mensaje enviado. Te responderé lo antes posible.';
      status.classList.add('is-ok');
    } catch {
      // No se borra lo escrito
      status.textContent = `No se pudo enviar el mensaje. Inténtalo de nuevo o escríbeme a ${CONFIG.CONTACT.email}.`;
      status.classList.add('is-error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Enviar mensaje';
    }
  });
}

export function initContact() {
  const { email, phone, phoneLabel, linkedin, github } = CONFIG.CONTACT;
  ['#link-email', '#c-email'].forEach((s) => { $(s).href = `mailto:${email}`; });
  ['#link-phone', '#c-phone'].forEach((s) => { const a = $(s); a.href = `tel:${phone}`; a.textContent = phoneLabel; });
  $('#link-linkedin').href = linkedin;
  $('#link-github').href = github;
  $('#calendly-enlace').href = CONFIG.CALENDLY_URL;

  $('#abrir-calendly').addEventListener('click', openCalendly);
  $('#ver-disponibilidad').addEventListener('click', (e) => showInline(e.currentTarget, $('#calendly-inline')));

  // "Escribirme un mensaje": baja al formulario y mueve el foco al primer campo
  $('#ir-formulario').addEventListener('click', (e) => {
    e.preventDefault();
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches && !location.search.includes('reduced');
    $('#contacto').scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    $('#f-nombre').focus({ preventScroll: true });
  });

  initForm($('#formulario'));
}
