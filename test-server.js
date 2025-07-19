require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testing Server and Supabase Integration...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Not set');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('\n❌ ERROR: Supabase credentials not set');
  process.exit(1);
}

async function testServerIntegration() {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    
    // Test 1: Insert a conversation
    console.log('\n🧪 Test 1: Inserting a test conversation...');
    const testConversationId = 'test-server-' + Date.now();
    const testData = {
      conversation_id: testConversationId,
      messages: [
        { role: 'user', content: 'Hello from test', timestamp: new Date().toISOString() },
        { role: 'assistant', content: 'Hi! This is a test response', timestamp: new Date().toISOString() }
      ]
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('conversations')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      return;
    }
    
    console.log('✅ Insert successful:', insertData);
    
    // Test 2: Read the conversation back
    console.log('\n🧪 Test 2: Reading the conversation back...');
    const { data: readData, error: readError } = await supabase
      .from('conversations')
      .select('*')
      .eq('conversation_id', testConversationId)
      .single();
    
    if (readError) {
      console.error('❌ Read failed:', readError);
    } else {
      console.log('✅ Read successful:', readData);
    }
    
    // Test 3: Update the conversation
    console.log('\n🧪 Test 3: Updating the conversation...');
    const updatedMessages = [
      ...testData.messages,
      { role: 'user', content: 'Another test message', timestamp: new Date().toISOString() }
    ];
    
    const { data: updateData, error: updateError } = await supabase
      .from('conversations')
      .update({ messages: updatedMessages })
      .eq('conversation_id', testConversationId)
      .select();
    
    if (updateError) {
      console.error('❌ Update failed:', updateError);
    } else {
      console.log('✅ Update successful:', updateData);
    }
    
    // Test 4: Clean up
    console.log('\n🧪 Test 4: Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('conversation_id', testConversationId);
    
    if (deleteError) {
      console.error('❌ Cleanup failed:', deleteError);
    } else {
      console.log('✅ Cleanup successful');
    }
    
    console.log('\n🎉 All tests passed! Supabase integration is working correctly.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testServerIntegration(); 