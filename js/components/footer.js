// Footer Component
const FooterComponent = {
    render: function() {
        const basePath = this.getBasePath();
        
        return `
            <footer>
                <div class="container">
                    <div class="logo" style="margin-bottom: 1rem;">SanjayAIDev</div>
                    <p style="color: #ccc;">40+ Production-Ready Godot Systems • AI Tools • Game Frameworks</p>
                    <p style="color: #ccc; margin-bottom: 2rem;">Built in India, for the world 🌏</p>
                    
                    <div class="footer-links-compact" style="display: flex; flex-wrap: wrap; gap: 2rem; justify-content: center; margin: 2rem 0;">
                        <div class="footer-category" style="text-align: left;">
                            <h4 style="color: var(--primary); margin-bottom: 1rem;">Products</h4>
                            <a href="${basePath}cgstore.html" style="color: #ccc; text-decoration: none; display: block; margin: 0.5rem 0;">Store</a>
                            <a href="${basePath}freegodotassets.html" style="color: #ccc; text-decoration: none; display: block; margin: 0.5rem 0;">Free Assets</a>
                            <a href="${basePath}minicourses.html" style="color: #ccc; text-decoration: none; display: block; margin: 0.5rem 0;">Mini-Courses</a>
                        </div>
                        <div class="footer-category" style="text-align: left;">
                            <h4 style="color: var(--primary); margin-bottom: 1rem;">Services</h4>
                            <a href="${basePath}services.html" style="color: #ccc; text-decoration: none; display: block; margin: 0.5rem 0;">Custom Dev</a>
                            <a href="${basePath}contact.html" style="color: #ccc; text-decoration: none; display: block; margin: 0.5rem 0;">Contact</a>
                            <a href="${basePath}blog.html" style="color: #ccc; text-decoration: none; display: block; margin: 0.5rem 0;">Blog</a>
                        </div>
                        <div class="footer-category" style="text-align: left;">
                            <h4 style="color: var(--primary); margin-bottom: 1rem;">Legal</h4>
                            <a href="${basePath}legal/privacy-policy.html" style="color: #ccc; text-decoration: none; display: block; margin: 0.5rem 0;">Privacy</a>
                            <a href="${basePath}legal/terms-of-service.html" style="color: #ccc; text-decoration: none; display: block; margin: 0.5rem 0;">Terms</a>
                            <a href="${basePath}legal/refund.html" style="color: #ccc; text-decoration: none; display: block; margin: 0.5rem 0;">Refunds</a>
                        </div>
                    </div>
                    
                    <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 2rem; margin-top: 2rem;">
                        <p>© 2026 SanjayAIDev. All rights reserved.</p>
                        <div style="margin-top: 1rem; display: flex; gap: 1rem; justify-content: center;">
                            <span class="currency-option active" data-currency="inr">₹ INR</span>
                            <span class="currency-option" data-currency="usd">$ USD</span>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    },

    getBasePath: function() {
        const path = window.location.pathname;
        if (path.includes('/legal/') || path.includes('/blog/') || path.includes('/pages/')) {
            return '../';
        }
        return './';
    }
};
