import mysql from 'mysql2/promise';
import { Note } from './types.js';
import { v4 as uuid } from 'uuid';

let pool: mysql.Pool | null = null;

// Initialize MySQL connection pool
export function initDatabase() {
  if (pool) return pool;
  
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'notes_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  
  return pool;
}

// Create database if it doesn't exist
export async function createDatabaseIfNotExists() {
  const dbName = process.env.DB_NAME || 'notes_db';
  
  // Create a connection without specifying a database
  const tempPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
  });
  
  try {
    // Create database if it doesn't exist
    await tempPool.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database '${dbName}' created or already exists`);
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  } finally {
    await tempPool.end();
  }
}

// Create the notes table if it doesn't exist
export async function createTable() {
  // First ensure the database exists
  await createDatabaseIfNotExists();
  
  const db = initDatabase();
  
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id VARCHAR(36) PRIMARY KEY,
        text TEXT NOT NULL,
        summary TEXT,
        tags JSON,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )
    `);
    console.log('Notes table created or already exists');
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
}

export async function createNote(text: string): Promise<Note> {
  const db = initDatabase();
  const id = uuid();
  const now = new Date();
  
  await db.execute(
    'INSERT INTO notes (id, text, created_at, updated_at) VALUES (?, ?, ?, ?)',
    [id, text, now, now]
  );
  
  return {
    id,
    text,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export async function listNotes(): Promise<Note[]> {
  const db = initDatabase();
  const [rows] = await db.execute(
    'SELECT id, text, summary, tags, created_at, updated_at FROM notes ORDER BY created_at DESC'
  );
  
  return (rows as any[]).map(row => ({
    id: row.id,
    text: row.text,
    summary: row.summary || undefined,
    tags: row.tags ? JSON.parse(row.tags) : undefined,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }));
}

export async function getNote(id: string): Promise<Note | undefined> {
  const db = initDatabase();
  const [rows] = await db.execute(
    'SELECT id, text, summary, tags, created_at, updated_at FROM notes WHERE id = ?',
    [id]
  );
  
  const row = (rows as any[])[0];
  if (!row) return undefined;
  
  return {
    id: row.id,
    text: row.text,
    summary: row.summary || undefined,
    tags: row.tags ? JSON.parse(row.tags) : undefined,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function updateNote(
  id: string, 
  patch: Partial<Pick<Note, 'text' | 'summary' | 'tags'>>
): Promise<Note | undefined> {
  const db = initDatabase();
  
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
  values.push(new Date());
  values.push(id);
  
  await db.execute(
    `UPDATE notes SET ${setParts.join(', ')} WHERE id = ?`,
    values
  );
  
  return getNote(id);
}

export async function searchNotes(q: string | undefined, tag: string | undefined): Promise<Note[]> {
  const db = initDatabase();
  let query = 'SELECT id, text, summary, tags, created_at, updated_at FROM notes WHERE 1=1';
  const params: any[] = [];
  
  if (q && q.trim()) {
    query += ' AND (text LIKE ? OR summary LIKE ? OR JSON_SEARCH(tags, "one", ?) IS NOT NULL)';
    const searchTerm = `%${q.toLowerCase()}%`;
    params.push(searchTerm, searchTerm, `%${q.toLowerCase()}%`);
  }
  
  if (tag && tag.trim()) {
    query += ' AND JSON_SEARCH(tags, "one", ?) IS NOT NULL';
    params.push(tag.toLowerCase());
  }
  
  query += ' ORDER BY created_at DESC';
  
  const [rows] = await db.execute(query, params);
  
  return (rows as any[]).map(row => ({
    id: row.id,
    text: row.text,
    summary: row.summary || undefined,
    tags: row.tags ? JSON.parse(row.tags) : undefined,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }));
}

export async function deleteNote(id: string): Promise<boolean> {
  const db = initDatabase();
  const [result] = await db.execute('DELETE FROM notes WHERE id = ?', [id]);
  return (result as any).affectedRows > 0;
}