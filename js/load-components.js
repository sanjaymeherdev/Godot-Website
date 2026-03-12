// Main loader for header and footer
document.addEventListener('DOMContentLoaded', function() {
    // Load header and footer components
    Promise.all([
        loadScript('js/components/header.js'),
        loadScript('js/components/footer.js')
    ]).then(() => {
        // Insert header at the beginning of body
        if (typeof HeaderComponent !== 'undefined') {
            const headerDiv = document.createElement('div');
            headerDiv.innerHTML = HeaderComponent.render();
            document.body.insertBefore(headerDiv.firstElementChild, document.body.firstChild);
            HeaderComponent.init();
        }

        // Insert footer at the end of body
        if (typeof FooterComponent !== 'undefined') {
            const footerDiv = document.createElement('div');
            footerDiv.innerHTML = FooterComponent.render();
            document.body.appendChild(footerDiv.firstElementChild);
        }

        // Initialize currency toggle (if not already done by header)
        initCurrencyToggle();
    });
});

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function initCurrencyToggle() {
    const currencyOptions = document.querySelectorAll('.currency-option');
    const inrPrices = document.querySelectorAll('.inr-price');
    const usdPrices = document.querySelectorAll('.usd-price');

    function setCurrency(currency) {
        localStorage.setItem('preferredCurrency', currency);
        
        currencyOptions.forEach(opt => {
            if (opt.dataset.currency === currency) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });

        if (currency === 'inr') {
            inrPrices.forEach(el => el.style.display = 'inline');
            usdPrices.forEach(el => el.style.display = 'none');
        } else {
            inrPrices.forEach(el => el.style.display = 'none');
            usdPrices.forEach(el => el.style.display = 'inline');
        }
    }

    // Load saved preference
    const savedCurrency = localStorage.getItem('preferredCurrency') || 'inr';
    setCurrency(savedCurrency);

    // Add click handlers
    currencyOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            setCurrency(opt.dataset.currency);
        });
    });
}
