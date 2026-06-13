import { HX, LN, LV, triSym, findHx } from './data.js';
import { computeHexagram, computeChangedHexagram } from '@liuyao/engine';
import { $, createYaoRow, adjustScroll } from './ui.js';
import { playHexagram } from './audio.js';

export function showReading(lines, playState) {
  playState.phase = 'reading';
  $('tp').classList.add('h');
  $('rp').classList.remove('h');

  const lt = lines.map(v => v === 6 || v === 9 ? 'ch' : 'st');
  const hx = computeHexagram(lines);
  const rhx = computeChangedHexagram(lines);

  if (hx) {
    $('rn').textContent = hx.sym + ' · 第' + hx.num + '卦';
    $('rzh').textContent = hx.zh;
    $('rpy').textContent = hx.py;
    $('ren').textContent = hx.en;
    $('rjg').textContent = hx.judgment;
    $('uts').textContent = triSym[hx.upper];
    $('lts').textContent = triSym[hx.lower];
    $('rdesc').textContent = hx.desc;
  }

  const ld = $('rlines');
  ld.innerHTML = '';
  for (let i = 5; i >= 0; i--) {
    const v = lines[i];
    const ch = lt[i] === 'ch';
    const yang = v === 7 || v === 9;
    const r = createYaoRow(v, LN[i] + '爻');
    const cs = document.createElement('span');
    cs.className = 'rl-c';
    cs.textContent = ch ? (yang ? '○变' : '✕变') : '';
    r.appendChild(cs);
    ld.appendChild(r);
  }

  const hasCh = lt.some(t => t === 'ch');
  const ciDiv = $('ci');
  if (hasCh) {
    const cnt = lt.filter(t => t === 'ch').length;
    ciDiv.textContent = '有 ' + cnt + ' 爻变动，由本卦变为变卦。动爻是判断吉凶的关键。';
    ciDiv.classList.remove('h');
  } else {
    ciDiv.textContent = '静卦 · 六爻皆无变动，以本卦卦辞断之。';
    ciDiv.classList.remove('h');
  }

  if (hasCh && rhx) {
    $('rs').classList.remove('h');
    $('rss').textContent = rhx.sym;
    $('rsn').textContent = rhx.zh;
    $('rspy').textContent = rhx.py;
    $('rsjg').textContent = rhx.judgment;
  } else {
    $('rs').classList.add('h');
  }

  $('stepI').textContent = (hasCh ? lt.filter(t => t === 'ch').length + '爻动·解卦' : '静卦·解卦');
  adjustScroll();
  playHexagram();
}

export function resetReading(playState) {
  playState.lines = [];
  playState.step = 0;
  playState.phase = 'toss';
  playState.busy = false;
  $('tp').classList.remove('h');
  $('rp').classList.add('h');
  $('rs').classList.add('h');
  $('tb').textContent = '摇 卦';
  $('tb').disabled = false;
  $('th').textContent = '第 1 爻 · 初爻';
  $('tossR').textContent = '';
  $('stepI').textContent = '静心·起卦';
  const ce = [$('c0'), $('c1'), $('c2')];
  ce.forEach(el => { el.className = 'coin heads'; el.textContent = '⚭'; });
  const bl = $('bl');
  if (bl) {
    bl.innerHTML = '<div class="emp">摇卦后显示</div>';
  }
  adjustScroll();
}
