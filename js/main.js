// ============================================================
// SANJAY MEHER — main.js (Updated with fail-safe checks)
// Supabase: colors, settings, products, leads
// ============================================================

const SUPABASE_URL = 'https://bvavtdyxuzzabzgodbjw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2YXZ0ZHl4dXp6YWJ6Z29kYmp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTc2OTksImV4cCI6MjA4OTc3MzY5OX0.gqfiaeDtWBtuyj_CQCaiySVA2-VmuM9CVvd5N-gRlV8';

// ── Supabase fetch helper ──────────────────────────────────
async function supabaseFetch(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY
    }
  });
  if (!res.ok) throw new Error(`Supabase fetch failed for ${table}: ${res.status}`);
  return res.json();
}

// ── Theme & mobile menu ──────────────────────────────────
// NOTE: theme toggle + hamburger/drawer are now owned centrally by
// js/components.js (the shared header). This page just needs to make
// sure the current theme (already applied to <body> by components.js)
// is reflected once Supabase colors load — see applyColors() below.

// ── Apply Colors from Supabase ────────────────────────────
function applyColors(colors) {
  const map = Array.isArray(colors)
    ? Object.fromEntries(colors.map(c => [c.key, c.value]))
    : colors;

  const vars = {
    '--accent':       map.primary_color   || '#8B5CF6',
    '--accent-hover': map.secondary_color || '#7C3AED',
    '--bg-dark':      map.background_dark || '#0a0a0f',
    '--bg-light':     map.background_light|| '#f5f5f7',
  };

  Object.entries(vars).forEach(([k,v]) =>
    document.documentElement.style.setProperty(k, v)
  );

  // Reapply bg based on current theme
  const isDark = !document.body.classList.contains('light-theme');
  document.documentElement.style.setProperty(
    '--bg-primary', isDark ? vars['--bg-dark'] : vars['--bg-light']
  );
}

// ── Apply Settings from Supabase ─────────────────────────
function applySettings(settings) {
  const map = Array.isArray(settings)
    ? Object.fromEntries(settings.map(s => [s.key, s.value]))
    : settings;

  // WhatsApp number
  if (map.whatsapp_number) {
    const num = map.whatsapp_number.replace(/\D/g,'');
    const fmt = formatPhone(num);
    document.querySelectorAll('.wa-number').forEach(el => el.textContent = fmt);
    document.querySelectorAll('[data-wa-link]').forEach(el => {
      const msg = el.getAttribute('data-wa-msg') || '';
      el.href = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
    });
    document.querySelectorAll('.whatsapp-float').forEach(el => {
      el.href = `https://wa.me/${num}?text=Hi%20Sanjay%2C%20I%20need%20a%20quote%20for%20my%20business.`;
    });
  }

  // Email
  if (map.email) {
    document.querySelectorAll('.contact-email').forEach(el => {
      el.textContent = map.email;
      if (el.tagName === 'A') el.href = `mailto:${map.email}`;
    });
  }

  // Site title
  if (map.site_title) document.title = map.site_title;
}

function formatPhone(num) {
  const s = String(num);
  if (s.length === 12 && s.startsWith('91'))
    return `+91 ${s.slice(2,7)} ${s.slice(7)}`;
  if (s.length === 10)
    return `+91 ${s.slice(0,5)} ${s.slice(5)}`;
  return `+${s}`;
}

// ── Apply Products from Supabase ─────────────────────────
let allProducts = [];

function applyProducts(products, query = '') {
  const grid = document.getElementById('productsGrid');
  // Only run if productsGrid exists on this page
  if (!grid) return;

  let active = products.filter(p => p.active !== false && p.active !== 'FALSE');

  if (query.trim()) {
    const q = query.toLowerCase();
    active = active.filter(p =>
      (p.name||'').toLowerCase().includes(q) ||
      (p.description||'').toLowerCase().includes(q)
    );
  }

  const countEl = document.getElementById('productsCount');
  if (countEl) countEl.textContent = `${active.length} product${active.length !== 1 ? 's' : ''} available`;

  if (!active.length) {
    grid.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem 0;">No products found.</p>';
    return;
  }

  grid.innerHTML = active.map(p => `
    <div class="product-card animate-on-scroll">
      ${p.image_url ? `
        <div class="product-image-container">
          <img src="${esc(p.image_url)}" alt="${esc(p.name||'')}" loading="lazy">
        </div>` : ''}
      <div class="product-info">
        <h3>${esc(p.name||'')}</h3>
        ${p.problem ? `<p class="problem-line">"${esc(p.problem)}"</p>` : ''}
        <p>${esc(p.description||'')}</p>
        <ul class="feature-list">
          ${p.feature1 ? `<li>${esc(p.feature1)}</li>` : ''}
          ${p.feature2 ? `<li>${esc(p.feature2)}</li>` : ''}
          ${p.feature3 ? `<li>${esc(p.feature3)}</li>` : ''}
        </ul>
        ${p.price ? `<div class="product-price-tag">${esc(p.price)}</div>` : ''}
        <a href="${esc(p.buy_link||'contact.html')}" class="quote-btn" style="margin-top:0.5rem;display:inline-block">
          Get Quote →
        </a>
      </div>
    </div>
  `).join('');

  initScrollAnimations();
}

function esc(text) {
  if (!text) return '';
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

// ── Load all Supabase data ────────────────────────────────
async function loadAllData() {
  try {
    const [colors, settings, products] = await Promise.all([
      supabaseFetch('colors'),
      supabaseFetch('settings'),
      supabaseFetch('products').catch(() => [])
    ]);

    applyColors(colors);
    applySettings(settings);

    allProducts = products;
    applyProducts(products); // This will only run if productsGrid exists

  } catch (err) {
    console.error('Supabase load error:', err);
    const grid = document.getElementById('productsGrid');
    if (grid && grid.innerHTML.includes('Loading')) {
      grid.innerHTML = '<p style="text-align:center;color:var(--danger);padding:2rem 0;">⚠️ Could not load products. Please refresh.</p>';
    }
  }
}

// ── Product search ────────────────────────────────────────
function initProductSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return; // Only run on products page
  input.addEventListener('input', () => applyProducts(allProducts, input.value));
}

// ── Contact form ──────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return; // Only run on contact page

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = {
      name:    fd.get('name'),
      email:   fd.get('email'),
      phone:   fd.get('phone'),
      service: fd.get('service') || 'General',
      message: fd.get('message'),
      status:  'New'
    };

    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '⏳ Sending…';
    btn.disabled = true;

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(res.status);
      showNotification('✅ Message sent! I\'ll reply on WhatsApp within 24 hours.', 'success');
      form.reset();
    } catch {
      showNotification('❌ Something went wrong. Please WhatsApp me directly.', 'error');
    } finally {
      btn.innerHTML = orig;
      btn.disabled = false;
    }
  });
}

// ── Notification ──────────────────────────────────────────
function showNotification(msg, type = 'success') {
  let el = document.querySelector('.site-notification');
  if (!el) {
    el = document.createElement('div');
    el.className = 'site-notification';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = `site-notification ${type} show`;
  setTimeout(() => el.classList.remove('show'), 4500);
}

// ── Scroll animations ─────────────────────────────────────
function initScrollAnimations() {
  const els = document.querySelectorAll('.animate-on-scroll');
  if (els.length === 0) return;
  
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 55);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  els.forEach(el => obs.observe(el));
}

// NOTE: active-nav highlighting is now handled inside js/components.js
// (the shared header owns the nav markup, so it owns marking it active too).

// ── Logo image error handler ──────────────────────────────
function initLogoErrors() {
  document.querySelectorAll('.logo-chip img, .brand-item img').forEach(img => {
    img.addEventListener('error', function() {
      this.style.display = 'none';
    });
  });
}

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Page loaded, initializing...');

  await loadAllData();

  initScrollAnimations();
  initContactForm();  // Safe - checks if form exists
  initProductSearch(); // Safe - checks if search input exists
  initLogoErrors();
  
  console.log('Initialization complete');
});
