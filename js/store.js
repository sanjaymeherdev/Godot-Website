// ============================================
// STORE CONFIGURATION
// ============================================
const CONFIG = {
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwQayBpHK2M3rndlxTQeyPbzUNpzUKSV6-Sani2wUI20sbr5Nh2tYYLJX9zcmH_HXA4ug/exec',
    COUPON_SCRIPT_URL:      'https://script.google.com/macros/s/AKfycby89oeq6ANrY9EY_Bhv6mN6fXIqrDMYMlMTwt4VBzN3teixSf_D4nBhI8OA-oKvXHISgw/exec',
    PAYPAL_EDGE_URL:        'https://lgfzoprhyjrmosvigwlb.supabase.co/functions/v1/cgstore-paypal',
    NOTIFY_URL:             'https://wa.me/917504704502?text=Hi%20Sanjay%2C%20I%27m%20interested%20in%20'
};

// ── Section display order and labels ──
const SECTION_CONFIG = [
    { type: 'bundle',    label: '📦 Bundles',      emoji: '📦' },
    { type: 'solo',      label: '📝 Solo Scripts',  emoji: '📝' },
    { type: 'framework', label: '🎮 Frameworks',    emoji: '🎮' },
    { type: 'plugin',    label: '🔌 Plugins',       emoji: '🔌' },
    { type: 'asset',     label: '🎨 3D Assets',     emoji: '🎨' }
];

// ============================================
// GLOBAL STATE
// ============================================
let allProducts     = [];
let filteredProducts = [];
let currentCategory  = 'all';
let currentSubcategory = 'all';
let currentSearch    = '';
let currentCurrency  = 'inr';
let appliedCoupon    = null;
let discountedAmount = null;
let selectedProduct  = null;

// ============================================
// INIT
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
// ============================================
function handlePayPalReturn() {
    const params    = new URLSearchParams(window.location.search);
    const ppOrderId = params.get('token');      // PayPal appends ?token=ORDER_ID automatically
    const cancelled = params.get('pp_cancelled');

    if (cancelled) {
        showStatusBanner('⚠️ Payment cancelled. You can try again anytime.', '#f59e0b');
        window.history.replaceState({}, '', window.location.pathname);
        return;
    }

    if (ppOrderId) {
        capturePayPalOrder(ppOrderId);
        pollPayPalUntilComplete(ppOrderId);
    }
}

async function capturePayPalOrder(orderId) {
    try {
        const res  = await fetch(CONFIG.PAYPAL_EDGE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'captureOrder', paypal_order_id: orderId })
        });
        const data = await res.json();
        console.log('Capture response:', data);
        return data;
    } catch (e) {
        console.error('Capture error:', e);
    }
}

async function pollPayPalUntilComplete(orderId) {
    const banner = showStatusBanner('⏳ Confirming your payment...', '#ff6b35', true);
    let attempts = 0;

    const interval = setInterval(async () => {
        attempts++;
        try {
            const res  = await fetch(CONFIG.PAYPAL_EDGE_URL, {
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
        position:fixed; top:0; left:0; right:0;
        background:${color}; color:white;
        text-align:center; padding:14px;
        z-index:9999; font-weight:bold; font-size:15px;
        transition:background 0.4s ease;
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
        allProducts      = JSON.parse(schemaEl.textContent);
        filteredProducts = [...allProducts];
        renderProducts(filteredProducts);
        hideLoading();
        updateResultsCount();
    } catch (error) {
        console.error('Error reading products schema:', error);
        showError();
    }
}

// ============================================
// RENDER — groups by section when showing all,
//          flat grid when filtered
// ============================================
function renderProducts(products) {
    const container      = document.getElementById('productsContainer');
    const noProductsState = document.getElementById('noProductsState');

    updateResultsCount(products.length);

    if (products.length === 0) {
        container.style.display = 'none';
        noProductsState.style.display = 'block';
        return;
    }

    container.style.display = 'block';
    noProductsState.style.display = 'none';

    // If a specific category is selected, show flat grid with section header only
    const isFiltered = currentCategory !== 'all' || currentSubcategory !== 'all' || currentSearch;

    if (isFiltered) {
        container.innerHTML = `
            <div class="products-grid">
                ${products.map(p => buildCard(p)).join('')}
            </div>
        `;
        return;
    }

    // Default: group by section type in defined order
    let html = '';
    for (const section of SECTION_CONFIG) {
        const sectionProducts = products.filter(p => p.type === section.type);
        if (sectionProducts.length === 0) continue;

        const liveCount   = sectionProducts.filter(p => p.live).length;
        const comingCount = sectionProducts.filter(p => !p.live).length;
        const countLabel  = `${liveCount} live${comingCount > 0 ? ` · ${comingCount} coming soon` : ''}`;

        html += `
            <div class="section-header">
                <span class="section-title">${section.label}</span>
                <span class="section-count">${countLabel}</span>
            </div>
            <div class="products-grid">
                ${sectionProducts.map(p => buildCard(p)).join('')}
            </div>
        `;
    }

    container.innerHTML = html;
}

// ── Build a single product card ──
function buildCard(product) {
    const isComingSoon = !product.live;
    const price        = currentCurrency === 'inr' ? product.price_inr : product.price_usd;
    const symbol       = currentCurrency === 'inr' ? '₹' : '$';
    const shortDesc    = product.short_description || '';
    const fullDesc     = (product.description || '').replace(/\n/g, '<br>');
    const hasMore      = fullDesc.length > 0;
    const imgHtml      = product.image
        ? `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=font-size:2.5rem>${product.icon || '🎮'}</span>'">`
        : `<span style="font-size:2.5rem">${product.icon || '🎮'}</span>`;

    // Badges
    let badge = '';
    if (isComingSoon)         badge = `<span class="badge badge-coming">Coming Soon</span>`;
    else if (product.featured) badge = `<span class="badge badge-featured">Featured</span>`;
    if (product.type === 'bundle')    badge += `<span class="badge badge-bundle" style="top:${isComingSoon||product.featured?'36':'10'}px">Bundle</span>`;
    if (product.type === 'framework') badge += `<span class="badge badge-framework" style="top:${isComingSoon||product.featured?'36':'10'}px">Framework</span>`;

    // Tags
    const tagHtml = (product.tags || []).map(t =>
        `<span class="product-tag">${t}</span>`
    ).join('');

    // Includes list (for bundles)
    const includesHtml = product.includes
        ? `<div style="font-size:0.75rem;color:#666;margin-bottom:0.5rem;">Includes: ${product.includes.join(' · ')}</div>`
        : '';

    // Action button
    const actionBtn = isComingSoon
        ? `<a href="${CONFIG.NOTIFY_URL}${encodeURIComponent(product.name)}" target="_blank" class="notify-button">🔔 Notify Me</a>`
        : `<button class="buy-button" onclick="openEmailModal(${product.id})">Buy Now</button>`;

    // Price display
    const priceHtml = isComingSoon
        ? `<div class="product-price coming-price">Coming Soon</div>`
        : `<div class="product-price"><span class="product-price-currency">${symbol}</span>${price}</div>`;

    // YouTube link
    const ytHtml = product.youtubeUrl
        ? `<a href="${product.youtubeUrl}" target="_blank" rel="noopener noreferrer" class="youtube-link" onclick="event.stopPropagation()">🎥 Watch Demo</a>`
        : '';

    return `
        <div class="product-card ${isComingSoon ? 'coming-soon' : ''}" data-product-id="${product.id}" data-type="${product.type}">
            <div class="product-image">
                ${imgHtml}
                ${badge}
            </div>
            <div class="product-content">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                ${includesHtml}
                <div class="description-wrapper">
                    <p class="product-description short-desc" id="short-${product.id}">${shortDesc}</p>
                    <div class="product-description full-desc" id="full-${product.id}" style="display:none;">${fullDesc}</div>
                    ${hasMore ? `<button class="read-more-btn" id="btn-${product.id}" onclick="toggleReadMore(${product.id})">Read More ▾</button>` : ''}
                </div>
                ${product.tags && product.tags.length > 0 ? `<div class="product-tags">${tagHtml}</div>` : ''}
                ${ytHtml}
                <div class="product-footer">
                    ${priceHtml}
                    ${actionBtn}
                </div>
            </div>
        </div>
    `;
}

function updateResultsCount(count) {
    const el = document.getElementById('resultsCount');
    if (el) {
        const n = count !== undefined ? count : filteredProducts.length;
        el.textContent = `${n} product${n !== 1 ? 's' : ''}`;
    }
}

// ============================================
// READ MORE
// ============================================
function toggleReadMore(productId) {
    const shortEl = document.getElementById(`short-${productId}`);
    const fullEl  = document.getElementById(`full-${productId}`);
    const btn     = document.getElementById(`btn-${productId}`);
    const isExpanded = fullEl.style.display === 'block';
    fullEl.style.display  = isExpanded ? 'none'  : 'block';
    shortEl.style.display = isExpanded ? 'block' : 'none';
    btn.textContent       = isExpanded ? 'Read More ▾' : 'Read Less ▴';
}

// ============================================
// CATEGORY FILTERING
// ============================================
function setupCategoryButtons() {
    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', function () {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategory    = this.dataset.category;
            currentSubcategory = 'all';
            updateSubcategoryButtons();
            filterProducts();
        });
    });
}

function setupSubcategoryButtons() {
    document.querySelectorAll('.subcategory-btn').forEach(button => {
        button.addEventListener('click', function () {
            document.querySelectorAll('.subcategory-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentSubcategory = this.dataset.subcategory;
            filterProducts();
        });
    });
}

function updateSubcategoryButtons() {
    document.querySelectorAll('.subcategory-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.subcategory === 'all') btn.classList.add('active');
    });
}

// ── Category → type mapping ──
const CATEGORY_TYPE_MAP = {
    'bundle':    ['bundle'],
    'solo':      ['solo'],
    'framework': ['framework'],
    'plugin':    ['plugin'],
    'asset':     ['asset']
};

function filterProducts() {
    let filtered = [...allProducts];

    // Category filter
    if (currentCategory !== 'all') {
        const types = CATEGORY_TYPE_MAP[currentCategory] || [];
        filtered = filtered.filter(p => types.includes(p.type));
    }

    // Subcategory / tag filter
    switch (currentSubcategory) {
        case 'live':
            filtered = filtered.filter(p => p.live);
            break;
        case 'coming':
            filtered = filtered.filter(p => !p.live);
            break;
        case 'featured':
            filtered = filtered.filter(p => p.featured);
            break;
        case 'ai':
            filtered = filtered.filter(p => (p.tags || []).includes('ai'));
            break;
        case 'multiplayer':
            filtered = filtered.filter(p => (p.tags || []).includes('multiplayer'));
            break;
        case 'mobile':
            filtered = filtered.filter(p => (p.tags || []).includes('mobile'));
            break;
        case 'monetization':
            filtered = filtered.filter(p => (p.tags || []).includes('monetization'));
            break;
    }

    // Search filter
    if (currentSearch) {
        const s = currentSearch.toLowerCase();
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(s) ||
            (p.short_description || '').toLowerCase().includes(s) ||
            (p.description || '').toLowerCase().includes(s) ||
            (p.tags || []).some(t => t.includes(s))
        );
    }

    filteredProducts = filtered;
    renderProducts(filteredProducts);
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
    const toggle      = document.getElementById('currencyToggle');
    const inrLabel    = document.getElementById('currencyLabelINR');
    const usdLabel    = document.getElementById('currencyLabelUSD');
    const methodNote  = document.getElementById('paymentMethodNote');

    if (toggle)     toggle.checked = currency === 'usd';
    if (inrLabel)   inrLabel.classList.toggle('currency-label-active', currency === 'inr');
    if (usdLabel)   usdLabel.classList.toggle('currency-label-active', currency === 'usd');
    if (methodNote) {
        methodNote.textContent = currency === 'inr' ? '💳 Razorpay' : '🌐 PayPal';
        methodNote.style.color = currency === 'inr' ? '#ff6b35' : '#0070ba';
    }

    localStorage.setItem('preferredCurrency', currency);
    renderProducts(filteredProducts.length ? filteredProducts : allProducts);
}

function loadSavedCurrency() {
    const saved = localStorage.getItem('preferredCurrency');
    if (saved === 'inr' || saved === 'usd') currentCurrency = saved;
    setCurrency(currentCurrency);
}

// ============================================
// MODAL
// ============================================
function openEmailModal(productId) {
    selectedProduct = allProducts.find(p => p.id === productId);
    if (!selectedProduct || !selectedProduct.live) return;

    appliedCoupon    = null;
    discountedAmount = null;

    const price  = currentCurrency === 'inr' ? selectedProduct.price_inr : selectedProduct.price_usd;
    const symbol = currentCurrency === 'inr' ? '₹' : '$';
    const method = currentCurrency === 'inr' ? '💳 Pay with Razorpay (INR)' : '🌐 Pay with PayPal (USD)';

    document.getElementById('modalProductName').textContent   = selectedProduct.name;
    document.getElementById('modalProductPrice').textContent  = `${symbol}${price}`;
    document.getElementById('modalProductPrice').classList.remove('price-strikethrough');
    document.getElementById('discountedPrice').style.display  = 'none';
    document.getElementById('discountedPrice').textContent    = '';
    document.getElementById('customerEmail').value            = '';
    document.getElementById('customerEmail').disabled         = false;
    document.getElementById('couponCode').value               = '';
    document.getElementById('couponCode').disabled            = false;
    document.getElementById('applyCouponBtn').disabled        = false;
    document.getElementById('applyCouponBtn').textContent     = 'Apply';
    document.getElementById('couponStatus').className         = 'coupon-status';
    document.getElementById('couponStatus').textContent       = '';

    const methodEl = document.getElementById('modalPaymentMethod');
    if (methodEl) methodEl.textContent = method;

    const continueButton = document.querySelector('.modal-button-primary');
    if (continueButton) { continueButton.disabled = false; continueButton.textContent = 'Continue to Payment'; }

    document.getElementById('emailModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeEmailModal() {
    document.getElementById('emailModal').classList.remove('active');
    document.body.style.overflow = 'auto';

    ['customerEmail','couponCode'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.value = ''; el.disabled = false; }
    });
    document.getElementById('applyCouponBtn').disabled    = false;
    document.getElementById('applyCouponBtn').textContent = 'Apply';
    document.getElementById('couponStatus').className     = 'coupon-status';
    document.getElementById('couponStatus').textContent   = '';
    document.getElementById('modalProductPrice').classList.remove('price-strikethrough');
    document.getElementById('discountedPrice').style.display = 'none';

    appliedCoupon    = null;
    discountedAmount = null;
    selectedProduct  = null;

    const continueButton = document.querySelector('.modal-button-primary');
    if (continueButton) { continueButton.disabled = false; continueButton.textContent = 'Continue to Payment'; }
}

// ============================================
// COUPON VALIDATION
// ============================================
async function applyCoupon() {
    const couponInput = document.getElementById('couponCode');
    const emailInput  = document.getElementById('customerEmail');
    const couponCode  = couponInput.value.trim().toUpperCase();
    const email       = emailInput.value.trim().toLowerCase();
    const statusDiv   = document.getElementById('couponStatus');
    const applyBtn    = document.getElementById('applyCouponBtn');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        statusDiv.className = 'coupon-status invalid';
        statusDiv.textContent = '⚠️ Please enter your email address first';
        emailInput.focus(); return;
    }
    if (!couponCode) {
        statusDiv.className = 'coupon-status invalid';
        statusDiv.textContent = '⚠️ Please enter a coupon code'; return;
    }

    applyBtn.disabled     = true;
    applyBtn.textContent  = 'Checking...';
    statusDiv.className   = 'coupon-status loading';
    statusDiv.textContent = '🔄 Validating coupon...';

    try {
        const response = await fetch(CONFIG.COUPON_SCRIPT_URL, {
            method: 'POST', mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'validateCoupon', couponCode,
                productId: selectedProduct.id,
                amount: currentCurrency === 'inr' ? selectedProduct.price_inr : selectedProduct.price_usd,
                email
            })
        });
        const result = await response.json();

        if (result.success) {
            appliedCoupon    = couponCode;
            discountedAmount = result.discountedAmount;
            statusDiv.className   = 'coupon-status valid';
            statusDiv.textContent = `✅ ${result.message}`;
            const symbol = currentCurrency === 'inr' ? '₹' : '$';
            document.getElementById('modalProductPrice').classList.add('price-strikethrough');
            const dp = document.getElementById('discountedPrice');
            dp.style.display = 'inline';
            dp.textContent   = `${symbol}${result.discountedAmount}`;
            couponInput.disabled = true;
            emailInput.disabled  = true;
            applyBtn.disabled    = true;
            applyBtn.textContent = 'Applied ✓';
        } else {
            appliedCoupon    = null;
            discountedAmount = null;
            if (result.expired)     { statusDiv.className = 'coupon-status expired'; statusDiv.textContent = `⏰ ${result.message}`; }
            else if (result.alreadyUsed) { statusDiv.className = 'coupon-status invalid'; statusDiv.textContent = `🚫 ${result.message}`; }
            else                    { statusDiv.className = 'coupon-status invalid'; statusDiv.textContent = `❌ ${result.message}`; }
            applyBtn.disabled    = false;
            applyBtn.textContent = 'Apply';
        }
    } catch (error) {
        console.error('Coupon validation error:', error);
        statusDiv.className   = 'coupon-status invalid';
        statusDiv.textContent = '❌ Error validating coupon. Please try again.';
        applyBtn.disabled     = false;
        applyBtn.textContent  = 'Apply';
    }
}

// ============================================
// PAYMENT PROCESSING
// ============================================
async function proceedToPayment() {
    const emailInput     = document.getElementById('customerEmail');
    const email          = emailInput.value.trim().toLowerCase();
    const continueButton = document.querySelector('.modal-button-primary');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address'); return;
    }

    continueButton.disabled     = true;
    continueButton.textContent  = 'Contacting Server...';

    try {
        const checkResponse = await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST', mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'checkPurchase', email, productId: selectedProduct.id })
        });
        const checkData = await checkResponse.json();
        if (!checkData.success) throw new Error(checkData.message || 'Failed to check purchase status');

        if (checkData.purchased) {
            alert('You already own this product! We have re-sent the download link to your email.');
            closeEmailModal(); return;
        }

        if (currentCurrency === 'usd') {
            await proceedWithPayPal(email, continueButton);
        } else {
            await proceedWithRazorpay(email, continueButton);
        }
    } catch (error) {
        console.error('Process Error:', error);
        alert('Error: ' + error.message);
        continueButton.disabled    = false;
        continueButton.textContent = 'Continue to Payment';
    }
}

// ── Razorpay (INR) ──
async function proceedWithRazorpay(email, continueButton) {
    const finalAmount = discountedAmount || selectedProduct.price_inr;
    continueButton.textContent = 'Creating Payment Link...';

    const paymentLinkResponse = await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST', mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
            action: 'createPaymentLink',
            productId: selectedProduct.id,
            amount: finalAmount, currency: 'INR',
            email, couponCode: appliedCoupon || ''
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
        <div style="max-width:600px;margin:50px auto;padding:20px;text-align:center;font-family:sans-serif;">
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
                <p><strong>Or copy this link:</strong></p>
                <input type="text" value="${paymentLinkData.paymentLinkUrl}" readonly
                       style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box;"
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

// ── PayPal (USD) ──
async function proceedWithPayPal(email, continueButton) {
    const finalAmount = discountedAmount || selectedProduct.price_usd;
    continueButton.textContent = 'Creating PayPal Order...';

    const res = await fetch(CONFIG.PAYPAL_EDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action:      'createOrder',
            email,
            amount:      finalAmount,
            currency:    'USD',
            type:        Number(selectedProduct.id),
            description: `Purchased: ${selectedProduct.name}`,
            metadata: {
                productId:   Number(selectedProduct.id),
                productName: selectedProduct.name,
                downloadLink: selectedProduct.download_link || ''
            },
            return_url: window.location.origin + window.location.pathname + '?pp_order=success',
            cancel_url: window.location.origin + window.location.pathname + '?pp_cancelled=1'
        })
    });

    const data = await res.json();
    if (data.success) {
        closeEmailModal();
        window.location.href = data.approval_url;
    } else {
        throw new Error(data.message || 'Failed to create PayPal order');
    }
}

// ============================================
// UI HELPERS
// ============================================
function showLoading() {
    document.getElementById('loadingState').style.display  = 'block';
    document.getElementById('productsContainer').style.display = 'none';
}
function hideLoading() {
    document.getElementById('loadingState').style.display = 'none';
}
function showError() {
    document.getElementById('loadingState').innerHTML = '<h3 style="color:#ff6b35;">Error Loading Products</h3>';
}

function initializeMobileMenu() {
    const btn     = document.getElementById('mobileMenuBtn');
    const menu    = document.getElementById('mobileMenu');
    const close   = document.getElementById('mobileCloseBtn');
    const overlay = document.getElementById('mobileMenuOverlay');

    if (btn)     btn.onclick     = () => { menu.classList.add('active'); overlay.classList.add('active'); document.body.classList.add('menu-open'); };
    if (close)   close.onclick   = () => { menu.classList.remove('active'); overlay.classList.remove('active'); document.body.classList.remove('menu-open'); };
    if (overlay) overlay.onclick = () => { menu.classList.remove('active'); overlay.classList.remove('active'); document.body.classList.remove('menu-open'); };
}

// ── Event listeners ──
document.addEventListener('click', function (event) {
    const modal = document.getElementById('emailModal');
    if (event.target === modal) closeEmailModal();
});
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeEmailModal();
});
