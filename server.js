const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// For Vercel serverless functions
const isVercel = process.env.VERCEL === '1';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

console.log('🔍 Supabase Environment Check:');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Not set');
console.log('SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('VERCEL:', process.env.VERCEL || 'false');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Supabase credentials not set');
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY in environment variables');
  console.error('Supabase integration will be disabled');
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized successfully');
    console.log('🔗 Supabase URL (first 20 chars):', supabaseUrl.substring(0, 20) + '...');
    console.log('🔑 Supabase Key (first 20 chars):', supabaseKey.substring(0, 20) + '...');
  } catch (error) {
    console.error('❌ Error initializing Supabase client:', error);
    supabase = null;
  }
}

// Check if OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY is not set in environment variables');
  console.error('Please set your OpenAI API key in the .env file or environment variables');
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files with proper MIME types
app.use('/style.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, 'style.css'));
});

app.use('/script.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'script.js'));
});

app.use('/debug.html', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, 'debug.html'));
});

// Serve static files from root directory
app.use(express.static(__dirname));

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

    // Save conversation to Supabase
    if (supabase) {
      try {
        const conversationData = {
          conversation_id: sessionId,
          messages: Object.values(conversations[sessionId])
        };

        console.log('💾 Attempting to save conversation to Supabase...');
        console.log('📊 Session ID:', sessionId);
        console.log('📊 Messages count:', Object.values(conversations[sessionId]).length);
        console.log('📊 Environment:', process.env.NODE_ENV || 'development');
        console.log('📊 Vercel:', process.env.VERCEL || 'false');

        // Check if conversation already exists
        const { data: existingConversation, error: selectError } = await supabase
          .from('conversations')
          .select('*')
          .eq('conversation_id', sessionId)
          .single();

        if (selectError && selectError.code !== 'PGRST116') {
          console.error('❌ Error checking existing conversation:', selectError);
        }

        if (existingConversation) {
          // Update existing conversation
          const { error: updateError } = await supabase
            .from('conversations')
            .update({ messages: conversationData.messages })
            .eq('conversation_id', sessionId);

          if (updateError) {
            console.error('❌ Error updating conversation in Supabase:', updateError);
          } else {
            console.log('✅ Conversation updated in Supabase');
          }
        } else {
          // Insert new conversation
          const { error: insertError } = await supabase
            .from('conversations')
            .insert([conversationData]);

          if (insertError) {
            console.error('❌ Error inserting conversation in Supabase:', insertError);
          } else {
            console.log('✅ New conversation saved to Supabase');
          }
        }
      } catch (supabaseError) {
        console.error('❌ Supabase error:', supabaseError);
      }
    } else {
      console.log('⚠️ Supabase not available - conversation saved to local memory only');
    }

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
    console.error('❌ Error in chat endpoint:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to process message';
    let errorDetails = error.message;
    
    if (error.message.includes('401')) {
      errorMessage = 'OpenAI API key is invalid or expired';
      errorDetails = 'Please check your OPENAI_API_KEY in environment variables';
    } else if (error.message.includes('429')) {
      errorMessage = 'OpenAI API rate limit exceeded';
      errorDetails = 'Please wait a moment and try again';
    } else if (error.message.includes('ENOTFOUND')) {
      errorMessage = 'Network error - cannot reach OpenAI API';
      errorDetails = 'Please check your internet connection';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: errorDetails,
      originalError: error.message
    });
  }
});

// API endpoint to get conversation history
app.get('/api/conversation/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    let conversation = {};
    
    if (supabase) {
      // Try to load from Supabase first
      console.log('🔍 Attempting to load conversation from Supabase...');
      const { data: supabaseConversation, error } = await supabase
        .from('conversations')
        .select('messages')
        .eq('conversation_id', sessionId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Error loading conversation from Supabase:', error);
      }

      if (supabaseConversation && supabaseConversation.messages) {
        // Load from Supabase
        conversation = supabaseConversation.messages.reduce((acc, msg, index) => {
          acc[index.toString()] = msg;
          return acc;
        }, {});
        
        // Update local memory
        conversations[sessionId] = conversation;
        console.log('✅ Loaded conversation from Supabase');
      } else {
        // Fall back to local memory
        conversation = conversations[sessionId] || {};
        console.log('📝 Using local conversation data');
      }
    } else {
      // Supabase not available, use local memory
      conversation = conversations[sessionId] || {};
      console.log('⚠️ Supabase not available - using local conversation data');
    }
    
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
    
  } catch (error) {
    console.error('❌ Error in conversation endpoint:', error);
    res.status(500).json({ error: 'Failed to load conversation' });
  }
});

// API endpoint to clear conversation
app.delete('/api/conversation/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    // Delete from Supabase
    if (supabase) {
      const { error: supabaseError } = await supabase
        .from('conversations')
        .delete()
        .eq('conversation_id', sessionId);

      if (supabaseError) {
        console.error('❌ Error deleting conversation from Supabase:', supabaseError);
      } else {
        console.log('✅ Conversation deleted from Supabase');
      }
    } else {
      console.log('⚠️ Supabase not available - skipping database deletion');
    }
    
    // Delete from local memory
    if (conversations[sessionId]) {
      console.log(`\n🗑️ DELETING CONVERSATION: ${sessionId}`);
      console.log(`   Messages deleted: ${Object.keys(conversations[sessionId]).length}`);
    }
    
    delete conversations[sessionId];
    res.json({ message: 'Conversation cleared from memory and database' });
    
  } catch (error) {
    console.error('❌ Error in delete conversation endpoint:', error);
    res.status(500).json({ error: 'Failed to clear conversation' });
  }
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    openaiKeySet: !!process.env.OPENAI_API_KEY,
    supabaseUrlSet: !!process.env.SUPABASE_URL,
    supabaseKeySet: !!process.env.SUPABASE_ANON_KEY,
    supabaseClient: !!supabase,
    environment: process.env.NODE_ENV || 'development',
    vercel: process.env.VERCEL || 'false',
    uptime: process.uptime()
  };
  
  console.log('🏥 Health check:', health);
  res.json(health);
});

// Supabase test endpoint
app.get('/api/test-supabase', async (req, res) => {
  try {
    if (!supabase) {
      return res.json({
        status: 'ERROR',
        message: 'Supabase client not initialized',
        supabaseUrlSet: !!process.env.SUPABASE_URL,
        supabaseKeySet: !!process.env.SUPABASE_ANON_KEY
      });
    }

    // Test connection
    const { data, error } = await supabase
      .from('conversations')
      .select('count')
      .limit(1);

    if (error) {
      return res.json({
        status: 'ERROR',
        message: 'Database connection failed',
        error: error.message,
        code: error.code
      });
    }

    // Test insert
    const testData = {
      conversation_id: 'vercel-test-' + Date.now(),
      messages: [{ role: 'user', content: 'Test message', timestamp: new Date().toISOString() }]
    };

    const { data: insertData, error: insertError } = await supabase
      .from('conversations')
      .insert([testData])
      .select();

    if (insertError) {
      return res.json({
        status: 'ERROR',
        message: 'Insert test failed',
        error: insertError.message,
        code: insertError.code
      });
    }

    // Clean up
    await supabase
      .from('conversations')
      .delete()
      .eq('conversation_id', testData.conversation_id);

    res.json({
      status: 'SUCCESS',
      message: 'Supabase connection and operations working correctly',
      testRecordId: insertData[0].id
    });

  } catch (error) {
    res.json({
      status: 'ERROR',
      message: 'Unexpected error',
      error: error.message
    });
  }
});

// Catch-all route for any unmatched requests
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl,
    availableRoutes: ['/api/chat', '/api/health', '/api/conversation/:sessionId', '/']
  });
});

// For Vercel deployment, export the app
if (!isVercel) {
  // Local development
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Make sure to set your OPENAI_API_KEY in the .env file');
  });
} else {
  // Vercel production
  console.log('🚀 Server exported for Vercel deployment');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('OpenAI Key Set:', !!process.env.OPENAI_API_KEY);
}

module.exports = app; 