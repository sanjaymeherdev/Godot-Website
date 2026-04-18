<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Test PayPal</title>
</head>
<body>
  <input type="email" id="email" placeholder="Email">
  <button id="payBtn">Pay</button>
  <div id="msg"></div>

  <script>
    const SUPABASE_FUNCTION_URL = 'https://lgfzoprhyjrmosvigwlb.supabase.co/functions/v1/paypal-payment';
    
    document.getElementById('payBtn').onclick = async function() {
      const email = document.getElementById('email').value;
      
      if (!email) {
        document.getElementById('msg').innerText = 'Enter email';
        return;
      }
      
      document.getElementById('payBtn').disabled = true;
      document.getElementById('msg').innerText = 'Creating order...';
      
      try {
        const res = await fetch(SUPABASE_FUNCTION_URL, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            action: 'createOrder',
            email: email,
            amount: '1.00',
            currency: 'USD',
            type: 'asset_purchase',
            description: 'Test Product',
            return_url: window.location.origin + '/success.html',
            cancel_url: window.location.origin
          })
        });
        
        const data = await res.json();
        
        if (data.success && data.approval_url) {
          window.location.href = data.approval_url;
        } else {
          document.getElementById('msg').innerText = data.message || 'Error';
          document.getElementById('payBtn').disabled = false;
        }
      } catch(err) {
        document.getElementById('msg').innerText = 'Network error';
        document.getElementById('payBtn').disabled = false;
      }
    };
  </script>
</body>
</html>
