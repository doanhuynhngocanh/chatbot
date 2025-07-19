require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Debugging Vercel Supabase Connection...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Not set');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('VERCEL:', process.env.VERCEL || 'false');

if (process.env.SUPABASE_URL) {
  console.log('🔗 Supabase URL (first 20 chars):', process.env.SUPABASE_URL.substring(0, 20) + '...');
}
if (process.env.SUPABASE_ANON_KEY) {
  console.log('🔑 Supabase Key (first 20 chars):', process.env.SUPABASE_ANON_KEY.substring(0, 20) + '...');
}

async function testVercelSupabase() {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('\n❌ ERROR: Supabase credentials not set in Vercel environment');
      console.error('Please check your Vercel environment variables:');
      console.error('1. Go to your Vercel project dashboard');
      console.error('2. Navigate to Settings > Environment Variables');
      console.error('3. Add SUPABASE_URL and SUPABASE_ANON_KEY');
      return;
    }

    console.log('\n🔗 Creating Supabase client for Vercel...');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    
    console.log('✅ Supabase client created successfully');
    
    // Test connection
    console.log('\n🧪 Testing database connection...');
    const { data, error } = await supabase
      .from('conversations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      console.error('\nPossible issues:');
      console.error('1. Check if your Supabase URL is correct');
      console.error('2. Check if your Supabase key is correct');
      console.error('3. Check if your table has proper permissions');
      console.error('4. Check if your Supabase project is active');
    } else {
      console.log('✅ Database connection successful!');
    }
    
    // Test insert
    console.log('\n🧪 Testing insert operation...');
    const testData = {
      conversation_id: 'vercel-test-' + Date.now(),
      messages: [
        { role: 'user', content: 'Vercel test message', timestamp: new Date().toISOString() }
      ]
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('conversations')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
      console.error('\nThis suggests a permissions or configuration issue');
    } else {
      console.log('✅ Insert test successful!');
      console.log('📝 Inserted record ID:', insertData[0].id);
      
      // Clean up
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

testVercelSupabase(); 