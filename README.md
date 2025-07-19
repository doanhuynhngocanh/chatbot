# AI Chatbot with Supabase

A simple AI chatbot with OpenAI integration and Supabase database storage.

## Features

- 🤖 AI-powered conversations using OpenAI GPT-3.5
- 💾 Persistent conversation storage in Supabase
- 🔄 New chat functionality (keeps previous conversations)
- 🌐 Deployable on Vercel
- 📱 Responsive design

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file with your credentials:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run locally:
   ```bash
   npm start
   ```

4. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

## Files

- `server.js` - Main backend server
- `index.html` - Frontend interface
- `script.js` - Frontend JavaScript
- `style.css` - Styling
- `package.json` - Dependencies
- `api/` - Vercel serverless functions 