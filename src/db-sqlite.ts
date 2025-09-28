import sqlite3 from 'sqlite3';
import { Note } from './types.js';
import { v4 as uuid } from 'uuid';

let db: sqlite3.Database | null = null;

export function initDatabase(): sqlite3.Database {
  if (db) return db;
  
  const dbPath = process.env.DB_FILE || './notes.db';
  
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening SQLite database:', err);
      throw err;
    }
    console.log(`Connected to SQLite database: ${dbPath}`);
  });
  
  return db;
}

export async function createTable(): Promise<void> {
  const database = initDatabase();
  
  return new Promise((resolve, reject) => {
    database.run(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        summary TEXT,
        tags TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function createNote(text: string): Promise<Note> {
  const database = initDatabase();
  
  const id = uuid();
  const now = new Date().toISOString();
  
  return new Promise((resolve, reject) => {
    database.run(
      'INSERT INTO notes (id, text, created_at, updated_at) VALUES (?, ?, ?, ?)',
      [id, text, now, now],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id,
            text,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    );
  });
}

export async function listNotes(): Promise<Note[]> {
  const database = initDatabase();
  
  return new Promise((resolve, reject) => {
    database.all(
      'SELECT id, text, summary, tags, created_at, updated_at FROM notes ORDER BY created_at DESC',
      (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => ({
            id: row.id,
            text: row.text,
            summary: row.summary || undefined,
            tags: row.tags ? JSON.parse(row.tags) : undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          })));
        }
      }
    );
  });
}

export async function getNote(id: string): Promise<Note | undefined> {
  const database = initDatabase();
  
  return new Promise((resolve, reject) => {
    database.get(
      'SELECT id, text, summary, tags, created_at, updated_at FROM notes WHERE id = ?',
      [id],
      (err, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(undefined);
        } else {
          resolve({
            id: row.id,
            text: row.text,
            summary: row.summary || undefined,
            tags: row.tags ? JSON.parse(row.tags) : undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          });
        }
      }
    );
  });
}

export async function updateNote(
  id: string, 
  patch: Partial<Pick<Note, 'text' | 'summary' | 'tags'>>
): Promise<Note | undefined> {
  const database = initDatabase();
  
  const setParts: string[] = [];
  const values: any[] = [];
  
  if (patch.text !== undefined) {
    setParts.push('text = ?');
    values.push(patch.text);
  }
  if (patch.summary !== undefined) {
    setParts.push('summary = ?');
    values.push(patch.summary);
  }
  if (patch.tags !== undefined) {
    setParts.push('tags = ?');
    values.push(JSON.stringify(patch.tags));
  }
  
  if (setParts.length === 0) {
    return getNote(id);
  }
  
  setParts.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);
  
  return new Promise((resolve, reject) => {
    database.run(
      `UPDATE notes SET ${setParts.join(', ')} WHERE id = ?`,
      values,
      function(err) {
        if (err) {
          reject(err);
        } else {
          getNote(id).then(resolve).catch(reject);
        }
      }
    );
  });
}

export async function searchNotes(q: string | undefined): Promise<Note[]> {
  const database = initDatabase();
  
  let query = 'SELECT id, text, summary, tags, created_at, updated_at FROM notes WHERE 1=1';
  const params: any[] = [];
  
  if (q && q.trim()) {
    query += ' AND (LOWER(text) LIKE ? OR LOWER(summary) LIKE ? OR LOWER(tags) LIKE ?)';
    const searchTerm = `%${q.toLowerCase()}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  query += ' ORDER BY created_at DESC';
  
  return new Promise((resolve, reject) => {
    database.all(query, params, (err, rows: any[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows.map(row => ({
          id: row.id,
          text: row.text,
          summary: row.summary || undefined,
          tags: row.tags ? JSON.parse(row.tags) : undefined,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })));
      }
    });
  });
}

export async function deleteNote(id: string): Promise<boolean> {
  const database = initDatabase();
  
  return new Promise((resolve, reject) => {
    database.run('DELETE FROM notes WHERE id = ?', [id], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes > 0);
      }
    });
  });
}