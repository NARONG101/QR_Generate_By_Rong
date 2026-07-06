// QR Studio — behavior

const tabs = Array.from(document.querySelectorAll('.type-tab'));
const sections = Array.from(document.querySelectorAll('.form-section'));
const form = document.getElementById('qr-form');
const qrCodeContainer = document.getElementById('qr-code');
const qrCaption = document.getElementById('qr-caption');
const resultActions = document.getElementById('result-actions');
const downloadBtn = document.getElementById('download-btn');
const copyBtn = document.getElementById('copy-btn');
const wifiAuth = document.getElementById('wifi-auth');
const wifiPasswordField = document.getElementById('wifi-password-field');

let activeType = 'wifi';
let currentCanvas = null;
let currentData = null;

/* ---------- Tab switching ---------- */
tabs.forEach(tab => {
  tab.addEventListener('click', () => setActiveType(tab.dataset.type));
});

function setActiveType(type) {
  activeType = type;
  tabs.forEach(t => {
    const active = t.dataset.type === type;
    t.classList.toggle('is-active', active);
    t.setAttribute('aria-selected', String(active));
  });
  sections.forEach(s => {
    const active = s.dataset.section === type;
    s.classList.toggle('is-active', active);
    s.hidden = !active;
  });
  clearErrors();
}

/* ---------- Wi-Fi: hide password field for open networks ---------- */
wifiAuth.addEventListener('change', () => {
  const isOpen = wifiAuth.value === 'NONE';
  wifiPasswordField.style.display = isOpen ? 'none' : 'block';
});

/* ---------- Validation helpers ---------- */
function setError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById('err-' + fieldId);
  if (input) input.classList.add('is-invalid');
  if (errorEl) errorEl.textContent = message;
}

function clearErrors() {
  document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  document.querySelectorAll('.field__error').forEach(el => (el.textContent = ''));
}

function focusFirstInvalid() {
  const el = document.querySelector('.is-invalid');
  if (el) el.focus();
}

/* ---------- Escaping for the WIFI: payload ---------- */
function escapeWifiValue(s) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/:/g, '\\:')
    .replace(/"/g, '\\"');
}

function cleanPhone(raw) {
  return raw.replace(/[^\d+\-() ]/g, '').trim();
}

/* ---------- Per-type builders. Each returns { data, caption } or null (and sets its own errors) ---------- */
const builders = {
  wifi() {
    const ssid = document.getElementById('wifi-ssid').value.trim();
    const auth = wifiAuth.value;
    const password = document.getElementById('wifi-password').value;
    const hidden = document.getElementById('wifi-hidden').checked;
    let ok = true;

    if (!ssid) { setError('wifi-ssid', 'Enter the network name.'); ok = false; }
    if (auth !== 'NONE' && !password) { setError('wifi-password', 'Enter the password, or set security to Open.'); ok = false; }
    if (!ok) return null;

    const ssidEsc = escapeWifiValue(ssid);
    const data = auth === 'NONE'
      ? `WIFI:T:nopass;S:${ssidEsc};H:${hidden};;`
      : `WIFI:T:${auth};S:${ssidEsc};P:${escapeWifiValue(password)};H:${hidden};;`;

    return { data, caption: `Wi‑Fi · ${ssid}` };
  },

  url() {
    let url = document.getElementById('url-input').value.trim();
    if (!url) { setError('url-input', 'Enter a URL.'); return null; }
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    try { new URL(url); } catch { setError('url-input', "That doesn't look like a valid URL."); return null; }
    return { data: url, caption: url };
  },

  phone() {
    const raw = document.getElementById('phone-input').value.trim();
    if (!raw) { setError('phone-input', 'Enter a phone number.'); return null; }
    const phone = cleanPhone(raw);
    if (!/\d{3,}/.test(phone)) { setError('phone-input', 'Enter a valid phone number.'); return null; }
    return { data: `tel:${phone}`, caption: `Call · ${phone}` };
  },

  email() {
    const email = document.getElementById('email-address').value.trim();
    const subject = document.getElementById('email-subject').value.trim();
    const body = document.getElementById('email-body').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('email-address', 'Enter a valid email address.'); return null; }

    const params = [];
    if (subject) params.push('subject=' + encodeURIComponent(subject));
    if (body) params.push('body=' + encodeURIComponent(body));
    const data = `mailto:${email}` + (params.length ? '?' + params.join('&') : '');
    return { data, caption: `Email · ${email}` };
  },

  sms() {
    const raw = document.getElementById('sms-phone').value.trim();
    const message = document.getElementById('sms-message').value.trim();
    if (!raw) { setError('sms-phone', 'Enter a phone number.'); return null; }
    const phone = cleanPhone(raw);
    if (!/\d{3,}/.test(phone)) { setError('sms-phone', 'Enter a valid phone number.'); return null; }
    const data = message ? `smsto:${phone}:${message}` : `smsto:${phone}`;
    return { data, caption: `Text · ${phone}` };
  },

  contact() {
    const name = document.getElementById('contact-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const org = document.getElementById('contact-org').value.trim();
    if (!name) { setError('contact-name', 'Enter a name.'); return null; }

    let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\n`;
    if (phone) vcard += `TEL:${cleanPhone(phone)}\n`;
    if (email) vcard += `EMAIL:${email}\n`;
    if (org) vcard += `ORG:${org}\n`;
    vcard += 'END:VCARD';

    return { data: vcard, caption: `Contact · ${name}` };
  },

  image() {
    let url = document.getElementById('image-url').value.trim();
    const alt = document.getElementById('image-alt').value.trim();
    if (!url) { setError('image-url', 'Enter an image URL.'); return null; }
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    try { new URL(url); } catch { setError('image-url', "That doesn't look like a valid URL."); return null; }
    return { data: url, caption: alt || url };
  },

  text() {
    const text = document.getElementById('text-input').value.trim();
    if (!text) { setError('text-input', 'Enter some text.'); return null; }
    return { data: text, caption: text.length > 60 ? text.slice(0, 57) + '…' : text };
  },
};

/* ---------- Generate ---------- */
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const result = builders[activeType]();
  if (!result) { focusFirstInvalid(); return; }

  await renderQr(result.data, result.caption);
});

async function renderQr(data, caption) {
  qrCodeContainer.innerHTML = '';
  qrCodeContainer.classList.remove('is-scanned');

  if (typeof QRCode === 'undefined') {
    qrCodeContainer.innerHTML = `<p class="label__placeholder">The QR engine didn't load. Refresh the page and try again.</p>`;
    qrCaption.textContent = '';
    resultActions.hidden = true;
    console.error('QRCode library is not defined — vendor-qrcode.js may have failed to load.');
    return;
  }

  const canvas = document.createElement('canvas');
  qrCodeContainer.appendChild(canvas);

  try {
    await QRCode.toCanvas(canvas, data, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 480,
      color: { dark: '#14171a', light: '#f2efe9' },
    });
  } catch (err) {
    qrCodeContainer.innerHTML = `<p class="label__placeholder">Couldn't fit that much data into a code. Try shortening it.</p>`;
    qrCaption.textContent = '';
    resultActions.hidden = true;
    console.error('QR generation failed:', err);
    return;
  }

  currentCanvas = canvas;
  currentData = data;
  qrCaption.textContent = caption;
  resultActions.hidden = false;
  resultActions.classList.remove('is-copied');

  // Retrigger the scan-line reveal.
  requestAnimationFrame(() => qrCodeContainer.classList.add('is-scanned'));
}

/* ---------- Download ---------- */
downloadBtn.addEventListener('click', () => {
  if (!currentCanvas) return;
  const link = document.createElement('a');
  link.href = currentCanvas.toDataURL('image/png');
  link.download = `qr-${activeType}-${Date.now()}.png`;
  link.click();
});

/* ---------- Copy raw data ---------- */
copyBtn.addEventListener('click', async () => {
  if (!currentData) return;
  try {
    await navigator.clipboard.writeText(currentData);
  } catch {
    // Fallback for browsers without Clipboard API access.
    const ta = document.createElement('textarea');
    ta.value = currentData;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  resultActions.classList.add('is-copied');
  const original = copyBtn.textContent;
  copyBtn.textContent = 'Copied';
  setTimeout(() => {
    copyBtn.textContent = original;
    resultActions.classList.remove('is-copied');
  }, 1600);
});

/* ---------- Init ---------- */
setActiveType('wifi');