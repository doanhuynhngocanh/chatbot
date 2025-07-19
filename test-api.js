// Test script to check API endpoints
const http = require('http');

const BASE_URL = 'http://localhost:3000';

function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await testEndpoint('/api/health');
    console.log('   Status:', health.status);
    console.log('   Response:', health.data);
    console.log('   OpenAI Key Set:', health.data.openaiKeySet);
    console.log('');

    // Test chat endpoint
    console.log('2. Testing chat endpoint...');
    const chatData = {
      message: 'Hello, how are you?',
      sessionId: 'test_session_' + Date.now()
    };
    const chat = await testEndpoint('/api/chat', 'POST', chatData);
    console.log('   Status:', chat.status);
    if (chat.status === 200) {
      console.log('   ✅ Chat endpoint working');
    } else {
      console.log('   ❌ Chat endpoint failed:', chat.data);
    }
    console.log('');

    // Test conversations endpoint
    console.log('3. Testing conversations endpoint...');
    const conversations = await testEndpoint('/api/conversations');
    console.log('   Status:', conversations.status);
    console.log('   Response:', conversations.data);
    console.log('');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
runTests(); 