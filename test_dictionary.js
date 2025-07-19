// Test script to demonstrate dictionary structure for conversations
const conversations = {};

// Simulate adding messages to a conversation using dictionary structure
function addMessage(sessionId, role, content) {
  if (!conversations[sessionId]) {
    conversations[sessionId] = {};
  }
  
  const messageId = Date.now().toString();
  conversations[sessionId][messageId] = {
    role: role,
    content: content,
    timestamp: new Date().toISOString()
  };
  
  console.log(`Added ${role} message (ID: ${messageId}) to session ${sessionId}`);
  console.log(`Total messages in session: ${Object.keys(conversations[sessionId]).length}`);
}

// Test the dictionary structure
console.log('=== Testing Dictionary Structure ===\n');

// Create a test session
const testSessionId = 'test_session_123';

// Add some test messages
addMessage(testSessionId, 'user', 'Hello, how are you?');
addMessage(testSessionId, 'assistant', 'I\'m doing well, thank you! How can I help you today?');
addMessage(testSessionId, 'user', 'Can you help me with programming?');
addMessage(testSessionId, 'assistant', 'Of course! I\'d be happy to help you with programming. What specific language or topic are you working on?');

// Display the conversation dictionary structure
console.log('\n=== Conversation Dictionary Structure ===');
console.log(JSON.stringify(conversations, null, 2));

// Show how to access messages by ID
console.log('\n=== Accessing Messages by ID ===');
Object.keys(conversations[testSessionId]).forEach(messageId => {
  const msg = conversations[testSessionId][messageId];
  console.log(`Message ID: ${messageId}`);
  console.log(`  Role: ${msg.role}`);
  console.log(`  Content: ${msg.content}`);
  console.log(`  Timestamp: ${msg.timestamp}`);
  console.log('---');
});

// Show statistics
const conversationMessages = Object.values(conversations[testSessionId]);
const stats = {
  totalMessages: conversationMessages.length,
  userMessages: conversationMessages.filter(msg => msg.role === 'user').length,
  assistantMessages: conversationMessages.filter(msg => msg.role === 'assistant').length,
  messageIds: Object.keys(conversations[testSessionId])
};

console.log('\n=== Dictionary Statistics ===');
console.log(JSON.stringify(stats, null, 2)); 