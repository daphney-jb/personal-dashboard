/**
 * Error-handling Tests
 *
 * Verifies that storage utilities degrade gracefully when localStorage
 * is unavailable, contains corrupt data, or throws quota errors.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
  clearDone,
} from '../utils/todoStorage.js';
import { getLayout, saveLayout } from '../utils/layoutStorage.js';

const TODO_KEY   = 'nexboard_todos';
const LAYOUT_KEY = 'nexboard_layout';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Corrupt data ────────────────────────────────────────────────────────────

describe('corrupt localStorage data', () => {
  it('getTodos() returns [] when stored value is invalid JSON', () => {
    localStorage.setItem(TODO_KEY, '%%not valid json%%');
    expect(getTodos()).toEqual([]);
  });

  it('getLayout() returns default when stored value is invalid JSON', () => {
    localStorage.setItem(LAYOUT_KEY, '{broken}');
    expect(getLayout()).toEqual(['weather', 'todo', 'news', 'whiteboard']);
  });

  it('getLayout() returns default when stored value is null (key missing)', () => {
    // localStorage.getItem returns null for missing keys;
    // JSON.parse(null) === null, not an array
    expect(getLayout()).toEqual(['weather', 'todo', 'news', 'whiteboard']);
  });

  it('getLayout() returns default when stored value is a plain object (not array)', () => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify({ order: [] }));
    expect(getLayout()).toEqual(['weather', 'todo', 'news', 'whiteboard']);
  });

  it('toggleTodo() on a non-existent id returns unchanged list', () => {
    addTodo('Only item');
    const before = getTodos();
    const result = toggleTodo(99999999);
    expect(result).toEqual(before);
  });

  it('deleteTodo() on a non-existent id returns unchanged list', () => {
    addTodo('Only item');
    const before = getTodos();
    const result = deleteTodo(99999999);
    expect(result).toEqual(before);
  });
});

// ─── localStorage.getItem throws ────────────────────────────────────────────

describe('localStorage.getItem throws', () => {
  it('getTodos() returns [] without throwing', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: access denied');
    });
    expect(() => getTodos()).not.toThrow();
    expect(getTodos()).toEqual([]);
  });

  it('getLayout() returns default without throwing', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: access denied');
    });
    expect(() => getLayout()).not.toThrow();
    expect(getLayout()).toEqual(['weather', 'todo', 'news', 'whiteboard']);
  });
});

// ─── localStorage.setItem throws (quota exceeded) ───────────────────────────

describe('localStorage.setItem throws (quota exceeded)', () => {
  it('addTodo() does not throw when setItem fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(() => addTodo('Should not crash')).not.toThrow();
  });

  it('toggleTodo() does not throw when setItem fails', () => {
    // seed data directly so getItem works, only setItem is broken
    localStorage.setItem(TODO_KEY, JSON.stringify([{ id: 1, text: 'x', done: false, createdAt: 0 }]));
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(() => toggleTodo(1)).not.toThrow();
  });

  it('deleteTodo() does not throw when setItem fails', () => {
    localStorage.setItem(TODO_KEY, JSON.stringify([{ id: 1, text: 'x', done: false, createdAt: 0 }]));
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(() => deleteTodo(1)).not.toThrow();
  });

  it('clearDone() does not throw when setItem fails', () => {
    localStorage.setItem(TODO_KEY, JSON.stringify([{ id: 1, text: 'x', done: true, createdAt: 0 }]));
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(() => clearDone()).not.toThrow();
  });
});

// ─── Edge cases ──────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('clearDone() on an already-empty list returns []', () => {
    expect(clearDone()).toEqual([]);
  });

  it('clearDone() when no todos are done returns the full list unchanged', () => {
    addTodo('Active 1');
    addTodo('Active 2');
    const before = getTodos();
    expect(clearDone()).toEqual(before);
  });

  it('addTodo() with only whitespace still saves a trimmed (empty) string', () => {
    // The implementation trims text — this documents/pins that behaviour
    addTodo('   ');
    expect(getTodos()[0].text).toBe('');
  });
});
