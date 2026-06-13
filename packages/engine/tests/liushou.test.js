import { describe, it, expect } from 'vitest';
import { applyLiuShou, LIU_SHOU } from '../src/index.js';

describe('applyLiuShou', () => {
  it('should start with 青龙 for 甲乙日', () => {
    const result = applyLiuShou(0); // 甲日
    expect(LIU_SHOU[result[0].index]).toBe('青龙');
    expect(result.length).toBe(6);
  });

  it('should start with 青龙 for 乙日', () => {
    const result = applyLiuShou(1);
    expect(LIU_SHOU[result[0].index]).toBe('青龙');
  });

  it('should start with 朱雀 for 丙丁日', () => {
    const result = applyLiuShou(2); // 丙日
    expect(LIU_SHOU[result[0].index]).toBe('朱雀');
    const result2 = applyLiuShou(3); // 丁日
    expect(LIU_SHOU[result2[0].index]).toBe('朱雀');
  });

  it('should start with 勾陈 for 戊日', () => {
    const result = applyLiuShou(4);
    expect(LIU_SHOU[result[0].index]).toBe('勾陈');
  });

  it('should start with 螣蛇 for 己日', () => {
    const result = applyLiuShou(5);
    expect(LIU_SHOU[result[0].index]).toBe('螣蛇');
  });

  it('should start with 白虎 for 庚辛日', () => {
    const result = applyLiuShou(6); // 庚日
    expect(LIU_SHOU[result[0].index]).toBe('白虎');
    const result2 = applyLiuShou(7); // 辛日
    expect(LIU_SHOU[result2[0].index]).toBe('白虎');
  });

  it('should start with 玄武 for 壬癸日', () => {
    const result = applyLiuShou(8); // 壬日
    expect(LIU_SHOU[result[0].index]).toBe('玄武');
    const result2 = applyLiuShou(9); // 癸日
    expect(LIU_SHOU[result2[0].index]).toBe('玄武');
  });

  it('should cycle through all six beasts', () => {
    const result = applyLiuShou(0); // 甲日 青龙起
    const names = result.map(r => LIU_SHOU[r.index]);
    expect(names).toEqual(['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武']);
    expect(new Set(names).size).toBe(6);
  });

  it('should cycle with offset for non-first starting beast', () => {
    const result = applyLiuShou(6); // 庚日 白虎起
    const names = result.map(r => LIU_SHOU[r.index]);
    expect(names).toEqual(['白虎', '玄武', '青龙', '朱雀', '勾陈', '螣蛇']);
  });
});
