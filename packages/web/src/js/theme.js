const STORAGE_KEY = 'liuyao_theme';

function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  const btn = document.getElementById('dmBtn');
  if (btn) btn.textContent = t === 'dark' ? '☀️' : '🌙';
  try { localStorage.setItem(STORAGE_KEY, t); } catch (e) { /* silent */ }
}

export function initTheme() {
  const saved = (() => { try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; } })();
  if (saved) {
    setTheme(saved);
    return;
  }
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(dark ? 'dark' : 'light');
}

export function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  setTheme(cur === 'dark' ? 'light' : 'dark');
}

export function watchSystemTheme() {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}
