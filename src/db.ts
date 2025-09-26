import { Note } from './types.js';
import { v4 as uuid } from 'uuid';

const notes = new Map<string, Note>();

export function createNote(text: string): Note {
  const now = new Date().toISOString();
  const n: Note = { id: uuid(), text, createdAt: now, updatedAt: now };
  notes.set(n.id, n);
  return n;
}

export function listNotes(): Note[] {
  return Array.from(notes.values()).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
}

export function getNote(id: string): Note | undefined {
  return notes.get(id);
}

export function updateNote(id: string, patch: Partial<Pick<Note,'text'|'summary'|'tags'>>): Note | undefined {
  const current = notes.get(id);
  if (!current) return undefined;
  const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
  notes.set(id, updated);
  return updated;
}

export function searchNotes(q: string | undefined, tag: string | undefined): Note[] {
  let arr = listNotes();
  if (q && q.trim()) {
    const s = q.toLowerCase();
    arr = arr.filter(n =>
      n.text.toLowerCase().includes(s) ||
      (n.summary?.toLowerCase().includes(s) ?? false) ||
      (n.tags?.some(t => t.toLowerCase().includes(s)) ?? false)
    );
  }
  if (tag && tag.trim()) {
    const t = tag.toLowerCase();
    arr = arr.filter(n => n.tags?.some(x => x.toLowerCase() == t));
  }
  return arr;
}

export function deleteNote(id: string): boolean {
  return notes.delete(id);
}
