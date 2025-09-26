import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { createNote, listNotes, getNote, updateNote, searchNotes, deleteNote } from './db-factory.js';
import { enrichWithAI } from './ai.js';
import { buildMcpRouter } from './mcp.js';

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from React build directory
const frontendBuildPath = path.join(process.cwd(), 'frontend', 'build');

// Serve React build files if they exist
try {
  if (require('fs').existsSync(frontendBuildPath)) {
    app.use(express.static(frontendBuildPath));
  }
} catch {
  // React build not available, API-only mode
}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/api/notes', async (_req, res) => {
  res.json(await listNotes());
});

app.post('/api/notes', async (req, res) => {
  const text = String(req.body?.text ?? '');
  const note = await createNote(text);
  res.status(201).json(note);
});

app.get('/api/notes/:id', async (req, res) => {
  const n = await getNote(req.params.id);
  if (!n) return res.status(404).json({ error: 'not_found' });
  res.json(n);
});

app.post('/api/notes/:id/enrich', async (req, res) => {
  const n = await getNote(req.params.id);
  if (!n) return res.status(404).json({ error: 'not_found' });
  const enrich = await enrichWithAI(n.text);
  res.json(await updateNote(n.id, enrich));
});

app.patch('/api/notes/:id', async (req, res) => {
  const n = await getNote(req.params.id);
  if (!n) return res.status(404).json({ error: 'not_found' });
  const updated = await updateNote(req.params.id, req.body);
  res.json(updated);
});

app.delete('/api/notes/:id', async (req, res) => {
  const deleted = await deleteNote(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'not_found' });
  res.json({ success: true });
});

app.get('/api/search', async (req, res) => {
  const q = (req.query.q as string|undefined);
  const tag = (req.query.tag as string|undefined);
  res.json(await searchNotes(q, tag));
});

app.use('/mcp', buildMcpRouter());

// Catch-all handler for non-API routes: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  // Only handle non-API routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/mcp/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const frontendIndexPath = path.join(process.cwd(), 'frontend', 'build', 'index.html');
  
  try {
    if (require('fs').existsSync(frontendIndexPath)) {
      res.sendFile(frontendIndexPath);
    } else {
      res.status(404).json({ error: 'Frontend not built. Run: npm run build:frontend' });
    }
  } catch {
    res.status(404).json({ error: 'Frontend not available' });
  }
});

const port = Number(process.env.PORT ?? 8080);
app.listen(port, () => {
  console.log(`HTTP API listening on :${port}`);
  console.log(`Frontend available at: http://localhost:${port}`);
});
