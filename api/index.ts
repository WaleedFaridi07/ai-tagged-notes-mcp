import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { enrichWithAI } from '../src/ai.js';
import { createNote, listNotes, getNote, updateNote, deleteNote } from '../src/db-factory.js';
import { Note } from '../src/types.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

app.put('/api/notes/:id/enrich', async (req, res) => {
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
    version: '1.0.0'
  });
});

// Export for Vercel
export default app;