import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { enrichWithAI } from '../src/ai.js';
import { createNote, listNotes, getNote, updateNote, deleteNote } from '../src/db-factory.js';
import { Note } from '../src/types.js';
import { buildMcpRouter } from '../src/mcp.js';
import { buildMcpHttpRouter } from '../src/mcp-http.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend build
app.use(express.static(path.join(process.cwd(), 'frontend/build')));

// Mount MCP HTTP routes (proper MCP protocol)
app.use('/mcp', buildMcpHttpRouter());

// Mount legacy MCP routes (simple HTTP API)
app.use('/mcp-legacy', buildMcpRouter());

// API Routes
app.post('/api/notes', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const note = await createNote(text);
    res.json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.get('/api/notes', async (req, res) => {
  try {
    const notes = await listNotes();
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

app.get('/api/notes/:id', async (req, res) => {
  try {
    const note = await getNote(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

app.post('/api/notes/:id/enrich', async (req, res) => {
  try {
    const note = await getNote(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    console.log(`🤖 Enriching note: ${note.text.substring(0, 50)}...`);

    const enrichResult = await enrichWithAI(note.text);
    const updatedNote = await updateNote(req.params.id, {
      summary: enrichResult.summary,
      tags: enrichResult.tags
    });

    res.json(updatedNote);
  } catch (error) {
    console.error('Error enriching note:', error);
    res.status(500).json({ error: 'Failed to enrich note' });
  }
});

app.patch('/api/notes/:id', async (req, res) => {
  try {
    const updatedNote = await updateNote(req.params.id, req.body);
    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    await deleteNote(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    env: {
      DB_TYPE: process.env.DB_TYPE || 'not set',
      AI_PROVIDER: process.env.AI_PROVIDER || 'not set',
      SUPABASE_URL: process.env.SUPABASE_URL ? 'set' : 'not set',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'set' : 'not set'
    }
  });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'frontend/build', 'index.html'));
});

// Debug endpoint to test specific note
app.get('/api/debug/note/:id', async (req, res) => {
  try {
    console.log('Debug: Looking for note ID:', req.params.id);
    console.log('Debug: DB_TYPE:', process.env.DB_TYPE);
    console.log('Debug: SUPABASE_URL:', process.env.SUPABASE_URL ? 'set' : 'not set');

    const note = await getNote(req.params.id);
    console.log('Debug: Note found:', note ? 'yes' : 'no');

    res.json({
      noteId: req.params.id,
      found: !!note,
      note: note,
      env: {
        DB_TYPE: process.env.DB_TYPE,
        SUPABASE_URL: process.env.SUPABASE_URL ? 'set' : 'not set'
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      noteId: req.params.id,
      env: {
        DB_TYPE: process.env.DB_TYPE,
        SUPABASE_URL: process.env.SUPABASE_URL ? 'set' : 'not set'
      }
    });
  }
});

// Export for Vercel
export default app;