import type { Request, Response, Router } from 'express';
import { Router as makeRouter } from 'express';
import { createNote, updateNote, listNotes, searchNotes, getNote, deleteNote } from './db-factory.js';
import { enrichWithAI } from './ai.js';

type Tool = {
  name: string;
  description: string;
  inputSchema: any;
};

const tools: Tool[] = [
  {
    name: "create_note",
    description: "Create a note with raw text",
    inputSchema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] }
  },
  {
    name: "enrich_note",
    description: "AI-enrich a note by id (summary + tags)",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] }
  },
  {
    name: "search_notes",
    description: "Search notes by free-text and/or tag",
    inputSchema: { type: "object", properties: { q: { type: "string" } } }
  },
  {
    name: "list_recent_notes",
    description: "Get the latest 10 notes (most recently created)",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "get_note",
    description: "Get a single note by id",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] }
  },
  {
    name: "delete_note",
    description: "Delete a note by id",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] }
  }
];

export function buildMcpRouter(): Router {
  const r = makeRouter();

  r.get('/tools', (_req: Request, res: Response) => {
    res.json({ tools });
  });

  r.post('/call', async (req: Request, res: Response) => {
    const { name, arguments: args } = req.body ?? {};
    try {
      switch (name) {
        case 'create_note': {
          const note = await createNote(String(args?.text ?? ''));
          res.json({ ok: true, result: note });
          return;
        }
        case 'enrich_note': {
          const id = String(args?.id ?? '');
          const note = await getNote(id);
          if (!note) return res.status(404).json({ ok: false, error: 'not_found' });
          const enrich = await enrichWithAI(note.text);
          res.json({ ok: true, result: await updateNote(id, enrich) });
          return;
        }
        case 'search_notes': {
          const q = args?.q ? String(args.q) : undefined;
          res.json({ ok: true, result: await searchNotes(q) });
          return;
        }
        case 'list_recent_notes': {
          const notes = await listNotes();
          // Return latest 10 notes (most recently created)
          const recentNotes = notes.slice(0, 10);
          res.json({ ok: true, result: recentNotes });
          return;
        }
        case 'get_note': {
          const id = String(args?.id ?? '');
          const note = await getNote(id);
          if (!note) return res.status(404).json({ ok: false, error: 'not_found' });
          res.json({ ok: true, result: note });
          return;
        }
        case 'delete_note': {
          const id = String(args?.id ?? '');
          const deleted = await deleteNote(id);
          if (!deleted) return res.status(404).json({ ok: false, error: 'not_found' });
          res.json({ ok: true, result: { success: true } });
          return;
        }
        default:
          res.status(400).json({ ok: false, error: 'unknown_tool' });
      }
    } catch (e: any) {
      console.error('MCP tool execution error:', e?.message ?? 'Unknown error');
      res.status(500).json({ ok: false, error: e?.message ?? 'error' });
    }
  });

  return r;
}
