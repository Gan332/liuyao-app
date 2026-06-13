import { describe, it, expect } from 'vitest';
import { getShiYing, applyShiYing, computeHexagram } from '../src/index.js';

describe('getShiYing', () => {
  it('乾为天 should have 世 at 上爻(5) and 应 at 三爻(2)', () => {
    const hex = computeHexagram([7, 7, 7, 7, 7, 7]);
    const { shi, ying } = getShiYing(hex);
    expect(shi).toBe(5); // 上爻
    expect(ying).toBe(2); // 三爻
  });

  it('坤为地 should have 世 at 上爻(5) and 应 at 三爻(2)', () => {
    const hex = computeHexagram([8, 8, 8, 8, 8, 8]);
    const { shi, ying } = getShiYing(hex);
    expect(shi).toBe(5);
    expect(ying).toBe(2);
  });

  it('天风姤 (一世) should have 世 at 初爻(0) and 应 at 四爻(3)', () => {
    // 姤: 上乾(7) 下巽(5)
    // 下巽=5 binary=101 → [7,8,7] 上乾=7 → [7,7,7]
    // 姤 = [7,8,7,7,7,7]
    const hex = computeHexagram([7, 8, 7, 7, 7, 7]);
    expect(hex.num).toBe(44);
    const { shi, ying } = getShiYing(hex);
    expect(shi).toBe(0);
    expect(ying).toBe(3);
  });

  it('天地否 (三世) should have 世 at 三爻(2) and 应 at 上爻(5)', () => {
    // 否: 上乾(7) 下坤(0)
    // 下坤 binary: 000 → [8,8,8]
    // 上乾 binary: 111 → [7,7,7]
    // 否 = [8,8,8,7,7,7]
    const hex = computeHexagram([8, 8, 8, 7, 7, 7]);
    expect(hex.num).toBe(12);
    const { shi, ying } = getShiYing(hex);
    expect(shi).toBe(2);
    expect(ying).toBe(5);
  });

  it('地天泰 (三世) should have 世 at 三爻(2)', () => {
    // 泰: 上坤(0) 下乾(7) → [7,7,7,8,8,8]
    const hex = computeHexagram([7, 7, 7, 8, 8, 8]);
    expect(hex.num).toBe(11);
    const { shi } = getShiYing(hex);
    expect(shi).toBe(2);
  });

  it('火地晋 (游魂) should have 世 at 四爻(3)', () => {
    // 晋: 上离(3) 下坤(0)
    // 下坤=0 → [8,8,8] 上离=3 binary=011 → [7,7,8]
    // 晋 = [8,8,8,7,7,8]
    const hex = computeHexagram([8, 8, 8, 7, 7, 8]);
    expect(hex.num).toBe(35);
    const { shi } = getShiYing(hex);
    expect(shi).toBe(3);
    expect(hex.num).toBe(35);
  });
});

describe('applyShiYing', () => {
  it('should mark correct lines for 乾', () => {
    const hex = computeHexagram([7, 7, 7, 7, 7, 7]);
    const marks = applyShiYing(hex);
    expect(marks[5].shi).toBe(true);
    expect(marks[5].ying).toBe(false);
    expect(marks[2].ying).toBe(true);
    expect(marks[2].shi).toBe(false);
    marks.forEach((m, i) => {
      if (i !== 5 && i !== 2) {
        expect(m.shi).toBe(false);
        expect(m.ying).toBe(false);
      }
    });
  });
});
