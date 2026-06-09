const HISTORY_KEY = 'liuyao_history';
const MAX_HISTORY = 100;

export function loadHistory() {
  try {
    const d = localStorage.getItem(HISTORY_KEY);
    return d ? JSON.parse(d) : [];
  } catch (e) {
    return [];
  }
}

export function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) { /* silent */ }
}

export function addEntry(history, entry) {
  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  saveHistory(history);
  return history;
}

export function removeEntry(history, id) {
  const filtered = history.filter(e => e.id !== id);
  saveHistory(filtered);
  return filtered;
}

export function clearAll() {
  try { localStorage.removeItem(HISTORY_KEY); } catch (e) { /* silent */ }
  return [];
}
