/* ===== Find My Work / Events Page ===== */

const SVG = {
  instagram: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
};

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

async function loadEvents() {
  try {
    const res  = await fetch('/.netlify/functions/get-products');
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    const s    = data.settings || {};

    // Header social icons
    const wrap = document.getElementById('header-social');
    if (wrap) {
      if (s.instagramUrl) wrap.appendChild(makeSocialIconLink(s.instagramUrl, SVG.instagram, 'Instagram'));
    }

    let hasEvents = false;
    let hasShops  = false;

    // Upcoming Events
    const events = Array.isArray(s.events) ? s.events : [];
    const today  = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = events
      .filter(ev => ev.name && ev.date)
      .filter(ev => {
        const [y, m, d] = ev.date.split('-').map(Number);
        return new Date(y, m - 1, d) >= today;
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    if (upcoming.length) {
      hasEvents = true;
      const section = document.getElementById('events-section');
      const list    = document.getElementById('events-list');
      if (section && list) {
        upcoming.forEach(ev => {
          const [year, month, day] = ev.date.split('-').map(Number);

          const card = document.createElement('div');
          card.className = 'event-card';

          // Date badge
          const badge = document.createElement('div');
          badge.className = 'event-badge';
          badge.innerHTML = `<span class="event-badge-month">${MONTHS_SHORT[month - 1]}</span><span class="event-badge-day">${day}</span><span class="event-badge-year">${year}</span>`;

          // Details
          const details = document.createElement('div');
          details.className = 'event-details';

          const nameEl = document.createElement('div');
          nameEl.className   = 'event-name';
          nameEl.textContent = ev.name;
          details.appendChild(nameEl);

          if (ev.location && ev.location.trim()) {
            const locEl = document.createElement('div');
            locEl.className   = 'event-location';
            locEl.innerHTML   = `<svg class="event-pin-icon" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 0C5.24 0 3 2.24 3 5c0 3.75 5 11 5 11s5-7.25 5-11c0-2.76-2.24-5-5-5zm0 6.75A1.75 1.75 0 1 1 8 3.25a1.75 1.75 0 0 1 0 3.5z"/></svg>${ev.location}`;
            details.appendChild(locEl);
          }

          card.appendChild(badge);
          card.appendChild(details);
          list.appendChild(card);
        });
        section.style.display = '';
      }
    }

    // Find My Work (shops)
    if (s.shopsText && s.shopsText.trim()) {
      const section = document.getElementById('shops-section');
      const grid    = document.getElementById('shops-grid');
      if (section && grid) {
        const entries = s.shopsText.trim().split(/\n\n+/);
        entries.forEach(entry => {
          const lines = entry.trim().split('\n').filter(l => l.trim());
          if (!lines.length) return;
          const card    = document.createElement('div');
          card.className = 'shop-card';
          const name    = document.createElement('div');
          name.className   = 'shop-name';
          name.textContent = lines[0];
          card.appendChild(name);
          if (lines[1]) {
            const addr = document.createElement('div');
            addr.className   = 'shop-address';
            addr.textContent = lines.slice(1).join(', ');
            card.appendChild(addr);
          }
          grid.appendChild(card);
        });
        if (grid.children.length) {
          hasShops = true;
          section.style.display = '';
        }
      }
    }

    // Show divider only when both sections are visible
    if (hasEvents && hasShops) {
      const divider = document.getElementById('events-divider');
      if (divider) divider.style.display = '';
    }

    if (!hasEvents && !hasShops) {
      const placeholder = document.getElementById('no-content-section');
      if (placeholder) placeholder.style.display = '';
    }

  } catch (err) {
    // fail silently
  }
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

document.addEventListener('DOMContentLoaded', loadEvents);
