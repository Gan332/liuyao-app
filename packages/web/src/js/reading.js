import { HX, LN, LV, triSym, findHx } from './data.js';
import { $, createYaoRow, adjustScroll } from './ui.js';
import { playHexagram } from './audio.js';

// Pure computation (no DOM)
export function computeHexagram(lines) {
  const lb = lines.map(v => (v === 7 || v === 9) ? 1 : 0);
  const lB = [lb[2], lb[1], lb[0]];
  const uB = [lb[5], lb[4], lb[3]];
  const lN = (lB[0] << 2) | (lB[1] << 1) | lB[2];
  const uN = (uB[0] << 2) | (uB[1] << 1) | uB[2];
  return findHx(uN, lN);
}

export function computeChangedHexagram(lines) {
  const lt = lines.map(v => v === 6 || v === 9 ? 'ch' : 'st');
  const lb = lines.map(v => (v === 7 || v === 9) ? 1 : 0);
  const cB = lb.map((b, i) => lt[i] === 'ch' ? 1 - b : b);
  const clB = [cB[2], cB[1], cB[0]];
  const cuB = [cB[5], cB[4], cB[3]];
  const clN = (clB[0] << 2) | (clB[1] << 1) | clB[2];
  const cuN = (cuB[0] << 2) | (cuB[1] << 1) | cuB[2];
  return findHx(cuN, clN);
}

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
