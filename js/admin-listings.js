/* ===== Admin Listings Page ===== */

const CATEGORIES = ['Jewelry', 'Knits & Felts', 'Hand Spun Yarn', 'Other'];

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

    <button class="delete-product-btn" data-idx="${index}">Delete This Listing</button>
  `;

  slot.querySelector('.add-photo-btn').addEventListener('click', () => slot.querySelector('.file-input').click());
  slot.querySelector('.file-input').addEventListener('change', e => handleImageUpload(e, index));
  slot.querySelector('.delete-product-btn').addEventListener('click', () => deleteProduct(index));
  wireRemoveButtons(slot, index);

  return slot;
}

function buildPhotoStripHTML(images) {
  if (!images || images.length === 0) {
    return `<p class="no-photos-hint">No photos yet — click "+ Add Photo" below.</p>`;
  }
  return images.map((src, i) => `
    <div class="photo-thumb">
      <img src="${src}" alt="Photo ${i + 1}">
      <button type="button" class="remove-photo-btn" data-photo-idx="${i}" aria-label="Remove photo">✕</button>
    </div>
  `).join('');
}

function wireRemoveButtons(container, slotIndex) {
  container.querySelectorAll('.remove-photo-btn').forEach(btn => {
    btn.addEventListener('click', () => removePhoto(slotIndex, parseInt(btn.dataset.photoIdx)));
  });
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
  wireRemoveButtons(strip, index);
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

// ─── Collect & Save ───────────────────────────────────────────────────────────

document.getElementById('save-btn').addEventListener('click', saveAll);

function collectFormValues() {
  siteData.products.forEach((p, i) => {
    p.name        = (document.getElementById('name-'  + i)?.value || '').trim();
    const rawPrice = (document.getElementById('price-' + i)?.value || '').trim();
    p.price       = rawPrice ? parseFloat(rawPrice) : '';
    p.description = (document.getElementById('desc-'  + i)?.value || '').trim();
    p.category    = document.getElementById('cat-'   + i)?.value || 'Other';
  });
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escAttr(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function escText(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(str || '')));
  return d.innerHTML;
}
