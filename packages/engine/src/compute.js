import { findHx } from './data.js';

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
