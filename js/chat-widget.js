// Fixed chat-widget.js - Single initialization and proper event handling
class ChatWidget {
    constructor() {
        this.isChatOpen = false;
        this.currentTicketId = null;
        this.userName = '';
        this.isNewChat = true;
        this.backendUrl = 'https://1454e379-5d20-4c4f-91ff-4859f3439300-00-2mhzvdi91js6d.sisko.replit.dev/';
        this.isInitialized = false;
        
        this.initialize();
    }

    initialize() {
        if (this.isInitialized) return;
        
        this.initializeElements();
        this.attachEventListeners();
        this.startPolling();
        
        this.isInitialized = true;
        console.log('✅ Chat widget initialized');
    }

    initializeElements() {
        this.chatToggle = document.getElementById('chatToggle');
        this.chatContainer = document.getElementById('chatContainer');
        this.closeChat = document.getElementById('closeChat');
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInputArea = document.getElementById('chatInputArea');
        this.startChatBtn = document.getElementById('startChatBtn');
        this.messageInput = document.getElementById('messageInput');
        this.sendMessageBtn = document.getElementById('sendMessageBtn');
        this.userNameInput = document.getElementById('userName');
        this.ticketIdInput = document.getElementById('ticketId');
        
        // Ensure chat starts closed
        if (this.chatContainer) {
            this.chatContainer.style.display = 'none';
        }
        
        this.resetChatState();
    }

    resetChatState() {
        if (this.chatMessages) this.chatMessages.innerHTML = '';
        if (this.userNameInput) this.userNameInput.value = '';
        if (this.ticketIdInput) this.ticketIdInput.value = '';
        if (this.welcomeScreen) this.welcomeScreen.style.display = 'flex';
        if (this.chatMessages) this.chatMessages.style.display = 'none';
        if (this.chatInputArea) this.chatInputArea.style.display = 'none';
        
        this.currentTicketId = null;
        this.userName = '';
        this.isNewChat = true;
    }

    attachEventListeners() {
        // Remove any existing event listeners first
        this.removeEventListeners();
        
        if (this.chatToggle) {
            this.chatToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleChat();
            });
        }
        
        if (this.closeChat) {
            this.closeChat.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeChatWindow();
            });
        }
        
        if (this.startChatBtn) {
            this.startChatBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.startChat();
            });
        }
        
        if (this.sendMessageBtn) {
            this.sendMessageBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.sendMessage();
            });
        }
        
        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.stopPropagation();
                    this.sendMessage();
                }
            });
        }

        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isChatOpen && 
                this.chatContainer && 
                !this.chatContainer.contains(e.target) && 
                this.chatToggle && 
                !this.chatToggle.contains(e.target)) {
                this.closeChatWindow();
            }
        });

        // Prevent propagation for chat container clicks
        if (this.chatContainer) {
            this.chatContainer.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    removeEventListeners() {
        // This is a simplified approach - in production you'd use removeEventListener
        // For now, we'll rely on proper initialization
        console.log('🔄 Resetting event listeners');
    }

    toggleChat() {
        this.isChatOpen = !this.isChatOpen;
        
        if (this.chatContainer) {
            this.chatContainer.style.display = this.isChatOpen ? 'flex' : 'none';
        }
        
        if (this.isChatOpen) {
            console.log('💬 Opening chat');
            setTimeout(() => {
                if (this.messageInput) this.messageInput.focus();
            }, 100);
        } else {
            console.log('❌ Closing chat');
        }
    }

    closeChatWindow() {
        this.isChatOpen = false;
        if (this.chatContainer) {
            this.chatContainer.style.display = 'none';
        }
    }

    async startChat() {
        if (!this.userNameInput) return;
        
        this.userName = this.userNameInput.value.trim();
        const ticketId = this.ticketIdInput ? this.ticketIdInput.value.trim() : '';
        
        if (!this.userName) {
            alert('Please enter your name to continue');
            return;
        }
        
        try {
            if (ticketId) {
                this.currentTicketId = ticketId;
                this.isNewChat = false;
                await this.continueExistingChat();
            } else {
                this.currentTicketId = this.generateTicketId();
                this.isNewChat = true;
                await this.startNewChat();
            }
            
            if (this.welcomeScreen) this.welcomeScreen.style.display = 'none';
            if (this.chatMessages) this.chatMessages.style.display = 'flex';
            if (this.chatInputArea) this.chatInputArea.style.display = 'flex';
            
        } catch (error) {
            console.error('Error starting chat:', error);
            alert('Error starting chat: ' + error.message);
        }
    }

    async startNewChat() {
        if (!this.chatMessages) return;
        
        this.chatMessages.innerHTML = '';
        
        const response = await this.sendToBackend('/api/new_chat', {
            userName: this.userName,
            ticketId: this.currentTicketId
        });
        
        if (response.success) {
            this.addMessage(`Your ticket ID is: ${this.currentTicketId}. Please save this ID to continue this chat later.`, 'bot');
            await this.loadMessages();
        } else {
            throw new Error(response.error);
        }
    }

    async continueExistingChat() {
        if (!this.chatMessages) return;
        
        this.chatMessages.innerHTML = '';
        
        const response = await this.sendToBackend('/api/continue_chat', {
            userName: this.userName,
            ticketId: this.currentTicketId
        });
        
        if (response.success) {
            this.addMessage(`Welcome back ${this.userName}! Continuing your previous conversation.`, 'bot');
            await this.loadMessages();
        } else {
            throw new Error(response.error);
        }
    }

    async loadMessages() {
        try {
            const response = await this.sendToBackend('/api/get_messages', {
                ticketId: this.currentTicketId
            });
            
            if (response.success) {
                response.messages.forEach(msg => {
                    this.addMessage(msg.message, msg.sender === 'user' ? 'user' : 'bot', false);
                });
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    async sendMessage() {
        if (!this.messageInput || !this.currentTicketId) return;
        
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        
        try {
            await this.sendToBackend('/api/user_message', {
                userName: this.userName,
                ticketId: this.currentTicketId,
                message: message
            });
            
            this.showTypingIndicator();
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.addMessage('Failed to send message. Please try again.', 'bot');
        }
    }

    addMessage(text, sender, scroll = true) {
        if (!this.chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;
        
        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
        
        if (scroll) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }

    showTypingIndicator() {
        if (!this.chatMessages) return;
        
        const existingIndicator = document.getElementById('typingIndicator');
        if (existingIndicator) existingIndicator.remove();
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = '● ● ●';
        
        typingDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(typingDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        setTimeout(() => {
            const indicator = document.getElementById('typingIndicator');
            if (indicator) {
                indicator.remove();
            }
        }, 2000);
    }

    async sendToBackend(endpoint, data) {
        const response = await fetch(this.backendUrl + endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }

    startPolling() {
        setInterval(async () => {
            if (this.currentTicketId && this.isChatOpen) {
                try {
                    const response = await this.sendToBackend('/api/get_messages', {
                        ticketId: this.currentTicketId
                    });
                    
                    if (response.success) {
                        this.syncMessages(response.messages);
                    }
                } catch (error) {
                    console.error('Error polling messages:', error);
                }
            }
        }, 3000);
    }

    syncMessages(messages) {
        if (!this.chatMessages) return;
        
        const existingMessages = Array.from(this.chatMessages.querySelectorAll('.message-content'))
            .map(el => el.textContent);
            
        messages.forEach(msg => {
            if (!existingMessages.includes(msg.message)) {
                this.addMessage(msg.message, msg.sender === 'user' ? 'user' : 'bot');
            }
        });
    }

    generateTicketId() {
        return 'TKT-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    }
}

// Global initialization with protection against multiple instances
let chatWidgetInstance = null;

function initializeChatWidget() {
    if (chatWidgetInstance) {
        console.log('⚠️ Chat widget already initialized');
        return chatWidgetInstance;
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            chatWidgetInstance = new ChatWidget();
        });
    } else {
        chatWidgetInstance = new ChatWidget();
    }
    
    return chatWidgetInstance;
}

// Initialize when script loads
initializeChatWidget();
