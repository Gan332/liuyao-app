import { describe, it, expect } from 'vitest';
import { computeHexagram, applyNajia, NAJIA_DATA, STEMS, BRANCHES } from '../src/index.js';

describe('applyNajia', () => {
  it('should assign 甲子 to 初爻 of 乾', () => {
    const hex = computeHexagram([7, 7, 7, 7, 7, 7]);
    const result = applyNajia([7, 7, 7, 7, 7, 7], hex);
    expect(result[0].stemCN).toBe('甲');
    expect(result[0].branchCN).toBe('子');
  });

  it('should assign 壬戌 to 上爻 of 乾', () => {
    const hex = computeHexagram([7, 7, 7, 7, 7, 7]);
    const result = applyNajia([7, 7, 7, 7, 7, 7], hex);
    expect(result[5].stemCN).toBe('壬');
    expect(result[5].branchCN).toBe('戌');
  });

  it('should assign 乙未 to 初爻 of 坤', () => {
    const hex = computeHexagram([8, 8, 8, 8, 8, 8]);
    const result = applyNajia([8, 8, 8, 8, 8, 8], hex);
    expect(result[0].stemCN).toBe('乙');
    expect(result[0].branchCN).toBe('未');
  });

  it('should assign 癸酉 to 上爻 of 坤', () => {
    const hex = computeHexagram([8, 8, 8, 8, 8, 8]);
    const result = applyNajia([8, 8, 8, 8, 8, 8], hex);
    expect(result[5].stemCN).toBe('癸');
    expect(result[5].branchCN).toBe('酉');
  });

  it('should correctly assign lower trigram najia for 泰 (地天泰)', () => {
    // 泰: 下乾(7) 上坤(0)
    const hex = computeHexagram([7, 7, 7, 8, 8, 8]);
    expect(hex.lower).toBe(7);
    expect(hex.upper).toBe(0);
    const result = applyNajia([7, 7, 7, 8, 8, 8], hex);
    // 下乾: 初甲子 二甲寅 三甲辰
    expect(result[0].stemCN).toBe('甲');
    expect(result[0].branchCN).toBe('子');
    expect(result[1].stemCN).toBe('甲');
    expect(result[1].branchCN).toBe('寅');
    expect(result[2].stemCN).toBe('甲');
    expect(result[2].branchCN).toBe('辰');
    // 上坤: 四癸丑 五癸亥 上癸酉
    expect(result[3].stemCN).toBe('癸');
    expect(result[3].branchCN).toBe('丑');
    expect(result[4].stemCN).toBe('癸');
    expect(result[4].branchCN).toBe('亥');
    expect(result[5].stemCN).toBe('癸');
    expect(result[5].branchCN).toBe('酉');
  });

  it('should handle 震卦 (全庚)', () => {
    // 震 encoding: 下震 [8,8,7], 上震 [8,8,7] → 震为雷
    const hex2 = computeHexagram([8, 8, 7, 8, 8, 7]);
    expect(hex2.lower).toBe(4);
    expect(hex2.upper).toBe(4);
    const result = applyNajia([8, 8, 7, 8, 8, 7], hex2);
    // 震: 初庚子 二庚寅 三庚辰 四庚午 五庚申 上庚戌
    expect(result[0].stemCN).toBe('庚');
    expect(result[0].branchCN).toBe('子');
    expect(result[1].stemCN).toBe('庚');
    expect(result[1].branchCN).toBe('寅');
    expect(result[2].stemCN).toBe('庚');
    expect(result[2].branchCN).toBe('辰');
    expect(result[3].stemCN).toBe('庚');
    expect(result[3].branchCN).toBe('午');
    expect(result[4].stemCN).toBe('庚');
    expect(result[4].branchCN).toBe('申');
    expect(result[5].stemCN).toBe('庚');
    expect(result[5].branchCN).toBe('戌');
  });

  it('should preserve original line values', () => {
    const hex = computeHexagram([7, 7, 7, 7, 7, 7]);
    const result = applyNajia([7, 7, 7, 7, 7, 7], hex);
    result.forEach(r => expect(r.value).toBe(7));
  });
});
