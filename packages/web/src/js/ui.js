let toastTimer = null;

export function $(id) {
  return document.getElementById(id);
}

export function showToast(msg) {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

export function yaoLine(val, opts = {}) {
  const ch = val === 6 || val === 9;
  const yang = val === 7 || val === 9;
  const w = document.createElement('div');
  w.className = 'yao-w' + (ch ? ' ch' : '');
  if (yang) {
    const b = document.createElement('div');
    b.className = 'yao-s';
    w.appendChild(b);
  } else {
    const b = document.createElement('div');
    b.className = 'yao-b';
    const s1 = document.createElement('span');
    const s2 = document.createElement('span');
    b.appendChild(s1);
    b.appendChild(s2);
    w.appendChild(b);
  }
  if (ch && opts.showCh) {
    const c = document.createElement('span');
    c.className = 'yao-ch ' + (yang ? 'yang' : 'yin');
    c.textContent = yang ? '○' : '✕';
    w.appendChild(c);
  }
  return w;
}

export function createYaoRow(value, label, extraClass = '') {
  const r = document.createElement('div');
  r.className = 'rl' + (extraClass ? ' ' + extraClass : '');
  const ns = document.createElement('span');
  ns.className = 'rl-n';
  ns.textContent = label;
  r.appendChild(ns);
  const vs = document.createElement('span');
  vs.className = 'rl-v';
  vs.textContent = value;
  r.appendChild(vs);
  const ys = document.createElement('span');
  ys.className = 'rl-y';
  const yang = value === 7 || value === 9;
  const ch = value === 6 || value === 9;
  if (yang) {
    const d = document.createElement('div');
    d.className = 'ys';
    ys.appendChild(d);
  } else {
    const d = document.createElement('div');
    d.className = 'yb';
    const s1 = document.createElement('span');
    const s2 = document.createElement('span');
    d.appendChild(s1);
    d.appendChild(s2);
    ys.appendChild(d);
  }
  if (ch) ys.style.opacity = '0.6';
  r.appendChild(ys);
  const ts = document.createElement('span');
  ts.className = 'rl-t';
  ts.textContent = {6:'⚋',7:'⚊',8:'⚋',9:'⚊'}[value] || '';
  r.appendChild(ts);
  return r;
}

export function adjustScroll() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
