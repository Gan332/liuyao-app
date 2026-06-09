import { LN, LV, LM } from './data.js';
import { $, yaoLine } from './ui.js';
import { playCoin } from './audio.js';

export function initToss(playState, onComplete) {
  const tb = $('tb');
  const th = $('th');
  const si = $('stepI');
  const ce = [$('c0'), $('c1'), $('c2')];

  function detLine(coins) {
    return coins.reduce((a, b) => a + (b ? 3 : 2), 0);
  }

  function toss() {
    if (playState.busy || playState.step >= 6) return;
    playState.busy = true;
    tb.disabled = true;
    tb.textContent = '摇动中…';
    $('tossR').textContent = '';

    ce.forEach((el, i) => {
      el.className = 'coin flip';
      let interval = setInterval(() => {
        el.textContent = Math.random() > 0.5 ? '⚭' : '⚮';
      }, 50);
      setTimeout(() => clearInterval(interval), 450);
    });

    setTimeout(() => {
      const res = ce.map(() => Math.random() > 0.5 ? 1 : 0);
      const val = detLine(res);
      playState.lines.push(val);
      playCoin();

      res.forEach((r, i) => {
        const el = ce[i];
        el.className = 'coin ' + (r ? 'heads' : 'tails');
        el.textContent = r ? '⚭' : '⚮';
      });

      const yN = LN[playState.step] + '爻';
      $('tossR').textContent = '得 ' + yN + '：' + LV[val] + ' (' + LM[val] + ')';
      updateBuiltLines(playState.lines);
      playState.step++;
      playState.busy = false;
      tb.disabled = false;

      if (playState.step >= 6) {
        tb.textContent = '成卦 ✓';
        tb.disabled = true;
        th.textContent = '卦象已成';
        si.textContent = '卦成·解卦';
        setTimeout(() => onComplete(playState.lines), 700);
      } else {
        tb.textContent = '摇 卦';
        th.textContent = '第 ' + (playState.step + 1) + ' 爻 · ' + LN[playState.step] + '爻';
        si.textContent = playState.step + '/6 · 起卦';
      }
    }, 550);
  }

  tb.addEventListener('click', toss);
}

export function updateBuiltLines(lines) {
  const bl = $('bl');
  if (!bl) return;
  bl.innerHTML = '';
  if (!lines.length) {
    bl.innerHTML = '<div class="emp">摇卦后显示</div>';
    return;
  }
  for (let i = 0; i < lines.length; i++) {
    const idx = lines.length - 1 - i;
    const v = lines[idx];
    const r = document.createElement('div');
    r.className = 'yao-r';
    const l = document.createElement('span');
    l.className = 'yao-l';
    l.textContent = LN[idx] + '爻';
    r.appendChild(l);
    r.appendChild(yaoLine(v, { showCh: true }));
    bl.appendChild(r);
  }
}
