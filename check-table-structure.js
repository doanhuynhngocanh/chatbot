require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Checking Supabase Table Structure...\n');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

async function checkTableStructure() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Try to get table information
    console.log('📊 Checking conversations table structure...');
    
    // First, let's see if the table exists and what columns it has
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error accessing table:', error);
      console.error('\nThis suggests the table structure might be different than expected.');
      return;
    }
    
    console.log('✅ Table exists and is accessible');
    
    // Let's try to insert a simple test record to see what columns are available
    console.log('\n🧪 Testing with minimal data...');
    
    // Try different column names that might exist
    const testVariations = [
      { conversation_id: 'test-1', messages: [{ role: 'user', content: 'test' }] },
      { conversation_id: 'test-2', message: [{ role: 'user', content: 'test' }] },
      { conversation_id: 'test-3', conversation: [{ role: 'user', content: 'test' }] },
      { conversation_id: 'test-4', data: [{ role: 'user', content: 'test' }] }
    ];
    
    for (let i = 0; i < testVariations.length; i++) {
      const testData = testVariations[i];
      console.log(`\nTrying variation ${i + 1}:`, Object.keys(testData));
      
      const { data: insertData, error: insertError } = await supabase
        .from('conversations')
        .insert([testData])
        .select();
      
      if (insertError) {
        console.log(`❌ Variation ${i + 1} failed:`, insertError.message);
      } else {
        console.log(`✅ Variation ${i + 1} succeeded!`);
        console.log('📝 Inserted data:', insertData);
        
        // Clean up
        await supabase
          .from('conversations')
          .delete()
          .eq('conversation_id', testData.conversation_id);
        
        break;
      }
    }
    
    // Let's also try to get the actual table schema
    console.log('\n📋 Attempting to get table schema...');
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('get_table_schema', { table_name: 'conversations' });
    
    if (schemaError) {
      console.log('⚠️ Could not get schema via RPC, trying alternative method...');
      
      // Try a simple query to see what columns exist
      const { data: sampleData, error: sampleError } = await supabase
        .from('conversations')
        .select('*')
        .limit(1);
      
      if (sampleData && sampleData.length > 0) {
        console.log('📋 Sample record structure:', Object.keys(sampleData[0]));
      }
    } else {
      console.log('📋 Table schema:', schemaData);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkTableStructure(); 