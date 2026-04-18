const GAS_URL    = 'https://script.google.com/macros/s/AKfycbzvGCTjASsKJ0NcHD4iAXBy-l70dGAbc8o3U14aZEYxIu3dNwlorAnBC_VtETnmP0AR_g/exec';
const PRODUCT_ID = '1';
const AMOUNT     = '1.00';

const emailInput = document.getElementById('email');
const payBtn     = document.getElementById('payBtn');
const msg        = document.getElementById('msg');

function setMsg(text, isInfo) {
  msg.textContent = text;
  msg.className   = 'msg' + (isInfo ? ' info' : '');
}

async function handleBuy() {
  const email = emailInput.value.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setMsg('Please enter a valid email address.');
    return;
  }

  payBtn.disabled    = true;
  payBtn.textContent = 'Connecting...';
  setMsg('', false);

  try {
    const res  = await fetch(GAS_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body:    JSON.stringify({
        action:    'createPaypalOrder',
        productId: PRODUCT_ID,
        amount:    AMOUNT,
        email:     email
      })
    });

    const data = await res.json();

    if (data.success && data.approveUrl) {
      setMsg('Redirecting to PayPal...', true);
      window.location.href = data.approveUrl;
    } else {
      setMsg(data.message || 'Something went wrong. Try again.');
      payBtn.disabled    = false;
      payBtn.textContent = 'Pay with PayPal';
    }

  } catch (err) {
    setMsg('Network error. Check your connection.');
    payBtn.disabled    = false;
    payBtn.textContent = 'Pay with PayPal';
    console.error(err);
  }
}

payBtn.addEventListener('click', handleBuy);
emailInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') handleBuy();
});
