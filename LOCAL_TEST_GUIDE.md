# 🧪 Local Testing Guide: Supabase + Groq

## 🚀 **Quick Setup (10 minutes)**

### **Step 1: Get Groq API Key (2 minutes)**
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up with GitHub
3. **API Keys** → **Create API Key**
4. Copy the key (starts with `gsk_...`)

### **Step 2: Set Up Supabase (5 minutes)**
1. Go to [supabase.com](https://supabase.com)
2. **New Project**: `ai-notes-local-test`
3. Wait ~2 minutes for setup
4. **SQL Editor** → **New Query**
5. Copy and paste contents of `supabase-setup.sql`
6. Click **Run**
7. **Settings** → **API** → Copy:
   - **Project URL**
   - **anon public key**

### **Step 3: Update .env File**
Replace the placeholder values in your `.env`:

```bash
# AI Configuration
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_actual_groq_key_here

# Database Configuration
DB_TYPE=supabase
SUPABASE_URL=https://your-actual-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your_actual_key
```

### **Step 4: Run Tests**
```bash
npm run test:local
```

## 🎯 **What the Test Does:**

### **Database Tests (Supabase):**
1. ✅ **Create Note** - Tests database connection
2. ✅ **List Notes** - Tests query functionality  
3. ✅ **Get Note** - Tests individual retrieval
4. ✅ **Update Note** - Tests modification

### **AI Tests (Groq):**
1. ✅ **Enrich Text** - Tests AI summarization
2. ✅ **Extract Tags** - Tests keyword extraction
3. ✅ **Update Database** - Tests AI + DB integration

## 📊 **Expected Output:**
```
🧪 Testing Supabase + Groq Integration Locally

🔧 Configuration:
   Database: supabase
   AI Provider: groq
   Supabase URL: Set
   Groq API Key: Set

📊 Testing Database (Supabase)...
1. Creating a note...
✅ Note created: { id: '123...', text: 'This is a test note about artificial...' }

2. Listing all notes...
✅ Found 1 notes

3. Getting specific note...
✅ Retrieved note: Found

🤖 Testing AI (Groq)...
1. Enriching note with AI...
✅ AI enrichment successful:
   Summary: A test note discussing AI and ML algorithms
   Tags: ['artificial', 'intelligence', 'machine', 'learning', 'algorithms']

2. Updating note with AI results...
✅ Note updated with AI enrichment

🎉 All tests passed! Supabase + Groq integration working perfectly.
```

## 🔧 **Troubleshooting:**

### **"Missing Supabase environment variables"**
- Check `.env` file has correct `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Make sure no extra spaces in the values

### **"relation 'notes' does not exist"**
- Run the SQL script in Supabase SQL Editor
- Check the table was created in **Table Editor**

### **"Invalid API key" (Groq)**
- Check your Groq API key starts with `gsk_`
- Make sure it's copied correctly without spaces

### **"AI provider not available"**
- Check `AI_PROVIDER=groq` in `.env`
- Verify `GROQ_API_KEY` is set

## 🎉 **Success Criteria:**
- ✅ Database operations work (create, read, update)
- ✅ AI enrichment works (summary + tags)
- ✅ Integration works (AI results saved to DB)
- ✅ No errors in console

## 🚀 **Next Steps:**
Once local testing passes:
1. **Deploy to Vercel** with same environment variables
2. **Test production** deployment
3. **Add more AI providers** if desired

Your local setup will be identical to production! 🎯