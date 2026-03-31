// Header Component
const HeaderComponent = {
    render: function() {
        const basePath = this.getBasePath();
        
        return `
            <header>
                <div class="container">
                    <nav>
                        <div class="logo">SanjayMeherDev</div>
                        
                        <!-- Desktop Navigation -->
                        <div class="nav-links">
                            <a href="${basePath}index.html" class="nav-home">Home</a>
                            <a href="${basePath}cgstore.html" class="nav-store">Store</a>
                            <a href="${basePath}freegodotassets.html" class="nav-free">Free</a>
                            <a href="${basePath}services.html" class="nav-services">Services</a>
                            <a href="${basePath}blog.html" class="nav-blog">Blog</a>
                            <a href="${basePath}contact.html" class="nav-contact">Contact</a>
                        </div>
                        
                        <!-- Currency Toggle & CTA -->
                        <div style="display: flex; align-items: center;">
                            <a href="${basePath}cgstore.html" class="cta-button" style="margin-left: 1rem;">Store</a>
                        </div>
                        
                        <!-- Mobile Menu Button -->
                        <button class="mobile-menu-btn" id="mobileMenuBtn">☰</button>
                    </nav>
                </div>
                
                <!-- Mobile Menu -->
                <div class="mobile-menu" id="mobileMenu">
                    <div class="mobile-menu-header">
                        <div class="mobile-menu-logo">SanjayAIDev</div>
                        <button class="mobile-close-btn" id="mobileCloseBtn">✕</button>
                    </div>
                    
                    <div class="mobile-nav-links">
                        <a href="${basePath}index.html">Home</a>
                        <a href="${basePath}cgstore.html">Store</a>
                        <a href="${basePath}freegodotassets.html">Free Assets</a>
                        <a href="${basePath}services.html">Services</a>
                        <a href="${basePath}blog.html">Blog</a>
                        <a href="${basePath}contact.html">Contact</a>
                        <a href="${basePath}cgstore.html" class="cta-button">Browse Store</a>
                    </div>
                </div>
                
                <!-- Mobile Menu Overlay -->
                <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>
            </header>
        `;
    },

    getBasePath: function() {
        const path = window.location.pathname;
        // Check if we're in a subdirectory
        if (path.includes('/legal/') || path.includes('/blog/') || path.includes('/pages/')) {
            return '../';
        }
        return './';
    },

    init: function() {
        // Set active page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(link => {
            const href = link.getAttribute('href').split('/').pop();
            if (href === currentPage) {
                link.classList.add('active');
            }
        });

        // Mobile menu logic
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileCloseBtn = document.getElementById('mobileCloseBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

        if (mobileMenuBtn && mobileCloseBtn && mobileMenu && mobileMenuOverlay) {
            function openMobileMenu() {
                mobileMenu.classList.add('active');
                mobileMenuOverlay.classList.add('active');
                document.body.classList.add('menu-open');
            }

            function closeMobileMenu() {
                mobileMenu.classList.remove('active');
                mobileMenuOverlay.classList.remove('active');
                document.body.classList.remove('menu-open');
            }

            mobileMenuBtn.addEventListener('click', openMobileMenu);
            mobileCloseBtn.addEventListener('click', closeMobileMenu);
            mobileMenuOverlay.addEventListener('click', closeMobileMenu);

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeMobileMenu();
            });
        }
    }
};
