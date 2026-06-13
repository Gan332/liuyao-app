import { HX, LN, LV, triSym, findHx } from './data.js';
import { computeHexagram, computeChangedHexagram, getFullDateStemBranch,
         applyNajia, applyLiuShou, applyShiYing, analyzeAllLines,
         STEMS, BRANCHES } from '@liuyao/engine';
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

  // Professional reading panel
  if (hx) {
    showProfessionalReading(lines, hx);
  }

  $('stepI').textContent = (hasCh ? lt.filter(t => t === 'ch').length + '爻动·解卦' : '静卦·解卦');
  adjustScroll();
  playHexagram();
}

function showProfessionalReading(lines, hx) {
  const panel = $('proPanel');
  if (!panel) return;
  panel.classList.remove('h');

  // 1. Current date stem-branch
  const now = new Date();
  const sb = getFullDateStemBranch(now);
  $('proDate').textContent = sb.formatted.year + '年 · ' + sb.formatted.month + '月 · ' + sb.formatted.day + '日';

  // 2. 纳甲
  const najia = applyNajia(lines, hx);

  // 3. 六兽 (based on day stem)
  const liushou = applyLiuShou(sb.day.stem, 6);

  // 4. 世应
  const shiying = applyShiYing(hx);

  // 5. 旺相休囚死
  const wxAnalysis = analyzeAllLines(najia, sb.month.branch);

  // 6. Render
  const container = $('proLines');
  container.innerHTML = '';
  const LN = ['初', '二', '三', '四', '五', '上'];

  for (let i = 5; i >= 0; i--) {
    const n = najia[i];
    const ls = liushou[i];
    const sy = shiying[i];
    const wx = wxAnalysis[i];
    const v = lines[i];
    const yang = v === 7 || v === 9;
    const ch = v === 6 || v === 9;
    const valueStr = v.toString();

    const row = document.createElement('div');
    row.className = 'pro-line';

    // Position
    const pos = document.createElement('span');
    pos.className = 'pro-line-pos';
    pos.textContent = LN[i];
    row.appendChild(pos);

    // 六兽
    const lsEl = document.createElement('span');
    lsEl.className = 'pro-liushou ls-' + ls.index;
    lsEl.textContent = ls.name;
    row.appendChild(lsEl);

    // 纳甲
    const njEl = document.createElement('span');
    njEl.className = 'pro-najia';
    njEl.textContent = n.stemCN + n.branchCN;
    row.appendChild(njEl);

    // Yao line
    const yaoEl = document.createElement('span');
    yaoEl.className = 'pro-line-yao';
    if (ch) yaoEl.classList.add('ych');
    const yaoSpan = document.createElement('span');
    if (yang) {
      yaoSpan.className = 'ys';
    } else {
      yaoSpan.className = 'yb';
      yaoSpan.innerHTML = '<span></span><span></span>';
    }
    yaoEl.appendChild(yaoSpan);
    row.appendChild(yaoEl);

    // 旺相休囚死
    const wxEl = document.createElement('span');
    wxEl.className = 'pro-wx wx-' + wx.state;
    wxEl.textContent = wx.stateCN;
    row.appendChild(wxEl);

    // 世应
    const syEl = document.createElement('span');
    syEl.className = 'pro-shiying';
    if (sy.shi) syEl.textContent = '世';
    else if (sy.ying) syEl.textContent = '应';
    syEl.classList.add(sy.shi ? 'shi' : sy.ying ? 'ying' : '');
    row.appendChild(syEl);

    // Value
    const valEl = document.createElement('span');
    valEl.className = 'pro-value';
    valEl.textContent = valueStr;
    row.appendChild(valEl);

    container.appendChild(row);
  }
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
  // Hide professional panel on reset
  const pp = $('proPanel');
  if (pp) pp.classList.add('h');
  adjustScroll();
}
