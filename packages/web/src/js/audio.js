let audioCtx = null;

function playTone(freq, dur) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g);
    g.connect(audioCtx.destination);
    o.type = 'sine';
    o.frequency.value = freq;
    o.start();
    g.gain.value = 0.08;
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.stop(audioCtx.currentTime + dur);
  } catch (e) { /* silent fail */ }
}

export function playCoin() {
  playTone(1400, 0.06);
}

export function playHexagram() {
  playTone(523, 0.1);
  setTimeout(() => playTone(659, 0.1), 80);
  setTimeout(() => playTone(784, 0.15), 160);
}
