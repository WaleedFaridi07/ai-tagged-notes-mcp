import { Note } from './types.js';

// Import all database implementations
import * as memoryDb from './db.js';
import * as mysqlDb from './db-mysql.js';
import * as sqliteDb from './db-sqlite.js';
import * as supabaseDb from './db-supabase.js';

// Database interface
export interface Database {
  createNote(text: string): Promise<Note> | Note;
  listNotes(): Promise<Note[]> | Note[];
  getNote(id: string): Promise<Note | undefined> | Note | undefined;
  updateNote(id: string, patch: Partial<Pick<Note, 'text' | 'summary' | 'tags'>>): Promise<Note | undefined> | Note | undefined;
  searchNotes(q: string | undefined, tag: string | undefined): Promise<Note[]> | Note[];
  deleteNote(id: string): Promise<boolean> | boolean;
}

// Wrapper to make memory DB async-compatible
class MemoryDbWrapper implements Database {
  async createNote(text: string): Promise<Note> {
    return memoryDb.createNote(text);
  }
  
  async listNotes(): Promise<Note[]> {
    return memoryDb.listNotes();
  }
  
  async getNote(id: string): Promise<Note | undefined> {
    return memoryDb.getNote(id);
  }
  
  async updateNote(id: string, patch: Partial<Pick<Note, 'text' | 'summary' | 'tags'>>): Promise<Note | undefined> {
    return memoryDb.updateNote(id, patch);
  }
  
  async searchNotes(q: string | undefined, tag: string | undefined): Promise<Note[]> {
    return memoryDb.searchNotes(q, tag);
  }
  
  async deleteNote(id: string): Promise<boolean> {
    return memoryDb.deleteNote(id);
  }
}

// MySQL DB wrapper
class MySqlDbWrapper implements Database {
  private initialized = false;
  
  private async ensureInitialized() {
    if (!this.initialized) {
      await mysqlDb.createTable();
      this.initialized = true;
    }
  }
  
  async createNote(text: string): Promise<Note> {
    await this.ensureInitialized();
    return mysqlDb.createNote(text);
  }
  
  async listNotes(): Promise<Note[]> {
    await this.ensureInitialized();
    return mysqlDb.listNotes();
  }
  
  async getNote(id: string): Promise<Note | undefined> {
    await this.ensureInitialized();
    return mysqlDb.getNote(id);
  }
  
  async updateNote(id: string, patch: Partial<Pick<Note, 'text' | 'summary' | 'tags'>>): Promise<Note | undefined> {
    await this.ensureInitialized();
    return mysqlDb.updateNote(id, patch);
  }
  
  async searchNotes(q: string | undefined, tag: string | undefined): Promise<Note[]> {
    await this.ensureInitialized();
    return mysqlDb.searchNotes(q, tag);
  }
  
  async deleteNote(id: string): Promise<boolean> {
    await this.ensureInitialized();
    return mysqlDb.deleteNote(id);
  }
}

// Supabase DB wrapper
class SupabaseDbWrapper implements Database {
  private initialized = false;
  
  private async ensureInitialized() {
    if (!this.initialized) {
      await supabaseDb.createTable();
      this.initialized = true;
    }
  }
  
  async createNote(text: string): Promise<Note> {
    await this.ensureInitialized();
    return supabaseDb.createNote(text);
  }
  
  async listNotes(): Promise<Note[]> {
    await this.ensureInitialized();
    return supabaseDb.listNotes();
  }
  
  async getNote(id: string): Promise<Note | undefined> {
    await this.ensureInitialized();
    return supabaseDb.getNote(id);
  }
  
  async updateNote(id: string, patch: Partial<Pick<Note, 'text' | 'summary' | 'tags'>>): Promise<Note | undefined> {
    await this.ensureInitialized();
    return supabaseDb.updateNote(id, patch);
  }
  
  async searchNotes(q: string | undefined, tag: string | undefined): Promise<Note[]> {
    await this.ensureInitialized();
    return supabaseDb.searchNotes(q, tag);
  }
  
  async deleteNote(id: string): Promise<boolean> {
    await this.ensureInitialized();
    return supabaseDb.deleteNote(id);
  }
}

// SQLite DB wrapper
class SqliteDbWrapper implements Database {
  private initialized = false;
  
  private async ensureInitialized() {
    if (!this.initialized) {
      await sqliteDb.createTable();
      this.initialized = true;
    }
  }
  
  async createNote(text: string): Promise<Note> {
    await this.ensureInitialized();
    return sqliteDb.createNote(text);
  }
  
  async listNotes(): Promise<Note[]> {
    await this.ensureInitialized();
    return sqliteDb.listNotes();
  }
  
  async getNote(id: string): Promise<Note | undefined> {
    await this.ensureInitialized();
    return sqliteDb.getNote(id);
  }
  
  async updateNote(id: string, patch: Partial<Pick<Note, 'text' | 'summary' | 'tags'>>): Promise<Note | undefined> {
    await this.ensureInitialized();
    return sqliteDb.updateNote(id, patch);
  }
  
  async searchNotes(q: string | undefined, tag: string | undefined): Promise<Note[]> {
    await this.ensureInitialized();
    return sqliteDb.searchNotes(q, tag);
  }
  
  async deleteNote(id: string): Promise<boolean> {
    await this.ensureInitialized();
    return sqliteDb.deleteNote(id);
  }
}

// Factory function to get the appropriate database
export function getDatabase(): Database {
  const dbType = process.env.DB_TYPE || 'sqlite';
  
  // Force memory database in serverless environments
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY;
  
  if (isServerless && dbType === 'sqlite') {
    console.warn('⚠️  SQLite not supported in serverless environment, using memory database');
    return new MemoryDbWrapper();
  }
  
  switch (dbType.toLowerCase()) {
    case 'mysql':
      return new MySqlDbWrapper();
    case 'memory':
      return new MemoryDbWrapper();
    case 'supabase':
      return new SupabaseDbWrapper();
    case 'sqlite':
    default:
      return new SqliteDbWrapper();
  }
}

// Export convenience functions that use the factory
const db = getDatabase();

export const createNote = (text: string) => db.createNote(text);
export const listNotes = () => db.listNotes();
export const getNote = (id: string) => db.getNote(id);
export const updateNote = (id: string, patch: Partial<Pick<Note, 'text' | 'summary' | 'tags'>>) => db.updateNote(id, patch);
export const searchNotes = (q: string | undefined, tag: string | undefined) => db.searchNotes(q, tag);
export const deleteNote = (id: string) => db.deleteNote(id);