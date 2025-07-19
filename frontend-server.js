const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');

const app = express();
const PORT = 3001; // Frontend server port
const BACKEND_URL = 'http://localhost:3000'; // Backend server URL

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Helper function to make HTTP requests to backend
function makeBackendRequest(method, path, data = null) {
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
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
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

// Proxy API requests to backend
app.post('/api/chat', async (req, res) => {
  try {
    const data = await makeBackendRequest('POST', '/api/chat', req.body);
    res.json(data);
  } catch (error) {
    console.error('Error forwarding request to backend:', error);
    res.status(500).json({ error: 'Failed to communicate with backend' });
  }
});

app.get('/api/conversation/:sessionId', async (req, res) => {
  try {
    const data = await makeBackendRequest('GET', `/api/conversation/${req.params.sessionId}`);
    res.json(data);
  } catch (error) {
    console.error('Error forwarding request to backend:', error);
    res.status(500).json({ error: 'Failed to communicate with backend' });
  }
});

app.delete('/api/conversation/:sessionId', async (req, res) => {
  try {
    const data = await makeBackendRequest('DELETE', `/api/conversation/${req.params.sessionId}`);
    res.json(data);
  } catch (error) {
    console.error('Error forwarding request to backend:', error);
    res.status(500).json({ error: 'Failed to communicate with backend' });
  }
});

app.get('/api/conversations', async (req, res) => {
  try {
    const data = await makeBackendRequest('GET', '/api/conversations');
    res.json(data);
  } catch (error) {
    console.error('Error forwarding request to backend:', error);
    res.status(500).json({ error: 'Failed to communicate with backend' });
  }
});

app.get('/api/conversations/raw', async (req, res) => {
  try {
    const data = await makeBackendRequest('GET', '/api/conversations/raw');
    res.json(data);
  } catch (error) {
    console.error('Error forwarding request to backend:', error);
    res.status(500).json({ error: 'Failed to communicate with backend' });
  }
});

app.listen(PORT, () => {
  console.log(`Frontend server running on http://localhost:${PORT}`);
  console.log(`Backend server should be running on ${BACKEND_URL}`);
}); 