/**
 * LeadFlow Bot v2.0
 * Personalised AI sales agent widget + activity tracking
 *
 * Usage:
 * <script
 *   src="leadflow-bot.js"
 *   data-leadflow-url="https://lgfzoprhyjrmosvigwlb.supabase.co/functions/v1/leadflow"
 *   data-leadflow-token="USER_BEARER_TOKEN"
 *   data-business-url="https://yourbusiness.com"
 *   data-whatsapp="919876543210"
 *   data-calendly="https://calendly.com/you/30min"
 *   data-payment="https://razorpay.com/your-link"
 *   data-theme="#25D366"
 *   data-business-name="My Business"
 *   data-position="right"
 * ></script>
 *
 * URL params read automatically:
 *   ?name=John        → personalised greeting
 *   ?lid=LEAD_ID      → which lead to track
 *   ?src=wa           → traffic source (wa/ig/fb/email/sheet)
 *   ?ref=leadflow     → enables tracking mode
 *   ?ig=ig_username   → instagram username if known
 */

(function () {
  'use strict';

  // ─── Config ───────────────────────────────────────────────────────────────
  const script = document.currentScript || (function () {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  const cfg = {
    leadflowUrl:   script.getAttribute('data-leadflow-url')   || '',
    leadflowToken: script.getAttribute('data-leadflow-token') || '',
    businessUrl:   script.getAttribute('data-business-url')   || '',
    whatsapp:      script.getAttribute('data-whatsapp')       || '',
    calendly:      script.getAttribute('data-calendly')       || '',
    payment:       script.getAttribute('data-payment')        || '',
    theme:         script.getAttribute('data-theme')          || '#25D366',
    businessName:  script.getAttribute('data-business-name')  || 'Us',
    position:      script.getAttribute('data-position')       || 'right',
  };

  // ─── URL Params ───────────────────────────────────────────────────────────
  const urlParams    = new URLSearchParams(window.location.search);
  const visitorName  = urlParams.get('name') || urlParams.get('visitor') || '';
  const leadId       = urlParams.get('lid')  || '';
  const src          = urlParams.get('src')  || 'direct';
  const ref          = urlParams.get('ref')  || '';
  const igUsername   = urlParams.get('ig')   || '';
  const trackingMode = ref === 'leadflow' && !!leadId;

  // ─── State ────────────────────────────────────────────────────────────────
  let isOpen        = false;
  let isTyping      = false;
  let history       = [];
  let businessContext = '';
  let initialized   = false;
  let unreadCount   = 0;
  let sessionStart  = Date.now();
  let trackingSent  = false;
  let ctaClicked    = null;

  // ─── Tracking ─────────────────────────────────────────────────────────────
  function getTimeSpent() {
    return Math.round((Date.now() - sessionStart) / 1000);
  }

  async function trackEvent(event, extra = {}) {
    if (!trackingMode || !cfg.leadflowUrl) return;
    try {
      await fetch(cfg.leadflowUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cfg.leadflowToken ? { 'Authorization': `Bearer ${cfg.leadflowToken}` } : {})
        },
        body: JSON.stringify({
          action: 'trackEvent',
          lead_id: leadId,
          event,
          src,
          ig_username: igUsername || undefined,
          page_url: window.location.href,
          time_spent: getTimeSpent(),
          ...extra
        })
      });
    } catch (e) {
      // silent fail — tracking should never break the bot
    }
  }

  // track visited on load
  if (trackingMode) {
    sessionStart = Date.now();
    // slight delay so page is loaded
    setTimeout(() => trackEvent('visited'), 1000);

    // track drop on page leave
    window.addEventListener('beforeunload', () => {
      if (!ctaClicked) {
        // use sendBeacon for reliable exit tracking
        const payload = JSON.stringify({
          action: 'trackEvent',
          lead_id: leadId,
          event: 'dropped',
          src,
          time_spent: getTimeSpent(),
          page_url: window.location.href
        });
        if (navigator.sendBeacon && cfg.leadflowUrl) {
          navigator.sendBeacon(cfg.leadflowUrl, new Blob([payload], { type: 'application/json' }));
        }
      }
    });

    // track time milestones — 30s, 2min, 5min
    [30000, 120000, 300000].forEach(ms => {
      setTimeout(() => trackEvent('time_milestone', { milestone_seconds: ms / 1000 }), ms);
    });
  }

  function onCTAClick(type) {
    ctaClicked = type;
    trackEvent('clicked_cta', { cta: type });
    // update lead status based on CTA
    const statusMap = {
      calendly: 'visited',
      whatsapp: 'contacted',
      payment:  'converted'
    };
    if (statusMap[type]) {
      trackEvent('status_update', { new_status: statusMap[type], cta: type });
    }
  }

  // ─── Styles ───────────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

    #lfbot-wrap * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', sans-serif; }

    #lfbot-wrap {
      position: fixed;
      ${cfg.position === 'left' ? 'left: 24px;' : 'right: 24px;'}
      bottom: 24px;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      align-items: ${cfg.position === 'left' ? 'flex-start' : 'flex-end'};
      gap: 12px;
    }

    #lfbot-bubble {
      width: 58px; height: 58px; border-radius: 50%;
      background: ${cfg.theme}; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      position: relative; flex-shrink: 0;
    }
    #lfbot-bubble:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(0,0,0,0.25); }
    #lfbot-bubble svg { transition: transform 0.3s ease; }
    #lfbot-bubble.open svg.chat-icon { display: none; }
    #lfbot-bubble.open svg.close-icon { display: block !important; }

    #lfbot-badge {
      position: absolute; top: -2px; right: -2px;
      width: 20px; height: 20px; background: #ff3b30;
      border-radius: 50%; color: white; font-size: 11px; font-weight: 600;
      display: none; align-items: center; justify-content: center;
      border: 2px solid white;
    }
    #lfbot-badge.show { display: flex; }

    #lfbot-window {
      width: 360px; height: 520px; background: #fff;
      border-radius: 20px; box-shadow: 0 8px 48px rgba(0,0,0,0.18);
      display: none; flex-direction: column; overflow: hidden;
      animation: lfbot-slide-up 0.25s ease;
      border: 1px solid rgba(0,0,0,0.06);
    }
    #lfbot-window.open { display: flex; }

    @keyframes lfbot-slide-up {
      from { opacity: 0; transform: translateY(16px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    #lfbot-header {
      background: ${cfg.theme}; padding: 16px 18px;
      display: flex; align-items: center; gap: 12px; flex-shrink: 0;
    }
    #lfbot-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(255,255,255,0.25);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    #lfbot-header-info { flex: 1; }
    #lfbot-header-name { font-size: 15px; font-weight: 600; color: #fff; }
    #lfbot-header-status {
      font-size: 12px; color: rgba(255,255,255,0.8);
      display: flex; align-items: center; gap: 5px; margin-top: 1px;
    }
    .lfbot-online-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #fff; opacity: 0.9; animation: lfbot-pulse 2s infinite;
    }
    @keyframes lfbot-pulse { 0%,100%{opacity:0.9} 50%{opacity:0.4} }

    /* tracking pill shown when lid present */
    #lfbot-tracking-pill {
      display: none;
      background: rgba(255,255,255,0.15);
      border-radius: 20px;
      padding: 2px 8px;
      font-size: 10px;
      color: rgba(255,255,255,0.9);
      margin-left: auto;
      flex-shrink: 0;
    }
    #lfbot-tracking-pill.show { display: block; }

    #lfbot-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
      background: #f7f8fa; scroll-behavior: smooth;
    }
    #lfbot-messages::-webkit-scrollbar { width: 3px; }
    #lfbot-messages::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }

    .lfbot-msg {
      display: flex; gap: 8px;
      animation: lfbot-msg-in 0.2s ease; max-width: 88%;
    }
    @keyframes lfbot-msg-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
    .lfbot-msg.bot { align-self: flex-start; }
    .lfbot-msg.user { align-self: flex-end; flex-direction: row-reverse; }

    .lfbot-bubble-msg {
      padding: 10px 14px; border-radius: 16px;
      font-size: 14px; line-height: 1.5; color: #1a1a1a;
    }
    .lfbot-msg.bot .lfbot-bubble-msg {
      background: #fff; border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.07);
    }
    .lfbot-msg.user .lfbot-bubble-msg {
      background: ${cfg.theme}; color: #fff; border-bottom-right-radius: 4px;
    }

    .lfbot-time { font-size: 10px; color: #aaa; margin-top: 3px; text-align: right; }
    .lfbot-msg.bot .lfbot-time { text-align: left; }

    .lfbot-typing {
      display: flex; gap: 4px; padding: 12px 14px;
      background: #fff; border-radius: 16px; border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.07);
      align-items: center; width: fit-content;
    }
    .lfbot-typing span {
      width: 7px; height: 7px; background: #bbb;
      border-radius: 50%; animation: lfbot-bounce 1.2s infinite;
    }
    .lfbot-typing span:nth-child(2) { animation-delay: 0.2s; }
    .lfbot-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes lfbot-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }

    .lfbot-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
    .lfbot-action-btn {
      padding: 7px 13px; border-radius: 20px;
      border: 1.5px solid ${cfg.theme}; background: transparent;
      color: ${cfg.theme}; font-size: 13px; font-weight: 500;
      cursor: pointer; transition: all 0.15s ease;
      font-family: 'DM Sans', sans-serif;
    }
    .lfbot-action-btn:hover { background: ${cfg.theme}; color: #fff; }

    .lfbot-cta {
      display: inline-flex; align-items: center; gap: 6px;
      margin-top: 8px; padding: 10px 18px; border-radius: 12px;
      border: none; font-size: 14px; font-weight: 600;
      cursor: pointer; text-decoration: none;
      transition: opacity 0.15s; font-family: 'DM Sans', sans-serif;
    }
    .lfbot-cta:hover { opacity: 0.88; }
    .lfbot-cta.wa  { background: #25D366; color: #fff; }
    .lfbot-cta.cal { background: #0069ff; color: #fff; }
    .lfbot-cta.pay { background: #6c47ff; color: #fff; }

    #lfbot-footer {
      padding: 12px 14px; border-top: 1px solid #eee;
      display: flex; gap: 8px; align-items: center;
      background: #fff; flex-shrink: 0;
    }
    #lfbot-input {
      flex: 1; border: 1.5px solid #e8e8e8; border-radius: 22px;
      padding: 10px 16px; font-size: 14px; outline: none;
      font-family: 'DM Sans', sans-serif; color: #1a1a1a;
      background: #f7f8fa; transition: border-color 0.15s;
      resize: none; max-height: 90px; min-height: 42px; line-height: 1.4;
    }
    #lfbot-input:focus { border-color: ${cfg.theme}; background: #fff; }
    #lfbot-input::placeholder { color: #bbb; }

    #lfbot-send {
      width: 40px; height: 40px; border-radius: 50%;
      background: ${cfg.theme}; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: transform 0.15s, opacity 0.15s;
    }
    #lfbot-send:hover { transform: scale(1.08); }
    #lfbot-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

    #lfbot-powered {
      text-align: center; font-size: 10px; color: #ccc;
      padding: 6px 0 4px; background: #fff; flex-shrink: 0;
    }
    #lfbot-powered a { color: #ccc; text-decoration: none; }
    #lfbot-powered a:hover { color: #999; }

    @media (max-width: 420px) {
      #lfbot-window { width: calc(100vw - 24px); height: 70vh; border-radius: 16px; }
    }
  `;

  // ─── HTML ─────────────────────────────────────────────────────────────────
  function buildWidget() {
    const wrap = document.createElement('div');
    wrap.id = 'lfbot-wrap';
    wrap.innerHTML = `
      <div id="lfbot-window">
        <div id="lfbot-header">
          <div id="lfbot-avatar">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.95 9.95 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" fill="rgba(255,255,255,0.9)"/>
            </svg>
          </div>
          <div id="lfbot-header-info">
            <div id="lfbot-header-name">${cfg.businessName}</div>
            <div id="lfbot-header-status">
              <span class="lfbot-online-dot"></span>
              <span>AI Assistant · Online</span>
            </div>
          </div>
          <div id="lfbot-tracking-pill" class="${trackingMode ? 'show' : ''}">
            ${src ? '📍 ' + src.toUpperCase() : ''}
          </div>
        </div>
        <div id="lfbot-messages"></div>
        <div id="lfbot-footer">
          <textarea id="lfbot-input" placeholder="Type a message..." rows="1"></textarea>
          <button id="lfbot-send" aria-label="Send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div id="lfbot-powered">Powered by <a href="#" target="_blank">LeadFlow AI</a></div>
      </div>
      <button id="lfbot-bubble" aria-label="Open chat">
        <div id="lfbot-badge"></div>
        <svg class="chat-icon" width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.95 9.95 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" fill="white"/>
        </svg>
        <svg class="close-icon" style="display:none" width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </button>
    `;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    document.body.appendChild(wrap);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function now() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  function scrollToBottom() {
    const msgs = document.getElementById('lfbot-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }
  function showTyping() {
    const msgs = document.getElementById('lfbot-messages');
    const div = document.createElement('div');
    div.className = 'lfbot-msg bot';
    div.id = 'lfbot-typing-indicator';
    div.innerHTML = `<div class="lfbot-typing"><span></span><span></span><span></span></div>`;
    msgs.appendChild(div);
    scrollToBottom();
  }
  function hideTyping() {
    const el = document.getElementById('lfbot-typing-indicator');
    if (el) el.remove();
  }

  function addMessage(role, text, actions, ctas) {
    hideTyping();
    const msgs = document.getElementById('lfbot-messages');
    const div = document.createElement('div');
    div.className = `lfbot-msg ${role}`;

    let actionsHTML = '';
    if (actions && actions.length) {
      actionsHTML = `<div class="lfbot-actions">${actions.map(a =>
        `<button class="lfbot-action-btn" onclick="window.__lfbot_action('${a.replace(/'/g,"\\'")}'); this.parentElement.parentElement.remove();">${a}</button>`
      ).join('')}</div>`;
    }

    let ctasHTML = '';
    if (ctas && ctas.length) {
      ctasHTML = ctas.map(c => {
        if (c.type === 'wa')
          return `<a class="lfbot-cta wa" href="https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(c.text||'Hi!')}" target="_blank" onclick="window.__lfbot_cta('whatsapp')">💬 WhatsApp Us</a>`;
        if (c.type === 'cal')
          return `<a class="lfbot-cta cal" href="${cfg.calendly}" target="_blank" onclick="window.__lfbot_cta('calendly')">📅 Book Appointment</a>`;
        if (c.type === 'pay')
          return `<a class="lfbot-cta pay" href="${cfg.payment}" target="_blank" onclick="window.__lfbot_cta('payment')">💳 Pay Now</a>`;
        return '';
      }).join('');
    }

    div.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:4px;max-width:100%">
        <div class="lfbot-bubble-msg">${text.replace(/\n/g,'<br>')}</div>
        ${actionsHTML}
        ${ctasHTML}
        <div class="lfbot-time">${now()}</div>
      </div>`;
    msgs.appendChild(div);
    scrollToBottom();

    if (role === 'bot' && !isOpen) {
      unreadCount++;
      const badge = document.getElementById('lfbot-badge');
      badge.textContent = unreadCount;
      badge.classList.add('show');
    }
  }

  // ─── CTA click handler (global) ───────────────────────────────────────────
  window.__lfbot_cta = function(type) {
    onCTAClick(type);
  };

  // ─── Fetch business context ───────────────────────────────────────────────
  async function fetchBusinessContext(url) {
    if (!url) return '';
    try {
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      const html = data.contents || '';
      return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 3000);
    } catch (e) {
      return '';
    }
  }

  // ─── Build system prompt ──────────────────────────────────────────────────
  function buildSystemPrompt(context) {
    const name = visitorName
      ? `The visitor's name is ${visitorName}.`
      : 'The visitor name is unknown.';

    const trackingInfo = trackingMode
      ? `This visitor came from ${src.toUpperCase()} campaign. Lead ID: ${leadId}.`
      : '';

    const actions = [
      cfg.whatsapp ? `WhatsApp: ${cfg.whatsapp}` : '',
      cfg.calendly  ? `Calendly booking: ${cfg.calendly}` : '',
      cfg.payment   ? `Payment link: ${cfg.payment}` : '',
    ].filter(Boolean).join('\n');

    return `You are a friendly AI sales assistant for ${cfg.businessName}. ${name} ${trackingInfo}
Your job is to warmly greet the visitor, understand their needs, and guide them from inquiry to action.

${context ? `Here is information about the business:\n${context}\n` : ''}

Available actions you can offer:
${actions || 'Contact us for more information.'}

IMPORTANT RULES:
- Keep replies short and conversational (2-4 sentences max)
- Be warm, helpful, never pushy
- When user is ready to take action, include a special JSON tag at the END of your message:
  [ACTIONS:whatsapp] — show WhatsApp button
  [ACTIONS:calendly] — show booking button
  [ACTIONS:payment]  — show payment button
  [ACTIONS:whatsapp,calendly] — show multiple
- If you don't know something, offer to connect them via WhatsApp
- Guide conversation: greet → understand need → present solution → offer action`;
  }

  // ─── Send to AI via LeadFlow Groq endpoint ────────────────────────────────
  async function sendToAI(userMessage) {
    // use LeadFlow's own Groq proxy if token provided
    if (cfg.leadflowUrl && cfg.leadflowToken) {
      const res = await fetch(cfg.leadflowUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cfg.leadflowToken}`
        },
        body: JSON.stringify({
          action: 'botChat',
          message: userMessage,
          system_prompt: buildSystemPrompt(businessContext),
          conversation_history: history.slice(-10),
        })
      });
      const data = await res.json();
      if (data.success) return data.result;
      throw new Error(data.message || 'AI error');
    }

    // fallback — direct Groq (requires key exposed, not recommended)
    throw new Error('No LeadFlow URL configured');
  }

  // ─── Parse AI response for CTA triggers ──────────────────────────────────
  function parseResponse(raw) {
    const ctas = [];
    let text = raw;
    const actionMatch = text.match(/\[ACTIONS:([^\]]+)\]/i);
    if (actionMatch) {
      text = text.replace(actionMatch[0], '').trim();
      actionMatch[1].split(',').map(s => s.trim().toLowerCase()).forEach(t => {
        if (t === 'whatsapp' && cfg.whatsapp) ctas.push({ type: 'wa' });
        if (t === 'calendly'  && cfg.calendly)  ctas.push({ type: 'cal' });
        if (t === 'payment'   && cfg.payment)   ctas.push({ type: 'pay' });
      });
    }
    return { text, ctas };
  }

  // ─── Handle user send ─────────────────────────────────────────────────────
  async function handleSend() {
    const input   = document.getElementById('lfbot-input');
    const sendBtn = document.getElementById('lfbot-send');
    const msg     = input.value.trim();
    if (!msg || isTyping) return;

    input.value = '';
    input.style.height = 'auto';
    addMessage('user', msg);
    history.push({ role: 'user', content: msg });

    isTyping = true;
    sendBtn.disabled = true;
    showTyping();

    try {
      const raw = await sendToAI(msg);
      const { text, ctas } = parseResponse(raw);
      addMessage('bot', text, null, ctas.length ? ctas : null);
      history.push({ role: 'assistant', content: text });

      // track that user engaged with bot
      if (trackingMode) trackEvent('bot_engaged', { message_count: history.length });

    } catch (e) {
      addMessage('bot', "Sorry, I'm having trouble connecting. Please try again or reach out directly.");
    } finally {
      isTyping = false;
      sendBtn.disabled = false;
    }
  }

  // ─── Action button handler (quick replies) ────────────────────────────────
  window.__lfbot_action = async function (text) {
    const input = document.getElementById('lfbot-input');
    input.value = text;
    await handleSend();
  };

  // ─── Toggle window ────────────────────────────────────────────────────────
  function toggleWindow() {
    isOpen = !isOpen;
    const win    = document.getElementById('lfbot-window');
    const bubble = document.getElementById('lfbot-bubble');
    const badge  = document.getElementById('lfbot-badge');

    if (isOpen) {
      win.classList.add('open');
      bubble.classList.add('open');
      badge.classList.remove('show');
      unreadCount = 0;
      setTimeout(() => document.getElementById('lfbot-input')?.focus(), 100);
      if (!initialized) initChat();
      // track bot open
      if (trackingMode) trackEvent('bot_opened');
    } else {
      win.classList.remove('open');
      bubble.classList.remove('open');
    }
  }

  // ─── Init chat ────────────────────────────────────────────────────────────
  async function initChat() {
    initialized = true;
    showTyping();

    if (cfg.businessUrl) {
      businessContext = await fetchBusinessContext(cfg.businessUrl);
    }

    const greeting = visitorName
      ? `Hi ${visitorName}! 👋 Welcome to ${cfg.businessName}. I'm your AI assistant — I'm here to help you find exactly what you need. What brings you here today?`
      : `Hi there! 👋 Welcome to ${cfg.businessName}. I'm your AI assistant. How can I help you today?`;

    hideTyping();
    addMessage('bot', greeting, null, null);
    history.push({ role: 'assistant', content: greeting });

    setTimeout(() => {
      const suggestions = [];
      if (cfg.calendly) suggestions.push('📅 Book appointment');
      if (cfg.whatsapp) suggestions.push('💬 Talk to a human');
      if (cfg.payment)  suggestions.push('💳 Make a payment');
      suggestions.push('ℹ️ Tell me more');
      if (suggestions.length > 1) {
        addMessage('bot', 'Here are some quick options:', suggestions, null);
        history.push({ role: 'assistant', content: 'Here are some quick options: ' + suggestions.join(', ') });
      }
    }, 800);
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────
  function boot() {
    buildWidget();

    document.getElementById('lfbot-bubble').addEventListener('click', toggleWindow);
    document.getElementById('lfbot-send').addEventListener('click', handleSend);

    const input = document.getElementById('lfbot-input');
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });
    input.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 90) + 'px';
    });

    // auto-open after 3s if name param present (personalised visit)
    if (visitorName) {
      setTimeout(() => { if (!isOpen) toggleWindow(); }, 3000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
