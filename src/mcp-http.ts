import type { Request, Response, Router } from 'express';
import { Router as makeRouter } from 'express';
import { createNote, updateNote, searchNotes, getNote, deleteNote } from './db-factory.js';
import { enrichWithAI } from './ai.js';

// MCP Protocol Implementation for HTTP Transport
export function buildMcpHttpRouter(): Router {
  const r = makeRouter();

  // Set proper headers for MCP
  r.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  // Handle preflight requests
  r.options('*', (req, res) => {
    res.status(200).end();
  });

  // MCP Initialize
  r.post('/initialize', (req, res) => {
    res.json({
      jsonrpc: "2.0",
      id: req.body.id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: "ai-tagged-notes-mcp",
          version: "1.0.0"
        }
      }
    });
  });

  // List tools
  r.post('/tools/list', (req, res) => {
    res.json({
      jsonrpc: "2.0",
      id: req.body.id,
      result: {
        tools: [
          {
            name: "mcp_notes_local_create_note",
            description: "Create a note with raw text",
            inputSchema: {
              type: "object",
              properties: {
                text: { type: "string", minLength: 1 }
              },
              required: ["text"]
            }
          },
          {
            name: "mcp_notes_local_enrich_note",
            description: "AI-enrich a note by id (summary + tags)",
            inputSchema: {
              type: "object",
              properties: {
                id: { type: "string", minLength: 1 }
              },
              required: ["id"]
            }
          },
          {
            name: "mcp_notes_local_get_note",
            description: "Get a single note by id",
            inputSchema: {
              type: "object",
              properties: {
                id: { type: "string", minLength: 1 }
              },
              required: ["id"]
            }
          },
          {
            name: "mcp_notes_local_search_notes",
            description: "Search notes by free-text and/or tag",
            inputSchema: {
              type: "object",
              properties: {
                q: { type: "string" },
                tag: { type: "string" }
              }
            }
          },
          {
            name: "mcp_notes_local_delete_note",
            description: "Delete a note by id",
            inputSchema: {
              type: "object",
              properties: {
                id: { type: "string", minLength: 1 }
              },
              required: ["id"]
            }
          }
        ]
      }
    });
  });

  // Call tool
  r.post('/tools/call', async (req, res) => {
    const { id, params } = req.body;
    const { name, arguments: args } = params;

    try {
      let result;

      switch (name) {
        case 'mcp_notes_local_create_note': {
          result = await createNote(String(args?.text ?? ''));
          break;
        }
        case 'mcp_notes_local_enrich_note': {
          const noteId = String(args?.id ?? '');
          const note = await getNote(noteId);
          if (!note) {
            return res.json({
              jsonrpc: "2.0",
              id,
              error: {
                code: -32602,
                message: "Note not found"
              }
            });
          }
          const enrich = await enrichWithAI(note.text);
          result = await updateNote(noteId, enrich);
          break;
        }
        case 'mcp_notes_local_search_notes': {
          const q = args?.q ? String(args.q) : undefined;
          const tag = args?.tag ? String(args.tag) : undefined;
          result = await searchNotes(q, tag);
          break;
        }
        case 'mcp_notes_local_get_note': {
          const noteId = String(args?.id ?? '');
          result = await getNote(noteId);
          if (!result) {
            return res.json({
              jsonrpc: "2.0",
              id,
              error: {
                code: -32602,
                message: "Note not found"
              }
            });
          }
          break;
        }
        case 'mcp_notes_local_delete_note': {
          const noteId = String(args?.id ?? '');
          const deleted = await deleteNote(noteId);
          if (!deleted) {
            return res.json({
              jsonrpc: "2.0",
              id,
              error: {
                code: -32602,
                message: "Note not found"
              }
            });
          }
          result = { success: true };
          break;
        }
        default:
          return res.json({
            jsonrpc: "2.0",
            id,
            error: {
              code: -32601,
              message: "Method not found"
            }
          });
      }

      res.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        }
      });

    } catch (error: any) {
      console.error('MCP HTTP tool execution error:', error?.message ?? 'Unknown error');
      res.json({
        jsonrpc: "2.0",
        id,
        error: {
          code: -32603,
          message: error?.message ?? 'Internal error'
        }
      });
    }
  });

  return r;
}