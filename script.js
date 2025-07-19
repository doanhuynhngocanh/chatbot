document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    // Fixed bot responses
    const botResponses = {
        greetings: [
            "Hello! How can I help you today?",
            "Hi there! What can I assist you with?",
            "Greetings! How may I be of service?"
        ],
        help: [
            "I'm here to help! What would you like to know?",
            "I can assist you with various topics. What do you need help with?",
            "Feel free to ask me anything!"
        ],
        weather: [
            "I can't check the weather in real-time, but I'd recommend checking a weather app or website for accurate information.",
            "For current weather conditions, you might want to check a weather service online.",
            "I don't have access to real-time weather data, but I can help you with other questions!"
        ],
        time: [
            `The current time is ${new Date().toLocaleTimeString()}.`,
            `It's currently ${new Date().toLocaleTimeString()}.`,
            `Right now it's ${new Date().toLocaleTimeString()}.`
        ],
        thanks: [
            "You're welcome! Is there anything else I can help you with?",
            "Glad I could help! Let me know if you need anything else.",
            "My pleasure! Feel free to ask more questions."
        ],
        goodbye: [
            "Goodbye! Have a great day!",
            "See you later! Take care!",
            "Farewell! Come back anytime!"
        ],
        default: [
            "That's interesting! Tell me more.",
            "I'm not sure I understand. Could you rephrase that?",
            "Interesting question! What else would you like to know?",
            "I'm here to chat! What's on your mind?"
        ]
    };

    function getBotResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Check for different types of messages
        if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
            return getRandomResponse(botResponses.greetings);
        } else if (message.includes('help') || message.includes('assist')) {
            return getRandomResponse(botResponses.help);
        } else if (message.includes('weather')) {
            return getRandomResponse(botResponses.weather);
        } else if (message.includes('time') || message.includes('what time')) {
            return getRandomResponse(botResponses.time);
        } else if (message.includes('thank') || message.includes('thanks')) {
            return getRandomResponse(botResponses.thanks);
        } else if (message.includes('bye') || message.includes('goodbye') || message.includes('see you')) {
            return getRandomResponse(botResponses.goodbye);
        } else {
            return getRandomResponse(botResponses.default);
        }
    }

    function getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

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

    function handleUserInput() {
        const message = userInput.value.trim();
        
        if (message === '') return;
        
        // Add user message
        addMessage(message, true);
        
        // Clear input
        userInput.value = '';
        
        // Simulate typing delay
        setTimeout(() => {
            const botResponse = getBotResponse(message);
            addMessage(botResponse, false);
        }, 500);
    }

    function getSessionId() {
        let sessionId = localStorage.getItem('chatbot_session_id');
        if (!sessionId) {
            sessionId = Math.random().toString(36).substr(2, 9) + Date.now();
            localStorage.setItem('chatbot_session_id', sessionId);
        }
        return sessionId;
    }

    document.getElementById('sendButton').addEventListener('click', sendMessage);
    document.getElementById('userInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    async function sendMessage() {
        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();
        if (!message) return;
        appendMessage('user', message, 'Just now');
        userInput.value = '';
        userInput.disabled = true;
        document.getElementById('sendButton').disabled = true;
        try {
            const res = await fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, sessionId: getSessionId() })
            });
            const data = await res.json();
            if (data.reply) {
                appendMessage('bot', data.reply, 'Just now');
            } else {
                appendMessage('bot', 'Sorry, I could not get a response.', 'Just now');
            }
        } catch (err) {
            appendMessage('bot', 'Error connecting to server.', 'Just now');
        }
        userInput.disabled = false;
        document.getElementById('sendButton').disabled = false;
        userInput.focus();
    }

    function appendMessage(sender, text, time) {
        const chatMessages = document.getElementById('chatMessages');
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message ' + (sender === 'user' ? 'user-message' : 'bot-message');
        msgDiv.innerHTML = `<div class="message-content">${text}</div><div class="message-time">${time}</div>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Focus on input when page loads
    userInput.focus();
}); 