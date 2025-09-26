import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

interface Note {
  id: string;
  text: string;
  summary?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

const API_BASE = '/api';

interface Toast {
  id: string;
  text: string;
  type: 'success' | 'error';
}

interface ConfirmDialog {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [enrichingNotes, setEnrichingNotes] = useState<Set<string>>(new Set());
  const [deletingNotes, setDeletingNotes] = useState<Set<string>>(new Set());
  const [newNoteText, setNewNoteText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
  });

  // Show toast message
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    const toast: Toast = { id, text, type };
    setToasts(prev => [...prev, toast]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Remove toast manually
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Show confirmation dialog
  const showConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Load notes
  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/notes`);
      if (!response.ok) throw new Error('Failed to load notes');
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      showToast('Error loading notes: ' + (error as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create note
  const createNote = async () => {
    if (!newNoteText.trim()) {
      showToast('Please enter some text for your note', 'error');
      return;
    }

    if (creating) return; // Prevent double submission

    try {
      setCreating(true);
      const response = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newNoteText }),
      });

      if (!response.ok) throw new Error('Failed to create note');
      
      setNewNoteText('');
      showToast('Note created successfully!');
      loadNotes();
    } catch (error) {
      showToast('Error creating note: ' + (error as Error).message, 'error');
    } finally {
      setCreating(false);
    }
  };

  // Search notes
  const searchNotes = async () => {
    if (!searchQuery.trim()) {
      loadNotes();
      return;
    }

    if (searching) return; // Prevent double search

    try {
      setSearching(true);
      setLoading(true);
      const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Failed to search notes');
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      showToast('Error searching notes: ' + (error as Error).message, 'error');
    } finally {
      setSearching(false);
      setLoading(false);
    }
  };

  // Enrich note
  const enrichNote = async (noteId: string) => {
    if (enrichingNotes.has(noteId)) return; // Prevent double enrichment

    try {
      setEnrichingNotes(prev => new Set(prev).add(noteId));
      const response = await fetch(`${API_BASE}/notes/${noteId}/enrich`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to enrich note');
      
      showToast('Note enriched successfully!');
      loadNotes();
    } catch (error) {
      showToast('Error enriching note: ' + (error as Error).message, 'error');
    } finally {
      setEnrichingNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(noteId);
        return newSet;
      });
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    loadNotes();
  };

  // Delete note
  const deleteNote = async (noteId: string) => {
    if (deletingNotes.has(noteId)) return; // Prevent double deletion

    const note = notes.find(n => n.id === noteId);
    const notePreview = note ? note.text.substring(0, 50) + (note.text.length > 50 ? '...' : '') : 'this note';

    showConfirmDialog(
      'Delete Note',
      `Are you sure you want to delete "${notePreview}"? This action cannot be undone.`,
      async () => {
        try {
          setDeletingNotes(prev => new Set(prev).add(noteId));
          
          const response = await fetch(`${API_BASE}/notes/${noteId}`, {
            method: 'DELETE',
          });

          if (!response.ok) throw new Error('Failed to delete note');
          
          showToast('Note deleted successfully!');
          loadNotes();
        } catch (error) {
          showToast('Error deleting note: ' + (error as Error).message, 'error');
        } finally {
          setDeletingNotes(prev => {
            const newSet = new Set(prev);
            newSet.delete(noteId);
            return newSet;
          });
        }
      }
    );
  };

  // Remove tag from note
  const removeTag = async (noteId: string, tagToRemove: string) => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (!note || !note.tags) return;

      const updatedTags = note.tags.filter(tag => tag !== tagToRemove);
      
      const response = await fetch(`${API_BASE}/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: updatedTags }),
      });

      if (!response.ok) throw new Error('Failed to remove tag');
      
      showToast('Tag removed successfully!');
      loadNotes();
    } catch (error) {
      showToast('Error removing tag: ' + (error as Error).message, 'error');
    }
  };

  // Handle keyboard shortcuts
  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      action();
    }
  };

  // Load notes on component mount
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>AI Tagged Notes</h1>
          <p>Create, search, and enrich your notes with AI-powered summaries and tags</p>
        </header>

        {/* Toast Container */}
        <div className="toast-container">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`toast toast-${toast.type}`}
              onClick={() => removeToast(toast.id)}
            >
              <span className="toast-text">{toast.text}</span>
              <button className="toast-close" onClick={() => removeToast(toast.id)}>
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Confirmation Dialog */}
        {confirmDialog.isOpen && (
          <div className="modal-overlay" onClick={confirmDialog.onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{confirmDialog.title}</h3>
                <button className="modal-close" onClick={confirmDialog.onCancel}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p>{confirmDialog.message}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={confirmDialog.onCancel}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={confirmDialog.onConfirm}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Note Section */}
        <section className="create-section">
          <h2>Create New Note</h2>
          <textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, createNote)}
            placeholder="Write your note here... (Ctrl+Enter to save)"
            rows={4}
          />
          <button 
            onClick={createNote} 
            disabled={creating}
            className="btn btn-primary"
          >
            {creating ? (
              <>
                <span className="spinner"></span>
                Creating...
              </>
            ) : (
              'Create Note'
            )}
          </button>
        </section>

        {/* Notes Section */}
        <section className="notes-section">
          <div className="notes-header">
            <h2>Your Notes</h2>
            <button 
              onClick={loadNotes} 
              disabled={loading}
              className="btn btn-secondary"
            >
              {loading ? (
                'Loading...'
              ) : (
                'Refresh'
              )}
            </button>
          </div>

          {/* Search */}
          <div className="search-section">
            <div className="search-controls">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchNotes()}
                placeholder="Search notes..."
                className="search-input"
              />
              <button 
                onClick={searchNotes} 
                disabled={searching}
                className="btn btn-secondary"
              >
                {searching ? (
                  <>
                    <span className="spinner"></span>
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </button>
              <button onClick={clearSearch} className="btn btn-secondary">
                Clear
              </button>
            </div>
          </div>

          {/* Notes List */}
          <div className={`notes-container ${loading ? 'loading' : ''}`}>
            {loading ? (
              <div className="loading">Loading notes...</div>
            ) : notes.length === 0 ? (
              <div className="empty-state">
                No notes found. Create your first note above!
              </div>
            ) : (
              notes.map((note) => (
                <div 
                  key={note.id} 
                  className={`note-card ${enrichingNotes.has(note.id) ? 'enriching' : ''} ${deletingNotes.has(note.id) ? 'deleting' : ''}`}
                >
                  <div className="note-text">{note.text}</div>
                  
                  {note.summary && (
                    <div className="note-summary">
                      <strong>Summary:</strong> {note.summary}
                    </div>
                  )}
                  
                  {note.tags && note.tags.length > 0 && (
                    <div className="note-tags">
                      {note.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                          <button
                            onClick={() => removeTag(note.id, tag)}
                            className="tag-delete"
                            title="Remove tag"
                            disabled={deletingNotes.has(note.id) || enrichingNotes.has(note.id)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="note-meta">
                    <span>Created: {new Date(note.createdAt).toLocaleString()}</span>
                    <div className="note-actions">
                      {!note.summary && (
                        <button
                          onClick={() => enrichNote(note.id)}
                          disabled={enrichingNotes.has(note.id) || deletingNotes.has(note.id)}
                          className="btn btn-secondary btn-small"
                        >
                          {enrichingNotes.has(note.id) ? (
                            <>
                              <span className="spinner"></span>
                              Enriching...
                            </>
                          ) : (
                            'Enrich with AI'
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => deleteNote(note.id)}
                        disabled={deletingNotes.has(note.id) || enrichingNotes.has(note.id)}
                        className="btn btn-danger"
                        title="Delete note"
                      >
                        {deletingNotes.has(note.id) ? (
                          <span className="spinner"></span>
                        ) : (
                          '🗑️'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;