# 🚀 Supabase Setup Guide (5 Minutes)

## Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Click "Start your project"**
3. **Sign up with GitHub** (recommended)
4. **Click "New Project"**
5. **Fill in details:**
   - Organization: Your GitHub username
   - Project name: `ai-notes-db`
   - Database password: Generate a strong password (save it!)
   - Region: Choose closest to you
6. **Click "Create new project"**
7. **Wait ~2 minutes** for project to be ready

## Step 2: Create Database Table

1. **Go to SQL Editor** (left sidebar)
2. **Click "New query"**
3. **Copy and paste** the contents of `supabase-setup.sql`
4. **Click "Run"** to create the table

## Step 3: Get API Credentials

1. **Go to Settings** → **API** (left sidebar)
2. **Copy these values:**
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public key**: `eyJ...` (long string)

## Step 4: Add to Vercel Environment Variables

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Select your project**: `ai-tagged-notes-mcp`
3. **Go to Settings** → **Environment Variables**
4. **Add these variables:**

```bash
DB_TYPE=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_key_here
```

## Step 5: Deploy

```bash
git add .
git commit -m "Add Supabase database support"
git push
vercel --prod
```

## ✅ **What You Get:**

- ✅ **Persistent database** - Data survives deployments
- ✅ **Real-time updates** - See changes instantly
- ✅ **Full SQL support** - Complex queries and relationships
- ✅ **Generous free tier** - 500MB database, 2GB bandwidth
- ✅ **Automatic backups** - Point-in-time recovery
- ✅ **Dashboard** - View and edit data directly

## 🔧 **Testing Your Setup:**

1. **Visit your Vercel app**
2. **Create a note**
3. **Enrich it with AI**
4. **Check Supabase dashboard** - you should see the data!

## 🎯 **Benefits Over Memory Database:**

| Feature | Memory DB | Supabase |
|---------|-----------|----------|
| **Persistence** | ❌ Lost on restart | ✅ Permanent |
| **Scalability** | ❌ Limited | ✅ Unlimited |
| **Backup** | ❌ None | ✅ Automatic |
| **Real-time** | ❌ No | ✅ Yes |
| **Dashboard** | ❌ No | ✅ Yes |
| **Cost** | Free | Free tier |

## 🚨 **Troubleshooting:**

### **"Missing Supabase environment variables"**
- Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in Vercel
- Make sure there are no extra spaces in the values

### **"relation 'notes' does not exist"**
- Run the SQL script in Supabase SQL Editor
- Check that the table was created in the Tables view

### **"Row Level Security policy violation"**
- The SQL script includes a permissive policy
- For production, you might want to restrict access

## 🎉 **You're Done!**

Your app now has a **persistent, scalable database** that works perfectly with Vercel serverless functions!