/* ===== Shop Page JavaScript ===== */

const SVG = {
  facebook:  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
};

// ─── Cart state ───────────────────────────────────────────────────────────────

let cart = loadCartFromStorage();

function loadCartFromStorage() {
  try { return JSON.parse(localStorage.getItem('rm_cart') || '[]'); }
  catch (e) { return []; }
}

function saveCartToStorage() {
  localStorage.setItem('rm_cart', JSON.stringify(cart));
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + parseFloat(item.price || 0) * item.quantity, 0);
}

function cartItemCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// ─── Shop loader ──────────────────────────────────────────────────────────────

async function loadShop() {
  const grid = document.getElementById('products-grid');

  try {
    const res = await fetch('/.netlify/functions/get-products');
    if (!res.ok) throw new Error('Failed to load');
    const data = await res.json();

    const products = (data.products || []).filter(p => p && p.name && p.name.trim() !== '');
    const s        = data.settings || {};

    populateHeaderSocial(s);

    if (products.length === 0) {
      grid.innerHTML = '<p class="grid-message">Check back soon for new pieces!</p>';
    } else {
      buildFilterBar(products);
      renderProducts(products, 'All');
    }

  } catch (err) {
    grid.innerHTML = '<p class="grid-message">Unable to load the shop right now. Please try again later.</p>';
  }
}

// ─── Header social icons ──────────────────────────────────────────────────────

function populateHeaderSocial(s) {
  const wrap = document.getElementById('header-social');
  if (!wrap) return;
  if (s.facebookUrl)  wrap.appendChild(makeSocialIconLink(s.facebookUrl,  SVG.facebook,  'Facebook'));
  if (s.instagramUrl) wrap.appendChild(makeSocialIconLink(s.instagramUrl, SVG.instagram, 'Instagram'));
}

function makeSocialIconLink(url, svgHtml, label) {
  const a = document.createElement('a');
  a.href      = url;
  a.target    = '_blank';
  a.rel       = 'noopener noreferrer';
  a.className = 'social-icon-link';
  a.setAttribute('aria-label', label);
  a.innerHTML = svgHtml;
  return a;
}

// ─── Category filter bar ──────────────────────────────────────────────────────

let allProducts = [];

function buildFilterBar(products) {
  allProducts = products;
  const bar   = document.getElementById('filter-bar');
  if (!bar) return;

  const used = ['All', ...['Jewelry', 'Knits & Felts', 'Hand Spun Yarn', 'Other'].filter(
    cat => products.some(p => (p.category || 'Other') === cat)
  )];

  if (used.length <= 2) return;

  bar.innerHTML = '';
  used.forEach(cat => {
    const btn = document.createElement('button');
    btn.className   = 'filter-btn' + (cat === 'All' ? ' active' : '');
    btn.dataset.cat = cat;
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProducts(allProducts, cat);
    });
    bar.appendChild(btn);
  });

  bar.style.display = 'flex';
}

function renderProducts(products, category) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const filtered = category === 'All'
    ? products
    : products.filter(p => (p.category || 'Other') === category);

  grid.innerHTML = '';
  if (filtered.length === 0) {
    grid.innerHTML = '<p class="grid-message">No items in this category yet.</p>';
  } else {
    filtered.forEach(p => grid.appendChild(buildCard(p)));
  }
}

// ─── Product cards ────────────────────────────────────────────────────────────

function buildCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';

  const images = Array.isArray(product.images) && product.images.length
    ? product.images
    : (product.image ? [product.image] : []);

  let imgHtml;
  if (images.length === 0) {
    imgHtml = `<div class="product-placeholder">&#128149;</div>`;
  } else if (images.length === 1) {
    imgHtml = `<img class="product-image" src="${esc(images[0])}" alt="${esc(product.name)}" loading="lazy">`;
  } else {
    imgHtml = `
      <div class="product-carousel">
        ${images.map((src, i) => `<img class="product-image carousel-img${i === 0 ? ' active' : ''}" src="${esc(src)}" alt="${esc(product.name)}" loading="lazy">`).join('')}
        <button class="carousel-btn prev-btn" aria-label="Previous photo">&#8249;</button>
        <button class="carousel-btn next-btn" aria-label="Next photo">&#8250;</button>
        <div class="carousel-dots">
          ${images.map((_, i) => `<span class="dot${i === 0 ? ' active' : ''}"></span>`).join('')}
        </div>
      </div>`;
  }

  const descHtml = product.description
    ? `<p class="product-desc">${esc(product.description)}</p>`
    : '';

  card.innerHTML = `
    ${imgHtml}
    <div class="product-info">
      <div class="product-name">${esc(product.name)}</div>
      ${descHtml}
      <div class="product-price">$${parseFloat(product.price || 0).toFixed(2)}</div>
      <button class="buy-btn">Add to Cart</button>
    </div>
  `;

  if (images.length > 1) {
    const carousel = card.querySelector('.product-carousel');
    const imgs     = carousel.querySelectorAll('.carousel-img');
    const dots     = carousel.querySelectorAll('.dot');
    let   current  = 0;

    function goTo(n) {
      imgs[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (n + images.length) % images.length;
      imgs[current].classList.add('active');
      dots[current].classList.add('active');
    }

    carousel.querySelector('.prev-btn').addEventListener('click', e => { e.stopPropagation(); goTo(current - 1); });
    carousel.querySelector('.next-btn').addEventListener('click', e => { e.stopPropagation(); goTo(current + 1); });
    dots.forEach((dot, i) => dot.addEventListener('click', e => { e.stopPropagation(); goTo(i); }));
  }

  card.querySelector('.buy-btn').addEventListener('click', function() {
    const added = addToCart(product, images[0] || '');
    if (added) {
      this.textContent = 'Added!';
      this.style.background = '#27ae60';
      setTimeout(() => {
        this.textContent = 'In Cart';
        this.style.background = '';
        this.disabled = true;
      }, 1000);
    } else {
      this.textContent = 'Already in Cart';
      this.disabled = true;
    }
  });

  return card;
}

// ─── Cart: add / remove / update ─────────────────────────────────────────────

function addToCart(product, image) {
  const already = cart.find(i => String(i.id) === String(product.id));
  if (already) return false; // one-of-a-kind, can't add twice
  cart.push({
    id:          product.id,
    name:        product.name,
    price:       product.price,
    description: product.description || '',
    image:       image,
    quantity:    1,
  });
  saveCartToStorage();
  updateCartCount();
  renderCartItems();
  return true;
}

function removeFromCart(id) {
  cart = cart.filter(i => String(i.id) !== String(id));
  saveCartToStorage();
  updateCartCount();
  renderCartItems();
}

function updateQty(id, delta) {
  const item = cart.find(i => String(i.id) === String(id));
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  saveCartToStorage();
  updateCartCount();
  renderCartItems();
}

// ─── Cart UI ──────────────────────────────────────────────────────────────────

function initCart() {
  // Inject overlay + drawer into body
  const overlay = document.createElement('div');
  overlay.className = 'cart-overlay';
  overlay.id        = 'cart-overlay';
  document.body.appendChild(overlay);

  const drawer = document.createElement('div');
  drawer.className = 'cart-drawer';
  drawer.id        = 'cart-drawer';
  drawer.innerHTML = `
    <div class="cart-header">
      <h2>Your Cart</h2>
      <button class="cart-close-btn" id="cart-close">✕</button>
    </div>
    <div class="cart-items" id="cart-items"></div>
    <div class="cart-footer" id="cart-footer"></div>
  `;
  document.body.appendChild(drawer);

  // Wire open/close
  document.getElementById('cart-icon-btn').addEventListener('click', openCart);
  overlay.addEventListener('click', closeCart);
  drawer.querySelector('#cart-close').addEventListener('click', closeCart);

  // Render initial state
  updateCartCount();
  renderCartItems();
}

function openCart() {
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-drawer').classList.remove('open');
}

function updateCartCount() {
  const badge = document.getElementById('cart-count');
  if (!badge) return;
  const count = cartItemCount();
  badge.textContent  = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

function renderCartItems() {
  const itemsEl  = document.getElementById('cart-items');
  const footerEl = document.getElementById('cart-footer');
  if (!itemsEl || !footerEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML  = '<div class="cart-empty">Your cart is empty.</div>';
    footerEl.innerHTML = '';
    return;
  }

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${esc(String(item.id))}">
      ${item.image
        ? `<img class="cart-item-img" src="${item.image}" alt="${esc(item.name)}">`
        : `<div class="cart-item-img"></div>`}
      <div class="cart-item-info">
        <div class="cart-item-name">${esc(item.name)}</div>
        <div class="cart-item-price">$${parseFloat(item.price || 0).toFixed(2)}</div>
      </div>
      <button class="cart-remove-btn" data-id="${esc(String(item.id))}" aria-label="Remove">✕</button>
    </div>
  `).join('');

  itemsEl.querySelectorAll('.cart-remove-btn').forEach(btn =>
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id)));

  const total = cartTotal();
  footerEl.innerHTML = `
    <div class="cart-total">
      <span>Total</span>
      <span>$${total.toFixed(2)}</span>
    </div>
    <button class="cart-checkout-btn" id="cart-checkout-btn">Proceed to Checkout</button>
    <button class="cart-continue-btn" id="cart-continue-btn">Continue Shopping</button>
  `;

  document.getElementById('cart-checkout-btn').addEventListener('click', checkout);
  document.getElementById('cart-continue-btn').addEventListener('click', closeCart);
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

async function checkout() {
  const btn = document.getElementById('cart-checkout-btn');
  btn.disabled    = true;
  btn.textContent = 'Please wait...';

  try {
    const res = await fetch('/.netlify/functions/create-checkout', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(item => ({
          name:        item.name,
          price:       item.price,
          description: item.description || '',
          quantity:    item.quantity,
        })),
      }),
    });

    if (!res.ok) throw new Error('Checkout failed');

    const { url } = await res.json();
    // Clear cart on successful redirect to Stripe
    cart = [];
    saveCartToStorage();
    window.location.href = url;

  } catch (err) {
    alert('Something went wrong. Please try again.');
    btn.disabled    = false;
    btn.textContent = 'Proceed to Checkout';
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function esc(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initCart();
  loadShop();
});
