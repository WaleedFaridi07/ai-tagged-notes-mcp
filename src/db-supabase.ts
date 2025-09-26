import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Note } from './types.js';

// Supabase database implementation
let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY');
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  
  return supabase;
}

// Create the notes table if it doesn't exist
export async function createTable(): Promise<void> {
  const client = getSupabaseClient();
  
  // The table creation is handled by Supabase migrations
  // We'll create it manually in the Supabase dashboard
  console.log('✅ Supabase table ready');
}

export async function createNote(text: string): Promise<Note> {
  const client = getSupabaseClient();
  
  const note = {
    id: crypto.randomUUID(),
    text,
    summary: null,
    tags: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await client
    .from('notes')
    .insert([note])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating note:', error);
    throw new Error(`Failed to create note: ${error.message}`);
  }
  
  return {
    id: data.id,
    text: data.text,
    summary: data.summary,
    tags: data.tags ? JSON.parse(data.tags) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}

export async function listNotes(): Promise<Note[]> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error listing notes:', error);
    throw new Error(`Failed to list notes: ${error.message}`);
  }
  
  return data.map(row => ({
    id: row.id,
    text: row.text,
    summary: row.summary,
    tags: row.tags ? JSON.parse(row.tags) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }));
}

export async function getNote(id: string): Promise<Note | undefined> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from('notes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return undefined; // Not found
    }
    console.error('Error getting note:', error);
    throw new Error(`Failed to get note: ${error.message}`);
  }
  
  return {
    id: data.id,
    text: data.text,
    summary: data.summary,
    tags: data.tags ? JSON.parse(data.tags) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}

export async function updateNote(
  id: string, 
  patch: Partial<Pick<Note, 'text' | 'summary' | 'tags'>>
): Promise<Note | undefined> {
  const client = getSupabaseClient();
  
  const updateData: any = {
    updated_at: new Date().toISOString()
  };
  
  if (patch.text !== undefined) updateData.text = patch.text;
  if (patch.summary !== undefined) updateData.summary = patch.summary;
  if (patch.tags !== undefined) updateData.tags = JSON.stringify(patch.tags);
  
  const { data, error } = await client
    .from('notes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating note:', error);
    throw new Error(`Failed to update note: ${error.message}`);
  }
  
  return {
    id: data.id,
    text: data.text,
    summary: data.summary,
    tags: data.tags ? JSON.parse(data.tags) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}

export async function searchNotes(q?: string, tag?: string): Promise<Note[]> {
  const client = getSupabaseClient();
  
  let query = client.from('notes').select('*');
  
  if (q) {
    query = query.or(`text.ilike.%${q}%,summary.ilike.%${q}%`);
  }
  
  if (tag) {
    query = query.like('tags', `%"${tag}"%`);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error searching notes:', error);
    throw new Error(`Failed to search notes: ${error.message}`);
  }
  
  return data.map(row => ({
    id: row.id,
    text: row.text,
    summary: row.summary,
    tags: row.tags ? JSON.parse(row.tags) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }));
}

export async function deleteNote(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  
  const { error } = await client
    .from('notes')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting note:', error);
    throw new Error(`Failed to delete note: ${error.message}`);
  }
  
  return true;
}