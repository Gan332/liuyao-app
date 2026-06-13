import '../css/style.css';

import { loadHistoryData, initHistory, addHistoryEntry, renderHistory } from './history.js';
import { initTheme, toggleTheme, watchSystemTheme } from './theme.js';
import { initToss, updateBuiltLines } from './toss.js';
import { initManual } from './manual.js';
import { showReading, resetReading } from './reading.js';
import { computeHexagram, computeChangedHexagram } from '@liuyao/engine';
import { $, showToast } from './ui.js';

// ===== State =====
const playState = {
  lines: [],
  step: 0,
  phase: 'toss',
  busy: false,
  mode: 'coin',
  history: [],
  curNote: '',
  curHistIdx: -1
};

// ===== Init =====
function init() {
  loadHistoryData(playState);
  initTheme();
  renderHistory(playState);
  updateBuiltLines(playState.lines);
  watchSystemTheme();

  // Theme toggle
  $('dmBtn').addEventListener('click', toggleTheme);

  // History
  initHistory(playState);

  // Mode switching
  $('modeCoin').addEventListener('click', () => {
    playState.mode = 'coin';
    $('modeCoin').classList.add('act');
    $('modeManual').classList.remove('act');
    $('coinArea').classList.remove('h');
    $('manualArea').classList.add('h');
  });
  $('modeManual').addEventListener('click', () => {
    playState.mode = 'manual';
    $('modeManual').classList.add('act');
    $('modeCoin').classList.remove('act');
    $('coinArea').classList.add('h');
    $('manualArea').classList.remove('h');
  });

  // Toss & Manual
  initToss(playState, handleComplete);
  initManual(playState, handleComplete);

  // Reset
  $('rb').addEventListener('click', () => resetReading(playState));

  // Share
  $('shareBtn').addEventListener('click', shareReading);

  // Save
  $('saveBtn').addEventListener('click', () => saveReadingWithNote('', playState));

  // Note
  $('noteBtn').addEventListener('click', async () => {
    const hx = computeHexagram(playState.lines);
    if (!hx) return;
    const note = await openNote(playState.curNote || '');
    if (note !== undefined && note !== null) {
      playState.curNote = note;
      saveReadingWithNote(note, playState);
    }
  });
  $('noteSave').addEventListener('click', () => {
    const v = $('noteText').value;
    closeNote(v);
  });
  $('noteCancel').addEventListener('click', () => closeNote(null));
  $('noteOverlay').addEventListener('click', () => closeNote(null));
  $('noteText').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) $('noteSave').click();
  });
  document.querySelectorAll('.note-tag').forEach(el => {
    el.addEventListener('click', () => {
      const t = el.dataset.tag;
      const ta = $('noteText');
      if (ta.value.includes(t)) return;
      ta.value = ta.value ? (ta.value + '、' + t) : t;
      ta.focus();
    });
  });
}

function handleComplete(lines) {
  showReading(lines, playState);
}

// ===== Save =====
function saveReadingWithNote(note, playState) {
  const hx = computeHexagram(playState.lines);
  if (!hx) return;
  const rhx = computeChangedHexagram(playState.lines);
  addHistoryEntry(
    playState,
    playState.lines,
    note,
    { upper: hx.upper, lower: hx.lower },
    rhx ? { upper: rhx.upper, lower: rhx.lower } : null
  );
  showToast('卦象已保存 📋');
}

// ===== Note Modal =====
let noteResolve = null;
function openNote(currentNote) {
  return new Promise(resolve => {
    noteResolve = resolve;
    $('noteText').value = currentNote || '';
    $('noteOverlay').classList.add('show');
    $('noteModal').classList.add('show');
    $('noteText').focus();
  });
}
function closeNote(result) {
  $('noteOverlay').classList.remove('show');
  $('noteModal').classList.remove('show');
  if (noteResolve) { noteResolve(result); noteResolve = null; }
}

// ===== Share =====
async function shareReading() {
  const hx = computeHexagram(playState.lines);
  if (!hx) return;
  let text = '🔮 六爻占卜 · ' + hx.sym + ' ' + hx.zh + '卦\n' +
    '━'.repeat(12) + '\n';
  const lt = playState.lines.map(v => v === 6 || v === 9 ? 'ch' : 'st');
  const hasCh = lt.some(t => t === 'ch');
  text += '本卦：' + hx.zh + '（' + hx.py + '）\n';
  if (hasCh) {
    const rhx = computeChangedHexagram(playState.lines);
    if (rhx) text += '变卦：' + rhx.zh + '（' + rhx.py + '）\n';
  }
  text += '\n六爻：\n';
  for (let i = 5; i >= 0; i--) {
    const v = playState.lines[i];
    const ch = lt[i] === 'ch';
    text += '  ' + ['初','二','三','四','五','上'][i] + '爻：' + v + ' ' + {6:'⚋',7:'⚊',8:'⚋',9:'⚊'}[v] + (ch ? '（变）' : '') + '\n';
  }
  text += '\n' + hx.judgment;
  if (navigator.share) {
    try { await navigator.share({ title: '六爻占卜', text }); } catch (e) { /* user cancelled */ }
  } else {
    try { await navigator.clipboard.writeText(text); showToast('卦象已复制到剪贴板'); } catch (e) { showToast('复制失败'); }
  }
}

document.addEventListener('DOMContentLoaded', init);
