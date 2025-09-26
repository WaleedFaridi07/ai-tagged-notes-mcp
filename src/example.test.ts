import { createNote, listNotes, searchNotes } from './db-factory.js';
import assert from 'node:assert/strict';
import test from 'node:test';

test('create and search notes', async () => {
  const n = await createNote('hello world project x');
  assert.ok(n.id);
  const all = await listNotes();
  assert.ok(all.length >= 1);
  const res = await searchNotes('project', undefined);
  assert.ok(res.some(x => x.id === n.id));
});
