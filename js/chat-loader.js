// chat-loader.js - Add this once, works on all pages
function loadChatWidget() {
    // Load CSS
    const chatCSS = document.createElement('link');
    chatCSS.rel = 'stylesheet';
    chatCSS.href = 'css/chat-widget.css';
    document.head.appendChild(chatCSS);
    
    // Create HTML
    const chatHTML = `
    <div class="chat-widget">
        <button class="chat-button" id="chatToggle">🤖</button>
        <div class="chat-container" id="chatContainer">
            <div class="chat-header">
                <h3>
                    Game Support
                    <button class="close-chat" id="closeChat">×</button>
                </h3>
            </div>
            <div class="chat-body">
                <div class="welcome-screen" id="welcomeScreen">
                    <h3>Game Support</h3>
                    <p>Need help with the course? Chat with our support team.</p>
                    <div class="input-group">
                        <label for="userName">Your Name</label>
                        <input type="text" id="userName" placeholder="Enter your name">
                    </div>
                    <div class="input-group">
                        <label for="ticketId">Ticket ID (Optional)</label>
                        <input type="text" id="ticketId" placeholder="Enter ticket ID to continue">
                    </div>
                    <button class="start-chat-btn" id="startChatBtn">Start Chat</button>
                </div>
                <div class="chat-messages" id="chatMessages"></div>
            </div>
            <div class="chat-input-area" id="chatInputArea">
                <input type="text" class="chat-input" id="messageInput" placeholder="Type your message...">
                <button class="send-button" id="sendMessageBtn">➤</button>
            </div>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', chatHTML);
    
    // Load chat widget functionality
    const chatScript = document.createElement('script');
    chatScript.src = 'js/chat-widget.js';
    document.body.appendChild(chatScript);
}

// Load when page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadChatWidget);
} else {
    loadChatWidget();
}
