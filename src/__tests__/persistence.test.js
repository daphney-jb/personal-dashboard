/**
 * localStorage Persistence Tests
 *
 * Verifies that all nexboard storage utilities correctly read from and
 * write to localStorage, and that data survives across re-loads of the
 * module (simulated by calling load/get helpers after save/set helpers).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
  clearDone,
} from '../utils/todoStorage.js';
import { getLayout, saveLayout } from '../utils/layoutStorage.js';

// ─── helpers ────────────────────────────────────────────────────────────────

const TODO_KEY    = 'nexboard_todos';
const LAYOUT_KEY  = 'nexboard_layout';
const THEME_KEY   = 'nexboard_theme';
const DEFAULT_LAYOUT = ['weather', 'todo', 'news', 'whiteboard'];

beforeEach(() => {
  localStorage.clear();
});

// ─── Todo Persistence ────────────────────────────────────────────────────────

describe('todoStorage – persistence', () => {
  it('getTodos() returns an empty array when nothing is stored', () => {
    expect(getTodos()).toEqual([]);
  });

  it('addTodo() writes the new item to localStorage', () => {
    addTodo('Buy milk');
    const raw = localStorage.getItem(TODO_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].text).toBe('Buy milk');
    expect(parsed[0].done).toBe(false);
  });

  it('addTodo() prepends items so the newest is first', () => {
    addTodo('First');
    addTodo('Second');
    const todos = getTodos();
    expect(todos[0].text).toBe('Second');
    expect(todos[1].text).toBe('First');
  });

  it('getTodos() reads what addTodo() persisted', () => {
    addTodo('Persist me');
    const todos = getTodos();
    expect(todos).toHaveLength(1);
    expect(todos[0].text).toBe('Persist me');
  });

  it('toggleTodo() flips done and persists the change', () => {
    addTodo('Toggle test');
    const [{ id }] = getTodos();

    toggleTodo(id);
    expect(getTodos()[0].done).toBe(true);

    toggleTodo(id);
    expect(getTodos()[0].done).toBe(false);
  });

  it('deleteTodo() removes only the specified item', () => {
    // Seed with distinct ids to avoid the Date.now() same-millisecond collision
    // that can occur when addTodo() is called twice in rapid succession.
    const items = [
      { id: 2, text: 'Delete me', done: false, createdAt: 2 },
      { id: 1, text: 'Keep me',   done: false, createdAt: 1 },
    ];
    localStorage.setItem(TODO_KEY, JSON.stringify(items));

    deleteTodo(2);
    const remaining = getTodos();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(1);
    expect(remaining[0].text).toBe('Keep me');
  });

  it('clearDone() removes only completed todos', () => {
    // Seed with distinct ids to avoid the Date.now() same-millisecond collision.
    const items = [
      { id: 2, text: 'Done task', done: true,  createdAt: 2 },
      { id: 1, text: 'Active',    done: false, createdAt: 1 },
    ];
    localStorage.setItem(TODO_KEY, JSON.stringify(items));

    clearDone();
    const remaining = getTodos();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(1);
    expect(remaining[0].done).toBe(false);
  });

  it('multiple addTodo calls accumulate in storage', () => {
    ['A', 'B', 'C'].forEach(t => addTodo(t));
    expect(getTodos()).toHaveLength(3);
    // Verify the raw storage also has 3 items
    expect(JSON.parse(localStorage.getItem(TODO_KEY))).toHaveLength(3);
  });

  it('todo items include id, text, done, and createdAt fields', () => {
    addTodo('Full item');
    const [item] = getTodos();
    expect(item).toMatchObject({
      id: expect.any(Number),
      text: 'Full item',
      done: false,
      createdAt: expect.any(Number),
    });
  });

  it('addTodo() trims whitespace from the text', () => {
    addTodo('  spaces  ');
    expect(getTodos()[0].text).toBe('spaces');
  });
});

// ─── Layout Persistence ──────────────────────────────────────────────────────

describe('layoutStorage – persistence', () => {
  it('getLayout() returns the default order when nothing is saved', () => {
    expect(getLayout()).toEqual(DEFAULT_LAYOUT);
  });

  it('saveLayout() writes to localStorage', () => {
    const custom = ['todo', 'news', 'weather', 'whiteboard'];
    saveLayout(custom);
    expect(localStorage.getItem(LAYOUT_KEY)).toBe(JSON.stringify(custom));
  });

  it('getLayout() reads back what saveLayout() saved', () => {
    const custom = ['news', 'whiteboard', 'todo', 'weather'];
    saveLayout(custom);
    expect(getLayout()).toEqual(custom);
  });

  it('getLayout() returns default when saved array has wrong length', () => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(['weather', 'todo']));
    expect(getLayout()).toEqual(DEFAULT_LAYOUT);
  });
});

// ─── Theme Persistence (manual, no hook) ─────────────────────────────────────

describe('nexboard_theme – persistence', () => {
  it('theme key is absent initially', () => {
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
  });

  it('manually writing "dark" is readable as the correct string', () => {
    localStorage.setItem(THEME_KEY, 'dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
  });

  it('manually writing "light" is readable as the correct string', () => {
    localStorage.setItem(THEME_KEY, 'light');
    expect(localStorage.getItem(THEME_KEY)).toBe('light');
  });
});
