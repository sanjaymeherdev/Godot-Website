// ============================================
// STORE CONFIGURATION
// ============================================
const CONFIG = {
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwQayBpHK2M3rndlxTQeyPbzUNpzUKSV6-Sani2wUI20sbr5Nh2tYYLJX9zcmH_HXA4ug/exec',
    COUPON_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycby89oeq6ANrY9EY_Bhv6mN6fXIqrDMYMlMTwt4VBzN3teixSf_D4nBhI8OA-oKvXHISgw/exec',
    PAYPAL_EDGE_URL: 'https://lgfzoprhyjrmosvigwlb.supabase.co/functions/v1/cgstore-paypal' // <-- replace with your Supabase URL
};

// ============================================
// GLOBAL VARIABLES
// ============================================
let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';
let currentSubcategory = 'all';
let currentSearch = '';
let currentCurrency = 'inr';
let appliedCoupon = null;
let discountedAmount = null;
let selectedProduct = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    initializeMobileMenu();
    loadSavedCurrency();
    loadProducts();
    setupCategoryButtons();
    setupSubcategoryButtons();
    setupSearch();
    setupCurrencySwitch();
    handlePayPalReturn();
});

// ============================================
// PAYPAL RETURN HANDLER
// polls status after user returns from PayPal approval page
// ============================================
function handlePayPalReturn() {
    const params = new URLSearchParams(window.location.search);
    const ppOrderId = params.get('pp_order');
    const cancelled = params.get('pp_cancelled');

    if (cancelled) {
        showStatusBanner('⚠️ Payment cancelled. You can try again anytime.', '#f59e0b');
        window.history.replaceState({}, '', window.location.pathname);
        return;
    }

    if (ppOrderId && ppOrderId !== 'PAYPAL_ORDER_ID') {
        pollPayPalUntilComplete(ppOrderId);
    }
}

async function pollPayPalUntilComplete(orderId) {
    const banner = showStatusBanner('⏳ Confirming your payment...', '#ff6b35', true);
    let attempts = 0;

    const interval = setInterval(async () => {
        attempts++;
        try {
            const res = await fetch(CONFIG.PAYPAL_EDGE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'pollStatus', paypal_order_id: orderId })
            });
            const data = await res.json();

            if (data.status === 'completed') {
                clearInterval(interval);
                banner.style.background = '#10b981';
                banner.textContent = '✅ Payment confirmed! Download link sent to your email.';
                window.history.replaceState({}, '', window.location.pathname);
                setTimeout(() => banner.remove(), 6000);
                return;
            }

            if (data.status === 'failed') {
                clearInterval(interval);
                banner.style.background = '#ef4444';
                banner.textContent = '❌ Payment failed. Please try again.';
                window.history.replaceState({}, '', window.location.pathname);
                return;
            }

        } catch (e) {
            console.error('Poll error:', e);
        }

        if (attempts >= 15) {
            clearInterval(interval);
            banner.style.background = '#f59e0b';
            banner.textContent = '⚠️ Still processing — check your email in a few minutes.';
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, 2000);
}

function showStatusBanner(message, color, persist = false) {
    const existing = document.getElementById('status-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'status-banner';
    banner.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0;
        background: ${color}; color: white;
        text-align: center; padding: 14px;
        z-index: 9999; font-weight: bold; font-size: 15px;
        transition: background 0.4s ease;
    `;
    banner.textContent = message;
    document.body.prepend(banner);

    if (!persist) setTimeout(() => banner.remove(), 4000);
    return banner;
}

// ============================================
// PRODUCT LOADING
// ============================================
function loadProducts() {
    showLoading();
    try {
        const schemaEl = document.getElementById('products-schema');
        if (!schemaEl) throw new Error('products-schema not found');

        allProducts = JSON.parse(schemaEl.textContent);
        filteredProducts = [...allProducts];
        displayProducts(filteredProducts);
        hideLoading();
        updateResultsCount();
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

    updateResultsCount(products.length);

    if (products.length === 0) {
        grid.style.display = 'none';
        noProductsState.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    noProductsState.style.display = 'none';

    const price = (p) => currentCurrency === 'inr' ? p.price_inr : p.price_usd;
    const symbol = currentCurrency === 'inr' ? '₹' : '$';

    grid.innerHTML = products.map(product => {
        const shortDesc = product.short_description || '';
        const fullDesc = product.description.replace(/\n/g, '<br>');
        const hasMore = product.description.trim().length > 0;

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
                ${product.youtubeUrl && !product.youtubeUrl.includes('your-demo') ? `
                    <a href="${product.youtubeUrl}" target="_blank" rel="noopener noreferrer"
                       class="youtube-link" onclick="event.stopPropagation()">
                        🎥 Watch Demo Video
                    </a>
                ` : ''}
                <div class="product-footer">
                    <div class="product-price">
                        <span class="product-price-currency">${symbol}</span>${price(product)}
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

function updateResultsCount(count) {
    const el = document.getElementById('resultsCount');
    if (el) {
        const n = count !== undefined ? count : filteredProducts.length;
        el.textContent = `${n} product${n !== 1 ? 's' : ''}`;
    }
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
// CATEGORY FILTERING
// only categories actually used in product data
// ============================================
function setupCategoryButtons() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            currentSubcategory = 'all';
            updateSubcategoryButtons();
            filterProducts();
            updateResultsCount();
        });
    });
}

// ============================================
// SUBCATEGORY FILTERING
// ============================================
function setupSubcategoryButtons() {
    const subcategoryButtons = document.querySelectorAll('.subcategory-btn');
    subcategoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            subcategoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentSubcategory = this.dataset.subcategory;
            filterProducts();
            updateResultsCount();
        });
    });
}

function updateSubcategoryButtons() {
    document.querySelectorAll('.subcategory-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.subcategory === 'all') btn.classList.add('active');
    });
}

// ============================================
// MAIN FILTER FUNCTION
// ============================================
function filterProducts() {
    let filtered = [...allProducts];

    if (currentCategory !== 'all') {
        const categoryMap = {
            'script':  ['Scripts'],
            'system':  ['Systems'],
            'asset':   ['Assets'],
            'plugin':  ['Plugins'],
            'tool':    ['Tools']
        };
        const mapped = categoryMap[currentCategory] || [currentCategory];
        filtered = filtered.filter(p => mapped.includes(p.category));
    }

    if (currentSubcategory !== 'all') {
        switch (currentSubcategory) {
            case 'featured':
                filtered = filtered.filter(p => p.featured);
                break;
            case 'ui':
                filtered = filtered.filter(p =>
                    p.name.toLowerCase().includes('ui') ||
                    p.name.toLowerCase().includes('interface') ||
                    p.name.toLowerCase().includes('menu'));
                break;
            case 'multiplayer':
                filtered = filtered.filter(p =>
                    p.name.toLowerCase().includes('multiplayer') ||
                    p.name.toLowerCase().includes('auth') ||
                    p.name.toLowerCase().includes('server'));
                break;
            case 'ai':
                filtered = filtered.filter(p =>
                    p.category === 'Tools' ||
                    p.name.toLowerCase().includes('ai') ||
                    p.name.toLowerCase().includes('npc'));
                break;
            case 'mobile':
                filtered = filtered.filter(p =>
                    p.name.toLowerCase().includes('touch') ||
                    p.name.toLowerCase().includes('mobile') ||
                    p.name.toLowerCase().includes('android'));
                break;
            case 'backend':
                filtered = filtered.filter(p =>
                    p.name.toLowerCase().includes('supabase') ||
                    p.name.toLowerCase().includes('auth') ||
                    p.name.toLowerCase().includes('server'));
                break;
            case 'template':
                filtered = filtered.filter(p =>
                    p.name.toLowerCase().includes('kit') ||
                    p.name.toLowerCase().includes('template') ||
                    p.name.toLowerCase().includes('system'));
                break;
        }
    }

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
        });
    }
}

// ============================================
// CURRENCY SWITCH
// INR = Razorpay | USD = PayPal
// ============================================
function setupCurrencySwitch() {
    const toggle = document.getElementById('currencyToggle');
    if (toggle) {
        toggle.addEventListener('change', function () {
            setCurrency(this.checked ? 'usd' : 'inr');
        });
    }
}

function setCurrency(currency) {
    currentCurrency = currency;

    const toggle = document.getElementById('currencyToggle');
    const inrLabel = document.getElementById('currencyLabelINR');
    const usdLabel = document.getElementById('currencyLabelUSD');
    const methodNote = document.getElementById('paymentMethodNote');

    if (toggle) toggle.checked = currency === 'usd';
    if (inrLabel) inrLabel.classList.toggle('currency-label-active', currency === 'inr');
    if (usdLabel) usdLabel.classList.toggle('currency-label-active', currency === 'usd');
    if (methodNote) {
        methodNote.textContent = currency === 'inr' ? '💳 Razorpay' : '🌐 PayPal';
        methodNote.style.color = currency === 'inr' ? '#ff6b35' : '#0070ba';
    }

    localStorage.setItem('preferredCurrency', currency);
    displayProducts(filteredProducts.length ? filteredProducts : allProducts);
}

function loadSavedCurrency() {
    const saved = localStorage.getItem('preferredCurrency');
    if (saved === 'inr' || saved === 'usd') {
        currentCurrency = saved;
    }
    // UI sync happens after DOM is ready via setupCurrencySwitch + setCurrency call
    setCurrency(currentCurrency);
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
    const symbol = currentCurrency === 'inr' ? '₹' : '$';
    const method = currentCurrency === 'inr' ? '💳 Pay with Razorpay (INR)' : '🌐 Pay with PayPal (USD)';

    document.getElementById('modalProductName').textContent = selectedProduct.name;
    document.getElementById('modalProductPrice').textContent = `${symbol}${price}`;
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

    // Show which payment method will be used
    const methodEl = document.getElementById('modalPaymentMethod');
    if (methodEl) methodEl.textContent = method;

    const continueButton = document.querySelector('.modal-button-primary');
    if (continueButton) {
        continueButton.disabled = false;
        continueButton.textContent = 'Continue to Payment';
    }

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
                couponCode,
                productId: selectedProduct.id,
                amount: currentCurrency === 'inr' ? selectedProduct.price_inr : selectedProduct.price_usd,
                email
            })
        });

        const result = await response.json();

        if (result.success) {
            appliedCoupon = couponCode;
            discountedAmount = result.discountedAmount;

            statusDiv.className = 'coupon-status valid';
            statusDiv.textContent = `✅ ${result.message}`;

            const symbol = currentCurrency === 'inr' ? '₹' : '$';
            document.getElementById('modalProductPrice').classList.add('price-strikethrough');
            const dp = document.getElementById('discountedPrice');
            dp.style.display = 'inline';
            dp.textContent = `${symbol}${result.discountedAmount}`;

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
// PAYMENT PROCESSING — branches by currency
// INR → Razorpay (existing Google Apps Script flow)
// USD → PayPal (Supabase edge function)
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
        // Check if already purchased (same for both methods)
        const checkResponse = await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'checkPurchase',
                email,
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

        // Branch by currency / payment method
        if (currentCurrency === 'usd') {
            await proceedWithPayPal(email, continueButton);
        } else {
            await proceedWithRazorpay(email, continueButton);
        }

    } catch (error) {
        console.error('Process Error:', error);
        alert('Error: ' + error.message);
        continueButton.disabled = false;
        continueButton.textContent = 'Continue to Payment';
    }
}

// ============================================
// RAZORPAY FLOW (INR)
// ============================================
async function proceedWithRazorpay(email, continueButton) {
    const finalAmount = discountedAmount || selectedProduct.price_inr;

    continueButton.textContent = 'Creating Payment Link...';

    const paymentLinkResponse = await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
            action: 'createPaymentLink',
            productId: selectedProduct.id,
            amount: finalAmount,
            currency: 'INR',
            email,
            couponCode: appliedCoupon || ''
        })
    });

    const paymentLinkData = await paymentLinkResponse.json();
    if (!paymentLinkData.success) throw new Error(paymentLinkData.message || 'Failed to create payment link');

    showPaymentPage(paymentLinkData, email, selectedProduct, finalAmount, appliedCoupon);
}

function showPaymentPage(paymentLinkData, email, product, finalAmount, couponCode) {
    if (!paymentLinkData.paymentLinkUrl || !product) {
        alert('Error: Could not generate payment link');
        const btn = document.querySelector('.modal-button-primary');
        if (btn) { btn.disabled = false; btn.textContent = 'Continue to Payment'; }
        return;
    }

    closeEmailModal();

    const symbol = '₹';
    const originalAmount = product.price_inr;

    document.body.innerHTML = `
        <div style="max-width:600px;margin:50px auto;padding:20px;text-align:center;">
            <h2 style="color:#ff6b35;">💳 Payment Link Ready</h2>
            <div style="background:#f5f5f5;padding:20px;border-radius:10px;margin:20px 0;">
                <p><strong>Product:</strong> ${product.name}</p>
                <p><strong>Amount:</strong>
                    ${couponCode
                        ? `<span style="text-decoration:line-through;color:#999;">${symbol}${originalAmount}</span>
                           <span style="color:#10b981;font-size:1.2em;">${symbol}${finalAmount}</span>`
                        : `${symbol}${finalAmount}`}
                </p>
                ${couponCode ? `<p style="color:#10b981;"><strong>✅ Coupon:</strong> ${couponCode}</p>` : ''}
                <p><strong>Email:</strong> ${email}</p>
            </div>
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
                ← Back to Store
            </button>
        </div>
    `;
}

// ============================================
// PAYPAL FLOW (USD)
// ============================================
async function proceedWithPayPal(email, continueButton) {
    const finalAmount = discountedAmount || selectedProduct.price_usd;

    continueButton.textContent = 'Creating PayPal Order...';

    const res = await fetch(CONFIG.PAYPAL_EDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'createOrder',
            email,
            amount: finalAmount,
            currency: 'USD',
            type: String(selectedProduct.id),
            description: `Purchased: ${selectedProduct.name}`,
            metadata: {
                productId: String(selectedProduct.id),
                productName: selectedProduct.name,
                downloadLink: selectedProduct.download_link || ''
            },
            return_url: window.location.origin + window.location.pathname + '?pp_order=PAYPAL_ORDER_ID',
            cancel_url: window.location.origin + window.location.pathname + '?pp_cancelled=1'
        })
    });

    const data = await res.json();

    if (data.success) {
        closeEmailModal();
        // Replace placeholder in return_url with real order ID (edge function does this too, but belt+suspenders)
        window.location.href = data.approval_url;
    } else {
        throw new Error(data.message || 'Failed to create PayPal order');
    }
}

// ============================================
// UI HELPERS
// ============================================
function showLoading() {
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('productsGrid').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loadingState').style.display = 'none';
}

function showError() {
    document.getElementById('loadingState').innerHTML = '<h3 style="color:#ff6b35;">Error Loading Products</h3>';
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
