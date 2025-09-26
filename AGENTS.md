# AI Tagged Notes - Agent Integration Guide

This document provides comprehensive information for AI agents and developers working with the AI Tagged Notes MCP Server.

## 🚀 Quick Start for Agents

```bash
git clone <repository-url>
cd ai-tagged-notes-mcp
npm install && npm run build
npm run mcp:start
```

**Result**: Fully functional MCP server with AI-powered note management in under 2 minutes!

## 🔌 MCP Integration

### MCP Server Details
- **Server Name**: `ai-tagged-notes`
- **Version**: `0.1.0`
- **Transport**: stdio
- **Protocol**: Model Context Protocol v1.0

### Available Tools

#### 1. `create_note`
Creates a new note with the provided text.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "minLength": 1,
      "description": "The content of the note"
    }
  },
  "required": ["text"]
}
```

**Output:**
```json
{
  "id": "uuid",
  "text": "note content",
  "createdAt": "2025-09-26T10:00:00.000Z",
  "updatedAt": "2025-09-26T10:00:00.000Z"
}
```

**Example Usage:**
```javascript
await mcp.callTool('create_note', {
  text: 'Remember to review the quarterly financial reports by Friday'
});
```

#### 2. `get_note`
Retrieves a specific note by its ID.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "description": "The unique identifier of the note"
    }
  },
  "required": ["id"]
}
```

**Output:**
```json
{
  "id": "uuid",
  "text": "note content",
  "summary": "AI-generated summary",
  "tags": ["tag1", "tag2"],
  "createdAt": "2025-09-26T10:00:00.000Z",
  "updatedAt": "2025-09-26T10:05:00.000Z"
}
```

#### 3. `search_notes`
Searches notes by text content or tags.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "q": {
      "type": "string",
      "description": "Search query (searches text, summary, and tags)"
    },
    "tag": {
      "type": "string",
      "description": "Specific tag to filter by"
    }
  }
}
```

**Output:**
```json
[
  {
    "id": "uuid",
    "text": "note content",
    "summary": "AI-generated summary",
    "tags": ["tag1", "tag2"],
    "createdAt": "2025-09-26T10:00:00.000Z",
    "updatedAt": "2025-09-26T10:05:00.000Z"
  }
]
```

**Example Usage:**
```javascript
// Search by text
await mcp.callTool('search_notes', { q: 'quarterly reports' });

// Search by tag
await mcp.callTool('search_notes', { tag: 'finance' });

// Combined search
await mcp.callTool('search_notes', { q: 'meeting', tag: 'urgent' });
```

#### 4. `enrich_note`
Enhances a note with AI-generated summary and tags.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "description": "The unique identifier of the note to enrich"
    }
  },
  "required": ["id"]
}
```

**Output:**
```json
{
  "id": "uuid",
  "text": "original note content",
  "summary": "Concise AI-generated summary (≤25 words)",
  "tags": ["relevant", "keyword", "tags"],
  "createdAt": "2025-09-26T10:00:00.000Z",
  "updatedAt": "2025-09-26T10:05:00.000Z"
}
```

#### 5. `delete_note`
Deletes a note by its ID.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1,
      "description": "The unique identifier of the note to delete"
    }
  },
  "required": ["id"]
}
```

**Output:**
```json
{
  "success": true
}
```

**Example Usage:**
```javascript
await mcp.callTool('delete_note', { id: 'note-uuid-here' });
```

## 🌐 REST API Integration

### Base URL
```
http://localhost:8080/api
```

### Authentication
Currently no authentication required. For production deployments, consider adding API key authentication.

### Endpoints

#### Notes Management
```http
GET    /api/notes           # List all notes
POST   /api/notes           # Create a note
GET    /api/notes/:id       # Get specific note
PATCH  /api/notes/:id       # Update a note (for tag removal)
DELETE /api/notes/:id       # Delete a note
POST   /api/notes/:id/enrich # AI-enrich a note
```

#### Search
```http
GET    /api/search?q={query}&tag={tag}  # Search notes
```

#### System
```http
GET    /health              # Health check
```

### Request/Response Examples

#### Create Note
```http
POST /api/notes
Content-Type: application/json

{
  "text": "Prepare presentation for client meeting next Tuesday"
}
```

Response:
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "text": "Prepare presentation for client meeting next Tuesday",
  "createdAt": "2025-09-26T10:00:00.000Z",
  "updatedAt": "2025-09-26T10:00:00.000Z"
}
```

#### Search Notes
```http
GET /api/search?q=presentation&tag=meeting
```

Response:
```json
[
  {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "text": "Prepare presentation for client meeting next Tuesday",
    "summary": "Prepare client presentation for Tuesday meeting",
    "tags": ["presentation", "client", "meeting", "Tuesday"],
    "createdAt": "2025-09-26T10:00:00.000Z",
    "updatedAt": "2025-09-26T10:05:00.000Z"
  }
]
```

#### Update Note
```http
PATCH /api/notes/f47ac10b-58cc-4372-a567-0e02b2c3d479
Content-Type: application/json

{
  "tags": ["presentation", "client", "meeting"]
}
```

Response:
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "text": "Prepare presentation for client meeting next Tuesday",
  "summary": "Prepare client presentation for Tuesday meeting",
  "tags": ["presentation", "client", "meeting"],
  "createdAt": "2025-09-26T10:00:00.000Z",
  "updatedAt": "2025-09-26T10:15:00.000Z"
}
```

#### Delete Note
```http
DELETE /api/notes/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

Response:
```json
{
  "success": true
}
```

## 🧠 AI Enhancement Details

### AI Processing
- **Summary**: ≤25 words, concise overview
- **Tags**: 1-5 relevant keywords
- **Fallback**: Rule-based if AI unavailable (first 97 chars + first 5 words)

### Prompt Template
```
Summarize in <= 25 words and propose 1-5 short keyword tags for:
{note_text}
Return JSON with keys: summary, tags.
```

## 🗄️ Data Models

### Note Schema
```typescript
interface Note {
  id: string;           // UUID v4
  text: string;         // Original note content
  summary?: string;     // AI-generated summary (optional)
  tags?: string[];      // AI-generated tags (optional)
  createdAt: string;    // ISO 8601 timestamp
  updatedAt: string;    // ISO 8601 timestamp
}
```

### Database Storage
- **SQLite**: JSON column for tags, TEXT for other fields
- **Supabase**: PostgreSQL with JSON column for tags, TEXT for other fields
- **Memory**: JavaScript Map with Note objects

## 🔧 Configuration for Agents

### Environment Variables
```bash
# AI Provider
AI_PROVIDER=llama                 # llama|groq|openai|ollama
GROQ_API_KEY=gsk_...             # For Groq
OPENAI_API_KEY=sk-proj-...       # For OpenAI
OLLAMA_BASE_URL=http://localhost:11434  # For Ollama
OLLAMA_MODEL=llama3.2:3b         # For Ollama

# Database
DB_TYPE=sqlite                   # sqlite|supabase|memory
DB_FILE=./notes.db              # SQLite file path
SUPABASE_URL=https://...        # For Supabase
SUPABASE_ANON_KEY=eyJ...        # For Supabase

# Server
PORT=8080
MCP_PORT=8090
```

### MCP Configuration Examples

#### Kiro IDE (`~/.kiro/settings/mcp.json`)
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

#### GitHub Copilot / Other MCP Clients
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

**Important**: Use **absolute paths** for both the script and database file.

## 🤖 AI Providers for Agents

### Quick Provider Selection

| Provider | Best For | Setup | Cost |
|----------|----------|-------|------|
| **Direct Llama** | Development, Privacy | 0 min | Free |
| **Groq** | Production, Speed | 2 min | Free tier |
| **OpenAI** | Premium Quality | 2 min | ~$0.002/enrichment |
| **Ollama** | Custom Models | 10 min | Free |

### Configuration Examples

```bash
# Direct Llama (Recommended)
AI_PROVIDER=llama

# Groq (Production)
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_groq_key_here

# OpenAI (Premium)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-your_key_here

# Ollama (Advanced)
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
```

## 🚀 Agent Use Cases

### 1. Meeting Notes Assistant
```javascript
// Create meeting note
const note = await mcp.callTool('create_note', {
  text: 'Team standup: Discussed Q4 goals, John to finish API docs by Friday, Sarah working on UI improvements, need to schedule client demo'
});

// Enrich with AI
const enriched = await mcp.callTool('enrich_note', { id: note.id });
// Result: summary="Team standup covering Q4 goals, API docs deadline, UI improvements, client demo scheduling"
//         tags=["standup", "Q4 goals", "API docs", "UI improvements", "client demo"]
```

### 2. Research Assistant
```javascript
// Search for related notes
const relatedNotes = await mcp.callTool('search_notes', { 
  q: 'machine learning' 
});

// Create new research note
const researchNote = await mcp.callTool('create_note', {
  text: 'New paper on transformer architectures shows 15% improvement in efficiency. Key insights: attention mechanism optimization, reduced computational complexity, better handling of long sequences.'
});

// Auto-enrich for better organization
await mcp.callTool('enrich_note', { id: researchNote.id });
```

### 3. Task Management
```javascript
// Search for pending tasks
const tasks = await mcp.callTool('search_notes', { tag: 'todo' });

// Create new task
const task = await mcp.callTool('create_note', {
  text: 'TODO: Review and approve budget proposal for marketing campaign, coordinate with finance team, deadline is end of month'
});

// Enrich to extract key information
const enrichedTask = await mcp.callTool('enrich_note', { id: task.id });

// Delete completed task
await mcp.callTool('delete_note', { id: task.id });
```

### 4. Note Cleanup
```javascript
// Find old notes
const oldNotes = await mcp.callTool('search_notes', { q: 'temporary' });

// Delete outdated notes
for (const note of oldNotes) {
  if (shouldDelete(note)) {
    await mcp.callTool('delete_note', { id: note.id });
  }
}
```

## 🔍 Search Capabilities

### Full-Text Search
The search functionality covers:
- **Note text**: Original content
- **Summaries**: AI-generated summaries
- **Tags**: All associated tags

### Search Strategies
1. **Keyword Search**: `q=keyword` - searches all text fields
2. **Tag Filter**: `tag=specific-tag` - exact tag match
3. **Combined**: Both parameters for refined results
4. **Case Insensitive**: All searches are case-insensitive

### Search Examples
```javascript
// Find all notes about meetings
await mcp.callTool('search_notes', { q: 'meeting' });

// Find urgent items
await mcp.callTool('search_notes', { tag: 'urgent' });

// Find urgent meetings
await mcp.callTool('search_notes', { q: 'meeting', tag: 'urgent' });
```

## 🛠️ Development Integration

### TypeScript Support
Full TypeScript definitions available:
```typescript
import { Note, EnrichResult } from './src/types';

interface NotesAPI {
  createNote(text: string): Promise<Note>;
  getNote(id: string): Promise<Note | undefined>;
  searchNotes(q?: string, tag?: string): Promise<Note[]>;
  enrichNote(id: string): Promise<Note>;
  deleteNote(id: string): Promise<boolean>;
  updateNote(id: string, patch: Partial<Note>): Promise<Note>;
}
```

### Error Handling
```javascript
try {
  const note = await mcp.callTool('create_note', { text: 'My note' });
} catch (error) {
  if (error.code === 'not_found') {
    // Handle missing note
  } else if (error.code === 'invalid_input') {
    // Handle validation error
  }
}
```

## 📊 Performance Considerations

### Database Performance
- **SQLite**: Excellent for < 100k notes, local file storage
- **Supabase**: Scalable PostgreSQL, real-time capabilities, cloud storage
- **Memory**: Fastest but non-persistent

### AI Provider Support
- **Multiple Providers**: OpenAI, Groq, Ollama, Hugging Face, Rule-based
- **Auto-Detection**: Automatically selects available provider
- **Graceful Fallback**: Falls back to rule-based if AI providers fail
- **Local Models**: Ollama support for completely offline operation

### AI API Considerations
- **Rate Limits**: Respect each provider's rate limits
- **Batch Processing**: Consider batching multiple enrichment requests
- **Cost Management**: Free tiers available for Groq and Hugging Face
- **Privacy**: Ollama runs completely local for sensitive data

### Caching Strategy
- Notes are cached in memory after database queries
- AI enrichment results are persisted to avoid re-processing
- Search results can be cached for frequently accessed queries

## 🔐 Security Considerations

### API Key Security
- Never commit API keys to version control
- Use `.env` files (already in `.gitignore`)
- System works without API keys using rule-based enrichment

### Data Privacy
- Notes stored locally by default (SQLite)
- AI API calls include note content (when configured)
- Consider Direct Llama or Ollama for sensitive data

## 🧪 Testing & Troubleshooting

### Quick Tests
```bash
# Unit tests
npm test

# MCP integration test
npm run mcp:start

# Health check
curl http://localhost:8080/api/health
```

### Common Issues
- **MCP not connecting**: Use absolute paths in configuration
- **Build errors**: Run `npm run build` after changes
- **Permission issues**: `chmod +x dist/mcp-stdio.js`

### Integration Testing
```javascript
// Test MCP integration
const testNote = await mcp.callTool('create_note', { 
  text: 'Test note for integration testing' 
});

const retrieved = await mcp.callTool('get_note', { id: testNote.id });
assert.equal(retrieved.text, 'Test note for integration testing');
```

## 🤝 Contributing

For extending the system with new MCP tools or AI providers, see the main [README.md](./README.md) for development setup and contribution guidelines.