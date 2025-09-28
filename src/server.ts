import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { createNote, listNotes, getNote, updateNote, searchNotes, deleteNote } from './db-factory.js';
import { enrichWithAI } from './ai.js';
import { buildMcpRouter } from './mcp.js';
import { buildMcpHttpRouter } from './mcp-http.js';

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from React build directory
const frontendBuildPath = path.join(process.cwd(), 'frontend', 'build');

try {
  if (fs.existsSync(frontendBuildPath)) {
    app.use(express.static(frontendBuildPath));
  }
} catch (error) {
  console.warn('Frontend build not available, running in API-only mode:', (error as Error).message);
}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/api/notes', async (_req, res) => {
  try {
    res.json(await listNotes());
  } catch (error) {
    console.error('Error fetching notes:', (error as Error).message);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const text = String(req.body?.text ?? '');
    const note = await createNote(text);
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', (error as Error).message);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.get('/api/notes/:id', async (req, res) => {
  try {
    const n = await getNote(req.params.id);
    if (!n) return res.status(404).json({ error: 'not_found' });
    res.json(n);
  } catch (error) {
    console.error('Error fetching note:', (error as Error).message);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

app.post('/api/notes/:id/enrich', async (req, res) => {
  try {
    const n = await getNote(req.params.id);
    if (!n) return res.status(404).json({ error: 'not_found' });
    const enrich = await enrichWithAI(n.text);
    res.json(await updateNote(n.id, enrich));
  } catch (error) {
    console.error('Error enriching note:', (error as Error).message);
    res.status(500).json({ error: 'Failed to enrich note' });
  }
});

app.patch('/api/notes/:id', async (req, res) => {
  try {
    const n = await getNote(req.params.id);
    if (!n) return res.status(404).json({ error: 'not_found' });
    const updated = await updateNote(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error('Error updating note:', (error as Error).message);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const deleted = await deleteNote(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'not_found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', (error as Error).message);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const q = (req.query.q as string | undefined);
    const tag = (req.query.tag as string | undefined);
    res.json(await searchNotes(q));
  } catch (error) {
    console.error('Error searching notes:', (error as Error).message);
    res.status(500).json({ error: 'Failed to search notes' });
  }
});

app.use('/mcp', buildMcpRouter());
app.use('/mcp-http', buildMcpHttpRouter());

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/mcp/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  const frontendIndexPath = path.join(process.cwd(), 'frontend', 'build', 'index.html');

  try {
    if (fs.existsSync(frontendIndexPath)) {
      res.sendFile(frontendIndexPath);
    } else {
      res.status(404).json({ error: 'Frontend not built. Run: npm run build:frontend' });
    }
  } catch (error) {
    console.error('Error serving frontend:', (error as Error).message);
    res.status(404).json({ error: 'Frontend not available' });
  }
});

const port = Number(process.env.PORT ?? 8080);
app.listen(port, () => {
  console.log(`HTTP API listening on :${port}`);
  console.log(`Frontend available at: http://localhost:${port}`);
});
