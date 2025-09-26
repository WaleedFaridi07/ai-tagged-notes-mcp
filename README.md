# AI Tagged Notes MCP Server

A comprehensive note-taking system with AI-powered enrichment, featuring multiple interfaces and persistent storage options.

## 🌟 Features

- **🤖 AI-Powered Enrichment**: Generate smart summaries and relevant tags using:
  - **Direct Llama** (Free, Local, Zero Setup) - Recommended ⭐
  - **Groq** (Free Tier, Lightning Fast) - Great for production
  - **OpenAI** (Paid, Highest Quality) - Premium option
- **🌐 Multiple Interfaces**: Web UI, MCP protocol, and REST API
- **💾 Flexible Storage**: SQLite (default), Supabase (cloud), or in-memory options
- **⚡ MCP Integration**: Works seamlessly with Kiro IDE
- **🎨 Modern React Frontend**: Beautiful, responsive web interface with custom UI components
- **📝 Full CRUD Operations**: Create, read, update, and delete notes and tags
- **🎯 Custom UI Components**: Toast notifications and confirmation modals
- **⏳ Loading States**: Comprehensive loading indicators for all operations
- **🔒 TypeScript**: Full type safety throughout the codebase
- **🚀 Zero Configuration**: Works out of the box with SQLite and Direct Llama

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Web UI │    │   Kiro IDE      │    │   HTTP Client   │
│   (Port 3000)   │    │   (MCP)         │    │   (API)         │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ HTTP API             │ MCP Protocol         │ REST API
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │     Node.js Server        │
                    │     (Port 8080)           │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │     Database Layer        │
                    │  ┌─────────┬─────────┐    │
                    │  │ SQLite  │Supabase │    │
                    │  │(default)│ (cloud) │    │
                    │  └─────────┴─────────┘    │
                    └───────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- npm or yarn
- OpenAI API key (for AI enrichment)

### Quick Setup (Recommended)

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd ai-tagged-notes-mcp
   ./setup.sh
   ```

2. **Start the application**
   ```bash
   npm start
   ```

3. **Access the application**
   - Web UI: http://localhost:8080
   - API: http://localhost:8080/api
   - Health check: http://localhost:8080/health

### Manual Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-tagged-notes-mcp
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key (optional)
   # The system works without an API key using rule-based enrichment
   ```

4. **Build the project**
   ```bash
   npm run build:all
   ```

5. **Start the server**
   ```bash
   npm start
   ```

## 🛠️ Development

### Development Mode

Run backend and frontend separately with hot reload:

```bash
# Terminal 1: Backend API server
npm run dev

# Terminal 2: React frontend with hot reload
npm run dev:frontend
```

- Backend: http://localhost:8080
- Frontend: http://localhost:3000 (proxies API calls to backend)

### Available Scripts

```bash
# Development
npm run dev              # Start backend with hot reload
npm run dev:frontend     # Start React frontend with hot reload

# Building
npm run build           # Build backend TypeScript
npm run build:frontend  # Build React frontend
npm run build:all       # Build both backend and frontend

# Production
npm start               # Start production server

# Testing
npm test                # Run tests

# MCP Server (for Kiro integration)
npm run mcp:dev         # Run MCP server in development
npm run mcp:start       # Run compiled MCP server
```

## 🗄️ Database Configuration

The system supports multiple database backends:

### SQLite (Default - Recommended)
```bash
DB_TYPE=sqlite
DB_FILE=./notes.db
```
- ✅ Zero configuration
- ✅ Single file database
- ✅ Perfect for development and small deployments
- ✅ No server installation required

### Supabase (Cloud PostgreSQL)
```bash
DB_TYPE=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```
- ✅ Persistent cloud storage
- ✅ Real-time capabilities
- ✅ Generous free tier

### In-Memory (Testing)
```bash
DB_TYPE=memory
```
- ⚠️ Data is lost on restart
- ✅ Fastest for testing

### 🔄 How to Switch Databases

**Step 1**: Stop the application (`Ctrl+C`)
**Step 2**: Edit your `.env` file
**Step 3**: Change the `DB_TYPE` and related settings
**Step 4**: Restart the application (`npm start`)

#### Switch to SQLite (Default)
```bash
# Edit .env
DB_TYPE=sqlite
DB_FILE=./notes.db
# Restart: npm start
# Your notes will be saved in notes.db file
```

#### Switch to Supabase (Cloud)
```bash
# First: Create Supabase project at https://supabase.com
# Run: SQL from supabase-setup.sql in your project
# Edit .env
DB_TYPE=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...your_key_here
# Restart: npm start
```

#### Switch to Memory (Testing)
```bash
# Edit .env
DB_TYPE=memory
# Remove DB_FILE, SUPABASE_* variables
# Restart: npm start
# ⚠️ All data will be lost when you restart
```

### 📊 Database Comparison

| Database | Persistence | Setup | Best For | Data Location |
|----------|-------------|-------|----------|---------------|
| **SQLite** | ✅ File | None | Development, Small apps | Local file |
| **Supabase** | ✅ Cloud | 5 min | Production, Collaboration | Cloud |
| **Memory** | ❌ Temporary | None | Testing, Demos | RAM |

## 🤖 AI Configuration

**The system works perfectly without any AI setup!** It will use rule-based enrichment as a fallback.

### 🚀 AI Provider Options (Choose One)

#### 1. 🆓 **Direct Llama (Recommended - Zero Setup)**
```bash
# No installation required! Just configure in .env
AI_PROVIDER=llama
# Model downloads automatically on first use (~50MB)
```
- ✅ **Completely free** - No API keys or limits
- ✅ **Zero setup** - Works out of the box
- ✅ **Privacy first** - All processing happens locally
- ✅ **Offline capable** - No internet needed after download

#### 2. 🆓 **Groq (Free Tier - Lightning Fast)**
```bash
# Get free API key from https://console.groq.com/keys
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_groq_api_key_here
```
- ✅ **Free tier** - 6,000 requests/minute
- ✅ **Extremely fast** - Sub-second responses
- ✅ **High quality** - Llama 3.1 models
- ✅ **Production ready** - Reliable cloud service

#### 3. 💰 **OpenAI (Paid - Highest Quality)**
```bash
# Get API key from https://platform.openai.com/api-keys
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-your-api-key-here
```
- ✅ **Best quality** - GPT-4 level summaries
- ✅ **Most reliable** - Industry standard
- ⚠️ **Paid service** - ~$0.002 per enrichment
- ✅ **Advanced features** - Best tag extraction

#### 4. 🆓 **Ollama (Advanced Local Setup)**
```bash
# Install Ollama from https://ollama.ai
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3.2:3b

# Configure in .env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
```
- ✅ **Free and local** - No API costs
- ✅ **Customizable** - Choose your own models
- ⚠️ **Requires setup** - Manual installation needed
- ✅ **Privacy** - Everything stays local

### 📊 AI Provider Comparison

| Provider | Cost | Speed | Quality | Local | Setup |
|----------|------|-------|---------|-------|-------|
| **Direct Llama** ⭐ | Free | Medium | Good | ✅ Yes | None |
| **Groq** | Free Tier | Very Fast | Very Good | ❌ No | API Key |
| **OpenAI** | Paid | Fast | Excellent | ❌ No | API Key |
| **Ollama** | Free | Fast | Very Good | ✅ Yes | Install |
| **Rule-based** | Free | Instant | Basic | ✅ Yes | None |

**Recommendation**: Start with **Direct Llama** for zero setup, upgrade to **Groq** for production speed.

### 🔄 How to Switch AI Providers

**Step 1**: Edit your `.env` file
**Step 2**: Change the `AI_PROVIDER` value
**Step 3**: Add required API keys (if needed)
**Step 4**: Restart the application

#### Switch to Direct Llama (Default)
```bash
# Edit .env
AI_PROVIDER=llama
# Remove any API keys - not needed
# Restart: npm start
```

#### Switch to Groq (Fast & Free)
```bash
# Edit .env
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_actual_key_here
# Restart: npm start
```

#### Switch to OpenAI (Premium)
```bash
# Edit .env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-your_actual_key_here
# Restart: npm start
```

#### Switch to Ollama (Advanced Local)
```bash
# First install Ollama: https://ollama.ai
# Pull a model: ollama pull llama3.2:3b
# Edit .env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
# Restart: npm start
```

#### Disable AI (Rule-Based Only)
```bash
# Edit .env
AI_PROVIDER=
# Or comment out: # AI_PROVIDER=llama
# Restart: npm start
```

### Without AI (Rule-Based Fallback)
- **Summary**: First 97 characters + "..." (if longer)
- **Tags**: First 5 unique words from the text
- **Still fully functional** for all note management features

## 🔌 MCP Integration (AI Agents & IDEs)

This project works as a **Model Context Protocol (MCP) server** for AI agents and IDEs like Kiro, GitHub Copilot, and other MCP-compatible tools.

### 🚀 Quick MCP Setup

#### 1. **Build the MCP Server**
```bash
git clone <repository-url>
cd ai-tagged-notes-mcp
npm install
npm run build
```

#### 2. **Test MCP Server**
```bash
npm run mcp:start
# Should show: "MCP server listening on stdio"
```

#### 3. **Configure Your Agent/IDE**

### 🤖 Kiro IDE Integration

**Add to your MCP configuration** (`~/.kiro/settings/mcp.json`):

```json
{
  "mcpServers": {
    "ai-notes": {
      "command": "node",
      "args": ["/absolute/path/to/ai-tagged-notes-mcp/dist/mcp-stdio.js"],
      "env": {
        "AI_PROVIDER": "llama",
        "DB_TYPE": "sqlite",
        "DB_FILE": "/absolute/path/to/ai-tagged-notes-mcp/notes.db"
      },
      "disabled": false,
      "autoApprove": ["create_note", "search_notes", "enrich_note"]
    }
  }
}
```

**Important**: Use **absolute paths** for both the script and database file.

### 🐙 GitHub Copilot Integration

**Add to your MCP configuration** (location varies by setup):

```json
{
  "mcpServers": {
    "ai-notes": {
      "command": "node",
      "args": ["/absolute/path/to/ai-tagged-notes-mcp/dist/mcp-stdio.js"],
      "env": {
        "AI_PROVIDER": "groq",
        "GROQ_API_KEY": "your_groq_key_here",
        "DB_TYPE": "sqlite"
      }
    }
  }
}
```

### 🔧 Other MCP Clients

**Generic MCP configuration**:
- **Command**: `node`
- **Args**: `["/path/to/dist/mcp-stdio.js"]`
- **Transport**: `stdio`
- **Environment**: Set `AI_PROVIDER`, `DB_TYPE`, and related variables

### 🛠️ Available MCP Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `create_note` | Create a new note | `text: string` |
| `search_notes` | Search notes by text or tags | `q?: string, tag?: string` |
| `get_note` | Get a specific note by ID | `id: string` |
| `enrich_note` | Add AI-generated summary and tags | `id: string` |
| `delete_note` | Delete a note | `id: string` |

### 📝 MCP Usage Examples

#### Create and Enrich a Note
```javascript
// In your AI agent or IDE
const note = await mcp.callTool('create_note', {
  text: 'Meeting with client about Q4 roadmap. Discussed new features, timeline, and budget constraints.'
});

const enriched = await mcp.callTool('enrich_note', { id: note.id });
// Result: summary="Client meeting covering Q4 roadmap, features, timeline, and budget"
//         tags=["meeting", "client", "Q4", "roadmap", "features"]
```

#### Search and Organize Notes
```javascript
// Find related notes
const relatedNotes = await mcp.callTool('search_notes', { 
  q: 'roadmap' 
});

// Search by tag
const meetings = await mcp.callTool('search_notes', { 
  tag: 'meeting' 
});
```

### 🔧 MCP Configuration Tips

#### For Development
```json
{
  "env": {
    "AI_PROVIDER": "llama",
    "DB_TYPE": "memory"
  }
}
```

#### For Production
```json
{
  "env": {
    "AI_PROVIDER": "groq",
    "GROQ_API_KEY": "your_key",
    "DB_TYPE": "supabase",
    "SUPABASE_URL": "your_url",
    "SUPABASE_ANON_KEY": "your_key"
  }
}
```

### 🐛 MCP Troubleshooting

#### Server Not Starting
```bash
# Check if build is complete
npm run build

# Test MCP server manually
npm run mcp:start
```

#### Connection Issues
- ✅ Use **absolute paths** in configuration
- ✅ Ensure the project is built (`npm run build`)
- ✅ Check environment variables are set correctly
- ✅ Restart your IDE/agent after configuration changes

#### Permission Issues
```bash
# Make sure the script is executable
chmod +x dist/mcp-stdio.js
```

## 📡 REST API

### Endpoints

```bash
# Notes
GET    /api/notes           # List all notes
POST   /api/notes           # Create a note
GET    /api/notes/:id       # Get a specific note
PATCH  /api/notes/:id       # Update a note (for tag removal)
DELETE /api/notes/:id       # Delete a note
POST   /api/notes/:id/enrich # AI-enrich a note

# Search
GET    /api/search?q=query&tag=tag # Search notes

# Health
GET    /health              # Health check
```

### Example Usage

```bash
# Create a note
curl -X POST http://localhost:8080/api/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "Remember to review the quarterly reports"}'

# Search notes
curl "http://localhost:8080/api/search?q=quarterly"

# Enrich a note with AI
curl -X POST http://localhost:8080/api/notes/{note-id}/enrich

# Update a note (remove tags)
curl -X PATCH http://localhost:8080/api/notes/{note-id} \
  -H "Content-Type: application/json" \
  -d '{"tags": ["updated", "tags"]}'

# Delete a note
curl -X DELETE http://localhost:8080/api/notes/{note-id}
```

## 🎨 Web Interface

The React frontend provides:

- **Create Notes**: Rich text input with keyboard shortcuts
- **Search & Filter**: Real-time search through all content
- **AI Enrichment**: One-click AI enhancement with loading states
- **Delete Operations**: Delete notes and individual tags with confirmation
- **Custom UI Components**: Toast notifications and confirmation modals
- **Loading States**: Comprehensive loading indicators for all operations
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Automatic refresh after operations

### UI Features
- **Toast Notifications**: Elegant slide-in notifications for all actions
- **Confirmation Modals**: Custom confirmation dialogs for destructive actions
- **Loading Indicators**: Spinners and visual feedback for all operations
- **Icon-Only Buttons**: Clean, minimal delete buttons with hover effects
- **Tag Management**: Remove individual tags with × buttons

### Keyboard Shortcuts
- `Ctrl+Enter` (or `Cmd+Enter`): Create note
- `Enter` in search: Search notes
- `ESC`: Close modals and dialogs

## 🧪 Testing

```bash
# Run all tests
npm test

# Test specific database
DB_TYPE=sqlite npm test
DB_TYPE=memory npm test
```

## 📁 Project Structure

```
ai-tagged-notes-mcp/
├── src/                    # Backend source code
│   ├── server.ts          # Main HTTP server
│   ├── mcp-stdio.ts       # MCP server implementation
│   ├── mcp.ts             # MCP HTTP router
│   ├── db-factory.ts      # Database factory
│   ├── db-sqlite.ts       # SQLite implementation
│   ├── db-supabase.ts     # Supabase implementation
│   ├── db.ts              # In-memory implementation
│   ├── ai.ts              # OpenAI integration
│   └── types.ts           # TypeScript types
├── frontend/              # React frontend
│   ├── src/
│   │   ├── App.tsx        # Main React component
│   │   └── App.css        # Styles
│   └── package.json       # Frontend dependencies
├── dist/                  # Compiled JavaScript
├── notes.db               # SQLite database (created automatically)
├── .env                   # Environment configuration
└── package.json           # Backend dependencies
```

## 🔧 Environment Variables

```bash
# AI Configuration (Choose one)
AI_PROVIDER=llama                    # llama|groq|openai|ollama (default: llama)

# Direct Llama (default - no additional config needed)
# Model downloads automatically on first use

# Groq (free tier, very fast)
# GROQ_API_KEY=gsk_your_groq_key_here

# OpenAI (paid, highest quality)
# OPENAI_API_KEY=sk-proj-your_key_here

# Ollama (local, requires installation)
# OLLAMA_BASE_URL=http://localhost:11434
# OLLAMA_MODEL=llama3.2:3b

# Server Configuration
PORT=8080                   # Server port
MCP_PORT=8090              # MCP server port

# Database Configuration
DB_TYPE=sqlite              # sqlite|supabase|memory
DB_FILE=./notes.db          # SQLite file path

# Supabase Configuration (for cloud storage)
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your_anon_key_here
```

## 🚨 Troubleshooting

### Common Issues

1. **"Module not found" errors**
   ```bash
   npm install
   npm run build
   ```

2. **MCP server not connecting**
   - Check the path in MCP configuration
   - Ensure the project is built: `npm run build`
   - Verify environment variables in MCP config

3. **Database connection issues**
   - SQLite: Check file permissions
   - Supabase: Verify URL and API key are correct

4. **AI enrichment not working**
   - Verify OpenAI API key is set
   - Check API key has sufficient credits
   - Ensure internet connectivity

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

## 📋 Quick Reference

### 🔄 Switch AI Provider
```bash
# Edit .env file
AI_PROVIDER=llama     # Direct Llama (free, local)
AI_PROVIDER=groq      # Groq (free tier, fast) + GROQ_API_KEY
AI_PROVIDER=openai    # OpenAI (paid, premium) + OPENAI_API_KEY
AI_PROVIDER=ollama    # Ollama (local, advanced) + OLLAMA_*
AI_PROVIDER=          # Disable AI (rule-based only)
```

### 🗄️ Switch Database
```bash
# Edit .env file
DB_TYPE=sqlite        # Local file (default)
DB_TYPE=supabase      # Cloud PostgreSQL + SUPABASE_*
DB_TYPE=memory        # Temporary (testing only)
```

### 🚀 Common Commands
```bash
npm start             # Start the application
npm run build         # Build for production
npm run dev           # Development mode
npm run mcp:start     # Start MCP server only
npm run get-url       # Get current Vercel production URL
```

### 🔌 MCP Integration
```bash
# Build MCP server
npm run build

# Test MCP server
npm run mcp:start

# Add to ~/.kiro/settings/mcp.json:
{
  "mcpServers": {
    "ai-notes": {
      "command": "node",
      "args": ["/absolute/path/to/dist/mcp-stdio.js"],
      "env": { "AI_PROVIDER": "llama", "DB_TYPE": "sqlite" }
    }
  }
}
```

### 🌐 Access Points
- **Local Web UI**: http://localhost:8080
- **Local API**: http://localhost:8080/api
- **Health Check**: http://localhost:8080/api/health
- **MCP**: stdio connection on port 8090

### 🚀 Live Demo
- **Production App**: [Latest Deployment](https://vercel.com/waleed-ahmad-faridis-projects/ai-tagged-notes-mcp)
- **Current URL**: Run `node scripts/get-vercel-url.js` to get the latest URL

### 🔗 Set Up Stable URL (Optional)
To avoid changing URLs on each deployment:

1. **Custom Domain** (Recommended):
   - Go to Vercel Dashboard → Your Project → Settings → Domains
   - Add your domain (e.g., `ai-notes.yourdomain.com`)
   - This URL never changes

2. **Vercel Production Domain**:
   - Your project gets a stable URL: `ai-tagged-notes-mcp.vercel.app`
   - Go to Vercel Dashboard → Settings → Domains → Add Domain
   - Use your project name as the subdomain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Hugging Face Transformers** for Direct Llama capabilities
- **Groq** for lightning-fast AI inference
- **OpenAI** for premium AI capabilities
- **Supabase** for cloud database infrastructure
- **Model Context Protocol (MCP)** for integration framework
- **SQLite** for reliable file-based storage
- **React** for the modern frontend framework