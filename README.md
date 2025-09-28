# AI Tagged Notes MCP Server

A comprehensive note-taking system with AI-powered enrichment, featuring multiple interfaces and persistent storage options.

## 🌟 Features

- **🤖 AI-Powered Enrichment**: Generate smart summaries and relevant tags using multiple providers
- **🌐 Multiple Interfaces**: Web UI, MCP protocol, and REST API
- **💾 Flexible Storage**: SQLite (default), Supabase (cloud), or in-memory options
- **⚡ MCP Integration**: Works seamlessly with Kiro IDE and other AI agents
- **🎨 Modern React Frontend**: Beautiful, responsive web interface
- **📝 Full CRUD Operations**: Create, read, update, and delete notes and tags
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

## 🐳 Docker Setup

### Quick Docker Start

The easiest way to run the complete application with all dependencies:

```bash
# Clone and start with Docker
git clone <repository-url>
cd ai-tagged-notes-mcp
docker-compose up -d

# Access the application
open http://localhost:8080
```

### Docker Features

- **🚀 Zero Configuration**: Works out of the box with Direct Llama AI
- **💾 Persistent Data**: SQLite database and AI models cached in Docker volumes
- **🤖 Local AI Processing**: Direct Llama runs completely offline after initial model download
- **🔒 Isolated Environment**: No conflicts with your local Node.js setup
- **📦 Complete Stack**: Frontend, backend, database, and AI all included

### Docker Commands

```bash
# Start the application
docker-compose up -d

# View logs (useful for first run to see AI model download)
docker-compose logs -f

# Stop the application
docker-compose down

# Update and restart
docker-compose up -d --build

# Clean restart (removes all data)
docker-compose down -v && docker-compose up -d --build
```

### First Run with Docker

When you first start with Docker, you'll see:

```bash
# Start and watch the logs
docker-compose up -d && docker-compose logs -f

# Expected output:
# ✅ Frontend build found at: /app/frontend/build
# HTTP API listening on :8080
# Frontend available at: http://localhost:8080
# 🤖 Using Direct Llama for AI enrichment
# 🔄 Loading Llama model (first time may take a few minutes)...
# ✅ AI enrichment successful with Direct Llama
```

### Docker vs Local Development

| Method | Best For | AI Provider | Database | Setup Time |
|--------|----------|-------------|----------|------------|
| **Docker** | Testing complete app, demos | Direct Llama (local) | SQLite (persistent) | 2 minutes |
| **Local Dev** | Development, hot reload | Any provider | Any database | 5 minutes |
| **Vercel** | Production deployment | Groq (cloud) | Supabase (cloud) | Live |

### Docker Environment Variables

The Docker setup uses these defaults (can be customized in `docker-compose.yml`):

```yaml
environment:
  AI_PROVIDER: llama          # Direct Llama (free, local)
  DB_TYPE: sqlite            # SQLite (persistent in volume)
  DB_FILE: /app/data/notes.db
  PORT: 8080
  MCP_PORT: 8090
```

### Docker Troubleshooting

#### Container Won't Start
```bash
# Check logs
docker-compose logs

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

#### AI Model Download Issues
```bash
# Check available disk space (models are ~50MB)
docker system df

# Watch model download progress
docker-compose logs -f ai-notes
```

#### Port Conflicts
```bash
# Change port in docker-compose.yml
ports:
  - "3080:8080"  # Use port 3080 instead of 8080
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

Edit your `.env` file and restart:

```bash
DB_TYPE=sqlite        # Local file (default)
DB_TYPE=supabase      # Cloud PostgreSQL + SUPABASE_*
DB_TYPE=memory        # Temporary (testing only)
```

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

**Recommendation**: Start with **Direct Llama** for zero setup, upgrade to **Groq** for production speed.

### 🔄 How to Switch AI Providers

Edit your `.env` file and restart:

```bash
AI_PROVIDER=llama     # Direct Llama (default, free, local)
AI_PROVIDER=groq      # Groq (free tier, fast) + GROQ_API_KEY
AI_PROVIDER=openai    # OpenAI (paid, premium) + OPENAI_API_KEY
AI_PROVIDER=ollama    # Ollama (local, advanced) + OLLAMA_*
```

## 🔌 MCP Integration

This project works as a **Model Context Protocol (MCP) server** for AI agents and IDEs.

### 🎯 Multiple MCP Transports

- **STDIO Transport** - For Claude Desktop, Kiro IDE integration
- **HTTP Transport** - For web clients, VS Code extensions, browser tools
- **VS Code Extension** - Demo extension in `vscode-mcp-notes-extension/`

### Quick MCP Setup

1. **Build the MCP Server**
   ```bash
   npm install && npm run build
   ```

2. **Test MCP Server**
   ```bash
   npm run mcp:start
   ```

3. **Configure Your Agent/IDE** - See [AGENTS.md](./AGENTS.md) for detailed integration guides

### Available MCP Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `create_note` | Create a new note | `text: string` |
| `search_notes` | Search notes by text or tags | `q?: string, tag?: string` |
| `get_note` | Get a specific note by ID | `id: string` |
| `enrich_note` | Add AI-generated summary and tags | `id: string` |
| `delete_note` | Delete a note | `id: string` |

For comprehensive MCP integration details, see [AGENTS.md](./AGENTS.md).

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
# Local Development
npm start             # Start the application
npm run build         # Build for production
npm run dev           # Development mode
npm run mcp:start     # Start MCP server only

# Docker
docker-compose up -d  # Start with Docker
docker-compose logs -f # View logs
docker-compose down   # Stop Docker containers

# Deployment
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
- **Production App**: [Latest Deployment](https://ai-tagged-notes-mcp.vercel.app/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🙏 Acknowledgments

- **Hugging Face Transformers** for Direct Llama capabilities
- **Groq** for lightning-fast AI inference
- **OpenAI** for premium AI capabilities
- **Supabase** for cloud database infrastructure
- **Model Context Protocol (MCP)** for integration framework
- **SQLite** for reliable file-based storage
- **React** for the modern frontend framework