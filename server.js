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

// Store conversations in memory as a dictionary
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
      console.log(`   Messages: ${Object.keys(conversations[sessionId]).length}`);
      Object.keys(conversations[sessionId]).forEach(messageId => {
        const msg = conversations[sessionId][messageId];
        const role = msg.role === 'user' ? '👤 USER' : '🤖 AI';
        console.log(`   ${messageId}. ${role}: ${msg.content}`);
      });
    });
  }
  console.log('='.repeat(50) + '\n');
}

// Function to print raw dictionary structure
function printRawDictionary() {
  console.log('\n' + '='.repeat(60));
  console.log('🗂️ RAW CONVERSATION DICTIONARY STRUCTURE:');
  console.log('='.repeat(60));
  console.log(JSON.stringify(conversations, null, 2));
  console.log('='.repeat(60) + '\n');
}

// API Routes only (no static file serving)

// API endpoint to handle chat messages
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Message and sessionId are required' });
    }

    // Initialize conversation for this session if it doesn't exist
    if (!conversations[sessionId]) {
      conversations[sessionId] = {};
    }

    // Generate unique message ID
    const messageId = Date.now().toString();
    
    // Add user message to conversation dictionary
    conversations[sessionId][messageId] = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    // Print user message to console
    console.log(`\n👤 USER (${sessionId}): ${message}`);

    // Prepare messages for OpenAI (include conversation history)
    const messages = [
      { role: 'system', content: 'You are a helpful AI assistant. Be concise and friendly in your responses.' },
      ...Object.values(conversations[sessionId]).map(msg => ({
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

    // Add AI response to conversation dictionary
    const aiMessageId = (Date.now() + 1).toString();
    conversations[sessionId][aiMessageId] = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    };

    // Print AI response to console
    console.log(`🤖 AI (${sessionId}): ${aiResponse}`);

    // Print conversation summary to console
    const conversationMessages = Object.values(conversations[sessionId]);
    console.log(`📊 Conversation ${sessionId} - Total messages: ${conversationMessages.length}`);
    console.log(`   User messages: ${conversationMessages.filter(msg => msg.role === 'user').length}`);
    console.log(`   AI messages: ${conversationMessages.filter(msg => msg.role === 'assistant').length}`);
    
    // Print raw dictionary structure
    printRawDictionary();

    // Return the response
    res.json({
      response: aiResponse,
      conversation: Object.values(conversations[sessionId])
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
  const conversation = conversations[sessionId] || {};
  
  // Print specific conversation to console
  console.log(`\n📖 GETTING CONVERSATION: ${sessionId}`);
  if (Object.keys(conversation).length > 0) {
    Object.keys(conversation).forEach(messageId => {
      const msg = conversation[messageId];
      const role = msg.role === 'user' ? '👤 USER' : '🤖 AI';
      console.log(`   ${messageId}. ${role}: ${msg.content}`);
    });
  } else {
    console.log('   No conversation found for this session.');
  }
  
  res.json({ conversation: Object.values(conversation) });
});

// API endpoint to clear conversation
app.delete('/api/conversation/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  // Print what's being deleted
  if (conversations[sessionId]) {
    console.log(`\n🗑️ DELETING CONVERSATION: ${sessionId}`);
    console.log(`   Messages deleted: ${Object.keys(conversations[sessionId]).length}`);
  }
  
  delete conversations[sessionId];
  res.json({ message: 'Conversation cleared' });
});

// API endpoint to get all conversations (for debugging)
app.get('/api/conversations', (req, res) => {
  // Print all conversations to console
  printConversationsToConsole();
  res.json({ conversations });
});

// API endpoint to get raw dictionary structure
app.get('/api/conversations/raw', (req, res) => {
  // Print raw dictionary to console
  printRawDictionary();
  res.json({ 
    message: 'Raw dictionary printed to console',
    conversations: conversations 
  });
});

app.listen(PORT, () => {
  console.log(`Backend API server running on http://localhost:${PORT}`);
  console.log('This server handles API requests only');
  console.log('Frontend should be running on http://localhost:3001');
}); 