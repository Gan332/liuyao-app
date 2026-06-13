import { describe, it, expect } from 'vitest';
import { getDayStemBranch, getYearStemBranch, getMonthStemBranch, getFullDateStemBranch, STEMS, BRANCHES } from '../src/chineseCalendar.js';

describe('getDayStemBranch', () => {
  it('should compute 甲子 for 1900-01-01', () => {
    const result = getDayStemBranch(new Date(1900, 0, 1));
    expect(STEMS[result.stem]).toBe('甲');
    expect(BRANCHES[result.branch]).toBe('子');
  });
});

describe('getYearStemBranch', () => {
  it('should return 甲子 for 1984', () => {
    const result = getYearStemBranch(new Date(1984, 5, 1));
    expect(STEMS[result.stem]).toBe('甲');
    expect(BRANCHES[result.branch]).toBe('子');
  });

  it('should return 乙丑 for 1985', () => {
    const result = getYearStemBranch(new Date(1985, 5, 1));
    expect(STEMS[result.stem]).toBe('乙');
    expect(BRANCHES[result.branch]).toBe('丑');
  });
});

describe('getMonthStemBranch', () => {
  it('should return 丙寅 for 甲年 立春后', () => {
    const result = getMonthStemBranch(0, new Date(2024, 1, 15)); // 2024-02-15, 寅月（立春后/惊蛰前）
    expect(STEMS[result.stem]).toBe('丙');
    expect(BRANCHES[result.branch]).toBe('寅');
  });
});

describe('getFullDateStemBranch', () => {
  it('should return formatted strings', () => {
    const result = getFullDateStemBranch(new Date(2026, 5, 9));
    expect(result.formatted.year).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    expect(result.formatted.month).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    expect(result.formatted.day).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
  });
});
