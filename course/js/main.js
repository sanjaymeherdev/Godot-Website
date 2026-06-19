// ============================================================
// MAIN.JS - Build with Sanjay
// ============================================================

// --- CONFIGURATION ---
const APPSCRIPT_URL = 'YOUR_APPSCRIPT_DEPLOYMENT_URL'; // ⚠️ REPLACE THIS

// --- SMOOTH SCROLL ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// --- LEAD FORM HANDLER ---
const leadForm = document.getElementById('leadForm');
if (leadForm) {
  leadForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(leadForm);
    const data = Object.fromEntries(formData.entries());
    
    // Validate required fields
    if (!data.Name || !data.Email || !data.Module) {
      showStatus('Please fill in all required fields (Name, Email, Module).', 'error');
      return;
    }
    
    // Show loading state
    setButtonLoading(true);
    
    try {
      const response = await fetch(APPSCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Required for AppScript
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      // Note: With no-cors, we can't read the response
      // But the request still goes through
      showStatus('✅ Thank you! I\'ll reach out within 24 hours on WhatsApp or email.', 'success');
      leadForm.reset();
      
    } catch (error) {
      console.error('Form submission error:', error);
      showStatus('❌ Something went wrong. Please try again or contact me directly on WhatsApp.', 'error');
    } finally {
      setButtonLoading(false);
    }
  });
}

// --- HELPER: Show status message ---
function showStatus(message, type) {
  const status = document.getElementById('formStatus');
  if (!status) return;
  
  status.style.display = 'block';
  status.textContent = message;
  status.style.background = type === 'success' ? '#dcfce7' : '#fee2e2';
  status.style.color = type === 'success' ? '#166534' : '#991b1b';
  status.style.border = '1px solid ' + (type === 'success' ? '#86efac' : '#fca5a5');
}

// --- HELPER: Toggle button loading state ---
function setButtonLoading(isLoading) {
  const btn = document.getElementById('submitBtn');
  const text = document.getElementById('btnText');
  const spinner = document.getElementById('btnSpinner');
  
  if (!btn || !text || !spinner) return;
  
  btn.disabled = isLoading;
  text.style.display = isLoading ? 'none' : 'inline';
  spinner.style.display = isLoading ? 'inline' : 'none';
}
