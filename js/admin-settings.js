/* ===== Admin Settings Page ===== */

let adminPass = '';
let siteData  = { products: [], settings: {} };

// ─── Auto-login from session ──────────────────────────────────────────────────

const savedPass = sessionStorage.getItem('adminPass');
if (savedPass) {
  adminPass = savedPass;
  initPanel();
}

// ─── Login ────────────────────────────────────────────────────────────────────

document.getElementById('login-btn').addEventListener('click', attemptLogin);
document.getElementById('password-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') attemptLogin();
});

async function attemptLogin() {
  const input = document.getElementById('password-input');
  const err   = document.getElementById('login-error');
  const pass  = input.value.trim();
  if (!pass) return;

  const res = await fetch('/.netlify/functions/verify-password', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: pass }),
  });

  if (res.status === 401) {
    err.style.display = 'block';
    input.value = '';
    input.focus();
    return;
  }

  err.style.display = 'none';
  adminPass = pass;
  sessionStorage.setItem('adminPass', pass);
  initPanel();
}

async function initPanel() {
  document.getElementById('password-screen').style.display = 'none';
  document.getElementById('admin-panel').style.display     = 'block';
  await loadData();
}

// ─── Load data ────────────────────────────────────────────────────────────────

async function loadData() {
  try {
    const res  = await fetch('/.netlify/functions/get-products');
    const data = await res.json();
    siteData   = data;
  } catch (e) {}

  if (!Array.isArray(siteData.products)) siteData.products = [];
  if (!siteData.settings) siteData.settings = {};

  const s = siteData.settings;
  setVal('contact-email',       s.contactEmail      || '');
  setVal('instagram-url',       s.instagramUrl       || '');
  setVal('facebook-url',        s.facebookUrl        || '');
  setVal('about-text',          s.aboutText          || '');
  setVal('shops-text',          s.shopsText          || '');
  setVal('special-orders-text', s.specialOrdersText  || '');
  setVal('returns-text',        s.returnsText        || '');

  refreshAboutPhotoPreview();
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

// ─── About photo ──────────────────────────────────────────────────────────────

document.getElementById('about-photo-btn').addEventListener('click', () => {
  document.getElementById('about-photo-file').click();
});

document.getElementById('about-photo-file').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  e.target.value = '';
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      siteData.settings.aboutPhoto = compressImage(img, 800, 0.75);
      refreshAboutPhotoPreview();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

document.getElementById('remove-about-photo-btn').addEventListener('click', () => {
  siteData.settings.aboutPhoto = '';
  refreshAboutPhotoPreview();
});

function refreshAboutPhotoPreview() {
  const preview   = document.getElementById('about-photo-preview');
  const removeBtn = document.getElementById('remove-about-photo-btn');
  const photo     = siteData.settings.aboutPhoto;
  if (photo) {
    preview.innerHTML       = `<img src="${photo}" alt="Your photo">`;
    removeBtn.style.display = '';
  } else {
    preview.innerHTML       = `<p class="no-photos-hint">No photo uploaded yet.</p>`;
    removeBtn.style.display = 'none';
  }
}

function compressImage(imgEl, maxSize, quality) {
  const canvas = document.createElement('canvas');
  let { width, height } = imgEl;
  if (width > height && width > maxSize) { height = Math.round(height * maxSize / width); width = maxSize; }
  else if (height > maxSize)             { width  = Math.round(width  * maxSize / height); height = maxSize; }
  canvas.width  = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(imgEl, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}

// ─── Collect & Save ───────────────────────────────────────────────────────────

document.getElementById('save-btn').addEventListener('click', saveAll);

function collectFormValues() {
  const s = siteData.settings;
  s.contactEmail      = getVal('contact-email');
  s.instagramUrl      = getVal('instagram-url');
  s.facebookUrl       = getVal('facebook-url');
  s.aboutText         = getVal('about-text');
  s.shopsText         = getVal('shops-text');
  s.specialOrdersText = getVal('special-orders-text');
  s.returnsText       = getVal('returns-text');
  // aboutPhoto tracked live in siteData.settings.aboutPhoto
}

function getVal(id) {
  return (document.getElementById(id)?.value || '').trim();
}

async function saveAll() {
  collectFormValues();
  const btn     = document.getElementById('save-btn');
  const overlay = document.getElementById('loading-overlay');
  btn.disabled          = true;
  overlay.style.display = 'flex';

  try {
    const res = await fetch('/.netlify/functions/update-products', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPass, data: siteData }),
    });
    if (res.status === 401) { alert('Session expired. Please log out and back in.'); return; }
    if (!res.ok) throw new Error(await res.text());
    showNotification();
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    btn.disabled          = false;
    overlay.style.display = 'none';
  }
}

function showNotification() {
  const n = document.getElementById('save-notification');
  n.style.display = 'block';
  setTimeout(() => { n.style.display = 'none'; }, 3500);
}

// ─── Logout ───────────────────────────────────────────────────────────────────

document.getElementById('logout-btn').addEventListener('click', () => {
  sessionStorage.removeItem('adminPass');
  adminPass = '';
  document.getElementById('admin-panel').style.display    = 'none';
  document.getElementById('password-screen').style.display = 'flex';
  document.getElementById('password-input').value = '';
});
