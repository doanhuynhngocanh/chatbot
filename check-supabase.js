require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Checking Supabase for saved conversations...\n');

async function checkSupabase() {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    
    // Check for the test conversation
    console.log('🔍 Looking for test conversation...');
    const { data: testData, error: testError } = await supabase
      .from('conversations')
      .select('*')
      .eq('conversation_id', 'test-123')
      .single();
    
    if (testError && testError.code !== 'PGRST116') {
      console.error('❌ Error checking test conversation:', testError);
    } else if (testData) {
      console.log('✅ Test conversation found in Supabase!');
      console.log('📝 Conversation ID:', testData.conversation_id);
      console.log('💬 Messages count:', testData.messages.length);
      console.log('📅 Created at:', testData.created_at);
      
      testData.messages.forEach((msg, index) => {
        const role = msg.role === 'user' ? '👤 USER' : '🤖 AI';
        console.log(`   ${index + 1}. ${role}: ${msg.content}`);
      });
    } else {
      console.log('❌ Test conversation not found in Supabase');
    }
    
    // Check for all conversations
    console.log('\n📊 Checking all conversations in Supabase...');
    const { data: allData, error: allError } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allError) {
      console.error('❌ Error fetching all conversations:', allError);
    } else {
      console.log(`✅ Found ${allData.length} conversations in Supabase:`);
      
      allData.forEach((conv, index) => {
        console.log(`\n${index + 1}. Conversation ID: ${conv.conversation_id}`);
        console.log(`   Created: ${conv.created_at}`);
        console.log(`   Messages: ${conv.messages.length}`);
        console.log(`   ID: ${conv.id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkSupabase(); 