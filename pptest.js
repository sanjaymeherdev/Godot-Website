<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Purchase - Godot Assets</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }
    .logo {
      color: #ff6b35;
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    h2 {
      color: #1f2937;
      margin-bottom: 20px;
    }
    input {
      width: 100%;
      padding: 14px;
      font-size: 16px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      margin-bottom: 20px;
      box-sizing: border-box;
      transition: border-color 0.3s;
    }
    input:focus {
      outline: none;
      border-color: #ff6b35;
    }
    button {
      background: #ff6b35;
      color: white;
      border: none;
      padding: 14px 30px;
      font-size: 16px;
      font-weight: bold;
      border-radius: 10px;
      cursor: pointer;
      width: 100%;
      transition: transform 0.2s, opacity 0.2s;
    }
    button:hover:not(:disabled) {
      transform: translateY(-2px);
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .msg {
      margin-top: 20px;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
    }
    .msg.info {
      background: #d1fae5;
      color: #065f46;
    }
    .msg.error {
      background: #fee2e2;
      color: #991b1b;
    }
    .product-info {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 10px;
      margin-bottom: 20px;
      text-align: left;
    }
    .product-info p {
      margin: 5px 0;
      color: #374151;
    }
    .price {
      font-size: 24px;
      font-weight: bold;
      color: #ff6b35;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🎮 Godot Assets</div>
    <h2>Complete Your Purchase</h2>
    
    <div class="product-info">
      <p><strong>Product:</strong> Premium Game Asset</p>
      <p><strong>Price:</strong> <span class="price">$1.00 USD</span></p>
    </div>
    
    <input type="email" id="email" placeholder="Enter your email address" autocomplete="email">
    <button id="payBtn">Pay with PayPal</button>
    <div id="msg" class="msg"></div>
  </div>

  <script>
    // ============================================
    // SUPABASE EDGE FUNCTION ENDPOINT
    // Replace with your actual Supabase function URL
    // ============================================
    const SUPABASE_FUNCTION_URL = 'https://your-project-ref.supabase.co/functions/v1/paypal-payment';
    
    const PRODUCT_ID = '1';
    const PRODUCT_NAME = 'Premium Game Asset';
    const AMOUNT = '1.00';
    const CURRENCY = 'USD';

    const emailInput = document.getElementById('email');
    const payBtn = document.getElementById('payBtn');
    const msg = document.getElementById('msg');

    function setMsg(text, isError = false) {
      msg.textContent = text;
      msg.className = 'msg';
      if (text) {
        msg.className += isError ? ' error' : ' info';
      }
    }

    async function handleBuy() {
      const email = emailInput.value.trim();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setMsg('Please enter a valid email address.', true);
        return;
      }

      payBtn.disabled = true;
      payBtn.textContent = 'Creating order...';
      setMsg('');

      try {
        const response = await fetch(SUPABASE_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'createOrder',
            email: email,
            amount: AMOUNT,
            currency: CURRENCY,
            type: 'asset_purchase',
            description: PRODUCT_NAME,
            return_url: window.location.origin + '/index.html',
            cancel_url: window.location.origin + '/cgstore.html',
            metadata: {
              productId: PRODUCT_ID,
              productName: PRODUCT_NAME
            }
          })
        });

        const data = await response.json();

        if (data.success && data.approval_url) {
          setMsg('Redirecting to PayPal...');
          // Redirect to PayPal checkout
          window.location.href = data.approval_url;
        } else {
          setMsg(data.message || 'Failed to create order. Please try again.', true);
          payBtn.disabled = false;
          payBtn.textContent = 'Pay with PayPal';
        }

      } catch (error) {
        console.error('Error:', error);
        setMsg('Network error. Please check your connection and try again.', true);
        payBtn.disabled = false;
        payBtn.textContent = 'Pay with PayPal';
      }
    }

    // Check if returning from PayPal
    function checkReturnFromPayPal() {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const payerId = urlParams.get('PayerID');
      
      if (token && payerId) {
        setMsg('Completing your purchase...');
        payBtn.disabled = true;
        
        // Call capture endpoint
        fetch(SUPABASE_FUNCTION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'captureOrder',
            paypal_order_id: token
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setMsg('Payment successful! Check your email for the download link.');
            // Redirect or show success message
          } else {
            setMsg(data.message || 'Payment verification failed. Contact support.', true);
          }
        })
        .catch(err => {
          console.error(err);
          setMsg('Error verifying payment. Contact support.', true);
        });
      }
    }

    payBtn.addEventListener('click', handleBuy);
    emailInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') handleBuy();
    });

    // Check if returning from PayPal
    checkReturnFromPayPal();
  </script>
</body>
</html>
