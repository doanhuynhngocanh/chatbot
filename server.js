const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Store conversations in memory (in production, use a database)
const conversations = {};

// Function to print all conversations to console
function printConversationsToConsole() {
  console.log('\n' + '='.repeat(50));
  console.log('📚 ALL CONVERSATIONS IN DICTIONARY:');
  console.log('='.repeat(50));
  
  if (Object.keys(conversations).length === 0) {
    console.log('No conversations yet.');
  } else {
    Object.keys(conversations).forEach(sessionId => {
      console.log(`\n🔗 Session: ${sessionId}`);
      console.log(`   Messages: ${conversations[sessionId].length}`);
      conversations[sessionId].forEach((msg, index) => {
        const role = msg.role === 'user' ? '👤 USER' : '🤖 AI';
        console.log(`   ${index + 1}. ${role}: ${msg.content}`);
      });
    });
  }
  console.log('='.repeat(50) + '\n');
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to handle chat messages
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Message and sessionId are required' });
    }

    // Initialize conversation for this session if it doesn't exist
    if (!conversations[sessionId]) {
      conversations[sessionId] = [];
    }

    // Add user message to conversation
    conversations[sessionId].push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // Print user message to console
    console.log(`\n👤 USER (${sessionId}): ${message}`);

    // Prepare messages for OpenAI (include conversation history)
    const messages = [
      { role: 'system', content: 'You are a helpful AI assistant. Be concise and friendly in your responses.' },
      ...conversations[sessionId].map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    // Add AI response to conversation
    conversations[sessionId].push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    });

    // Print AI response to console
    console.log(`🤖 AI (${sessionId}): ${aiResponse}`);

    // Print conversation summary to console
    console.log(`📊 Conversation ${sessionId} - Total messages: ${conversations[sessionId].length}`);
    console.log(`   User messages: ${conversations[sessionId].filter(msg => msg.role === 'user').length}`);
    console.log(`   AI messages: ${conversations[sessionId].filter(msg => msg.role === 'assistant').length}`);

    // Return the response
    res.json({
      response: aiResponse,
      conversation: conversations[sessionId]
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error.message 
    });
  }
});

// API endpoint to get conversation history
app.get('/api/conversation/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const conversation = conversations[sessionId] || [];
  
  // Print specific conversation to console
  console.log(`\n📖 GETTING CONVERSATION: ${sessionId}`);
  if (conversation.length > 0) {
    conversation.forEach((msg, index) => {
      const role = msg.role === 'user' ? '👤 USER' : '🤖 AI';
      console.log(`   ${index + 1}. ${role}: ${msg.content}`);
    });
  } else {
    console.log('   No conversation found for this session.');
  }
  
  res.json({ conversation });
});

// API endpoint to clear conversation
app.delete('/api/conversation/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  delete conversations[sessionId];
  res.json({ message: 'Conversation cleared' });
});

// API endpoint to get all conversations (for debugging)
app.get('/api/conversations', (req, res) => {
  res.json({ conversations });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 