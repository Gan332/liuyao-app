import { findHx } from './data.js';

/** Convert yin/yang line values (6-9) to binary (0=yin, 1=yang). */
function linesToBinary(lines) {
  return lines.map(v => v === 7 || v === 9 ? 1 : 0);
}

/** Extract upper and lower trigram indices from reversed binary bits. */
function trigramIndices(bits) {
  const lower = (bits[2] << 2) | (bits[1] << 1) | bits[0];
  const upper = (bits[5] << 2) | (bits[4] << 1) | bits[3];
  return { upper, lower };
}

export function computeHexagram(lines) {
  const bits = linesToBinary(lines);
  const { upper, lower } = trigramIndices(bits);
  return findHx(upper, lower);
}

export function computeChangedHexagram(lines) {
  const lt = lines.map(v => v === 6 || v === 9 ? 'ch' : 'st');
  if (!lt.some(t => t === 'ch')) return undefined;
  const bits = linesToBinary(lines);
  const cBits = bits.map((b, i) => lt[i] === 'ch' ? 1 - b : b);
  const { upper, lower } = trigramIndices(cBits);
  return findHx(upper, lower);
}
