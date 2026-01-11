// Store Configuration
const CONFIG = {
    PRODUCTS_JSON_PATH: 'data/products.json',
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwhC7GCx704qJ94Fy_YLe_M9G-kB9PwaR6dO7Z4niF-oUFPv0Hb2RErnmMeJuzV4OpnwA/exec'
};

// Global variables
let allProducts = [];
let currentFilter = 'all';
let currentSearch = '';
let selectedProduct = null;

// Initialize store on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
    loadProducts();
    setupFilterButtons();
    setupSearch();
});

// Load products from JSON
async function loadProducts() {
    try {
        showLoading();
        const response = await fetch(CONFIG.PRODUCTS_JSON_PATH);
        if (!response.ok) throw new Error('Failed to load products');
        allProducts = await response.json();
        displayProducts(allProducts);
        hideLoading();
    } catch (error) {
        console.error('Error loading products:', error);
        showError();
    }
}

// Display products in grid
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
    
    grid.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='🎮'">
                ${product.featured ? '<span class="featured-badge">Featured</span>' : ''}
            </div>
            <div class="product-content">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <div class="product-price">
                        <span class="product-price-currency">₹</span>${product.price}
                    </div>
                    <button class="buy-button" onclick="openEmailModal(${product.id})">
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter and Search Logic
function filterProducts() {
    let filtered = allProducts;
    if (currentFilter !== 'all') {
        filtered = (currentFilter === 'featured') ? filtered.filter(p => p.featured) : filtered.filter(p => p.category === currentFilter);
    }
    if (currentSearch) {
        const search = currentSearch.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search));
    }
    displayProducts(filtered);
}

function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.category;
            filterProducts();
        });
    });
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentSearch = this.value.trim();
            filterProducts();
        });
    }
}

// Modal Functions
function openEmailModal(productId) {
    selectedProduct = allProducts.find(p => p.id === productId);
    if (!selectedProduct) return;
    document.getElementById('modalProductName').textContent = selectedProduct.name;
    document.getElementById('modalProductPrice').textContent = `₹${selectedProduct.price}`;
    document.getElementById('customerEmail').value = '';
    document.getElementById('emailModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeEmailModal() {
    document.getElementById('emailModal').classList.remove('active');
    document.body.style.overflow = 'auto';
    selectedProduct = null;
}

// --- CORE PAYMENT LOGIC ---
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
        // 1. Check if already purchased
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
        
        if (!checkData.success) {
            throw new Error(checkData.message || 'Failed to check purchase status');
        }
        
        if (checkData.purchased) {
            alert('You already own this product! We have re-sent the download link to your email.');
            closeEmailModal();
            return;
        }
        
        // 2. Create Payment Link (NOT Order)
        continueButton.textContent = 'Creating Payment Link...';
        const paymentLinkResponse = await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'createPaymentLink', // CHANGED: createOrder → createPaymentLink
                productId: selectedProduct.id,
                amount: selectedProduct.price,
                email: email
            })
        });
        
        const paymentLinkData = await paymentLinkResponse.json();

        if (!paymentLinkData.success) {
            throw new Error(paymentLinkData.message || 'Failed to create payment link');
        }
        
        // 3. Open Payment Link (No Razorpay JS SDK needed)
        openPaymentLink(paymentLinkData, email);
        
    } catch (error) {
        console.error('Process Error:', error);
        alert('Error: ' + error.message);
        continueButton.disabled = false;
        continueButton.textContent = 'Continue to Payment';
    }
}

function openPaymentLink(paymentLinkData, email) {
    // Payment Links: Simply redirect to the Razorpay payment page
    if (paymentLinkData.paymentLinkUrl) {
        // Open in new tab
        window.open(paymentLinkData.paymentLinkUrl, '_blank');
        
        // Close modal
        closeEmailModal();
        
        // Show success message
        alert('Payment page opened! Complete your payment on the Razorpay page. The download link will be sent to ' + email + ' after successful payment.');
    } else {
        alert('Error: Could not generate payment link');
        const continueButton = document.querySelector('.modal-button-primary');
        continueButton.disabled = false;
        continueButton.textContent = 'Continue to Payment';
    }
}

// Remove the old Razorpay SDK functions - they're not needed for Payment Links

// UI Helpers
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
    
    if (btn) btn.onclick = () => menu.classList.add('active');
    if (close) close.onclick = () => menu.classList.remove('active');
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('emailModal');
    if (event.target === modal) {
        closeEmailModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeEmailModal();
    }
});
