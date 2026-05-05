// components.js - Shared Header & Footer for Graphicy Marketing Site
// Usage: Add <div id="graphicy-header"></div> and <div id="graphicy-footer"></div> to your HTML

(function() {
    // ========== HEADER STYLES ==========
    const headerStyles = `
    <style>
        .graphicy-header {
            background: rgba(10, 10, 20, 0.95);
            backdrop-filter: blur(10px);
            position: sticky;
            top: 0;
            z-index: 1000;
            border-bottom: 1px solid rgba(139, 92, 246, 0.2);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }
        .graphicy-header .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1.5rem;
        }
        .graphicy-header nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
            flex-wrap: wrap;
        }
        .graphicy-header .logo {
            font-size: 1.5rem;
            font-weight: bold;
        }
        .graphicy-header .logo a {
            color: white;
            text-decoration: none;
        }
        .graphicy-header .logo span {
            color: #8b5cf6;
        }
        .graphicy-header .logo .tagline {
            font-size: 0.7rem;
            opacity: 0.7;
            margin-left: 0.5rem;
            font-weight: normal;
        }
        .graphicy-header .nav-links {
            display: flex;
            gap: 1.5rem;
            align-items: center;
        }
        .graphicy-header .nav-links a {
            color: #a0a0c0;
            text-decoration: none;
            transition: color 0.2s;
            font-weight: 500;
        }
        .graphicy-header .nav-links a:hover,
        .graphicy-header .nav-links a.active {
            color: #8b5cf6;
        }
        .graphicy-header .dropdown {
            position: relative;
            display: inline-block;
        }
        .graphicy-header .dropbtn {
            cursor: pointer;
            background: none;
            border: none;
            color: #a0a0c0;
            font-weight: 500;
            font-size: 1rem;
            font-family: inherit;
            padding: 0.5rem 0;
        }
        .graphicy-header .dropbtn:hover {
            color: #8b5cf6;
        }
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
        .graphicy-header .dropdown-content a {
            color: white;
            padding: 0.75rem 1rem;
            text-decoration: none;
            display: block;
            font-size: 0.9rem;
            transition: background 0.2s;
        }
        .graphicy-header .dropdown-content a:hover {
            background: #2d2d44;
            color: #8b5cf6;
        }
        .graphicy-header .dropdown:hover .dropdown-content {
            display: block;
        }
        .graphicy-header .cta-button-primary {
            background: linear-gradient(135deg, #8b5cf6, #6d28d9);
            color: white;
            padding: 0.5rem 1.25rem;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            transition: transform 0.2s, box-shadow 0.2s;
            display: inline-block;
        }
        .graphicy-header .cta-button-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }
        .graphicy-header .mobile-menu-btn {
            display: none;
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
        }
        body.graphicy-menu-open {
            overflow: hidden;
        }
        @media (max-width: 768px) {
            .graphicy-header .nav-links {
                display: none;
            }
            .graphicy-header .mobile-menu-btn {
                display: block;
            }
            .graphicy-header .cta-button-primary {
                display: none;
            }
            .graphicy-header .logo .tagline {
                display: none;
            }
        }
    </style>
    <style>
        #graphicyMobileMenu {
            position: fixed;
            top: 0;
            right: -100%;
            width: 80%;
            max-width: 320px;
            height: 100%;
            background: #1a1a2e;
            z-index: 99999;
            transition: right 0.3s ease;
            box-shadow: -2px 0 10px rgba(0,0,0,0.3);
            overflow-y: auto;
        }
        #graphicyMobileMenu.active {
            right: 0;
        }
        #graphicyMobileMenu .mobile-menu-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        #graphicyMobileMenu .mobile-menu-logo {
            font-size: 1.25rem;
            font-weight: bold;
            color: white;
        }
        #graphicyMobileMenu .mobile-close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
        }
        #graphicyMobileMenu .mobile-nav-links {
            padding: 1rem;
        }
        #graphicyMobileMenu .mobile-nav-links a {
            display: block;
            padding: 0.75rem 1rem;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            transition: background 0.2s;
        }
        #graphicyMobileMenu .mobile-nav-links a:hover {
            background: #2d2d44;
        }
        #graphicyMobileMenu .mobile-dropdown-header {
            font-weight: bold;
            padding: 0.75rem 1rem;
            color: #8b5cf6;
            font-size: 0.9rem;
        }
        #graphicyMobileMenu .mobile-dropdown a {
            padding-left: 2rem !important;
            font-size: 0.9rem;
        }
        #graphicyMobileMenuOverlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 99998;
            display: none;
        }
        #graphicyMobileMenuOverlay.active {
            display: block;
        }
    </style>
    `;

    // ========== FOOTER STYLES ==========
    const footerStyles = `
    <style>
        .graphicy-footer {
            background: #0a0a14;
            margin-top: 4rem;
            border-top: 1px solid rgba(139, 92, 246, 0.2);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }
        .graphicy-footer .footer-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 3rem 1.5rem 1.5rem;
        }
        .graphicy-footer .footer-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        .graphicy-footer .footer-section h4 {
            color: #8b5cf6;
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }
        .graphicy-footer .footer-section p {
            color: #a0a0c0;
            line-height: 1.6;
            font-size: 0.9rem;
        }
        .graphicy-footer .footer-section a {
            display: block;
            color: #a0a0c0;
            text-decoration: none;
            margin-bottom: 0.5rem;
            transition: color 0.2s, transform 0.2s;
            font-size: 0.9rem;
        }
        .graphicy-footer .footer-section a:hover {
            color: #8b5cf6;
            transform: translateX(5px);
        }
        .graphicy-footer .social-links {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }
        .graphicy-footer .social-links a {
            display: inline-block;
            margin-bottom: 0;
        }
        .graphicy-footer .footer-bottom {
            text-align: center;
            padding-top: 2rem;
            margin-top: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            color: #a0a0c0;
            font-size: 0.85rem;
        }
        .graphicy-footer .footer-bottom a {
            color: #8b5cf6;
            text-decoration: none;
        }
        @media (max-width: 768px) {
            .graphicy-footer .footer-grid {
                grid-template-columns: 1fr;
                text-align: center;
            }
            .graphicy-footer .social-links {
                justify-content: center;
            }
            .graphicy-footer .footer-section a {
                text-align: center;
            }
        }
    </style>
    `;

    function getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/portfolio/')) {
            return '../';
        }
        return './';
    }

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
                    <div class="mobile-dropdown-header">Portfolio</div>
                    <div class="mobile-dropdown">
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
                                <a href="https://instagram.com/freelance.sanjay" target="_blank">📷 Instagram</a>
                                <a href="https://youtube.com/@Champ_gaming" target="_blank">▶️ YouTube</a>
                                <a href="https://github.com/sanjaymeherdev" target="_blank">🐙 GitHub</a>
                            </div>
                        </div>
                        <div class="footer-section">
                            <h4>Services</h4>
                            <a href="${basePath}services.html">📱 Social Media Management</a>
                            <a href="${basePath}services.html">🎬 Video Editing / AI Videos</a>
                            <a href="${basePath}services.html">🎨 Graphic Design</a>
                            <a href="${basePath}services.html">🌐 Website Design</a>
                            <a href="${basePath}services.html">📈 SEO</a>
                            <a href="${basePath}services.html">💬 WhatsApp Marketing</a>
                        </div>
                        <div class="footer-section">
                            <h4>Quick Links</h4>
                            <a href="${basePath}portfolio/video-editing.html">🎬 Portfolio</a>
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

    function initMobileMenu() {
        const menuBtn = document.getElementById('graphicyMobileMenuBtn');
        const closeBtn = document.getElementById('graphicyMobileCloseBtn');
        const menu = document.getElementById('graphicyMobileMenu');
        const overlay = document.getElementById('graphicyMobileMenuOverlay');

        if (menuBtn && closeBtn && menu && overlay) {
            function openMenu() {
                menu.classList.add('active');
                overlay.classList.add('active');
                document.body.classList.add('graphicy-menu-open');
            }
            function closeMenu() {
                menu.classList.remove('active');
                overlay.classList.remove('active');
                document.body.classList.remove('graphicy-menu-open');
            }
            menuBtn.addEventListener('click', openMenu);
            closeBtn.addEventListener('click', closeMenu);
            overlay.addEventListener('click', closeMenu);
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeMenu();
            });
        }
    }

    function initActiveNav() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.graphicy-header .nav-links a, #graphicyMobileMenu .mobile-nav-links a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href === currentPage || (currentPage === 'index.html' && href === 'index.html'))) {
                link.classList.add('active');
                if (link.style) link.style.color = '#8b5cf6';
            }
        });
    }

    function init() {
        const headerContainer = document.getElementById('graphicy-header');
        const footerContainer = document.getElementById('graphicy-footer');

        if (headerContainer) {
            document.head.insertAdjacentHTML('beforeend', headerStyles);
            headerContainer.innerHTML = renderHeader();
            initMobileMenu();
            initActiveNav();
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
