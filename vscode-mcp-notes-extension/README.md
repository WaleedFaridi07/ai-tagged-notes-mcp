# MCP Notes VS Code Extension

A VS Code extension that demonstrates MCP (Model Context Protocol) HTTP integration with the AI Tagged Notes application.

## 🎯 Purpose

This extension serves as a **proof of concept** and **testing tool** for the MCP HTTP implementation, showing how VS Code extensions can integrate with MCP servers.

## ✨ Features

- **Create Notes** - Add new notes via MCP HTTP
- **Search Notes** - Find notes by text, summary, or AI-generated tags  
- **List Recent Notes** - Get the latest 10 notes (most recently created) ⭐ **NEW**
- **List All Notes** - Browse all available notes
- **AI Enrichment** - Automatically add summaries and tags to notes
- **Rich UI** - Native VS Code Quick Pick and Webview integration

## 🚀 Installation & Usage

### Prerequisites
- AI Tagged Notes MCP server running on `localhost:8080`
- VS Code 1.74.0 or higher

### Install Extension
1. **Compile**: `npm run compile`
2. **Package**: `vsce package` 
3. **Install**: In VS Code, `Ctrl+Shift+P` → "Extensions: Install from VSIX..."

### Commands
- `Ctrl+Shift+P` → "MCP: Create Note"
- `Ctrl+Shift+P` → "MCP: Search Notes"  
- `Ctrl+Shift+P` → "MCP: List Recent Notes (Latest 10)" ⭐ **NEW**
- `Ctrl+Shift+P` → "MCP: List All Notes"

### Keyboard Shortcuts
- `Ctrl+Shift+N` (Cmd+Shift+N on Mac) - Create Note
- `Ctrl+Shift+F` (Cmd+Shift+F on Mac) - Search Notes
- `Ctrl+Shift+R` (Cmd+Shift+R on Mac) - List Recent Notes ⭐ **NEW**

## 🔧 Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Package extension
vsce package
```

## 🎯 Architecture

This extension demonstrates:
- **MCP HTTP Client** - JSON-RPC over HTTP communication
- **VS Code Integration** - Native UI components and commands
- **Error Handling** - Graceful failure and user feedback
- **Progress Indicators** - Visual feedback during operations

## 📝 Example Workflow

1. **Create**: `Ctrl+Shift+N` → Type "Meeting notes for project X"
2. **Enrich**: Choose "Yes" to add AI summary and tags
3. **Recent**: `Ctrl+Shift+R` → Quick access to latest notes ⭐ **NEW**
4. **Search**: `Ctrl+Shift+F` → Search "project" to find related notes
5. **View**: Select note to see details in webview

## 🔗 Related

- [Main AI Tagged Notes Project](../)
- [MCP HTTP Implementation](../src/mcp-http.ts)
- [MCP STDIO Implementation](../src/mcp-stdio.ts)