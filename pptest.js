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
    
    <input type="email" id="payment-email" placeholder="Enter your email address" autocomplete="email">
    <button id="paypal-pay-btn">Pay with PayPal</button>
    <div id="payment-msg" class="msg"></div>
  </div>

  <script>
    (function() {
      // Use unique IDs to avoid conflicts
      const SUPABASE_FUNCTION_URL = 'https://lgfzoprhyjrmosvigwlb.supabase.co/functions/v1/paypal-payment';
      const PRODUCT_ID = '1';
      const PRODUCT_NAME = 'Premium Game Asset';
      const AMOUNT = '1.00';

      // Wait for DOM to be fully loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }

      function init() {
        const emailInput = document.getElementById('payment-email');
        const payBtn = document.getElementById('paypal-pay-btn');
        const msgDiv = document.getElementById('payment-msg');

        if (!payBtn) {
          console.error('Button not found');
          return;
        }

        function setMsg(text, isError = false) {
          if (msgDiv) {
            msgDiv.textContent = text || '';
            msgDiv.className = 'msg';
            if (text && isError) msgDiv.className += ' error';
            if (text && !isError) msgDiv.className += ' info';
          }
        }

        async function handleBuy(e) {
          // Prevent any default behavior
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          
          const email = emailInput ? emailInput.value.trim() : '';

          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setMsg('Please enter a valid email address.', true);
            return;
          }

          if (payBtn) {
            payBtn.disabled = true;
            payBtn.textContent = 'Creating order...';
          }
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
                currency: 'USD',
                type: 'asset_purchase',
                description: PRODUCT_NAME,
                return_url: window.location.origin + '/index.html',
                cancel_url: window.location.origin,
                metadata: {
                  productId: PRODUCT_ID,
                  productName: PRODUCT_NAME
                }
              })
            });

            const data = await response.json();

            if (data.success && data.approval_url) {
              setMsg('Redirecting to PayPal...');
              window.location.href = data.approval_url;
            } else {
              setMsg(data.message || 'Failed to create order. Please try again.', true);
              if (payBtn) {
                payBtn.disabled = false;
                payBtn.textContent = 'Pay with PayPal';
              }
            }

          } catch (error) {
            console.error('Error:', error);
            setMsg('Network error. Please check your connection.', true);
            if (payBtn) {
              payBtn.disabled = false;
              payBtn.textContent = 'Pay with PayPal';
            }
          }
        }

        // Remove any existing listeners and add new one
        const newBtn = payBtn.cloneNode(true);
        payBtn.parentNode.replaceChild(newBtn, payBtn);
        newBtn.addEventListener('click', handleBuy);
        
        if (emailInput) {
          emailInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
              handleBuy(e);
            }
          });
        }
      }
    })();
  </script>
</body>
</html>
