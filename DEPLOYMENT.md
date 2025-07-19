# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install with `npm i -g vercel`
3. **OpenAI API Key**: Get from [platform.openai.com](https://platform.openai.com)

## Step 1: Prepare Your Code

The code is already configured for Vercel deployment with:
- ✅ `vercel.json` configuration
- ✅ Single server setup
- ✅ Static file serving
- ✅ API endpoints

## Step 2: Set Environment Variables

### Option A: Using Vercel Dashboard
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key
   - **Environment**: Production, Preview, Development

### Option B: Using Vercel CLI
```bash
vercel env add OPENAI_API_KEY
# Enter your OpenAI API key when prompted
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI
```bash
# Login to Vercel
vercel login

# Deploy
vercel

# For production
vercel --prod
```

### Option B: Using GitHub Integration
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Vercel will automatically deploy on every push

## Step 4: Access Your Chatbot

After deployment, you'll get a URL like:
- `https://your-project.vercel.app`

## Troubleshooting

### Issue: "Cannot find module 'openai'"
**Solution**: Make sure all dependencies are in `package.json`

### Issue: "OPENAI_API_KEY is not defined"
**Solution**: Set the environment variable in Vercel dashboard

### Issue: "Cannot GET /"
**Solution**: The server should serve static files. Check `vercel.json` configuration.

### Issue: API calls not working
**Solution**: 
1. Check environment variables are set
2. Verify API endpoints are correct
3. Check Vercel function logs

## Local Testing

Test locally before deploying:
```bash
npm install
npm start
# Visit http://localhost:3000
```

## Important Notes

- **Conversation Storage**: Conversations are stored in memory and will reset on each serverless function invocation
- **Rate Limits**: Be aware of OpenAI API rate limits
- **Environment**: Make sure `OPENAI_API_KEY` is set in all environments (Production, Preview, Development)

## File Structure for Vercel

```
chatbot/
├── server.js           # Main server file
├── vercel.json         # Vercel configuration
├── package.json        # Dependencies
├── index.html          # Frontend
├── style.css           # Styles
├── script.js           # Frontend logic
└── .env               # Local environment (not deployed)
``` 