import * as vscode from 'vscode';
import * as https from 'https';
import * as http from 'http';

// MCP HTTP Client
class McpHttpClient {
  private baseUrl: string;
  private requestId = 1;

  constructor(baseUrl: string = 'http://localhost:8080/mcp-http') {
    this.baseUrl = baseUrl;
  }

  private async makeRequest(method: string, params?: any): Promise<any> {
    const body = JSON.stringify({
      jsonrpc: '2.0',
      id: this.requestId++,
      method,
      params
    });

    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseUrl}/${method}`);
      const options = {
        hostname: url.hostname,
        port: url.port || 8080,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.error) {
              reject(new Error(result.error.message || 'MCP Error'));
            } else {
              resolve(result.result);
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  async initialize(): Promise<any> {
    return this.makeRequest('initialize');
  }

  async listTools(): Promise<any> {
    return this.makeRequest('tools/list');
  }

  async callTool(name: string, args: any): Promise<any> {
    return this.makeRequest('tools/call', { name, arguments: args });
  }
}

// Extension activation
export function activate(context: vscode.ExtensionContext) {
  const mcpClient = new McpHttpClient();
  
  console.log('MCP Notes Extension is now active!');

  // Test MCP connection on activation
  mcpClient.initialize()
    .then(() => {
      vscode.window.showInformationMessage('✅ Connected to MCP HTTP server');
    })
    .catch((error) => {
      vscode.window.showErrorMessage(`❌ Failed to connect to MCP server: ${error.message}`);
    });

  // Command: Create Note
  const createNoteCommand = vscode.commands.registerCommand('mcpNotes.createNote', async () => {
    try {
      const text = await vscode.window.showInputBox({
        prompt: 'Enter note text',
        placeHolder: 'Type your note here...',
        ignoreFocusOut: true
      });

      if (!text) {
        return;
      }

      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Creating note...',
        cancellable: false
      }, async () => {
        try {
          const result = await mcpClient.callTool('create_note', { text });
          const noteData = JSON.parse(result.content[0].text);
          
          vscode.window.showInformationMessage(
            `✅ Note created! ID: ${noteData.id.substring(0, 8)}...`
          );
          
          // Ask if user wants to enrich with AI
          const enrichChoice = await vscode.window.showQuickPick(
            ['Yes', 'No'], 
            { placeHolder: 'Enrich note with AI summary and tags?' }
          );
          
          if (enrichChoice === 'Yes') {
            await enrichNote(noteData.id);
          }
        } catch (error: any) {
          vscode.window.showErrorMessage(`❌ Failed to create note: ${error.message}`);
        }
      });
    } catch (error: any) {
      vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
    }
  });

  // Command: Search Notes
  const searchNotesCommand = vscode.commands.registerCommand('mcpNotes.searchNotes', async () => {
    try {
      const query = await vscode.window.showInputBox({
        prompt: 'Search notes (text, summary, or tags)',
        placeHolder: 'Enter search term...',
        ignoreFocusOut: true
      });

      if (!query) {
        return;
      }

      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Searching notes...',
        cancellable: false
      }, async () => {
        try {
          const result = await mcpClient.callTool('search_notes', { q: query });
          const notes = JSON.parse(result.content[0].text);
          
          if (notes.length === 0) {
            vscode.window.showInformationMessage('No notes found matching your search.');
            return;
          }

          // Show results in Quick Pick
          const items = notes.map((note: any) => ({
            label: `📝 ${note.text.substring(0, 50)}${note.text.length > 50 ? '...' : ''}`,
            description: note.summary || 'No summary',
            detail: `Tags: ${note.tags?.join(', ') || 'None'} | Created: ${new Date(note.createdAt).toLocaleDateString()}`,
            noteData: note
          }));

          const selected = await vscode.window.showQuickPick(items, {
            placeHolder: `Found ${notes.length} note(s). Select one to view details.`,
            ignoreFocusOut: true
          });

          if (selected) {
            showNoteDetails((selected as any).noteData);
          }
        } catch (error: any) {
          vscode.window.showErrorMessage(`❌ Search failed: ${error.message}`);
        }
      });
    } catch (error: any) {
      vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
    }
  });

  // Command: List Recent Notes (Latest 10)
  const listRecentNotesCommand = vscode.commands.registerCommand('mcpNotes.listRecentNotes', async () => {
    try {
      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Loading recent notes...',
        cancellable: false
      }, async () => {
        try {
          const result = await mcpClient.callTool('list_recent_notes', {});
          const notes = JSON.parse(result.content[0].text);
          
          if (notes.length === 0) {
            vscode.window.showInformationMessage('No notes found. Create your first note!');
            return;
          }

          // Show recent notes in Quick Pick
          const items = notes.map((note: any) => ({
            label: `📝 ${note.text.substring(0, 60)}${note.text.length > 60 ? '...' : ''}`,
            description: `${note.tags?.length || 0} tags`,
            detail: `Created: ${new Date(note.createdAt).toLocaleDateString()}`,
            noteData: note
          }));

          const selected = await vscode.window.showQuickPick(items, {
            placeHolder: `Latest ${notes.length} note(s)`,
            ignoreFocusOut: true
          });

          if (selected) {
            showNoteDetails((selected as any).noteData);
          }
        } catch (error: any) {
          vscode.window.showErrorMessage(`❌ Failed to load recent notes: ${error.message}`);
        }
      });
    } catch (error: any) {
      vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
    }
  });

  // Command: List All Notes
  const listNotesCommand = vscode.commands.registerCommand('mcpNotes.listNotes', async () => {
    try {
      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Loading notes...',
        cancellable: false
      }, async () => {
        try {
          const result = await mcpClient.callTool('search_notes', {});
          const notes = JSON.parse(result.content[0].text);
          
          if (notes.length === 0) {
            vscode.window.showInformationMessage('No notes found. Create your first note!');
            return;
          }

          // Show all notes in Quick Pick
          const items = notes.map((note: any) => ({
            label: `📝 ${note.text.substring(0, 60)}${note.text.length > 60 ? '...' : ''}`,
            description: `${note.tags?.length || 0} tags`,
            detail: `Created: ${new Date(note.createdAt).toLocaleDateString()}`,
            noteData: note
          }));

          const selected = await vscode.window.showQuickPick(items, {
            placeHolder: `Select from ${notes.length} note(s)`,
            ignoreFocusOut: true
          });

          if (selected) {
            showNoteDetails((selected as any).noteData);
          }
        } catch (error: any) {
          vscode.window.showErrorMessage(`❌ Failed to load notes: ${error.message}`);
        }
      });
    } catch (error: any) {
      vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
    }
  });

  // Helper: Enrich Note
  async function enrichNote(noteId: string) {
    try {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Enriching note with AI...',
        cancellable: false
      }, async () => {
        const result = await mcpClient.callTool('enrich_note', { id: noteId });
        const noteData = JSON.parse(result.content[0].text);
        
        vscode.window.showInformationMessage(
          `🤖 Note enriched! Added ${noteData.tags?.length || 0} tags`
        );
      });
    } catch (error: any) {
      vscode.window.showErrorMessage(`❌ Failed to enrich note: ${error.message}`);
    }
  }

  // Helper: Show Note Details
  function showNoteDetails(note: any) {
    const panel = vscode.window.createWebviewPanel(
      'noteDetails',
      `Note: ${note.text.substring(0, 30)}...`,
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    panel.webview.html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; }
          .note-text { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 10px 0; }
          .summary { background: #e3f2fd; padding: 10px; border-radius: 6px; margin: 10px 0; }
          .tags { margin: 10px 0; }
          .tag { background: #007acc; color: white; padding: 4px 8px; border-radius: 12px; margin: 2px; display: inline-block; font-size: 12px; }
          .meta { color: #666; font-size: 12px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <h2>📝 Note Details</h2>
        
        <div class="note-text">
          <strong>Text:</strong><br>
          ${note.text}
        </div>
        
        ${note.summary ? `
          <div class="summary">
            <strong>🤖 AI Summary:</strong><br>
            ${note.summary}
          </div>
        ` : ''}
        
        ${note.tags && note.tags.length > 0 ? `
          <div class="tags">
            <strong>🏷️ Tags:</strong><br>
            ${note.tags.map((tag: string) => `<span class="tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
        
        <div class="meta">
          <strong>ID:</strong> ${note.id}<br>
          <strong>Created:</strong> ${new Date(note.createdAt).toLocaleString()}<br>
          <strong>Updated:</strong> ${new Date(note.updatedAt).toLocaleString()}
        </div>
      </body>
      </html>
    `;
  }

  // Register commands
  context.subscriptions.push(
    createNoteCommand,
    searchNotesCommand,
    listRecentNotesCommand,
    listNotesCommand
  );
}

export function deactivate() {}