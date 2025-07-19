# AI Chatbot with OpenAI Integration

A simple AI chatbot that uses OpenAI's GPT-3.5-turbo model to process user messages and maintain conversation history.

## Features

- Real-time chat interface
- OpenAI GPT-3.5-turbo integration
- Conversation history storage
- Session-based conversations
- Modern, responsive UI

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory and add your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

**Important:** Replace `your_openai_api_key_here` with your actual OpenAI API key.

### 3. Start the Servers

**Option A: Run both servers separately**
```bash
# Terminal 1 - Start Backend API Server (Port 3000)
npm run backend

# Terminal 2 - Start Frontend Server (Port 3001)
npm run frontend
```

**Option B: Run with development mode (auto-restart)**
```bash
# Terminal 1 - Backend with auto-restart
npm run dev-backend

# Terminal 2 - Frontend with auto-restart  
npm run dev-frontend
```

### 4. Access the Chatbot

Open your browser and navigate to `http://localhost:3001`

**Backend API:** `http://localhost:3000` (API endpoints only)
**Frontend:** `http://localhost:3001` (Web interface)

## API Endpoints

- `POST /api/chat` - Send a message and get AI response
- `GET /api/conversation/:sessionId` - Get conversation history
- `DELETE /api/conversation/:sessionId` - Clear conversation
- `GET /api/conversations` - Get all conversations (debug)

## Project Structure

```
chatbot/
├── index.html              # Frontend HTML
├── style.css               # CSS styles
├── script.js               # Frontend JavaScript
├── server.js               # Backend API server (Port 3000)
├── frontend-server.js      # Frontend server (Port 3001)
├── package.json            # Dependencies
├── .env                   # Environment variables
└── README.md              # This file
```

## How it Works

1. **Frontend Server (Port 3001)**: Serves HTML/CSS/JS files and proxies API requests to backend
2. **Backend Server (Port 3000)**: Handles API requests and OpenAI integration
3. **Conversation Storage**: Conversations are stored in memory (dictionary) with session IDs
4. **OpenAI Integration**: Uses OpenAI's chat completions API for AI responses
5. **Communication**: Frontend communicates with backend via HTTP API calls

## Security Notes

- The `.env` file should be added to `.gitignore` to keep your API key secure
- In production, consider using a database instead of in-memory storage
- Add rate limiting and input validation for production use

## Troubleshooting

- Make sure your OpenAI API key is valid and has sufficient credits
- Check that all dependencies are installed with `npm install`
- Ensure the server is running on the correct port
- Check browser console for any JavaScript errors 