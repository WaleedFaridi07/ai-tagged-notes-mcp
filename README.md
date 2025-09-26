# AI Tagged Notes MCP Server

A comprehensive note-taking system with AI-powered enrichment, featuring multiple interfaces and persistent storage options.

## 🌟 Features

- **AI-Powered Enrichment**: Generate smart summaries and relevant tags using OpenAI
- **Multiple Interfaces**: Web UI, MCP protocol, and REST API
- **Flexible Storage**: SQLite (default), MySQL, or in-memory options
- **MCP Integration**: Works seamlessly with Kiro IDE
- **Modern React Frontend**: Beautiful, responsive web interface with custom UI components
- **Full CRUD Operations**: Create, read, update, and delete notes and tags
- **Custom UI Components**: Toast notifications and confirmation modals
- **Loading States**: Comprehensive loading indicators for all operations
- **TypeScript**: Full type safety throughout the codebase
- **Zero Configuration**: Works out of the box with SQLite

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
                    │  │ SQLite  │ MySQL   │    │
                    │  │(default)│(optional)│    │
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

### MySQL (Optional)
```bash
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=notes_db
```

### In-Memory (Testing)
```bash
DB_TYPE=memory
```
- ⚠️ Data is lost on restart
- ✅ Fastest for testing

## 🤖 AI Configuration

**The system works perfectly without any AI setup!** It will use rule-based enrichment as a fallback.

### AI Provider Options

#### 1. 🆓 **Ollama (Recommended - Completely Free & Local)**
```bash
# Install Ollama from https://ollama.ai
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a lightweight model
ollama pull llama3.2:3b

# Configure in .env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
AI_PROVIDER=ollama
```

#### 2. 🆓 **Groq (Free Tier - Fast Inference)**
```bash
# Get free API key from https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here
AI_PROVIDER=groq
```

#### 3. 🆓 **Hugging Face (Free Tier)**
```bash
# Get free API key from https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY=your_hf_api_key_here
AI_PROVIDER=huggingface
```

#### 4. 💰 **OpenAI (Paid)**
```bash
# Get API key from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-your-api-key-here
AI_PROVIDER=openai
```

### AI Features Comparison

| Provider | Cost | Speed | Quality | Local |
|----------|------|-------|---------|-------|
| **Ollama** | Free | Medium | Good | ✅ Yes |
| **Groq** | Free Tier | Very Fast | Good | ❌ No |
| **Hugging Face** | Free Tier | Slow | Fair | ❌ No |
| **OpenAI** | Paid | Fast | Excellent | ❌ No |
| **Rule-based** | Free | Instant | Basic | ✅ Yes |

### Without AI (Rule-Based Fallback)
- Summary: First 97 characters + "..." (if longer)
- Tags: First 5 unique words from the text
- Still fully functional for all note management features

## 🔌 MCP Integration (Kiro IDE)

### Setup for Kiro

1. **Add to your MCP configuration** (`~/.kiro/settings/mcp.json`):
   ```json
   {
     "mcpServers": {
       "notes": {
         "command": "node",
         "args": ["/path/to/ai-tagged-notes-mcp/dist/mcp-stdio.js"],
         "env": {
           "OPENAI_API_KEY": "your-api-key",
           "DB_TYPE": "sqlite",
           "DB_FILE": "/path/to/ai-tagged-notes-mcp/notes.db"
         },
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

2. **Build the MCP server**:
   ```bash
   npm run build
   ```

3. **Restart Kiro** to load the MCP server

### MCP Tools Available

- `create_note`: Create a new note
- `get_note`: Retrieve a note by ID
- `search_notes`: Search notes by text or tags
- `enrich_note`: AI-enhance a note with summary and tags
- `delete_note`: Delete a note by ID

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
│   ├── db-mysql.ts        # MySQL implementation
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
# API Configuration
OPENAI_API_KEY=sk-proj-...  # Required for AI features
PORT=8080                   # Server port

# Database Configuration
DB_TYPE=sqlite              # sqlite|mysql|memory
DB_FILE=./notes.db          # SQLite file path
DB_HOST=localhost           # MySQL host
DB_PORT=3306                # MySQL port
DB_USER=root                # MySQL user
DB_PASSWORD=                # MySQL password
DB_NAME=notes_db            # MySQL database name
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
   - MySQL: Verify server is running and credentials are correct

4. **AI enrichment not working**
   - Verify OpenAI API key is set
   - Check API key has sufficient credits
   - Ensure internet connectivity

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Model Context Protocol (MCP) for integration framework
- SQLite for reliable file-based storage
- React for the modern frontend framework