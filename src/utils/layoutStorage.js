const KEY = 'nexboard_layout';
const DEFAULT = ['weather', 'todo', 'news', 'whiteboard'];

export function getLayout() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(saved) && saved.length === DEFAULT.length) return saved;
  } catch { /* ignore */ }
  return DEFAULT;
}

export function saveLayout(order) {
  localStorage.setItem(KEY, JSON.stringify(order));
}
