const KEY = 'nexboard_todos';

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(todos) {
  try {
    localStorage.setItem(KEY, JSON.stringify(todos));
  } catch { /* ignore */ }
}

export function getTodos() {
  return load();
}

export function addTodo(text) {
  const todos = load();
  const todo = { id: Date.now(), text: text.trim(), done: false, createdAt: Date.now() };
  const updated = [todo, ...todos];
  save(updated);
  return updated;
}

export function toggleTodo(id) {
  const updated = load().map(t => t.id === id ? { ...t, done: !t.done } : t);
  save(updated);
  return updated;
}

export function deleteTodo(id) {
  const updated = load().filter(t => t.id !== id);
  save(updated);
  return updated;
}

export function clearDone() {
  const updated = load().filter(t => !t.done);
  save(updated);
  return updated;
}
