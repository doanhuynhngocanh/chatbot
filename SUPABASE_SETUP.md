# Supabase Integration Setup

## Environment Variables

Add these to your `.env` file:

```env
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Supabase Table Structure

Your `conversations` table should have these columns:

```sql
CREATE TABLE conversations (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conversation_id TEXT NOT NULL,
  messages JSONB NOT NULL
);
```

## Installation

Install the Supabase dependency:

```bash
npm install @supabase/supabase-js
```

## Features

✅ **Automatic Conversation Storage**: All conversations are saved to Supabase
✅ **Conversation Loading**: Conversations are loaded from Supabase when available
✅ **Conversation Deletion**: Conversations are deleted from both memory and database
✅ **Fallback to Local**: If Supabase is unavailable, falls back to local memory
✅ **Error Handling**: Graceful error handling for database operations

## API Endpoints

- `POST /api/chat` - Send message and save to Supabase
- `GET /api/conversation/:sessionId` - Load conversation from Supabase
- `DELETE /api/conversation/:sessionId` - Delete conversation from Supabase

## Vercel Deployment

Make sure to add these environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add:
   - `OPENAI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY` 