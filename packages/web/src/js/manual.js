import { LN } from './data.js';
import { $ } from './ui.js';

export function initManual(playState, onComplete) {
  createManualLines();

  $('manualBtn').addEventListener('click', () => {
    if (playState.busy) return;
    const lines = getManualLines();
    if (lines.length !== 6) return;
    playState.lines = lines;
    playState.step = 6;
    onComplete(playState.lines);
  });
}

function createManualLines() {
  const el = $('manualLines');
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const row = document.createElement('div');
    row.className = 'manual-line';
    const label = document.createElement('span');
    label.className = 'manual-label';
    label.textContent = LN[i];
    row.appendChild(label);
    const yao = document.createElement('div');
    yao.className = 'manual-yao';
    const yin = document.createElement('div');
    yin.className = 'yb';
    yin.appendChild(document.createElement('span'));
    yin.appendChild(document.createElement('span'));
    row.appendChild(yao);
    const vals = document.createElement('div');
    vals.className = 'manual-vals';
    [7, 8, 9, 6].forEach(v => {
      const btn = document.createElement('button');
      btn.className = 'me-btn' + (v === 7 ? ' act' : '');
      btn.textContent = v;
      btn.addEventListener('click', () => {
        vals.querySelectorAll('.me-btn').forEach(b => b.classList.remove('act'));
        btn.classList.add('act');
        const yang = v === 7 || v === 9;
        yao.innerHTML = '';
        if (yang) {
          const d = document.createElement('div');
          d.className = 'ys';
          yao.appendChild(d);
        } else {
          const d = document.createElement('div');
          d.className = 'yb';
          d.appendChild(document.createElement('span'));
          d.appendChild(document.createElement('span'));
          yao.appendChild(d);
        }
      });
      vals.appendChild(btn);
    });
    row.appendChild(vals);
    row.appendChild(yao);
    el.appendChild(row);
  }
  // Init first line
  const firstYao = el.querySelector('.manual-line .manual-yao');
  if (firstYao) {
    firstYao.innerHTML = '';
    const d = document.createElement('div');
    d.className = 'ys';
    firstYao.appendChild(d);
  }
}

function getManualLines() {
  const rows = $('manualLines').querySelectorAll('.manual-line');
  const lines = [];
  rows.forEach(row => {
    const active = row.querySelector('.me-btn.act');
    lines.push(active ? parseInt(active.textContent) : 7);
  });
  return lines;
}
