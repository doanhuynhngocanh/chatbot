// Generate a unique session ID for this conversation
const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

// DOM elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// Add event listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Function to add a message to the chat
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = new Date().toLocaleTimeString();
    
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(messageTime);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to send message to backend
async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, true);
    
    // Clear input
    userInput.value = '';
    
    // Disable input while processing
    userInput.disabled = true;
    sendButton.disabled = true;
    
    try {
        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing';
        typingDiv.innerHTML = '<div class="message-content">🤖 AI is typing...</div>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Send message to backend
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                sessionId: sessionId
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Remove typing indicator
        chatMessages.removeChild(typingDiv);
        
        // Add AI response to chat
        addMessage(data.response);
        
    } catch (error) {
        console.error('Error:', error);
        
        // Remove typing indicator
        const typingDiv = document.querySelector('.typing');
        if (typingDiv) {
            chatMessages.removeChild(typingDiv);
        }
        
        // Show error message
        addMessage('Sorry, I encountered an error. Please try again.');
    } finally {
        // Re-enable input
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus();
    }
}

// Add some CSS for typing indicator
const style = document.createElement('style');
style.textContent = `
    .typing .message-content {
        font-style: italic;
        color: #666;
    }
`;
document.head.appendChild(style); 