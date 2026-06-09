import { loadHistory, saveHistory, removeEntry, clearAll } from './storage.js';
import { $, showToast } from './ui.js';
import { showReading, computeHexagram } from './reading.js';

export function initHistory(playState) {
  $('histBtn').addEventListener('click', openHistory);
  $('histClose').addEventListener('click', closeHistory);
  $('histOverlay').addEventListener('click', closeHistory);
  $('histClear').addEventListener('click', () => {
    if (!playState.history.length) return;
    if (confirm('确定清空所有历史记录？')) {
      playState.history = clearAll();
      renderHistory(playState);
      showToast('历史已清空');
    }
  });
}

export function addHistoryEntry(playState, lines, note, hexagram, changingHexagram) {
  const hx = computeHexagram(lines);
  const entry = {
    id: Date.now(),
    lines: [...lines],
    hexagram: { ...hexagram },
    changingHexagram: changingHexagram ? { ...changingHexagram } : null,
    note,
    ts: Date.now(),
    date: new Date().toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    hxName: hx ? hx.zh : '?',
    hxSym: hx ? hx.sym : '䷀'
  };
  playState.history.unshift(entry);
  if (playState.history.length > 100) playState.history.length = 100;
  saveHistory(playState.history);
  renderHistory(playState);
}

export function loadHistoryData(playState) {
  playState.history = loadHistory();
}

function openHistory() {
  $('histOverlay').classList.add('show');
  $('histPanel').classList.add('show');
}

function closeHistory() {
  $('histOverlay').classList.remove('show');
  $('histPanel').classList.remove('show');
}

export function renderHistory(playState) {
  const el = $('histList');
  if (!playState.history.length) {
    el.innerHTML = '<div class="hist-empty">暂无记录<br>起卦后将自动保存</div>';
    return;
  }
  el.innerHTML = playState.history.map((e, i) =>
    `<div class="hist-item" data-idx="${i}">
      <div class="hist-sym">${e.hxSym || '䷀'}</div>
      <div class="hist-info">
        <div class="hist-name">${e.hxName || '?'}</div>
        <div class="hist-date">${e.date || new Date(e.ts).toLocaleString('zh-CN')}</div>
        ${e.note ? `<div class="hist-note">${e.note}</div>` : ''}
      </div>
      <button class="hist-del" data-id="${e.id}" style="background:none;border:none;color:#ff3b30;font-size:16px;cursor:pointer;padding:4px">✕</button>
    </div>`
  ).join('');

  el.querySelectorAll('.hist-item').forEach(el2 => {
    el2.addEventListener('click', (e) => {
      if (e.target.closest('.hist-del')) return;
      const idx = parseInt(el2.dataset.idx);
      const entry = playState.history[idx];
      if (!entry) return;
      closeHistory();
      playState.lines = [...entry.lines];
      playState.step = 6;
      showToast('已加载历史卦象');
      setTimeout(() => showReading(playState.lines, playState), 300);
    });
  });

  el.querySelectorAll('.hist-del').forEach(el2 => {
    el2.addEventListener('click', (e) => {
      e.stopPropagation();
      playState.history = removeEntry(playState.history, parseInt(el2.dataset.id));
      renderHistory(playState);
    });
  });
}
