# Vercel Supabase Troubleshooting Guide

## 🔍 **Debug Steps:**

### **1. Check Environment Variables on Vercel:**

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Verify these variables are set:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anon/public key
   - `OPENAI_API_KEY` - Your OpenAI API key

### **2. Test Supabase Connection:**

After deploying, visit these URLs to test:

- **Health Check**: `https://your-app.vercel.app/api/health`
- **Supabase Test**: `https://your-app.vercel.app/api/test-supabase`

### **3. Check Vercel Logs:**

1. Go to your Vercel project dashboard
2. Click on the latest deployment
3. Check **Functions** tab for server logs
4. Look for Supabase initialization messages

### **4. Common Issues & Solutions:**

#### **Issue: Environment Variables Not Set**
```
❌ ERROR: Supabase credentials not set
```
**Solution**: Add environment variables in Vercel dashboard

#### **Issue: Supabase Client Not Initialized**
```
Supabase integration will be disabled
```
**Solution**: Check if URL and key are correct

#### **Issue: Database Connection Failed**
```
❌ Database connection failed
```
**Solution**: 
- Check Supabase project is active
- Verify table permissions
- Check network connectivity

#### **Issue: Insert Permission Denied**
```
❌ Insert test failed
```
**Solution**: 
- Check Supabase RLS (Row Level Security) policies
- Verify table permissions for anonymous users

### **5. Supabase Table Permissions:**

Make sure your `conversations` table allows:
- **SELECT** for anonymous users
- **INSERT** for anonymous users  
- **UPDATE** for anonymous users
- **DELETE** for anonymous users

### **6. Test Locally First:**

```bash
# Test local environment
node debug-vercel.js

# Test local server
npm start
# Then visit: http://localhost:3000/api/test-supabase
```

### **7. Vercel Deployment Commands:**

```bash
# Deploy to Vercel
vercel --prod

# Check deployment status
vercel ls
```

### **8. Debug Endpoints:**

- `/api/health` - Check environment variables
- `/api/test-supabase` - Test database connection
- `/api/conversations` - List all conversations

### **9. Expected Logs:**

**Successful initialization:**
```
✅ Supabase client initialized successfully
🔗 Supabase URL (first 20 chars): https://your-project.supabase.co...
🔑 Supabase Key (first 20 chars): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Successful save:**
```
💾 Attempting to save conversation to Supabase...
✅ New conversation saved to Supabase
```

### **10. If Still Not Working:**

1. **Check Supabase Dashboard** - Verify project is active
2. **Test API Keys** - Use Supabase dashboard to test
3. **Check Network** - Ensure Vercel can reach Supabase
4. **Review Logs** - Check both Vercel and Supabase logs
5. **Contact Support** - If all else fails

## 🚀 **Quick Fix Checklist:**

- [ ] Environment variables set in Vercel
- [ ] Supabase project is active
- [ ] Table permissions allow anonymous access
- [ ] API keys are correct
- [ ] Network connectivity works
- [ ] Server logs show successful initialization 