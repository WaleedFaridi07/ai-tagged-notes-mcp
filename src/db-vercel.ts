// Vercel-compatible database options
import { Database } from './db.js';
import { Note } from './types.js';

// Option 1: Vercel KV (Redis-based)
export class VercelKVDatabase implements Database {
  private kv: any;

  constructor() {
    // Requires @vercel/kv package
    // this.kv = kv;
  }

  async createNote(text: string): Promise<Note> {
    const note: Note = {
      id: crypto.randomUUID(),
      text,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // await this.kv.set(`note:${note.id}`, JSON.stringify(note));
    return note;
  }

  async getAllNotes(): Promise<Note[]> {
    // const keys = await this.kv.keys('note:*');
    // const notes = await Promise.all(
    //   keys.map(async (key: string) => {
    //     const data = await this.kv.get(key);
    //     return JSON.parse(data);
    //   })
    // );
    // return notes;
    return [];
  }

  async getNoteById(id: string): Promise<Note | null> {
    // const data = await this.kv.get(`note:${id}`);
    // return data ? JSON.parse(data) : null;
    return null;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
    // const existing = await this.getNoteById(id);
    // if (!existing) return null;
    
    // const updated = { ...existing, ...updates, updatedAt: new Date() };
    // await this.kv.set(`note:${id}`, JSON.stringify(updated));
    // return updated;
    return null;
  }

  async deleteNote(id: string): Promise<boolean> {
    // await this.kv.del(`note:${id}`);
    return true;
  }

  async close(): Promise<void> {
    // No cleanup needed for KV
  }
}

// Option 2: Planetscale (MySQL-compatible)
export class PlanetscaleDatabase implements Database {
  // Implementation using @planetscale/database
  // Serverless MySQL with edge compatibility
}

// Option 3: Supabase (PostgreSQL)
export class SupabaseDatabase implements Database {
  // Implementation using @supabase/supabase-js
  // Serverless PostgreSQL with real-time features
}