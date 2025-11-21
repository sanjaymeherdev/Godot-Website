// chat-loader.js - Universal chat widget loader for all pages
class ChatLoader {
    constructor() {
        this.chatWidget = null;
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeChatWidget();
            });
        } else {
            this.initializeChatWidget();
        }
        
        this.isInitialized = true;
    }

    initializeChatWidget() {
        // Check if chat widget elements exist on this page
        const chatToggle = document.getElementById('chatToggle');
        const chatContainer = document.getElementById('chatContainer');
        
        if (!chatToggle || !chatContainer) {
            console.log('❌ Chat widget elements not found on this page');
            this.injectChatWidget();
            return;
        }
        
        console.log('✅ Chat widget elements found, initializing...');
        this.loadChatWidgetScript();
    }

    injectChatWidget() {
        // Inject chat widget HTML if it doesn't exist
        if (!document.getElementById('chatToggle')) {
            console.log('🔄 Injecting chat widget HTML...');
            
            const chatWidgetHTML = `
                <div class="chat-widget">
                    <button class="chat-button" id="chatToggle">🤖</button>
                    <div class="chat-container" id="chatContainer">
                        <div class="chat-header">
                            <h3>Game Support <button class="close-chat" id="closeChat">×</button></h3>
                        </div>
                        <div class="chat-body">
                            <div class="welcome-screen" id="welcomeScreen">
                                <h3>Game Support</h3>
                                <p>Need help? Chat with our support team.</p>
                                <div class="input-group">
                                    <label for="userName">Your Name</label>
                                    <input type="text" id="userName" placeholder="Enter your name">
                                </div>
                                <div class="input-group">
                                    <label for="ticketId">Ticket ID (Optional)</label>
                                    <input type="text" id="ticketId" placeholder="Enter ticket ID">
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
            
            // Inject into body
            document.body.insertAdjacentHTML('beforeend', chatWidgetHTML);
            
            // Load CSS if not already loaded
            this.loadChatWidgetCSS();
            
            // Load and initialize the chat widget script
            this.loadChatWidgetScript();
        }
    }

    loadChatWidgetCSS() {
        // Check if chat widget CSS is already loaded
        if (document.querySelector('link[href*="chat-widget.css"]')) {
            return;
        }
        
        // Create link element for CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/chat-widget.css';
        document.head.appendChild(link);
    }

    loadChatWidgetScript() {
        // Check if chat widget script is already loaded
        if (window.chatWidgetInstance) {
            console.log('✅ Chat widget already loaded');
            return;
        }

        // Load the chat widget script
        const script = document.createElement('script');
        script.src = 'js/chat-widget.js';
        script.onload = () => {
            console.log('✅ Chat widget script loaded successfully');
        };
        script.onerror = () => {
            console.error('❌ Failed to load chat widget script');
        };
        document.body.appendChild(script);
    }
}

// Initialize chat loader globally
window.chatLoader = new ChatLoader();
