require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testing Supabase Connection...\n');

// Check environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('Environment Variables:');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Not set');
console.log('SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Not set');

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ ERROR: Supabase credentials not set');
  console.error('Please add to your .env file:');
  console.error('SUPABASE_URL=your_supabase_project_url');
  console.error('SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

// Test Supabase connection
async function testSupabase() {
  try {
    console.log('\n🔗 Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('✅ Supabase client created successfully');
    
    // Test connection by querying the conversations table
    console.log('\n📊 Testing database connection...');
    const { data, error } = await supabase
      .from('conversations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      console.error('\nPossible issues:');
      console.error('1. Check if your Supabase URL is correct');
      console.error('2. Check if your Supabase key is correct');
      console.error('3. Check if the "conversations" table exists');
      console.error('4. Check if your table has the correct structure');
    } else {
      console.log('✅ Database connection successful!');
      console.log('✅ "conversations" table is accessible');
    }
    
    // Test inserting a sample record
    console.log('\n🧪 Testing insert operation...');
    const testData = {
      conversation_id: 'test-' + Date.now(),
      messages: [
        { role: 'user', content: 'Test message', timestamp: new Date().toISOString() }
      ]
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('conversations')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
    } else {
      console.log('✅ Insert test successful!');
      console.log('📝 Inserted record:', insertData);
      
      // Clean up test record
      const { error: deleteError } = await supabase
        .from('conversations')
        .delete()
        .eq('conversation_id', testData.conversation_id);
      
      if (deleteError) {
        console.error('⚠️ Could not clean up test record:', deleteError);
      } else {
        console.log('✅ Test record cleaned up');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testSupabase(); 