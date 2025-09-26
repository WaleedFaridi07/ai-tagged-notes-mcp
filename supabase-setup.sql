-- Create the notes table in Supabase
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  summary TEXT,
  tags TEXT, -- JSON string of tags array
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_text_search ON notes USING gin(to_tsvector('english', text));
CREATE INDEX IF NOT EXISTS idx_notes_summary_search ON notes USING gin(to_tsvector('english', summary));

-- Enable Row Level Security (RLS) - optional for public access
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on notes" ON notes
  FOR ALL USING (true);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_notes_updated_at 
  BEFORE UPDATE ON notes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();