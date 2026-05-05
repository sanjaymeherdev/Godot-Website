// components.js - Marketing Site Version
// No Godot, no Store, no Game references
// Usage: Add <div id="sanjay-header"></div> and <div id="sanjay-footer"></div> to your HTML

(function() {
    // ========== HEADER STYLES (same as yours, keeping consistency) ==========
    const headerStyles = `
    <style>
        .sanjay-header { background: rgba(15, 15, 26, 0.95); backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 1000; border-bottom: 1px solid rgba(79, 70, 229, 0.2); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; }
        .sanjay-header .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
        .sanjay-header nav { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; flex-wrap: wrap; }
        .sanjay-header .logo { font-size: 1.5rem; font-weight: bold; }
        .sanjay-header .logo a { color: white; text-decoration: none; }
        .sanjay-header .logo span { color: #4f46e5; }
        .sanjay-header .logo .tagline { font-size: 0.7rem; opacity: 0.7; margin-left: 0.5rem; font-weight: normal; }
        .sanjay-header .nav-links { display: flex; gap: 1.5rem; align-items: center; }
        .sanjay-header .nav-links a { color: #a0a0c0; text-decoration: none; transition: color 0.2s; font-weight: 500; }
        .sanjay-header .nav-links a:hover, .sanjay-header .nav-links a.active { color: #4f46e5; }
        
        .sanjay-header .dropdown { position: relative; display: inline-block; }
        .sanjay-header .dropbtn { cursor: pointer; background: none; border: none; color: #a0a0c0; font-weight: 500; font-size: 1rem; font-family: inherit; padding: 0.5rem 0; }
        .sanjay-header .dropbtn:hover { color: #4f46e5; }
        .sanjay-header .dropdown-content { 
            display: none; 
            position: absolute; 
            background: #1a1a2e; 
            min-width: 240px; 
            box-shadow: 0 8px 16px rgba(0,0,0,0.3); 
            border-radius: 12px; 
            z-index: 1000; 
            top: 100%; 
            left: 0; 
            margin-top: 0; 
            border: 1px solid rgba(79, 70, 229, 0.2); 
            overflow: hidden;
        }
        .sanjay-header .dropdown::after {
            content: '';
            position: absolute;
            bottom: -0.5rem;
            left: 0;
            width: 100%;
            height: 0.5rem;
            background: transparent;
        }
        .sanjay-header .dropdown-content::before {
            content: '';
            position: absolute;
            top: -0.5rem;
            left: 0;
            width: 100%;
            height: 0.5rem;
            background: transparent;
        }
        .sanjay-header .dropdown-content a { color: white; padding: 0.75rem 1rem; text-decoration: none; display: block; font-size: 0.9rem; transition: background 0.2s; }
        .sanjay-header .dropdown-content a:hover { background: #2d2d44; }
        
        .sanjay-header .cta-button-primary { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 0.5rem 1.25rem; border-radius: 8px; font-weight: 600; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; display: inline-block; }
        .sanjay-header .cta-button-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
        .sanjay-header .cta-button-secondary { border: 2px solid #4f46e5; color: #4f46e5; padding: 0.5rem 1.25rem; border-radius: 8px; font-weight: 600; text-decoration: none; transition: all 0.2s; display: inline-block; background: transparent; }
        .sanjay-header .cta-button-secondary:hover { background: #4f46e5; color: white; }
        .sanjay-header .mobile-menu-btn { display: none; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; }
        body.sanjay-menu-open { overflow: hidden; }
        @media (max-width: 768px) { .sanjay-header .nav-links { display: none; } .sanjay-header .mobile-menu-btn { display: block; } .sanjay-header .cta-button-primary, .sanjay-header .cta-button-secondary { display: none; } .sanjay-header .logo .tagline { display: none; } }
    </style>
    <style>
        #sanjayMobileMenu { position: fixed; top: 0; right: -100%; width: 80%; max-width: 320px; height: 100%; background: #1a1a2e; z-index: 99999; transition: right 0.3s ease; box-shadow: -2px 0 10px rgba(0,0,0,0.3); overflow-y: auto; }
        #sanjayMobileMenu.active { right: 0; }
        #sanjayMobileMenu .mobile-menu-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
        #sanjayMobileMenu .mobile-menu-logo { font-size: 1.25rem; font-weight: bold; color: white; }
        #sanjayMobileMenu .mobile-close-btn { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; }
        #sanjayMobileMenu .mobile-nav-links { padding: 1rem; }
        #sanjayMobileMenu .mobile-nav-links a { display: block; padding: 0.75rem 1rem; color: white; text-decoration: none; border-radius: 8px; transition: background 0.2s; }
        #sanjayMobileMenu .mobile-nav-links a:hover { background: #2d2d44; }
        #sanjayMobileMenu .mobile-dropdown { margin: 0.5rem 0; }
        #sanjayMobileMenu .mobile-dropdown-header { font-weight: bold; padding: 0.75rem 1rem; color: #4f46e5; font-size: 0.9rem; }
        #sanjayMobileMenu .mobile-dropdown a { padding-left: 2rem !important; font-size: 0.9rem; }
        #sanjayMobileMenuOverlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 99998; display: none; }
        #sanjayMobileMenuOverlay.active { display: block; }
    </style>
    `;
    
    // ========== FOOTER STYLES (same as yours) ==========
    const footerStyles = `
        <style>
            .sanjay-footer { background: #0f0f1a; margin-top: 4rem; border-top: 1px solid rgba(79, 70, 229, 0.2); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; }
            .sanjay-footer .footer-container { max-width: 1200px; margin: 0 auto; padding: 3rem 1.5rem 1.5rem; }
            .sanjay-footer .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 2rem; }
            .sanjay-footer .footer-section h4 { color: #4f46e5; margin-bottom: 1rem; font-size: 1.1rem; }
            .sanjay-footer .footer-section p { color: #a0a0c0; line-height: 1.6; font-size: 0.9rem; }
            .sanjay-footer .footer-section a { display: block; color: #a0a0c0; text-decoration: none; margin-bottom: 0.5rem; transition: color 0.2s; font-size: 0.9rem; }
            .sanjay-footer .footer-section a:hover { color: #4f46e5; }
            .sanjay-footer .social-links { display: flex; gap: 1rem; margin-top: 1rem; }
            .sanjay-footer .social-links a { display: inline-block; margin-bottom: 0; font-size: 1.2rem; }
            .sanjay-footer .footer-bottom { text-align: center; padding-top: 2rem; margin-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.1); color: #a0a0c0; font-size: 0.85rem; }
            .sanjay-footer .footer-bottom a { color: #4f46e5; text-decoration: none; }
            .sanjay-footer .footer-bottom a:hover { text-decoration: underline; }
            .sanjay-footer .footer-credits { margin-top: 0.5rem; font-size: 0.8rem; opacity: 0.7; }
            @media (max-width: 768px) { .sanjay-footer .footer-grid { grid-template-columns: 1fr; gap: 1.5rem; text-align: center; } .sanjay-footer .social-links { justify-content: center; } .sanjay-footer .footer-section a { text-align: center; } }
        </style>
    `;
    
    function getBasePath() {
        const path = window.location.pathname;
        // For marketing site, all pages are in /marketing/ folder
        // So relative paths go to ./
        return './';
    }
    
    // ========== MARKETING HEADER (No Godot, No Store) ==========
    function renderHeader() {
        const basePath = getBasePath();
        return `
            <header class="sanjay-header">
                <div class="container">
                    <nav>
                        <div class="logo">
                            <a href="${basePath}index.html">Sanjay<span>Meher</span></a>
                            <span class="tagline">Digital Marketing</span>
                        </div>
                        <div class="nav-links">
                            <a href="${basePath}index.html">Home</a>
                            <a href="${basePath}services.html">Services</a>
                            <a href="${basePath}portfolio.html">Portfolio</a>
                            <a href="${basePath}about.html">About</a>
                            <a href="${basePath}contact.html">Contact</a>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <a href="${basePath}contact.html" class="cta-button-primary">📞 Free Consultation</a>
                        </div>
                        <button class="mobile-menu-btn" id="sanjayMobileMenuBtn">☰</button>
                    </nav>
                </div>
            </header>
            <div id="sanjayMobileMenu">
                <div class="mobile-menu-header">
                    <div class="mobile-menu-logo">SanjayMeher</div>
                    <button class="mobile-close-btn" id="sanjayMobileCloseBtn">✕</button>
                </div>
                <div class="mobile-nav-links">
                    <a href="${basePath}index.html">Home</a>
                    <a href="${basePath}services.html">Services</a>
                    <a href="${basePath}portfolio.html">Portfolio</a>
                    <a href="${basePath}about.html">About</a>
                    <a href="${basePath}contact.html">Contact</a>
                    <a href="${basePath}contact.html" class="cta-button-primary" style="display: block; text-align: center; margin: 1rem;">Free Consultation</a>
                </div>
            </div>
            <div id="sanjayMobileMenuOverlay"></div>
        `;
    }
    
    // ========== MARKETING FOOTER (No Godot, No Store references) ==========
    function renderFooter() {
        const basePath = getBasePath();
        const year = new Date().getFullYear();
        return `
            <footer class="sanjay-footer">
                <div class="footer-container">
                    <div class="footer-grid">
                        <div class="footer-section">
                            <h4>Sanjay Meher</h4>
                            <p>Digital marketing and business automation for Indian small businesses. Helping you get found on Google and automate your operations.</p>
                            <div class="social-links">
                                <a href="https://instagram.com/freelance.sanjay" target="_blank" title="Instagram" style="color:#a0a0c0;transition:color 0.2s;" onmouseover="this.style.color='#e1306c'" onmouseout="this.style.color='#a0a0c0'">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.1-4.8C2.4 3.9 4 2.3 7.2 2.3c1.3-.1 1.6-.1 4.8-.1zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1.0 8.3 0 8.7 0 12c0 3.3 0 3.7.1 4.9.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24c3.3 0 3.7 0 4.9-.1 4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9 0-3.3 0-3.7-.1-4.9C23.7 2.7 21.3.3 16.9.1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z"/></svg>
                                </a>
                                <a href="https://github.com/sanjaymeherdev" target="_blank" title="GitHub" style="color:#a0a0c0;transition:color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#a0a0c0'">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.7 18 5 18 5c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z"/></svg>
                                </a>
                            </div>
                        </div>
                        <div class="footer-section">
                            <h4>Services</h4>
                            <a href="${basePath}services.html#seo">📍 Local SEO & Google Maps</a>
                            <a href="${basePath}services.html#reviews">⭐ Google Reviews Management</a>
                            <a href="${basePath}services.html#speed">🚀 Website Speed Optimization</a>
                            <a href="${basePath}services.html#whatsapp">💬 WhatsApp Automation</a>
                            <a href="${basePath}services.html#ai">🧠 AI Integration</a>
                        </div>
                        <div class="footer-section">
                            <h4>Company</h4>
                            <a href="${basePath}about.html">About Me</a>
                            <a href="${basePath}portfolio.html">Portfolio</a>
                            <a href="${basePath}contact.html">Contact</a>
                            <a href="${basePath}blog/index.html">Blog</a>
                        </div>
                        <div class="footer-section">
                            <h4>Legal</h4>
                            <a href="${basePath}legal/terms.html">Terms of Service</a>
                            <a href="${basePath}legal/privacy.html">Privacy Policy</a>
                            <a href="${basePath}legal/refund.html">Refund Policy</a>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>© ${year} Sanjay Meher. All rights reserved.</p>
                        <p class="footer-credits">Made in India 🇮🇳 | Helping small businesses grow online</p>
                    </div>
                </div>
            </footer>
        `;
    }
    
    function initHeader() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.sanjay-header .nav-links a').forEach(link => {
            const href = link.getAttribute('href')?.split('/').pop()?.split('?')[0];
            if (href === currentPage) link.classList.add('active');
        });
        
        const mobileMenuBtn = document.getElementById('sanjayMobileMenuBtn');
        const mobileCloseBtn = document.getElementById('sanjayMobileCloseBtn');
        const mobileMenu = document.getElementById('sanjayMobileMenu');
        const mobileMenuOverlay = document.getElementById('sanjayMobileMenuOverlay');
        
        if (mobileMenuBtn && mobileCloseBtn && mobileMenu && mobileMenuOverlay) {
            function openMobileMenu() {
                mobileMenu.classList.add('active');
                mobileMenuOverlay.classList.add('active');
                document.body.classList.add('sanjay-menu-open');
            }
            function closeMobileMenu() {
                mobileMenu.classList.remove('active');
                mobileMenuOverlay.classList.remove('active');
                document.body.classList.remove('sanjay-menu-open');
            }
            mobileMenuBtn.addEventListener('click', openMobileMenu);
            mobileCloseBtn.addEventListener('click', closeMobileMenu);
            mobileMenuOverlay.addEventListener('click', closeMobileMenu);
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeMobileMenu();
            });
        }
    }
    
    function init() {
        const headerContainer = document.getElementById('sanjay-header');
        const footerContainer = document.getElementById('sanjay-footer');
        
        if (headerContainer) {
            document.head.insertAdjacentHTML('beforeend', headerStyles);
            headerContainer.innerHTML = renderHeader();
            initHeader();
        }
        
        if (footerContainer) {
            document.head.insertAdjacentHTML('beforeend', footerStyles);
            footerContainer.innerHTML = renderFooter();
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
