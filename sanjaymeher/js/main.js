// ==================== CONFIGURATION ====================
const SUPABASE_URL = 'https://bvavtdyxuzzabzgodbjw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2YXZ0ZHl4dXp6YWJ6Z29kYmp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTc2OTksImV4cCI6MjA4OTc3MzY5OX0.gqfiaeDtWBtuyj_CQCaiySVA2-VmuM9CVvd5N-gRlV8';

// ==================== SUPABASE FETCH HELPER ====================
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

// ==================== THEME MANAGEMENT ====================
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const bgDark = getComputedStyle(document.documentElement).getPropertyValue('--bg-dark').trim();
  const bgLight = getComputedStyle(document.documentElement).getPropertyValue('--bg-light').trim();
  
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    document.body.style.backgroundColor = bgLight || '#f5f5f7';
    updateThemeIcons('light');
  } else {
    document.body.classList.remove('light-theme');
    document.body.style.backgroundColor = bgDark || '#0a0a0f';
    updateThemeIcons('dark');
  }
}

function updateThemeIcons(theme) {
  const isLight = theme === 'light';
  const desktopIcon = document.querySelector('#themeToggleDesktop .theme-icon');
  const mobileIcon = document.querySelector('#themeToggleMobile');
  
  if (desktopIcon) {
    desktopIcon.textContent = isLight ? '☀️' : '🌙';
  }
  
  if (mobileIcon) {
    if (isLight) {
      mobileIcon.innerHTML = '<span class="theme-icon">☀️</span> Switch Theme';
    } else {
      mobileIcon.innerHTML = '<span class="theme-icon">🌙</span> Switch Theme';
    }
  }
}

function toggleTheme() {
  const isCurrentlyLight = document.body.classList.contains('light-theme');
  const bgDark = getComputedStyle(document.documentElement).getPropertyValue('--bg-dark').trim();
  const bgLight = getComputedStyle(document.documentElement).getPropertyValue('--bg-light').trim();
  
  if (isCurrentlyLight) {
    // Switch to dark mode
    document.body.classList.remove('light-theme');
    document.body.style.backgroundColor = bgDark || '#0a0a0f';
    localStorage.setItem('theme', 'dark');
    updateThemeIcons('dark');
  } else {
    // Switch to light mode
    document.body.classList.add('light-theme');
    document.body.style.backgroundColor = bgLight || '#f5f5f7';
    localStorage.setItem('theme', 'light');
    updateThemeIcons('light');
  }
  
  // Force update of any elements that might have cached styles
  document.dispatchEvent(new Event('themeChanged'));
}

// ==================== MOBILE MENU ====================
function initMobileMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
}

// ==================== APPLY COLORS ====================
function applyColors(colors) {
  const map = Array.isArray(colors)
    ? Object.fromEntries(colors.map(c => [c.key, c.value]))
    : colors;

  const primaryColor = map.primary_color || '#8b5cf6';
  const secondaryColor = map.secondary_color || '#6d28d9';
  const bgDark = map.background_dark || '#0a0a0f';
  const bgLight = map.background_light || '#f5f5f7';
  const textDark = map.text_dark || '#ffffff';
  const textLight = map.text_light || '#1a1a2e';

  document.documentElement.style.setProperty('--primary-color', primaryColor);
  document.documentElement.style.setProperty('--secondary-color', secondaryColor);
  document.documentElement.style.setProperty('--bg-dark', bgDark);
  document.documentElement.style.setProperty('--bg-light', bgLight);
  document.documentElement.style.setProperty('--text-dark', textDark);
  document.documentElement.style.setProperty('--text-light', textLight);

  // Apply current theme background
  if (document.body.classList.contains('light-theme')) {
    document.body.style.backgroundColor = bgLight;
  } else {
    document.body.style.backgroundColor = bgDark;
  }
}

// ==================== APPLY SETTINGS ====================
function applySettings(settings) {
  const map = Array.isArray(settings)
    ? Object.fromEntries(settings.map(s => [s.key, s.value]))
    : settings;

  // Update WhatsApp number
  if (map.whatsapp_number) {
    const whatsappNumber = map.whatsapp_number.replace(/\D/g, '');
    const formattedNumber = formatPhoneNumber(whatsappNumber);
    
    const whatsappBtn = document.querySelector('.btn-whatsapp');
    if (whatsappBtn) {
      const icon = whatsappBtn.querySelector('i');
      if (icon) {
        whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i> ' + formattedNumber;
      } else {
        whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i> ' + formattedNumber;
      }
    }
    
    const callBtn = document.querySelector('.btn-call');
    if (callBtn) {
      callBtn.textContent = formattedNumber;
    }
  }

  // Update email
  if (map.email) {
    const emailBtn = document.querySelector('.btn-email');
    if (emailBtn) {
      emailBtn.textContent = map.email;
    }
  }

  // Update site title
  if (map.site_title) {
    document.title = map.site_title;
  }
}

// Helper function to format phone number
function formatPhoneNumber(number) {
  const str = number.toString();
  if (str.length === 12 && str.startsWith('91')) {
    return `+91 ${str.slice(2, 7)} ${str.slice(7)}`;
  }
  if (str.length === 10) {
    return `+91 ${str.slice(0, 5)} ${str.slice(5)}`;
  }
  return `+${str}`;
}

// ==================== APPLY PRODUCTS ====================
function applyProducts(products) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const active = products.filter(p => p.active !== false && p.active !== 'FALSE');

  if (!active.length) {
    grid.innerHTML = '<p style="text-align:center;color:#9090b8;">No products found.</p>';
    return;
  }

  grid.innerHTML = active.map(p => `
    <div class="service-card">
      <div class="service-icon">${escapeHtml(p.icon || p.Icon || '📦')}</div>
      <h3>${escapeHtml(p.name || p.Name || '')}</h3>
      <p class="problem-line">"${escapeHtml(p.problem || p.Problem || '')}"</p>
      <p>${escapeHtml(p.description || p.Description || '')}</p>
      <ul class="feature-list">
        ${(p.feature1 || p.Feature1) ? `<li>${escapeHtml(p.feature1 || p.Feature1)}</li>` : ''}
        ${(p.feature2 || p.Feature2) ? `<li>${escapeHtml(p.feature2 || p.Feature2)}</li>` : ''}
        ${(p.feature3 || p.Feature3) ? `<li>${escapeHtml(p.feature3 || p.Feature3)}</li>` : ''}
      </ul>
      <div style="margin-top:10px;font-weight:bold;color:var(--primary-color,#8b5cf6);">
        ${escapeHtml(p.price || p.Price || '')}
      </div>
      <a href="${escapeHtml(p.buy_link || p.BuyLink || 'contact.html')}" class="quote-btn">Get Quote →</a>
    </div>
  `).join('');

  const countEl = document.getElementById('productsCount');
  if (countEl) countEl.textContent = `${active.length} products available`;
}

// ==================== LOAD ALL DATA FROM SUPABASE ====================
async function loadAllData() {
  try {
    // Fetch all 3 in parallel
    const [colors, settings, products] = await Promise.all([
      supabaseFetch('colors'),
      supabaseFetch('settings'),
      supabaseFetch('products')
    ]);

    applyColors(colors);
    applySettings(settings);
    applyProducts(products);
    
    // Re-apply theme after colors are loaded
    const currentTheme = localStorage.getItem('theme');
    const bgDark = getComputedStyle(document.documentElement).getPropertyValue('--bg-dark').trim();
    const bgLight = getComputedStyle(document.documentElement).getPropertyValue('--bg-light').trim();
    
    if (currentTheme === 'light') {
      document.body.classList.add('light-theme');
      document.body.style.backgroundColor = bgLight || '#f5f5f7';
      updateThemeIcons('light');
    } else {
      document.body.classList.remove('light-theme');
      document.body.style.backgroundColor = bgDark || '#0a0a0f';
      updateThemeIcons('dark');
    }

    // Clear any old cached data
    localStorage.removeItem('siteData');
    localStorage.removeItem('siteDataTime');

  } catch(error) {
    console.error('Supabase load failed, page will use defaults:', error);
    
    const grid = document.getElementById('productsGrid');
    if (grid && grid.innerHTML.includes('fa-spinner')) {
      grid.innerHTML = '<p style="text-align:center;color:#ef4444;">⚠️ Unable to load data. Please refresh the page.</p>';
    }
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      const note = document.querySelector('.form-note');
      if (note) {
        note.innerHTML = '⚠️ Connection issue. Please WhatsApp directly or refresh.';
        note.style.color = '#ef4444';
      }
    }
  }
}

// ==================== CONTACT FORM HANDLER ====================
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      service: formData.get('service') || 'General',
      message: formData.get('message')
    };

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>⏳ Sending...</span>';
    submitBtn.disabled = true;

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ ...data, status: 'New' })
      });

      if (!res.ok) throw new Error(`Supabase error: ${res.status}`);

      showNotification('✅ Thank you! I will contact you on WhatsApp within 24 hours.', 'success');
      contactForm.reset();

    } catch(error) {
      console.error('Lead save failed:', error);
      showNotification('❌ Something went wrong. Please WhatsApp directly.', 'error');
    } finally {
      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled = false;
    }
  });
}

// ==================== NOTIFICATION ====================
function showNotification(message, type = 'success') {
  let notification = document.querySelector('.site-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'site-notification';
    document.body.appendChild(notification);
    const style = document.createElement('style');
    style.textContent = `
      .site-notification {
        position: fixed; bottom: 90px; right: 20px;
        background: #10b981; color: white;
        padding: 12px 20px; border-radius: 8px;
        font-size: 14px; z-index: 10000;
        opacity: 0; transition: opacity 0.3s;
        pointer-events: none; max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }
      .site-notification.error { background: #ef4444; }
      .site-notification.show { opacity: 1; }
    `;
    document.head.appendChild(style);
  }
  notification.textContent = message;
  notification.className = `site-notification ${type} show`;
  setTimeout(() => notification.classList.remove('show'), 4000);
}

// ==================== SCROLL ANIMATIONS ====================
function initScrollAnimations() {
  const elements = document.querySelectorAll('.service-card, .step-card, .brand-item, .service-card-full, .faq-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ==================== ACTIVE NAV ====================
function highlightActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.desktop-nav a, .mobile-nav a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.style.color = 'var(--primary-color)';
    }
  });
}

// ==================== ESCAPE HTML ====================
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==================== LOGO ERROR HANDLER ====================
function initLogoErrorHandler() {
  document.querySelectorAll('.brand-item img').forEach(img => {
    img.addEventListener('error', function() { 
      this.style.display = 'none'; 
    });
  });
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initMobileMenu();
  highlightActiveNav();

  // Load data first, then animate
  await loadAllData();
  initScrollAnimations();
  initContactForm();
  initLogoErrorHandler();

  // Add theme toggle event listeners
  const desktopToggle = document.getElementById('themeToggleDesktop');
  const mobileToggle = document.getElementById('themeToggleMobile');
  
  if (desktopToggle) {
    desktopToggle.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
    });
  }
  
  if (mobileToggle) {
    mobileToggle.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
    });
  }
});
