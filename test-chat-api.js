// Use built-in fetch (available in Node.js 18+)

async function testChatAPI() {
  console.log('🧪 Testing Chat API Endpoint...\n');
  
  const sessionId = 'test-session-' + Date.now();
  const testMessage = 'Hello, this is a test message';
  
  console.log('📝 Session ID:', sessionId);
  console.log('💬 Test message:', testMessage);
  
  try {
    // Test 1: Send a message to the chat API
    console.log('\n🧪 Test 1: Sending message to chat API...');
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: testMessage,
        sessionId: sessionId
      })
    });
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Chat API response received');
    console.log('🤖 AI Response:', data.response);
    console.log('📊 Conversation length:', data.conversation.length);
    
    // Test 2: Check if conversation was saved to Supabase
    console.log('\n🧪 Test 2: Checking if conversation was saved to Supabase...');
    const { createClient } = require('@supabase/supabase-js');
    require('dotenv').config();
    
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    
    const { data: supabaseData, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('conversation_id', sessionId)
      .single();
    
    if (error) {
      console.error('❌ Error checking Supabase:', error);
    } else if (supabaseData) {
      console.log('✅ Conversation found in Supabase!');
      console.log('📝 Conversation ID:', supabaseData.conversation_id);
      console.log('💬 Messages count:', supabaseData.messages.length);
      console.log('📅 Created at:', supabaseData.created_at);
      
      // Show the messages
      supabaseData.messages.forEach((msg, index) => {
        const role = msg.role === 'user' ? '👤 USER' : '🤖 AI';
        console.log(`   ${index + 1}. ${role}: ${msg.content}`);
      });
    } else {
      console.log('❌ Conversation not found in Supabase');
    }
    
    // Test 3: Clean up test data
    console.log('\n🧪 Test 3: Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('conversation_id', sessionId);
    
    if (deleteError) {
      console.error('❌ Cleanup failed:', deleteError);
    } else {
      console.log('✅ Test data cleaned up');
    }
    
    console.log('\n🎉 Chat API test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testChatAPI(); 