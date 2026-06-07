// components.js — Context-aware Header & Footer
// Detects which of the 3 sub-sites is active and renders the matching nav.
// Usage: <div id="sanjay-header"></div>  and  <div id="sanjay-footer"></div>

(function () {

    // ─── SITE DETECTION ───────────────────────────────────────────────
    // Returns 'godotdev' | 'sanjaymeher' | 'techtools' | 'root'
    function detectSite() {
        const path = window.location.pathname;
        if (path.startsWith('/godotdev') || path.startsWith('/sanjaymeherdev')) return 'godotdev';
        if (path.startsWith('/sanjaymeher')) return 'sanjaymeher';
        if (path.startsWith('/tech-tools')) return 'techtools';
        return 'root';
    }

    // Relative base path for pages inside subfolders like /legal/, /blog/
    function getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/legal/') || path.includes('/blog/')) return '../';
        return './';
    }

    const site = detectSite();
    const base = getBasePath();

    // ─── SHARED STYLES ────────────────────────────────────────────────
    const SHARED_CSS = `
<style>
/* ── Reset / base ── */
.sm-header *, .sm-footer * { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Header shell ── */
.sm-header {
    background: rgba(15,15,26,0.97);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    position: sticky; top: 0; z-index: 1000;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.sm-header .sm-inner {
    max-width: 1200px; margin: 0 auto; padding: 0 1.5rem;
    display: flex; align-items: center; justify-content: space-between;
    height: 58px; gap: 1rem;
}

/* ── Logo ── */
.sm-logo { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; flex-shrink: 0; }
.sm-logo-text { font-size: 1.15rem; font-weight: 700; color: #fff; }
.sm-logo-text span { color: #4f46e5; }
.sm-logo-badge {
    font-size: 0.65rem; font-weight: 600; padding: 2px 7px; border-radius: 20px;
    background: rgba(79,70,229,0.18); color: #818cf8; border: 1px solid rgba(79,70,229,0.3);
    letter-spacing: 0.03em; white-space: nowrap;
}

/* ── Desktop nav ── */
.sm-nav { display: flex; align-items: center; gap: 0.25rem; flex: 1; justify-content: center; }
.sm-nav a, .sm-nav .sm-drop-btn {
    color: #a0a0c0; text-decoration: none; font-size: 0.9rem; font-weight: 500;
    padding: 0.45rem 0.75rem; border-radius: 6px; transition: all 0.15s;
    background: none; border: none; cursor: pointer; font-family: inherit;
    white-space: nowrap;
}
.sm-nav a:hover, .sm-nav .sm-drop-btn:hover,
.sm-nav a.active { color: #fff; background: rgba(255,255,255,0.07); }

/* ── Dropdown ── */
.sm-dropdown { position: relative; }
.sm-dropdown-menu {
    display: none; position: absolute; top: calc(100% + 4px); left: 50%;
    transform: translateX(-50%);
    background: #1c1c2e; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; padding: 0.4rem; min-width: 220px; z-index: 200;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
.sm-dropdown-menu a {
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.55rem 0.85rem; border-radius: 8px;
    color: #c4c4d4; font-size: 0.85rem; text-decoration: none;
    transition: background 0.15s, color 0.15s;
}
.sm-dropdown-menu a:hover { background: rgba(79,70,229,0.15); color: #fff; }
.sm-dropdown-menu .sm-divider {
    height: 1px; background: rgba(255,255,255,0.07); margin: 0.3rem 0.5rem;
}
/* Bridge to prevent hover gap */
.sm-dropdown::after {
    content: ''; position: absolute; bottom: -8px; left: 0;
    width: 100%; height: 8px;
}

/* ── CTA buttons ── */
.sm-ctas { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
.sm-btn-primary {
    background: #4f46e5; color: #fff; padding: 0.45rem 1.1rem;
    border-radius: 8px; font-size: 0.85rem; font-weight: 600;
    text-decoration: none; transition: background 0.2s, transform 0.15s;
    white-space: nowrap;
}
.sm-btn-primary:hover { background: #4338ca; transform: translateY(-1px); }
.sm-btn-outline {
    border: 1px solid rgba(255,255,255,0.2); color: #c4c4d4;
    padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600;
    text-decoration: none; transition: all 0.2s; white-space: nowrap;
}
.sm-btn-outline:hover { border-color: #4f46e5; color: #818cf8; background: rgba(79,70,229,0.08); }

/* ── Site switcher pill ── */
.sm-switcher {
    display: flex; align-items: center; gap: 0.25rem;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 30px; padding: 3px; flex-shrink: 0;
}
.sm-switcher a {
    font-size: 0.72rem; font-weight: 600; padding: 4px 10px; border-radius: 20px;
    text-decoration: none; color: #888; transition: all 0.2s; white-space: nowrap;
}
.sm-switcher a.active, .sm-switcher a:hover {
    background: #4f46e5; color: #fff;
}

/* ── Mobile hamburger ── */
.sm-hamburger {
    display: none; background: none; border: none; cursor: pointer;
    color: #fff; padding: 0.4rem; border-radius: 6px; flex-shrink: 0;
}
.sm-hamburger:hover { background: rgba(255,255,255,0.08); }
.sm-hamburger svg { display: block; }

/* ── Mobile drawer ── */
#sm-drawer {
    position: fixed; top: 0; right: -100%; width: min(340px, 88vw);
    height: 100%; background: #13131f; z-index: 99999;
    transition: right 0.28s cubic-bezier(.4,0,.2,1);
    overflow-y: auto; box-shadow: -4px 0 24px rgba(0,0,0,0.5);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
#sm-drawer.open { right: 0; }
#sm-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.6);
    z-index: 99998; display: none; backdrop-filter: blur(2px);
}
#sm-overlay.open { display: block; }
body.sm-no-scroll { overflow: hidden; }

.sm-drawer-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08);
}
.sm-drawer-logo { font-size: 1rem; font-weight: 700; color: #fff; }
.sm-drawer-logo span { color: #4f46e5; }
.sm-drawer-close {
    background: rgba(255,255,255,0.08); border: none; color: #fff;
    width: 32px; height: 32px; border-radius: 6px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; transition: background 0.15s;
}
.sm-drawer-close:hover { background: rgba(255,255,255,0.15); }

.sm-drawer-switcher {
    display: flex; gap: 0.3rem; padding: 0.75rem 1.25rem;
    border-bottom: 1px solid rgba(255,255,255,0.08);
}
.sm-drawer-switcher a {
    flex: 1; text-align: center; padding: 6px 4px; border-radius: 8px;
    font-size: 0.72rem; font-weight: 600; color: #888; text-decoration: none;
    border: 1px solid rgba(255,255,255,0.1); transition: all 0.2s;
}
.sm-drawer-switcher a.active, .sm-drawer-switcher a:hover {
    background: #4f46e5; color: #fff; border-color: #4f46e5;
}

.sm-drawer-body { padding: 0.5rem 0.75rem 2rem; }
.sm-drawer-body a {
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.65rem 0.75rem; border-radius: 8px;
    color: #c4c4d4; text-decoration: none; font-size: 0.9rem;
    transition: background 0.15s, color 0.15s;
}
.sm-drawer-body a:hover { background: rgba(79,70,229,0.15); color: #fff; }
.sm-drawer-section { padding: 0.75rem 0.75rem 0.25rem; }
.sm-drawer-section-label {
    font-size: 0.7rem; font-weight: 700; color: #555; letter-spacing: 0.08em;
    text-transform: uppercase; padding: 0 0.25rem;
}
.sm-drawer-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 0.4rem 0.5rem; }
.sm-drawer-ctas { padding: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
.sm-drawer-ctas a {
    display: block; text-align: center; padding: 0.65rem; border-radius: 8px;
    font-weight: 600; font-size: 0.88rem; text-decoration: none; transition: all 0.2s;
}

/* ── Footer ── */
.sm-footer {
    background: #0d0d1a;
    border-top: 1px solid rgba(255,255,255,0.07);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin-top: 4rem;
}
.sm-footer .sm-f-inner { max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.5rem 1.5rem; }
.sm-footer .sm-f-top {
    display: grid; grid-template-columns: 2fr repeat(3, 1fr);
    gap: 2rem; margin-bottom: 2rem;
}
.sm-footer h4 { font-size: 0.8rem; font-weight: 700; color: #4f46e5; letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 0.75rem; }
.sm-footer p { font-size: 0.85rem; color: #666; line-height: 1.6; }
.sm-footer a { display: block; font-size: 0.85rem; color: #888; text-decoration: none; margin-bottom: 0.4rem; transition: color 0.15s; }
.sm-footer a:hover { color: #818cf8; }
.sm-footer .sm-f-social { display: flex; gap: 0.6rem; margin-top: 0.75rem; }
.sm-footer .sm-f-social a { display: inline-flex; margin-bottom: 0; width: 32px; height: 32px; align-items: center; justify-content: center; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); transition: all 0.2s; }
.sm-footer .sm-f-social a:hover { background: rgba(79,70,229,0.2); border-color: #4f46e5; }
.sm-footer .sm-f-bottom {
    border-top: 1px solid rgba(255,255,255,0.07);
    padding-top: 1.25rem; display: flex;
    justify-content: space-between; align-items: center;
    gap: 1rem; flex-wrap: wrap;
}
.sm-footer .sm-f-legal { display: flex; gap: 1rem; flex-wrap: wrap; }
.sm-footer .sm-f-legal a { display: inline; font-size: 0.78rem; color: #555; margin-bottom: 0; }
.sm-footer .sm-f-legal a:hover { color: #818cf8; }
.sm-footer .sm-f-copy { font-size: 0.78rem; color: #444; }

/* ── Responsive ── */
@media (max-width: 900px) {
    .sm-nav, .sm-switcher, .sm-ctas { display: none !important; }
    .sm-hamburger { display: flex; }
    .sm-footer .sm-f-top { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 540px) {
    .sm-footer .sm-f-top { grid-template-columns: 1fr; }
    .sm-footer .sm-f-bottom { flex-direction: column; align-items: flex-start; }
}
</style>`;

    // ─── NAV CONFIGS ──────────────────────────────────────────────────
    const NAV = {
        root: {
            logo: 'Sanjay<span>Meher</span>',
            badge: 'Hub',
            logoHref: '/',
            links: [
                { label: '🏢 Business', href: '/sanjaymeher' },
                { label: '🎮 Godot Dev', href: '/godotdev' },
                { label: '⚙️ Tech Tools', href: '/tech-tools' },
                { label: 'Blog', href: `${base}blog.html` },
                { label: 'Contact', href: `${base}contact.html` },
            ],
            ctas: [
                { label: '💬 WhatsApp', href: 'https://wa.me/917504704502', primary: true },
            ]
        },
        godotdev: {
            logo: 'Sanjay<span>MeherDev</span>',
            badge: 'Godot',
            logoHref: '/godotdev',
            links: [
                { label: 'Home', href: '/godotdev' },
                {
                    label: 'Store', dropdown: [
                        { icon: '🎮', label: 'Multiplayer Systems', href: `${base}cgstore.html?category=multiplayer` },
                        { icon: '🤖', label: 'AI & Tools', href: `${base}cgstore.html?category=ai` },
                        { icon: '🎲', label: 'Complete Game Kits', href: `${base}cgstore.html?category=gamekits` },
                        { icon: '⚙️', label: 'Universal Systems', href: `${base}cgstore.html?category=systems` },
                        { icon: '📦', label: 'Bundles', href: `${base}cgstore.html?category=bundles` },
                    ]
                },
                {
                    label: 'Multiplayer', dropdown: [
                        { icon: '⚡', label: 'Done-For-You Setup', href: `${base}godotmp.html` },
                        { icon: '🔒', label: 'GodotConnect P2P', href: `${base}godotconnect.html` },
                        { icon: '🔄', label: 'CGRelay Server', href: `${base}cgrelay.html` },
                        { icon: '🛠️', label: 'Custom Dev Services', href: `${base}services.html` },
                    ]
                },
                { label: 'Free Tools', href: `${base}freegodotassets.html` },
                { label: 'Learn', href: `${base}GDScourse.html` },
                { label: 'Blog', href: `${base}blog.html` },
            ],
            ctas: [
                { label: '🎮 Shop', href: `${base}cgstore.html`, primary: true },
                { label: '💬 Consult', href: `${base}services.html`, primary: false },
            ]
        },
        sanjaymeher: {
            logo: 'Sanjay<span>Meher</span>',
            badge: 'Business',
            logoHref: '/sanjaymeher',
            links: [
                { label: 'Home', href: '/sanjaymeher' },
                { label: 'Services', href: '/sanjaymeher/services' },
                { label: 'Products', href: '/sanjaymeher/products' },
                { label: 'About', href: '/sanjaymeher/about' },
                { label: 'Contact', href: '/sanjaymeher/contact' },
            ],
            ctas: [
                { label: '💬 WhatsApp', href: 'https://wa.me/918984636695?text=Hi%20Sanjay%2C%20I%20have%20a%20project%20for%20you', primary: true },
            ]
        },
        techtools: {
            logo: 'Sanjay<span>Tech</span>',
            badge: 'Tools',
            logoHref: '/tech-tools',
            links: [
                { label: 'Home', href: '/tech-tools' },
                {
                    label: 'Products', dropdown: [
                        { icon: '📱', label: 'WhatsApp Tools', href: '/tech-tools#whatsapp' },
                        { icon: '⚙️', label: 'Self-Host Servers', href: '/tech-tools#servers' },
                        { icon: '💼', label: 'Business Tools', href: '/tech-tools#business' },
                    ]
                },
                { label: 'Game Services', href: `${base}services.html` },
                { label: 'Blog', href: `${base}blog.html` },
            ],
            ctas: [
                { label: '💬 Free Consult', href: 'https://wa.me/917504704502?text=Hi%20Sanjay%2C%20I%20need%20something%20built%20for%20my%20business', primary: true },
            ]
        }
    };

    const cfg = NAV[site];

    // ─── SITE SWITCHER HTML ───────────────────────────────────────────
    function switcherHTML(mobile = false) {
        const items = [
            { key: 'godotdev',    label: '🎮 Godot',    href: '/godotdev' },
            { key: 'sanjaymeher', label: '🏢 Business',  href: '/sanjaymeher' },
            { key: 'techtools',   label: '⚙️ Tools',    href: '/tech-tools' },
        ];
        return items.map(i =>
            `<a href="${i.href}" class="${site === i.key ? 'active' : ''}">${i.label}</a>`
        ).join('');
    }

    // ─── RENDER DESKTOP NAV LINKS ─────────────────────────────────────
    function desktopLinks() {
        return cfg.links.map(l => {
            if (l.dropdown) {
                const items = l.dropdown.map(d =>
                    `<a href="${d.href}">${d.icon ? d.icon + ' ' : ''}${d.label}</a>`
                ).join('');
                return `
                <div class="sm-dropdown" data-drop>
                    <button class="sm-drop-btn">${l.label} ▾</button>
                    <div class="sm-dropdown-menu">${items}</div>
                </div>`;
            }
            const active = window.location.pathname === l.href || window.location.href.includes(l.href.replace('./','')) ? ' active' : '';
            return `<a href="${l.href}"${active ? ' class="active"' : ''}>${l.label}</a>`;
        }).join('');
    }

    // ─── RENDER MOBILE DRAWER LINKS ──────────────────────────────────
    function drawerLinks() {
        let html = '';
        cfg.links.forEach(l => {
            if (l.dropdown) {
                html += `<div class="sm-drawer-section"><div class="sm-drawer-section-label">${l.label}</div></div>`;
                l.dropdown.forEach(d => {
                    html += `<a href="${d.href}">${d.icon ? d.icon + ' ' : ''}${d.label}</a>`;
                });
                html += `<div class="sm-drawer-divider"></div>`;
            } else {
                html += `<a href="${l.href}">${l.label}</a>`;
            }
        });
        return html;
    }

    // ─── RENDER HEADER ────────────────────────────────────────────────
    function renderHeader() {
        const ctaHTML = cfg.ctas.map(c =>
            `<a href="${c.href}" class="${c.primary ? 'sm-btn-primary' : 'sm-btn-outline'}">${c.label}</a>`
        ).join('');

        return `
<header class="sm-header" role="banner">
    <div class="sm-inner">
        <a href="${cfg.logoHref}" class="sm-logo">
            <span class="sm-logo-text">${cfg.logo}</span>
            <span class="sm-logo-badge">${cfg.badge}</span>
        </a>

        <nav class="sm-nav" aria-label="Main">
            ${desktopLinks()}
        </nav>

        <div class="sm-switcher" aria-label="Switch section">
            ${switcherHTML()}
        </div>

        <div class="sm-ctas">${ctaHTML}</div>

        <button class="sm-hamburger" id="sm-open" aria-label="Open menu" aria-expanded="false">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
        </button>
    </div>
</header>

<!-- Mobile drawer -->
<div id="sm-overlay" role="presentation"></div>
<nav id="sm-drawer" aria-label="Mobile navigation">
    <div class="sm-drawer-head">
        <span class="sm-drawer-logo">${cfg.logo}</span>
        <button class="sm-drawer-close" id="sm-close" aria-label="Close menu">✕</button>
    </div>
    <div class="sm-drawer-switcher">${switcherHTML(true)}</div>
    <div class="sm-drawer-body">${drawerLinks()}</div>
    <div class="sm-drawer-ctas">
        ${cfg.ctas.map(c =>
            `<a href="${c.href}" style="${c.primary
                ? 'background:#4f46e5;color:#fff;'
                : 'border:1px solid rgba(255,255,255,0.15);color:#c4c4d4;'}">${c.label}</a>`
        ).join('')}
    </div>
</nav>`;
    }

    // ─── RENDER FOOTER ────────────────────────────────────────────────
    function renderFooter() {
        const year = new Date().getFullYear();
        const godotLinks = `
            <a href="${base}cgstore.html">🎮 Godot Store</a>
            <a href="${base}cgrelay.html">🔄 CGRelay</a>
            <a href="${base}godotmp.html">⚡ Multiplayer Setup</a>
            <a href="${base}freegodotassets.html">✨ Free Tools</a>
            <a href="${base}GDScourse.html">📚 Learn GDScript</a>`;
        const businessLinks = `
            <a href="/sanjaymeher/services">🏢 Business Services</a>
            <a href="/sanjaymeher/products">📦 Products</a>
            <a href="/tech-tools">⚙️ Tech Tools</a>
            <a href="/sanjaymeher/contact">📧 Contact</a>`;
        const resourceLinks = `
            <a href="${base}blog.html">📝 Blog</a>
            <a href="${base}contact.html">💬 Contact</a>
            <a href="${base}legal/terms.html">Terms</a>
            <a href="${base}legal/privacy.html">Privacy</a>
            <a href="${base}legal/refund.html">Refund Policy</a>`;

        return `
<footer class="sm-footer">
    <div class="sm-f-inner">
        <div class="sm-f-top">
            <div>
                <h4>SanjayMeherDev</h4>
                <p style="margin-bottom:0.75rem">One developer. Three worlds — Godot systems, business automation, and AI tools. Built in India 🇮🇳 for the world.</p>
                <div class="sm-f-social">
                    <a href="https://youtube.com/@Champ_gaming" target="_blank" rel="noopener" aria-label="YouTube">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#888"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>
                    </a>
                    <a href="https://github.com/sanjaymeherdev" target="_blank" rel="noopener" aria-label="GitHub">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#888"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.7 18 5 18 5c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z"/></svg>
                    </a>
                    <a href="https://instagram.com/freelance.sanjay" target="_blank" rel="noopener" aria-label="Instagram">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#888"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.1-4.8C2.4 3.9 4 2.3 7.2 2.3c1.3-.1 1.6-.1 4.8-.1zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1.0 8.3 0 8.7 0 12c0 3.3 0 3.7.1 4.9.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24c3.3 0 3.7 0 4.9-.1 4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9 0-3.3 0-3.7-.1-4.9C23.7 2.7 21.3.3 16.9.1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z"/></svg>
                    </a>
                    <a href="https://discord.gg/3TKfQw3qmn" target="_blank" rel="noopener" aria-label="Discord">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#888"><path d="M20.3 4.4A19.7 19.7 0 0 0 15.4 3c-.2.4-.5.9-.7 1.3a18.3 18.3 0 0 0-5.4 0A13.5 13.5 0 0 0 8.6 3 19.6 19.6 0 0 0 3.7 4.4C.5 9.2-.3 13.9.1 18.5a19.9 19.9 0 0 0 6 3c.5-.6.9-1.3 1.3-2a12.8 12.8 0 0 1-2-.9l.5-.4a14.2 14.2 0 0 0 12.2 0l.5.4a13 13 0 0 1-2 1c.4.7.8 1.4 1.3 2a19.8 19.8 0 0 0 6-3c.5-5.2-.8-9.8-3.6-14.1zM8 15.7c-1.2 0-2.1-1.1-2.1-2.4s.9-2.4 2.1-2.4c1.2 0 2.1 1.1 2.1 2.4s-.9 2.4-2.1 2.4zm7.9 0c-1.2 0-2.1-1.1-2.1-2.4s.9-2.4 2.1-2.4c1.2 0 2.1 1.1 2.1 2.4s-.9 2.4-2.1 2.4z"/></svg>
                    </a>
                </div>
            </div>
            <div>
                <h4>Godot Dev</h4>
                ${godotLinks}
            </div>
            <div>
                <h4>Business</h4>
                ${businessLinks}
            </div>
            <div>
                <h4>Resources</h4>
                ${resourceLinks}
            </div>
        </div>
        <div class="sm-f-bottom">
            <div class="sm-f-legal">
                <a href="${base}legal/terms.html">Terms</a>
                <a href="${base}legal/privacy.html">Privacy</a>
                <a href="${base}legal/license.html">License</a>
                <a href="${base}legal/refund.html">Refund</a>
                <a href="${base}legal/client-policy.html">Client Policy</a>
            </div>
            <span class="sm-f-copy">© ${year} SanjayMeherDev · Made in India 🇮🇳</span>
        </div>
    </div>
</footer>`;
    }

    // ─── INIT INTERACTIONS ────────────────────────────────────────────
    function initInteractions() {
        // Hamburger / drawer
        const open    = document.getElementById('sm-open');
        const close   = document.getElementById('sm-close');
        const drawer  = document.getElementById('sm-drawer');
        const overlay = document.getElementById('sm-overlay');

        function openDrawer()  { drawer.classList.add('open'); overlay.classList.add('open'); document.body.classList.add('sm-no-scroll'); open && open.setAttribute('aria-expanded','true'); }
        function closeDrawer() { drawer.classList.remove('open'); overlay.classList.remove('open'); document.body.classList.remove('sm-no-scroll'); open && open.setAttribute('aria-expanded','false'); }

        open    && open.addEventListener('click', openDrawer);
        close   && close.addEventListener('click', closeDrawer);
        overlay && overlay.addEventListener('click', closeDrawer);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

        // Desktop dropdowns — hover with bridge delay
        document.querySelectorAll('.sm-dropdown[data-drop]').forEach(dd => {
            const menu = dd.querySelector('.sm-dropdown-menu');
            let timer;
            const show = () => { clearTimeout(timer); menu.style.display = 'block'; };
            const hide = () => { timer = setTimeout(() => { menu.style.display = 'none'; }, 120); };
            dd.addEventListener('mouseenter', show);
            dd.addEventListener('mouseleave', hide);
            menu.addEventListener('mouseenter', show);
            menu.addEventListener('mouseleave', hide);
        });
    }

    // ─── INJECT ───────────────────────────────────────────────────────
    function inject() {
        const headerEl = document.getElementById('sanjay-header');
        const footerEl = document.getElementById('sanjay-footer');

        if (headerEl || footerEl) {
            document.head.insertAdjacentHTML('beforeend', SHARED_CSS);
        }

        if (headerEl) {
            headerEl.innerHTML = renderHeader();
            initInteractions();
        }

        if (footerEl) {
            footerEl.innerHTML = renderFooter();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }

})();
