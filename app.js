// ---------------------------------------------
// HARNESSES R US • app.js
// Envía datos de contacto a un backend que publica en RabbitMQ (cola CONTACTO)
// ---------------------------------------------
(() => {
  const $ = (sel, el=document) => el.querySelector(sel);

  const form = $('#contactForm');
  const sendBtn = $('#sendBtn');
  const toast = $('#toast');
  const thisYear = new Date().getFullYear();
  $('#year').textContent = thisYear;

  function showToast(message, type='ok') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.className = 'toast', 4200);
  }

  function serializeForm(formEl) {
    const data = Object.fromEntries(new FormData(formEl).entries());
    data.terms = formEl.elements['terms'].checked;
    return data;
  }

  form?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const payload = serializeForm(form);
    if (!payload.terms) {
      showToast('Debes aceptar el tratamiento de datos.', 'err');
      return;
    }

    const API_ENDPOINT = form.dataset.endpoint || 'https://example.com/api/contact';

    const envelope = {
      queue: 'CONTACTO',
      source: 'web:harnesses-r-us',
      timestamp: new Date().toISOString(),
      data: {
        name: payload.name?.trim(),
        company: payload.company?.trim() || null,
        email: payload.email?.trim(),
        phone: payload.phone?.trim() || null,
        message: payload.message?.trim()
      }
    };

    try {
      sendBtn.classList.add('loading');
      sendBtn.setAttribute('disabled', 'true');

      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-QUEUE-NAME': 'CONTACTO'
        },
        body: JSON.stringify(envelope)
      });

      if (!res.ok) {
        const errText = await res.text().catch(()=>'');
        throw new Error(`HTTP ${res.status} ${res.statusText} ${errText}`.trim());
      }

  showToast('Thank you! We have received your request. We will contact you soon.', 'ok');
      form.reset();
    } catch (err) {
      console.error(err);
  showToast('Could not send. Check your connection or try again later.', 'err');
    } finally {
      sendBtn.classList.remove('loading');
      sendBtn.removeAttribute('disabled');
    }
  });
})();
