// ============================================
// STORE CONFIGURATION
// ============================================
const CONFIG = {
    PRODUCTS_JSON_PATH: 'data/products.json',
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwQayBpHK2M3rndlxTQeyPbzUNpzUKSV6-Sani2wUI20sbr5Nh2tYYLJX9zcmH_HXA4ug/exec',
    COUPON_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycby89oeq6ANrY9EY_Bhv6mN6fXIqrDMYMlMTwt4VBzN3teixSf_D4nBhI8OA-oKvXHISgw/exec'
};

// ============================================
// GLOBAL VARIABLES
// ============================================
let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';
let currentSubcategory = 'all';
let currentSearch = '';
let currentCurrency = 'inr'; // Default to INR
let appliedCoupon = null;
let discountedAmount = null;
let selectedProduct = null;

// Currency conversion rates (you can adjust these)
const CURRENCY_RATES = {
    inr: 1,
    usd: 0.012 // 1 INR = 0.012 USD (approx)
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    initializeMobileMenu();
    loadProducts();
    setupCategoryButtons();
    setupSubcategoryButtons();
    setupSearch();
    setupCurrencyToggle();
    loadSavedCurrency();
});

// ============================================
// PRODUCT LOADING & DISPLAY
// ============================================
function loadProducts() {
    showLoading();
 
    try {
        const schemaEl = document.getElementById('products-schema');
        if (!schemaEl) throw new Error('products-schema script tag not found');
 
        allProducts = JSON.parse(schemaEl.textContent);
        filteredProducts = [...allProducts];
        displayProducts(filteredProducts);
        hideLoading();
        updateActiveFiltersDisplay();
 
    } catch (error) {
        console.error('Error reading products schema:', error);
        showError();
    }
}
// ============================================
// DISPLAY PRODUCTS
// ============================================
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    const noProductsState = document.getElementById('noProductsState');

    if (products.length === 0) {
        grid.style.display = 'none';
        noProductsState.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    noProductsState.style.display = 'none';

    grid.innerHTML = products.map(product => {
        const shortDesc = product.short_description || '';
        const fullDesc = product.description.replace(/\n/g, '<br>');
        const hasMore = product.description.trim().length > 0;
        
        // Get price based on current currency
        const price = currentCurrency === 'inr' ? product.price_inr : product.price_usd;
        const currencySymbol = currentCurrency === 'inr' ? '₹' : '$';

        return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='🎮'">
                ${product.featured ? '<span class="featured-badge">Featured</span>' : ''}
            </div>
            <div class="product-content">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>

                <div class="description-wrapper">
                    <p class="product-description short-desc" id="short-${product.id}">${shortDesc}</p>
                    <div class="product-description full-desc" id="full-${product.id}" style="display:none;">${fullDesc}</div>
                    ${hasMore ? `<button class="read-more-btn" id="btn-${product.id}" onclick="toggleReadMore(${product.id})">Read More ▾</button>` : ''}
                </div>

                ${product.youtubeUrl ? `
                    <a href="${product.youtubeUrl}"
                       target="_blank"
                       rel="noopener noreferrer"
                       class="youtube-link"
                       onclick="event.stopPropagation()">
                        🎥 Watch Demo Video
                    </a>
                ` : ''}

                <div class="product-footer">
                    <div class="product-price">
                        <span class="product-price-currency">${currencySymbol}</span>${price}
                    </div>
                    <button class="buy-button" onclick="openEmailModal(${product.id})">
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// ============================================
// READ MORE TOGGLE
// ============================================
function toggleReadMore(productId) {
    const shortEl = document.getElementById(`short-${productId}`);
    const fullEl = document.getElementById(`full-${productId}`);
    const btn = document.getElementById(`btn-${productId}`);

    const isExpanded = fullEl.style.display === 'block';

    if (isExpanded) {
        fullEl.style.display = 'none';
        shortEl.style.display = 'block';
        btn.textContent = 'Read More ▾';
    } else {
        shortEl.style.display = 'none';
        fullEl.style.display = 'block';
        btn.textContent = 'Read Less ▴';
    }
}

// ============================================
// CATEGORY FILTERING (First Tier)
// ============================================
function setupCategoryButtons() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Update active state
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update current category
            currentCategory = this.dataset.category;
            
            // Reset subcategory to 'all'
            currentSubcategory = 'all';
            updateSubcategoryButtons();
            
            // Apply filters
            filterProducts();
            updateActiveFiltersDisplay();
        });
    });
}

// ============================================
// SUBCATEGORY FILTERING (Second Tier)
// ============================================
function setupSubcategoryButtons() {
    const subcategoryButtons = document.querySelectorAll('.subcategory-btn');
    subcategoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Update active state
            subcategoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update current subcategory
            currentSubcategory = this.dataset.subcategory;
            
            // Apply filters
            filterProducts();
            updateActiveFiltersDisplay();
        });
    });
}

function updateSubcategoryButtons() {
    const subcategoryButtons = document.querySelectorAll('.subcategory-btn');
    
    // Reset all to default
    subcategoryButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.subcategory === 'all') {
            btn.classList.add('active');
        }
    });
}

// ============================================
// MAIN FILTER FUNCTION
// ============================================
function filterProducts() {
    let filtered = [...allProducts];
    
    // Apply category filter
    if (currentCategory !== 'all') {
        // Map UI categories to actual product categories
        const categoryMap = {
            'course': ['Course', 'Mini-Courses'],
            'script': ['Scripts'],
            'system': ['Systems'],
            'game': ['Game', 'Games'],
            'ai-tool': ['Tools', 'AI'],
            'app': ['Plugins', 'Apps']
        };
        
        const mappedCategories = categoryMap[currentCategory] || [currentCategory];
        filtered = filtered.filter(p => mappedCategories.includes(p.category));
    }
    
    // Apply subcategory filter
    if (currentSubcategory !== 'all') {
        switch(currentSubcategory) {
            case 'featured':
                filtered = filtered.filter(p => p.featured);
                break;
            case 'ui':
                filtered = filtered.filter(p => 
                    p.name.toLowerCase().includes('ui') || 
                    p.name.toLowerCase().includes('interface') ||
                    p.name.toLowerCase().includes('menu')
                );
                break;
            case 'multiplayer':
                filtered = filtered.filter(p => 
                    p.name.toLowerCase().includes('multiplayer') || 
                    p.name.toLowerCase().includes('auth') ||
                    p.name.toLowerCase().includes('server')
                );
                break;
            case 'ai':
                filtered = filtered.filter(p => 
                    p.category === 'Tools' || 
                    p.name.toLowerCase().includes('ai') ||
                    p.name.toLowerCase().includes('npc')
                );
                break;
            case 'mobile':
                filtered = filtered.filter(p => 
                    p.name.toLowerCase().includes('touch') || 
                    p.name.toLowerCase().includes('mobile') ||
                    p.name.toLowerCase().includes('android')
                );
                break;
            case 'backend':
                filtered = filtered.filter(p => 
                    p.name.toLowerCase().includes('supabase') || 
                    p.name.toLowerCase().includes('auth') ||
                    p.name.toLowerCase().includes('server')
                );
                break;
            case 'template':
                filtered = filtered.filter(p => 
                    p.name.toLowerCase().includes('kit') || 
                    p.name.toLowerCase().includes('template') ||
                    p.name.toLowerCase().includes('system')
                );
                break;
        }
    }
    
    // Apply search filter
    if (currentSearch) {
        const search = currentSearch.toLowerCase();
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(search) ||
            p.description.toLowerCase().includes(search)
        );
    }
    
    filteredProducts = filtered;
    displayProducts(filteredProducts);
}

// ============================================
// SEARCH
// ============================================
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentSearch = this.value.trim();
            filterProducts();
            updateActiveFiltersDisplay();
        });
    }
}

// ============================================
// CURRENCY TOGGLE
// ============================================
function setupCurrencyToggle() {
    const currencyOptions = document.querySelectorAll('.currency-option');
    currencyOptions.forEach(opt => {
        opt.addEventListener('click', function() {
            const currency = this.dataset.currency;
            setCurrency(currency);
        });
    });
}

function setCurrency(currency) {
    currentCurrency = currency;
    
    // Update toggle UI
    document.querySelectorAll('.currency-option').forEach(opt => {
        if (opt.dataset.currency === currency) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
    
    // Save preference
    localStorage.setItem('preferredCurrency', currency);
    
    // Refresh displayed products with new currency
    displayProducts(filteredProducts.length ? filteredProducts : allProducts);
}

function loadSavedCurrency() {
    const saved = localStorage.getItem('preferredCurrency');
    if (saved && (saved === 'inr' || saved === 'usd')) {
        setCurrency(saved);
    }
}

// ============================================
// ACTIVE FILTERS DISPLAY
// ============================================
function updateActiveFiltersDisplay() {
    const categoryBadge = document.getElementById('activeCategoryBadge');
    const subcategoryBadge = document.getElementById('activeSubcategoryBadge');
    
    // Update category badge
    const categoryName = document.querySelector(`.category-btn[data-category="${currentCategory}"]`)?.textContent || 'All';
    categoryBadge.innerHTML = `Category: ${categoryName} <button class="clear-filter" onclick="clearCategoryFilter()">✕</button>`;
    
    // Update subcategory badge
    const subcategoryName = document.querySelector(`.subcategory-btn[data-subcategory="${currentSubcategory}"]`)?.textContent || 'All';
    subcategoryBadge.innerHTML = `Subcategory: ${subcategoryName} <button class="clear-filter" onclick="clearSubcategoryFilter()">✕</button>`;
}

function clearCategoryFilter() {
    document.querySelector('.category-btn[data-category="all"]').click();
}

function clearSubcategoryFilter() {
    document.querySelector('.subcategory-btn[data-subcategory="all"]').click();
}

// ============================================
// MODAL FUNCTIONS
// ============================================
function openEmailModal(productId) {
    selectedProduct = allProducts.find(p => p.id === productId);
    if (!selectedProduct) return;

    appliedCoupon = null;
    discountedAmount = null;

    const price = currentCurrency === 'inr' ? selectedProduct.price_inr : selectedProduct.price_usd;
    const currencySymbol = currentCurrency === 'inr' ? '₹' : '$';

    document.getElementById('modalProductName').textContent = selectedProduct.name;
    document.getElementById('modalProductPrice').textContent = `${currencySymbol}${price}`;
    document.getElementById('modalProductPrice').classList.remove('price-strikethrough');
    document.getElementById('discountedPrice').style.display = 'none';
    document.getElementById('discountedPrice').textContent = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerEmail').disabled = false;
    document.getElementById('couponCode').value = '';
    document.getElementById('couponCode').disabled = false;
    document.getElementById('applyCouponBtn').disabled = false;
    document.getElementById('applyCouponBtn').textContent = 'Apply';
    document.getElementById('couponStatus').className = 'coupon-status';
    document.getElementById('couponStatus').textContent = '';

    document.getElementById('emailModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeEmailModal() {
    document.getElementById('emailModal').classList.remove('active');
    document.body.style.overflow = 'auto';

    document.getElementById('customerEmail').value = '';
    document.getElementById('customerEmail').disabled = false;
    document.getElementById('couponCode').value = '';
    document.getElementById('couponCode').disabled = false;
    document.getElementById('applyCouponBtn').disabled = false;
    document.getElementById('applyCouponBtn').textContent = 'Apply';
    document.getElementById('couponStatus').className = 'coupon-status';
    document.getElementById('couponStatus').textContent = '';
    document.getElementById('modalProductPrice').classList.remove('price-strikethrough');
    document.getElementById('discountedPrice').style.display = 'none';

    appliedCoupon = null;
    discountedAmount = null;
    selectedProduct = null;

    const continueButton = document.querySelector('.modal-button-primary');
    if (continueButton) {
        continueButton.disabled = false;
        continueButton.textContent = 'Continue to Payment';
    }
}

// ============================================
// COUPON VALIDATION
// ============================================
async function applyCoupon() {
    const couponInput = document.getElementById('couponCode');
    const emailInput = document.getElementById('customerEmail');
    const couponCode = couponInput.value.trim().toUpperCase();
    const email = emailInput.value.trim().toLowerCase();
    const statusDiv = document.getElementById('couponStatus');
    const applyBtn = document.getElementById('applyCouponBtn');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        statusDiv.className = 'coupon-status invalid';
        statusDiv.textContent = '⚠️ Please enter your email address first';
        emailInput.focus();
        return;
    }

    if (!couponCode) {
        statusDiv.className = 'coupon-status invalid';
        statusDiv.textContent = '⚠️ Please enter a coupon code';
        return;
    }

    applyBtn.disabled = true;
    applyBtn.textContent = 'Checking...';
    statusDiv.className = 'coupon-status loading';
    statusDiv.textContent = '🔄 Validating coupon...';

    try {
        const response = await fetch(CONFIG.COUPON_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'validateCoupon',
                couponCode: couponCode,
                productId: selectedProduct.id,
                amount: currentCurrency === 'inr' ? selectedProduct.price_inr : selectedProduct.price_usd,
                email: email
            })
        });

        const result = await response.json();

        if (result.success) {
            appliedCoupon = couponCode;
            discountedAmount = result.discountedAmount;

            statusDiv.className = 'coupon-status valid';
            statusDiv.textContent = `✅ ${result.message}`;

            const originalPrice = document.getElementById('modalProductPrice');
            const discountedPrice = document.getElementById('discountedPrice');

            originalPrice.classList.add('price-strikethrough');
            discountedPrice.style.display = 'inline';
            discountedPrice.textContent = `${currentCurrency === 'inr' ? '₹' : '$'}${result.discountedAmount}`;

            couponInput.disabled = true;
            emailInput.disabled = true;
            applyBtn.disabled = true;
            applyBtn.textContent = 'Applied ✓';

        } else {
            appliedCoupon = null;
            discountedAmount = null;

            if (result.expired) {
                statusDiv.className = 'coupon-status expired';
                statusDiv.textContent = `⏰ ${result.message}`;
            } else if (result.alreadyUsed) {
                statusDiv.className = 'coupon-status invalid';
                statusDiv.textContent = `🚫 ${result.message}`;
            } else {
                statusDiv.className = 'coupon-status invalid';
                statusDiv.textContent = `❌ ${result.message}`;
            }

            applyBtn.disabled = false;
            applyBtn.textContent = 'Apply';
        }

    } catch (error) {
        console.error('Coupon validation error:', error);
        statusDiv.className = 'coupon-status invalid';
        statusDiv.textContent = '❌ Error validating coupon. Please try again.';
        applyBtn.disabled = false;
        applyBtn.textContent = 'Apply';
    }
}

// ============================================
// PAYMENT PROCESSING
// ============================================
async function proceedToPayment() {
    const emailInput = document.getElementById('customerEmail');
    const email = emailInput.value.trim().toLowerCase();
    const continueButton = document.querySelector('.modal-button-primary');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    continueButton.disabled = true;
    continueButton.textContent = 'Contacting Server...';

    try {
        const checkResponse = await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'checkPurchase',
                email: email,
                productId: selectedProduct.id
            })
        });

        const checkData = await checkResponse.json();

        if (!checkData.success) throw new Error(checkData.message || 'Failed to check purchase status');

        if (checkData.purchased) {
            alert('You already own this product! We have re-sent the download link to your email.');
            closeEmailModal();
            return;
        }

        const baseAmount = currentCurrency === 'inr' ? selectedProduct.price_inr : selectedProduct.price_usd;
        const finalAmount = discountedAmount || baseAmount;

        continueButton.textContent = 'Creating Payment Link...';
        const paymentLinkResponse = await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'createPaymentLink',
                productId: selectedProduct.id,
                amount: finalAmount,
                currency: currentCurrency.toUpperCase(),
                email: email,
                couponCode: appliedCoupon || ''
            })
        });

        const paymentLinkData = await paymentLinkResponse.json();

        if (!paymentLinkData.success) throw new Error(paymentLinkData.message || 'Failed to create payment link');

        showPaymentPage(paymentLinkData, email, selectedProduct, finalAmount, appliedCoupon);

    } catch (error) {
        console.error('Process Error:', error);
        alert('Error: ' + error.message);
        continueButton.disabled = false;
        continueButton.textContent = 'Continue to Payment';
    }
}

function showPaymentPage(paymentLinkData, email, product, finalAmount, couponCode) {
    if (!paymentLinkData.paymentLinkUrl || !product) {
        alert('Error: Could not generate payment link');
        const continueButton = document.querySelector('.modal-button-primary');
        if (continueButton) {
            continueButton.disabled = false;
            continueButton.textContent = 'Continue to Payment';
        }
        return;
    }

    closeEmailModal();

    const currencySymbol = currentCurrency === 'inr' ? '₹' : '$';
    const originalAmount = currentCurrency === 'inr' ? product.price_inr : product.price_usd;

    document.body.innerHTML = `
        <div style="max-width:600px;margin:50px auto;padding:20px;text-align:center;">
            <h2 style="color:#ff6b35;">Payment Link Ready</h2>
            <div style="background:#f5f5f5;padding:20px;border-radius:10px;margin:20px 0;">
                <p><strong>Product:</strong> ${product.name}</p>
                <p><strong>Amount:</strong>
                    ${couponCode
                        ? `<span style="text-decoration:line-through;color:#999;">${currencySymbol}${originalAmount}</span>
                           <span style="color:#10b981;font-size:1.2em;">${currencySymbol}${finalAmount}</span>`
                        : `${currencySymbol}${finalAmount}`}
                </p>
                ${couponCode ? `<p style="color:#10b981;"><strong>✅ Coupon Applied:</strong> ${couponCode}</p>` : ''}
                <p><strong>Email:</strong> ${email}</p>
            </div>
            <p>Click the button below to complete payment:</p>
            <a href="${paymentLinkData.paymentLinkUrl}" target="_blank"
               style="display:inline-block;background:#ff6b35;color:white;padding:15px 30px;
                      border-radius:5px;text-decoration:none;font-size:16px;font-weight:bold;margin:20px 0;">
                Open Payment Page
            </a>
            <div style="margin-top:30px;text-align:left;">
                <p><strong>Alternative:</strong> Copy this link manually:</p>
                <input type="text" value="${paymentLinkData.paymentLinkUrl}" readonly
                       style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;"
                       onclick="this.select()">
                <p style="font-size:14px;color:#666;margin-top:10px;">
                    After payment, download link will be sent to ${email}
                </p>
            </div>
            <button onclick="location.reload()"
                    style="background:#666;color:white;border:none;padding:10px 20px;
                           border-radius:5px;margin-top:20px;cursor:pointer;">
                Back to Store
            </button>
        </div>
    `;
}

// ============================================
// UI HELPERS
// ============================================
function showLoading() {
    document.getElementById('loadingState').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadingState').style.display = 'none';
}

function showError() {
    document.getElementById('loadingState').innerHTML = '<h3>Error Loading Products</h3>';
}

function initializeMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');
    const close = document.getElementById('mobileCloseBtn');
    const overlay = document.getElementById('mobileMenuOverlay');
    
    if (btn) btn.onclick = () => {
        menu.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('menu-open');
    };
    
    if (close) close.onclick = () => {
        menu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('menu-open');
    };
    
    if (overlay) overlay.onclick = () => {
        menu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('menu-open');
    };
}

// ============================================
// EVENT LISTENERS
// ============================================
document.addEventListener('click', function (event) {
    const modal = document.getElementById('emailModal');
    if (event.target === modal) closeEmailModal();
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeEmailModal();
});
