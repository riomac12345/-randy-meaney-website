/* ===== About Page JavaScript ===== */

const SVG = {
  instagram: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
};

async function fetchWithRetry(url, attempts = 3, delayMs = 800) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
    } catch (_) {}
    if (i < attempts - 1) await new Promise(r => setTimeout(r, delayMs));
  }
  return null;
}

async function loadAbout() {
  try {
    const res  = await fetchWithRetry('/.netlify/functions/get-products');
    if (!res) throw new Error('Failed after retries');
    const data = await res.json();
    const s    = data.settings || {};

    // Header social icons
    populateHeaderSocial(s);

    // About Randy section
    if (s.aboutText || s.aboutPhoto) {
      const section = document.getElementById('about');
      if (section) section.style.display = '';

      if (s.aboutPhoto) {
        const col = document.getElementById('about-photo-col');
        const img = document.getElementById('about-photo-img');
        if (col && img) { img.src = s.aboutPhoto; col.style.display = ''; }
      }

      const body = document.getElementById('about-body');
      if (body && s.aboutText) body.textContent = s.aboutText;

      const socialWrap = document.getElementById('about-social-links');
      if (socialWrap) {
        if (s.instagramUrl) socialWrap.appendChild(makeAboutSocialLink(s.instagramUrl, SVG.instagram, 'Instagram'));
      }
    }

    // Special orders
    if (s.specialOrdersText && s.specialOrdersText.trim()) {
      const card = document.getElementById('special-orders-card');
      const body = document.getElementById('special-orders-body');
      if (card && body) {
        body.textContent  = s.specialOrdersText;
        card.style.display = '';
      }
    }

    // Returns
    if (s.returnsText && s.returnsText.trim()) {
      const card = document.getElementById('returns-card');
      const body = document.getElementById('returns-body');
      if (card && body) {
        body.textContent  = s.returnsText;
        card.style.display = '';
      }
    }

    // Contact email
    if (s.contactEmail) {
      const link = document.getElementById('contact-link');
      if (link) link.href = 'mailto:' + s.contactEmail;
    }

  } catch (err) {
    // fail silently — static default content remains visible
  }
}

function populateHeaderSocial(s) {
  const wrap = document.getElementById('header-social');
  if (!wrap) return;
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

function makeAboutSocialLink(url, svgHtml, label) {
  const a = document.createElement('a');
  a.href      = url;
  a.target    = '_blank';
  a.rel       = 'noopener noreferrer';
  a.className = 'about-social-link';
  a.innerHTML = svgHtml + label;
  return a;
}

document.addEventListener('DOMContentLoaded', loadAbout);
