// components.js - Marketing Site for Graphicy
// No Godot, No Store, No Blog
// Usage: Add <div id="sanjay-header"></div> and <div id="sanjay-footer"></div> to your HTML

(function() {
    // ========== HEADER STYLES ==========
    const headerStyles = `
    <style>
        .graphicy-header { background: rgba(10, 10, 20, 0.95); backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 1000; border-bottom: 1px solid rgba(139, 92, 246, 0.2); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; }
        .graphicy-header .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
        .graphicy-header nav { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; flex-wrap: wrap; }
        .graphicy-header .logo { font-size: 1.5rem; font-weight: bold; }
        .graphicy-header .logo a { color: white; text-decoration: none; }
        .graphicy-header .logo span { color: #8b5cf6; }
        .graphicy-header .logo .tagline { font-size: 0.7rem; opacity: 0.7; margin-left: 0.5rem; font-weight: normal; }
        .graphicy-header .nav-links { display: flex; gap: 1.5rem; align-items: center; }
        .graphicy-header .nav-links a { color: #a0a0c0; text-decoration: none; transition: color 0.2s; font-weight: 500; }
        .graphicy-header .nav-links a:hover, .graphicy-header .nav-links a.active { color: #8b5cf6; }
        
        .graphicy-header .dropdown { position: relative; display: inline-block; }
        .graphicy-header .dropbtn { cursor: pointer; background: none; border: none; color: #a0a0c0; font-weight: 500; font-size: 1rem; font-family: inherit; padding: 0.5rem 0; }
        .graphicy-header .dropbtn:hover { color: #8b5cf6; }
        .graphicy-header .dropdown-content { 
            display: none; 
            position: absolute; 
            background: #1a1a2e; 
            min-width: 220px; 
            box-shadow: 0 8px 16px rgba(0,0,0,0.3); 
            border-radius: 12px; 
            z-index: 1000; 
            top: 100%; 
            left: 0; 
            margin-top: 0; 
            border: 1px solid rgba(139, 92, 246, 0.2); 
            overflow: hidden;
        }
        .graphicy-header .dropdown::after {
            content: '';
            position: absolute;
            bottom: -0.5rem;
            left: 0;
            width: 100%;
            height: 0.5rem;
            background: transparent;
        }
        .graphicy-header .dropdown-content::before {
            content: '';
            position: absolute;
            top: -0.5rem;
            left: 0;
            width: 100%;
            height: 0.5rem;
            background: transparent;
        }
        .graphicy-header .dropdown-content a { color: white; padding: 0.75rem 1rem; text-decoration: none; display: block; font-size: 0.9rem; transition: background 0.2s; }
        .graphicy-header .dropdown-content a:hover { background: #2d2d44; color: #8b5cf6; }
        
        .graphicy-header .cta-button-primary { background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white; padding: 0.5rem 1.25rem; border-radius: 8px; font-weight: 600; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; display: inline-block; }
        .graphicy-header .cta-button-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4); }
        .graphicy-header .mobile-menu-btn { display: none; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; }
        body.graphicy-menu-open { overflow: hidden; }
        @media (max-width: 768px) { .graphicy-header .nav-links { display: none; } .graphicy-header .mobile-menu-btn { display: block; } .graphicy-header .cta-button-primary { display: none; } .graphicy-header .logo .tagline { display: none; } }
    </style>
    <style>
        #graphicyMobileMenu { position: fixed; top: 0; right: -100%; width: 80%; max-width: 320px; height: 100%; background: #1a1a2e; z-index: 99999; transition: right 0.3s ease; box-shadow: -2px 0 10px rgba(0,0,0,0.3); overflow-y: auto; }
        #graphicyMobileMenu.active { right: 0; }
        #graphicyMobileMenu .mobile-menu-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
        #graphicyMobileMenu .mobile-menu-logo { font-size: 1.25rem; font-weight: bold; color: white; }
        #graphicyMobileMenu .mobile-close-btn { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; }
        #graphicyMobileMenu .mobile-nav-links { padding: 1rem; }
        #graphicyMobileMenu .mobile-nav-links a { display: block; padding: 0.75rem 1rem; color: white; text-decoration: none; border-radius: 8px; transition: background 0.2s; }
        #graphicyMobileMenu .mobile-nav-links a:hover { background: #2d2d44; }
        #graphicyMobileMenu .mobile-dropdown { margin: 0.5rem 0; }
        #graphicyMobileMenu .mobile-dropdown-header { font-weight: bold; padding: 0.75rem 1rem; color: #8b5cf6; font-size: 0.9rem; }
        #graphicyMobileMenu .mobile-dropdown a { padding-left: 2rem !important; font-size: 0.9rem; }
        #graphicyMobileMenuOverlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 99998; display: none; }
        #graphicyMobileMenuOverlay.active { display: block; }
    </style>
    `;
    
    // ========== FOOTER STYLES ==========
    const footerStyles = `
        <style>
            .graphicy-footer { background: #0a0a14; margin-top: 4rem; border-top: 1px solid rgba(139, 92, 246, 0.2); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; }
            .graphicy-footer .footer-container { max-width: 1200px; margin: 0 auto; padding: 3rem 1.5rem 1.5rem; }
            .graphicy-footer .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 2rem; }
            .graphicy-footer .footer-section h4 { color: #8b5cf6; margin-bottom: 1rem; font-size: 1.1rem; }
            .graphicy-footer .footer-section p { color: #a0a0c0; line-height: 1.6; font-size: 0.9rem; }
            .graphicy-footer .footer-section a { display: block; color: #a0a0c0; text-decoration: none; margin-bottom: 0.5rem; transition: color 0.2s; font-size: 0.9rem; }
            .graphicy-footer .footer-section a:hover { color: #8b5cf6; }
            .graphicy-footer .social-links { display: flex; gap: 1rem; margin-top: 1rem; }
            .graphicy-footer .social-links a { display: inline-block; margin-bottom: 0; font-size: 1.2rem; }
            .graphicy-footer .footer-bottom { text-align: center; padding-top: 2rem; margin-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.1); color: #a0a0c0; font-size: 0.85rem; }
            .graphicy-footer .footer-bottom a { color: #8b5cf6; text-decoration: none; }
            .graphicy-footer .footer-bottom a:hover { text-decoration: underline; }
            .graphicy-footer .footer-credits { margin-top: 0.5rem; font-size: 0.8rem; opacity: 0.7; }
            @media (max-width: 768px) { .graphicy-footer .footer-grid { grid-template-columns: 1fr; gap: 1.5rem; text-align: center; } .graphicy-footer .social-links { justify-content: center; } .graphicy-footer .footer-section a { text-align: center; } }
        </style>
    `;
    
    function getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/portfolio/')) {
            return '../';
        }
        return './';
    }
    
    // ========== MARKETING HEADER (Graphicy) ==========
    function renderHeader() {
        const basePath = getBasePath();
        return `
            <header class="graphicy-header">
                <div class="container">
                    <nav>
                        <div class="logo">
                            <a href="${basePath}index.html">Graphicy<span>.</span></a>
                            <span class="tagline">by Sanjay Meher</span>
                        </div>
                        <div class="nav-links">
                            <a href="${basePath}index.html">Home</a>
                            <a href="${basePath}services.html">Services</a>
                            <div class="dropdown">
                                <button class="dropbtn">Portfolio ▼</button>
                                <div class="dropdown-content">
                                    <a href="${basePath}portfolio/video-editing.html">🎬 Video Editing</a>
                                    <a href="${basePath}portfolio/graphic-design.html">🎨 Graphic Design</a>
                                    <a href="${basePath}portfolio/motion-graphics.html">✨ Motion Graphics</a>
                                    <a href="${basePath}portfolio/animation.html">🎮 2D/3D Animation</a>
                                </div>
                            </div>
                            <a href="${basePath}courses.html">Courses</a>
                            <a href="${basePath}about.html">About</a>
                            <a href="${basePath}contact.html">Contact</a>
                        </div>
                        <div>
                            <a href="${basePath}contact.html" class="cta-button-primary">📞 Free Quote</a>
                        </div>
                        <button class="mobile-menu-btn" id="graphicyMobileMenuBtn">☰</button>
                    </nav>
                </div>
            </header>
            <div id="graphicyMobileMenu">
                <div class="mobile-menu-header">
                    <div class="mobile-menu-logo">Graphicy</div>
                    <button class="mobile-close-btn" id="graphicyMobileCloseBtn">✕</button>
                </div>
                <div class="mobile-nav-links">
                    <a href="${basePath}index.html">Home</a>
                    <a href="${basePath}services.html">Services</a>
                    <div class="mobile-dropdown">
                        <div class="mobile-dropdown-header">Portfolio</div>
                        <a href="${basePath}portfolio/video-editing.html">→ Video Editing</a>
                        <a href="${basePath}portfolio/graphic-design.html">→ Graphic Design</a>
                        <a href="${basePath}portfolio/motion-graphics.html">→ Motion Graphics</a>
                        <a href="${basePath}portfolio/animation.html">→ 2D/3D Animation</a>
                    </div>
                    <a href="${basePath}courses.html">Courses</a>
                    <a href="${basePath}about.html">About</a>
                    <a href="${basePath}contact.html">Contact</a>
                    <a href="${basePath}contact.html" class="cta-button-primary" style="display: block; text-align: center; margin: 1rem;">Free Quote</a>
                </div>
            </div>
            <div id="graphicyMobileMenuOverlay"></div>
        `;
    }
    
    // ========== MARKETING FOOTER (Graphicy) ==========
    function renderFooter() {
        const basePath = getBasePath();
        const year = new Date().getFullYear();
        return `
            <footer class="graphicy-footer">
                <div class="footer-container">
                    <div class="footer-grid">
                        <div class="footer-section">
                            <h4>Graphicy</h4>
                            <p>Premium video editing, graphic design, and digital marketing services for businesses across India. Led by Sanjay Meher with 7+ years of experience.</p>
                            <div class="social-links">
                                <a href="https://instagram.com/freelance.sanjay" target="_blank" title="Instagram" style="color:#a0a0c0;transition:color 0.2s;" onmouseover="this.style.color='#e1306c'" onmouseout="this.style.color='#a0a0c0'">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.1-4.8C2.4 3.9 4 2.3 7.2 2.3c1.3-.1 1.6-.1 4.8-.1zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1.0 8.3 0 8.7 0 12c0 3.3 0 3.7.1 4.9.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24c3.3 0 3.7 0 4.9-.1 4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9 0-3.3 0-3.7-.1-4.9C23.7 2.7 21.3.3 16.9.1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z"/></svg>
                                </a>
                                <a href="https://youtube.com/@Champ_gaming" target="_blank" title="YouTube" style="color:#a0a0c0;transition:color 0.2s;" onmouseover="this.style.color='#ff0000'" onmouseout="this.style.color='#a0a0c0'">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>
                                </a>
                                <a href="https://github.com/sanjaymeherdev" target="_blank" title="GitHub" style="color:#a0a0c0;transition:color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#a0a0c0'">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.7 18 5 18 5c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z"/></svg>
                                </a>
                            </div>
                        </div>
                        <div class="footer-section">
                            <h4>Services</h4>
                            <a href="${basePath}services.html#social">📱 Social Media Management</a>
                            <a href="${basePath}services.html#video">🎬 Video Editing / AI Videos</a>
                            <a href="${basePath}services.html#graphic">🎨 Graphic Design</a>
                            <a href="${basePath}services.html#web">🌐 Website Design</a>
                            <a href="${basePath}services.html#animation">🎮 2D/3D Animation</a>
                            <a href="${basePath}services.html#motion">✨ Motion Graphics</a>
                            <a href="${basePath}services.html#seo">📈 SEO</a>
                            <a href="${basePath}services.html#automation">⚙️ Marketing Automation</a>
                            <a href="${basePath}services.html#whatsapp">💬 WhatsApp Marketing</a>
                        </div>
                        <div class="footer-section">
                            <h4>Portfolio</h4>
                            <a href="${basePath}portfolio/video-editing.html">🎬 Video Editing</a>
                            <a href="${basePath}portfolio/graphic-design.html">🎨 Graphic Design</a>
                            <a href="${basePath}portfolio/motion-graphics.html">✨ Motion Graphics</a>
                            <a href="${basePath}portfolio/animation.html">🎮 2D/3D Animation</a>
                        </div>
                        <div class="footer-section">
                            <h4>Quick Links</h4>
                            <a href="${basePath}courses.html">📚 Video Editing Course</a>
                            <a href="${basePath}about.html">👤 About Sanjay</a>
                            <a href="${basePath}contact.html">📞 Contact Us</a>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>© ${year} Graphicy by Sanjay Meher. All rights reserved.</p>
                        <p class="footer-credits">Made in India 🇮🇳 | Serving businesses across India</p>
                    </div>
                </div>
            </footer>
        `;
    }
    
    function initHeader() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.graphicy-header .nav-links a').forEach(link => {
            const href = link.getAttribute('href')?.split('/').pop()?.split('?')[0];
            if (href === currentPage) link.classList.add('active');
        });
        
        const mobileMenuBtn = document.getElementById('graphicyMobileMenuBtn');
        const mobileCloseBtn = document.getElementById('graphicyMobileCloseBtn');
        const mobileMenu = document.getElementById('graphicyMobileMenu');
        const mobileMenuOverlay = document.getElementById('graphicyMobileMenuOverlay');
        
        if (mobileMenuBtn && mobileCloseBtn && mobileMenu && mobileMenuOverlay) {
            function openMobileMenu() {
                mobileMenu.classList.add('active');
                mobileMenuOverlay.classList.add('active');
                document.body.classList.add('graphicy-menu-open');
            }
            function closeMobileMenu() {
                mobileMenu.classList.remove('active');
                mobileMenuOverlay.classList.remove('active');
                document.body.classList.remove('graphicy-menu-open');
            }
            mobileMenuBtn.addEventListener('click', openMobileMenu);
            mobileCloseBtn.addEventListener('click', closeMobileMenu);
            mobileMenuOverlay.addEventListener('click', closeMobileMenu);
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeMobileMenu();
            });
        }
        
        // Desktop dropdown hover
        const dropdowns = document.querySelectorAll('.graphicy-header .dropdown');
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
    
    function init() {
        const headerContainer = document.getElementById('graphicy-header');
        const footerContainer = document.getElementById('graphicy-footer');
        
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
