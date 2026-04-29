const KEY = 'nexboard_layout';
const DEFAULT = ['weather', 'todo', 'news', 'whiteboard', 'clock'];

const VIS_KEY = 'nexboard_visible';

function defaultVisible() {
  return Object.fromEntries(DEFAULT.map(id => [id, true]));
}

export function getVisible() {
  try {
    const saved = JSON.parse(localStorage.getItem(VIS_KEY));
    if (saved && typeof saved === 'object') return { ...defaultVisible(), ...saved };
  } catch { /* ignore */ }
  return defaultVisible();
}

export function saveVisible(visible) {
  localStorage.setItem(VIS_KEY, JSON.stringify(visible));
}

export function getLayout() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(saved)) {
      const valid = saved.filter(id => DEFAULT.includes(id));
      const missing = DEFAULT.filter(id => !valid.includes(id));
      return [...valid, ...missing];
    }
  } catch { /* ignore */ }
  return [...DEFAULT];
}

export function saveLayout(order) {
  localStorage.setItem(KEY, JSON.stringify(order));
}
