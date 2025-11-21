// Chat Widget Functionality
class ChatWidget {
    constructor() {
        this.isChatOpen = false;
        this.currentTicketId = null;
        this.userName = '';
        this.isNewChat = true;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // Core elements
        this.chatToggle = document.getElementById('chatToggle');
        this.chatContainer = document.getElementById('chatContainer');
        this.closeChat = document.getElementById('closeChat');
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInputArea = document.getElementById('chatInputArea');
        
        // Buttons and inputs
        this.startChatBtn = document.getElementById('startChatBtn');
        this.messageInput = document.getElementById('messageInput');
        this.sendMessageBtn = document.getElementById('sendMessageBtn');
        this.userNameInput = document.getElementById('userName');
        this.ticketIdInput = document.getElementById('ticketId');
    }

    attachEventListeners() {
        // Toggle chat window
        this.chatToggle.addEventListener('click', () => this.toggleChat());
        this.closeChat.addEventListener('click', () => this.closeChatWindow());

        // Start chat
        this.startChatBtn.addEventListener('click', () => this.startChat());

        // Send message
        this.sendMessageBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isChatOpen && 
                !this.chatContainer.contains(e.target) && 
                !this.chatToggle.contains(e.target)) {
                this.closeChatWindow();
            }
        });
    }

    toggleChat() {
        this.isChatOpen = !this.isChatOpen;
        this.chatContainer.style.display = this.isChatOpen ? 'flex' : 'none';
        
        if (this.isChatOpen) {
            this.messageInput.focus();
        }
    }

    closeChatWindow() {
        this.isChatOpen = false;
        this.chatContainer.style.display = 'none';
    }

    startChat() {
        this.userName = this.userNameInput.value.trim();
        const ticketId = this.ticketIdInput.value.trim();
        
        if (!this.userName) {
            alert('Please enter your name to continue');
            return;
        }
        
        // Handle ticket ID
        if (ticketId) {
            this.currentTicketId = ticketId;
            this.isNewChat = false;
            this.continueExistingChat();
        } else {
            this.currentTicketId = this.generateTicketId();
            this.isNewChat = true;
            this.startNewChat();
        }
        
        // Update UI
        this.welcomeScreen.style.display = 'none';
        this.chatMessages.style.display = 'flex';
        this.chatInputArea.style.display = 'flex';
    }

    startNewChat() {
        this.addMessage(`Hello ${this.userName}! How can we help you today?`, 'bot');
        this.addMessage(`Your ticket ID is: ${this.currentTicketId}. Please save this ID to continue this chat later.`, 'bot');
        
        // Send to backend to create Discord channel
        this.sendToBackend('new_chat', {
            userName: this.userName,
            ticketId: this.currentTicketId
        });
    }

    continueExistingChat() {
        this.addMessage(`Welcome back ${this.userName}! Continuing your previous conversation.`, 'bot');
        
        // Send to backend to fetch previous messages
        this.sendToBackend('continue_chat', {
            userName: this.userName,
            ticketId: this.currentTicketId
        });
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        
        // Send to backend
        this.sendToBackend('user_message', {
            userName: this.userName,
            ticketId: this.currentTicketId,
            message: message
        });
        
        // Simulate typing indicator
        this.showTypingIndicator();
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;
        
        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = '● ● ●';
        
        typingDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(typingDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        // Remove typing indicator after delay (simulate response time)
        setTimeout(() => {
            const indicator = document.getElementById('typingIndicator');
            if (indicator) {
                indicator.remove();
                this.addMessage("Thanks for your message! Our team will respond shortly.", 'bot');
            }
        }, 2000);
    }

    generateTicketId() {
        return 'TKT-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    sendToBackend(action, data) {
        // This is where you'll integrate with your backend
        // For now, we'll just log to console
        console.log(`Backend Action: ${action}`, data);
        
        // Example fetch request (commented out for now)
        /*
        fetch('https://your-backend-url.com/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: action,
                ...data
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Backend response:', data);
        })
        .catch(error => {
            console.error('Error sending to backend:', error);
        });
        */
    }

    // Method to receive messages from backend/Discord
    receiveMessage(message, sender = 'bot') {
        this.addMessage(message, sender);
    }
}

// Initialize chat widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatWidget = new ChatWidget();
});