// components.js - Combined Header and Footer
// Usage: Add <div id="sanjay-header"></div> and <div id="sanjay-footer"></div> to your HTML

(function() {
    // ========== HEADER STYLES ==========
    const headerStyles = `
    <style>
        /* Header Styles */
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
        
        /* Fixed Dropdown Styles - No Gap */
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
        /* Bridge elements to eliminate gap */
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
        .sanjay-header .mobile-menu { position: fixed; top: 0; right: -100%; width: 80%; max-width: 320px; height: 100%; background: #1a1a2e; z-index: 2000; transition: right 0.3s ease; box-shadow: -2px 0 10px rgba(0,0,0,0.3); overflow-y: auto; }
        .sanjay-header .mobile-menu.active { right: 0; }
        .sanjay-header .mobile-menu-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .sanjay-header .mobile-menu-logo { font-size: 1.25rem; font-weight: bold; color: white; }
        .sanjay-header .mobile-close-btn { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; }
        .sanjay-header .mobile-nav-links { padding: 1rem; }
        .sanjay-header .mobile-nav-links a { display: block; padding: 0.75rem 1rem; color: white; text-decoration: none; border-radius: 8px; transition: background 0.2s; }
        .sanjay-header .mobile-nav-links a:hover { background: #2d2d44; }
        .sanjay-header .mobile-dropdown { margin: 0.5rem 0; }
        .sanjay-header .mobile-dropdown-header { font-weight: bold; padding: 0.75rem 1rem; color: #4f46e5; font-size: 0.9rem; }
        .sanjay-header .mobile-dropdown a { padding-left: 2rem !important; font-size: 0.9rem; }
        .sanjay-header .mobile-menu-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1999; display: none; }
        .sanjay-header .mobile-menu-overlay.active { display: block; }
        body.sanjay-menu-open { overflow: hidden; }
        @media (max-width: 768px) { .sanjay-header .nav-links { display: none; } .sanjay-header .mobile-menu-btn { display: block; } .sanjay-header .cta-button-primary, .sanjay-header .cta-button-secondary { display: none; } .sanjay-header .logo .tagline { display: none; } }
    </style>
`;
    
    // ========== FOOTER STYLES ==========
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
    
    // Helper function
    function getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/legal/') || path.includes('/blog/') || path.includes('/pages/')) {
            return '../';
        }
        return './';
    }
    
    // Render Header
    function renderHeader() {
        const basePath = getBasePath();
        return `
            <header class="sanjay-header">
                <div class="container">
                    <nav>
                        <div class="logo">
                            <a href="${basePath}index.html">Sanjay<span>AIDev</span></a>
                            <span class="tagline">Godot Expert</span>
                        </div>
                        <div class="nav-links">
                            <a href="${basePath}index.html">Home</a>
                            <div class="dropdown">
                                <button class="dropbtn">Store ▼</button>
                                <div class="dropdown-content">
                                    <a href="${basePath}cgstore.html?category=multiplayer">🎮 Multiplayer Systems</a>
                                    <a href="${basePath}cgstore.html?category=ai">🤖 AI & Tools</a>
                                    <a href="${basePath}cgstore.html?category=gamekits">🎲 Complete Game Kits</a>
                                    <a href="${basePath}cgstore.html?category=systems">⚙️ Universal Systems</a>
                                    <a href="${basePath}cgstore.html?category=bundles">📦 Bundles</a>
                                </div>
                            </div>
                            <div class="dropdown">
                                <button class="dropbtn">Services ▼</button>
                                <div class="dropdown-content">
                                    <a href="${basePath}godotmp.html">⚡ Done-For-You Networking</a>
                                    <a href="${basePath}godotconnect.html">🔒 Privacy P2P Backend</a>
                                    <a href="${basePath}cgrelay.html">🔄 Managed Relay Server</a>
                                    <a href="${basePath}customdev.html">🛠️ Custom Development</a>
                                </div>
                            </div>
                            <a href="${basePath}freegodotassets.html">Free Tools</a>
                            <a href="${basePath}learn.html">Learn</a>
                            <a href="${basePath}blog.html">Blog</a>
                            <a href="${basePath}contact.html">Contact</a>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <a href="${basePath}cgstore.html" class="cta-button-primary">🎮 Shop</a>
                            <a href="${basePath}services.html#consult" class="cta-button-secondary">💬 Consult</a>
                        </div>
                        <button class="mobile-menu-btn" id="sanjayMobileMenuBtn">☰</button>
                    </nav>
                </div>
                <div class="mobile-menu" id="sanjayMobileMenu">
                    <div class="mobile-menu-header">
                        <div class="mobile-menu-logo">SanjayAIDev</div>
                        <button class="mobile-close-btn" id="sanjayMobileCloseBtn">✕</button>
                    </div>
                    <div class="mobile-nav-links">
                        <a href="${basePath}index.html">Home</a>
                        <div class="mobile-dropdown">
                            <div class="mobile-dropdown-header">Store</div>
                            <a href="${basePath}cgstore.html?category=multiplayer">→ Multiplayer Systems</a>
                            <a href="${basePath}cgstore.html?category=ai">→ AI & Tools</a>
                            <a href="${basePath}cgstore.html?category=gamekits">→ Complete Game Kits</a>
                            <a href="${basePath}cgstore.html?category=systems">→ Universal Systems</a>
                        </div>
                        <div class="mobile-dropdown">
                            <div class="mobile-dropdown-header">Services</div>
                            <a href="${basePath}godotmp.html">→ Done-For-You Networking</a>
                            <a href="${basePath}godotconnect.html">→ Privacy P2P Backend</a>
                            <a href="${basePath}cgrelay.html">→ Managed Relay Server</a>
                            <a href="${basePath}customdev.html">→ Custom Development</a>
                        </div>
                        <a href="${basePath}freegodotassets.html">Free Tools</a>
                        <a href="${basePath}learn.html">Learn</a>
                        <a href="${basePath}blog.html">Blog</a>
                        <a href="${basePath}contact.html">Contact</a>
                        <a href="${basePath}cgstore.html" class="cta-button-primary" style="display: block; text-align: center; margin: 1rem;">Shop Now</a>
                        <a href="${basePath}services.html#consult" class="cta-button-secondary" style="display: block; text-align: center; margin: 1rem;">Free Consultation</a>
                    </div>
                </div>
                <div class="mobile-menu-overlay" id="sanjayMobileMenuOverlay"></div>
            </header>
        `;
    }
    
    // Render Footer
    function renderFooter() {
        const basePath = getBasePath();
        const year = new Date().getFullYear();
        return `
            <footer class="sanjay-footer">
                <div class="footer-container">
                    <div class="footer-grid">
                        <div class="footer-section">
                            <h4>SanjayAIDev</h4>
                            <p>Your go-to expert for Godot game development. From beginner tutorials to production-ready multiplayer systems, AI integrations, and complete game kits.</p>
                            <div class="social-links">
                                <a href="https://youtube.com/@Champ_gaming" target="_blank">📺 YouTube</a>
                                <a href="#" target="_blank">🐙 GitHub</a>
                                <a href="#" target="_blank">🐦 Twitter</a>
                                <a href="#" target="_blank">💬 Discord</a>
                            </div>
                        </div>
                        <div class="footer-section">
                            <h4>Products</h4>
                            <a href="${basePath}cgstore.html?category=multiplayer">🎮 Multiplayer Systems</a>
                            <a href="${basePath}cgstore.html?category=ai">🤖 AI & Tools</a>
                            <a href="${basePath}cgstore.html?category=gamekits">🎲 Complete Game Kits</a>
                            <a href="${basePath}cgstore.html?category=systems">⚙️ Universal Systems</a>
                            <a href="${basePath}freegodotassets.html">✨ Free Tools</a>
                        </div>
                        <div class="footer-section">
                            <h4>Services</h4>
                            <a href="${basePath}godotmp.html">⚡ Done-For-You Networking</a>
                            <a href="${basePath}godotconnect.html">🔒 Privacy P2P Backend</a>
                            <a href="${basePath}cgrelay.html">🔄 Managed Relay Server</a>
                            <a href="${basePath}customdev.html">🛠️ Custom Development</a>
                            <a href="${basePath}services.html#consult">💬 Free Consultation</a>
                        </div>
                        <div class="footer-section">
                            <h4>Resources</h4>
                            <a href="${basePath}learn.html">📚 Learn Godot</a>
                            <a href="${basePath}blog.html">📝 Blog</a>
                            <a href="${basePath}godotvisualcoder.html">🎨 GodotVisualCoder</a>
                            <a href="${basePath}faq.html">❓ FAQ</a>
                            <a href="${basePath}contact.html">📧 Contact</a>
                        </div>
                        
                    </div>
					<div class="footer-bottom">
                            <h4>Legal</h4>
                            <a href="${basePath}legal/terms.html">Terms of Service</a>
                            <a href="${basePath}legal/privacy.html">Privacy Policy</a>
                            <a href="${basePath}legal/license.html">License</a>
                            <a href="${basePath}legal/refund.html">Refund Policy</a>
                        </div>
                    <div class="footer-bottom">
                        <p>© ${year} SanjayAIDev. All rights reserved.</p>
                        <p class="footer-credits">Built with ❤️ for the Godot community | Made in India 🇮🇳</p>
                    </div>
                </div>
            </footer>
        `;
    }
    
    // Initialize Header Functionality
   // Initialize Header Functionality
function initHeader() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.sanjay-header .nav-links a, .sanjay-header .mobile-nav-links a').forEach(link => {
        const href = link.getAttribute('href')?.split('/').pop()?.split('?')[0];
        if (href === currentPage) {
            link.classList.add('active');
        }
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
    
    // Fixed Dropdown Event Handlers
    const dropdowns = document.querySelectorAll('.sanjay-header .dropdown');
    dropdowns.forEach(dropdown => {
        const content = dropdown.querySelector('.dropdown-content');
        let timeoutId;
        
        function showDropdown() {
            clearTimeout(timeoutId);
            if (content) content.style.display = 'block';
        }
        
        function hideDropdown() {
            timeoutId = setTimeout(() => {
                if (content) content.style.display = 'none';
            }, 150);
        }
        
        dropdown.addEventListener('mouseenter', showDropdown);
        dropdown.addEventListener('mouseleave', hideDropdown);
        
        if (content) {
            content.addEventListener('mouseenter', showDropdown);
            content.addEventListener('mouseleave', hideDropdown);
        }
    });
}
    
    // Inject components when DOM is ready
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
