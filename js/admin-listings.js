/* ===== Admin Page (Listings + Settings) ===== */

const CATEGORIES = ['Jewelry', 'Knits & Felts', 'Hand Spun Yarn', 'Other'];

let adminPass = '';
let siteData  = { products: [], settings: {} };

// ─── Tab switching ────────────────────────────────────────────────────────────

function switchTab(name) {
  document.querySelectorAll('.admin-page-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.tab === name));
  document.getElementById('section-listings').style.display = name === 'listings' ? '' : 'none';
  document.getElementById('section-settings').style.display = name === 'settings' ? '' : 'none';
}

document.querySelectorAll('.admin-page-tab').forEach(tab => {
  tab.addEventListener('click', e => {
    e.preventDefault();
    switchTab(tab.dataset.tab);
  });
});

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
  switchTab('listings');
  await loadData();
  buildGrid();
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

  // Normalize old single-image format
  siteData.products = siteData.products
    .filter(p => p && typeof p === 'object')
    .map(p => {
      if (!Array.isArray(p.images)) { p.images = p.image ? [p.image] : []; }
      delete p.image;
      return p;
    });

  // Populate settings form fields
  const s = siteData.settings;
  setVal('contact-email',       s.contactEmail      || '');
  setVal('instagram-url',       s.instagramUrl       || '');
  setVal('about-text',          s.aboutText          || '');
  setVal('shops-text',          s.shopsText          || '');
  setVal('special-orders-text', s.specialOrdersText  || '');
  setVal('returns-text',        s.returnsText        || '');
  refreshAboutPhotoPreview();
  renderEventsList();
}

function emptyProduct() {
  return { id: Date.now() + Math.random(), name: '', price: '', description: '', images: [], category: 'Other' };
}

// ─── Build the product grid ────────────────────────────────────────────────────

function buildGrid() {
  const grid = document.getElementById('admin-grid');
  grid.innerHTML = '';
  siteData.products.forEach((_, i) => grid.appendChild(buildSlot(i)));
}

function buildSlot(index) {
  const p      = siteData.products[index];
  const images = p.images || [];
  const slot   = document.createElement('div');
  slot.className   = 'product-slot';
  slot.dataset.idx = index;

  slot.innerHTML = `
    <div class="slot-header">Item ${index + 1}</div>

    <div class="photo-strip" id="photo-strip-${index}">
      ${buildPhotoStripHTML(images)}
    </div>
    <button type="button" class="add-photo-btn">+ Add Photo</button>
    <input type="file" accept="image/*" class="file-input" id="file-${index}" style="display:none" multiple />

    <div class="slot-field">
      <label class="slot-label" for="name-${index}">Item Name</label>
      <input type="text" id="name-${index}" class="slot-input"
             placeholder="e.g. Blue Beaded Bracelet" value="${escAttr(p.name)}" />
    </div>

    <div class="slot-field">
      <label class="slot-label" for="price-${index}">Price ($)</label>
      <input type="number" id="price-${index}" class="slot-input"
             placeholder="e.g. 25.00" min="0" step="0.01" value="${escAttr(p.price)}" />
    </div>

    <div class="slot-field">
      <label class="slot-label" for="desc-${index}">Short Description (optional)</label>
      <textarea id="desc-${index}" class="slot-input slot-textarea"
                placeholder="e.g. Hand-beaded with love">${escText(p.description)}</textarea>
    </div>

    <div class="slot-field">
      <label class="slot-label" for="cat-${index}">Category</label>
      <select id="cat-${index}" class="slot-input">
        ${CATEGORIES.map(c => `<option value="${c}"${(p.category || 'Other') === c ? ' selected' : ''}>${c}</option>`).join('')}
      </select>
    </div>

    <label class="sold-toggle-label">
      <input type="checkbox" class="sold-checkbox" id="sold-${index}" ${p.sold ? 'checked' : ''} />
      Mark as Sold
    </label>

    <button class="delete-product-btn" data-idx="${index}">Delete This Listing</button>
  `;

  slot.querySelector('.add-photo-btn').addEventListener('click', () => slot.querySelector('.file-input').click());
  slot.querySelector('.file-input').addEventListener('change', e => handleImageUpload(e, index));
  slot.querySelector('.delete-product-btn').addEventListener('click', () => deleteProduct(index));
  wirePhotoButtons(slot, index);

  return slot;
}

function buildPhotoStripHTML(images) {
  if (!images || images.length === 0) {
    return `<p class="no-photos-hint">No photos yet — click "+ Add Photo" below.</p>`;
  }
  return images.map((src, i) => `
    <div class="photo-thumb">
      <img src="${src}" alt="Photo ${i + 1}" class="photo-thumb-img" data-photo-idx="${i}" title="Click to view larger">
      <button type="button" class="remove-photo-btn" data-photo-idx="${i}" aria-label="Remove photo">✕</button>
    </div>
  `).join('');
}

function wirePhotoButtons(container, slotIndex) {
  container.querySelectorAll('.remove-photo-btn').forEach(btn => {
    btn.addEventListener('click', () => removePhoto(slotIndex, parseInt(btn.dataset.photoIdx)));
  });
  container.querySelectorAll('.photo-thumb-img').forEach(img => {
    img.addEventListener('click', () => {
      const images = siteData.products[slotIndex].images || [];
      if (images.length) openPhotoLightbox(images, parseInt(img.dataset.photoIdx));
    });
  });
}

// ─── Photo lightbox ───────────────────────────────────────────────────────────

function openPhotoLightbox(images, startIndex) {
  let modal = document.getElementById('photo-lightbox');
  if (!modal) {
    modal = document.createElement('div');
    modal.id        = 'photo-lightbox';
    modal.className = 'photo-lightbox';
    modal.innerHTML = `
      <div class="lightbox-inner">
        <button class="lightbox-close" id="lightbox-close">✕</button>
        <button class="lightbox-prev" id="lightbox-prev">&#8249;</button>
        <img id="lightbox-img" class="lightbox-img" src="" alt="Photo" />
        <button class="lightbox-next" id="lightbox-next">&#8250;</button>
        <div class="lightbox-dots" id="lightbox-dots"></div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('lightbox-close').addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
  }

  let current = 0;

  function showPhoto(i) {
    current = ((i % images.length) + images.length) % images.length;
    document.getElementById('lightbox-img').src = images[current];
    const dotsEl = document.getElementById('lightbox-dots');
    dotsEl.innerHTML = images.map((_, j) =>
      `<span class="lightbox-dot${j === current ? ' active' : ''}"></span>`
    ).join('');
    dotsEl.querySelectorAll('.lightbox-dot').forEach((dot, j) =>
      dot.addEventListener('click', () => showPhoto(j)));
    const showNav = images.length > 1;
    document.getElementById('lightbox-prev').style.display = showNav ? '' : 'none';
    document.getElementById('lightbox-next').style.display = showNav ? '' : 'none';
  }

  document.getElementById('lightbox-prev').onclick = () => showPhoto(current - 1);
  document.getElementById('lightbox-next').onclick = () => showPhoto(current + 1);

  // Touch swipe
  let touchStartX = 0;
  const inner = modal.querySelector('.lightbox-inner');
  inner.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  inner.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) showPhoto(dx < 0 ? current + 1 : current - 1);
  });

  showPhoto(startIndex);
  modal.classList.add('open');
}

// ─── Image upload & compression ───────────────────────────────────────────────

function handleImageUpload(event, index) {
  const files = Array.from(event.target.files);
  if (!files.length) return;
  event.target.value = '';
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        if (!Array.isArray(siteData.products[index].images)) siteData.products[index].images = [];
        siteData.products[index].images.push(compressImage(img, 700, 0.65));
        refreshPhotoStrip(index);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
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

function refreshPhotoStrip(index) {
  const strip = document.getElementById('photo-strip-' + index);
  if (!strip) return;
  strip.innerHTML = buildPhotoStripHTML(siteData.products[index].images || []);
  wirePhotoButtons(strip, index);
}

function removePhoto(slotIndex, photoIndex) {
  siteData.products[slotIndex].images.splice(photoIndex, 1);
  refreshPhotoStrip(slotIndex);
}

// ─── Add / Delete listings ────────────────────────────────────────────────────

document.getElementById('add-listing-btn').addEventListener('click', () => {
  siteData.products.push(emptyProduct());
  buildGrid();
  const slots = document.querySelectorAll('#admin-grid .product-slot');
  slots[slots.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
});

function deleteProduct(index) {
  if (!confirm('Delete this listing? It will be permanently removed from your shop.')) return;
  siteData.products.splice(index, 1);
  buildGrid();
}

// ─── Settings: about photo ────────────────────────────────────────────────────

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

// ─── Settings helpers ─────────────────────────────────────────────────────────

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function getVal(id) {
  return (document.getElementById(id)?.value || '').trim();
}

// ─── Collect & Save ───────────────────────────────────────────────────────────

document.getElementById('save-btn').addEventListener('click', saveAll);

function collectFormValues() {
  // Products
  siteData.products.forEach((p, i) => {
    p.name        = (document.getElementById('name-'  + i)?.value || '').trim();
    const rawPrice = (document.getElementById('price-' + i)?.value || '').trim();
    p.price       = rawPrice ? parseFloat(rawPrice) : '';
    p.description = (document.getElementById('desc-'  + i)?.value || '').trim();
    p.category    = document.getElementById('cat-'   + i)?.value || 'Other';
    p.sold        = document.getElementById('sold-'  + i)?.checked || false;
  });
  // Settings
  const s = siteData.settings;
  s.contactEmail      = getVal('contact-email');
  s.instagramUrl      = getVal('instagram-url');
  s.aboutText         = getVal('about-text');
  s.shopsText         = getVal('shops-text');
  s.specialOrdersText = getVal('special-orders-text');
  s.returnsText       = getVal('returns-text');
  // events tracked live in siteData.settings.events
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

// ─── Upcoming Events ──────────────────────────────────────────────────────────

document.getElementById('add-event-btn').addEventListener('click', () => {
  if (!Array.isArray(siteData.settings.events)) siteData.settings.events = [];
  siteData.settings.events.push({ name: '', date: '', location: '' });
  renderEventsList();
  const rows = document.querySelectorAll('.event-admin-row');
  const last = rows[rows.length - 1];
  if (last) last.querySelector('.event-name-input')?.focus();
});

function renderEventsList() {
  const list = document.getElementById('events-list');
  if (!list) return;
  if (!Array.isArray(siteData.settings.events)) siteData.settings.events = [];

  list.innerHTML = '';

  siteData.settings.events.forEach((ev, i) => {
    const row = document.createElement('div');
    row.className = 'event-admin-row';

    const nameInput = document.createElement('input');
    nameInput.type        = 'text';
    nameInput.className   = 'admin-input event-name-input';
    nameInput.placeholder = 'Event name (e.g. Santa Barbara Farmers Market)';
    nameInput.value       = ev.name || '';
    nameInput.addEventListener('input', () => { siteData.settings.events[i].name = nameInput.value; });

    const dateInput = document.createElement('input');
    dateInput.type      = 'date';
    dateInput.className = 'admin-input event-date-input';
    dateInput.value     = ev.date || '';
    dateInput.addEventListener('change', () => { siteData.settings.events[i].date = dateInput.value; });

    const locInput = document.createElement('input');
    locInput.type        = 'text';
    locInput.className   = 'admin-input event-location-input';
    locInput.placeholder = 'Location (optional, e.g. Downtown Santa Barbara)';
    locInput.value       = ev.location || '';
    locInput.addEventListener('input', () => { siteData.settings.events[i].location = locInput.value; });

    const deleteBtn = document.createElement('button');
    deleteBtn.type        = 'button';
    deleteBtn.className   = 'delete-event-btn';
    deleteBtn.textContent = 'Remove';
    deleteBtn.addEventListener('click', () => {
      siteData.settings.events.splice(i, 1);
      renderEventsList();
    });

    row.appendChild(nameInput);
    row.appendChild(dateInput);
    row.appendChild(locInput);
    row.appendChild(deleteBtn);
    list.appendChild(row);
  });

  if (!siteData.settings.events.length) {
    const empty = document.createElement('p');
    empty.className   = 'hint';
    empty.textContent = 'No upcoming events yet. Click "+ Add Event" to add one.';
    list.appendChild(empty);
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

document.getElementById('logout-btn').addEventListener('click', () => {
  sessionStorage.removeItem('adminPass');
  adminPass = '';
  document.getElementById('admin-panel').style.display    = 'none';
  document.getElementById('password-screen').style.display = 'flex';
  document.getElementById('password-input').value = '';
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escAttr(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function escText(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(str || '')));
  return d.innerHTML;
}
