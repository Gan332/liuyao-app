import { describe, it, expect } from 'vitest';
import { analyzeWangXiang, analyzeAllLines, getSeason, WUXING, WX_STATES, BRANCH_WUXING } from '../src/index.js';

describe('getSeason', () => {
  it('寅卯 are spring', () => {
    expect(getSeason(2)).toBe('spring');
    expect(getSeason(3)).toBe('spring');
  });
  it('巳午 are summer', () => {
    expect(getSeason(5)).toBe('summer');
    expect(getSeason(6)).toBe('summer');
  });
  it('申酉 are autumn', () => {
    expect(getSeason(8)).toBe('autumn');
    expect(getSeason(9)).toBe('autumn');
  });
  it('亥子 are winter', () => {
    expect(getSeason(11)).toBe('winter');
    expect(getSeason(0)).toBe('winter');
  });
  it('辰戌丑未 are quarter', () => {
    [4, 10, 1, 7].forEach(b => expect(getSeason(b)).toBe('quarter'));
  });
});

describe('analyzeWangXiang', () => {
  it('木旺于春 (寅月)', () => {
    const result = analyzeWangXiang(0, 2);
    expect(result.state).toBe(0);
    expect(result.stateCN).toBe('旺');
  });

  it('火相于春 (寅月)', () => {
    const result = analyzeWangXiang(1, 2);
    expect(result.stateCN).toBe('相');
  });

  it('土死于春 (寅月)', () => {
    const result = analyzeWangXiang(2, 2);
    expect(result.stateCN).toBe('死');
  });

  it('金囚于春 (寅月)', () => {
    const result = analyzeWangXiang(3, 2);
    expect(result.stateCN).toBe('囚');
  });

  it('水休于春 (寅月)', () => {
    const result = analyzeWangXiang(4, 2);
    expect(result.stateCN).toBe('休');
  });

  it('火旺于夏 (午月)', () => {
    const result = analyzeWangXiang(1, 6);
    expect(result.stateCN).toBe('旺');
  });

  it('金旺于秋 (申月)', () => {
    const result = analyzeWangXiang(3, 8);
    expect(result.stateCN).toBe('旺');
  });

  it('水旺于冬 (子月)', () => {
    const result = analyzeWangXiang(4, 11);
    expect(result.stateCN).toBe('旺');
  });

  it('土旺于四季 (辰月)', () => {
    const result = analyzeWangXiang(2, 4);
    expect(result.stateCN).toBe('旺');
  });
});

describe('analyzeAllLines', () => {
  it('should return correct state for each line of 乾 in 寅月', () => {
    const najiaLines = [
      { branch: 0 }, { branch: 2 }, { branch: 4 },
      { branch: 6 }, { branch: 8 }, { branch: 10 },
    ];
    const results = analyzeAllLines(najiaLines, 2);
    // 春: [木旺,火相,土死,金囚,水休]
    // 子(水)→休, 寅(木)→旺, 辰(土)→死, 午(火)→相, 申(金)→囚, 戌(土)→死
    expect(results[0].stateCN).toBe('休'); // 子→水
    expect(results[1].stateCN).toBe('旺'); // 寅→木
    expect(results[2].stateCN).toBe('死'); // 辰→土
    expect(results[3].stateCN).toBe('相'); // 午→火
    expect(results[4].stateCN).toBe('囚'); // 申→金
    expect(results[5].stateCN).toBe('死'); // 戌→土
  });

  it('should handle 乾卦 in 申月', () => {
    const najiaLines = [
      { branch: 0 }, { branch: 2 }, { branch: 4 },
      { branch: 6 }, { branch: 8 }, { branch: 10 },
    ];
    const results = analyzeAllLines(najiaLines, 8);
    // 申(8) → 秋
    // 子(水)=相, 寅(木)=死, 辰(土)=相... wait:
    // 秋 states: [木=死(4), 火=囚(3), 土=休(2), 金=旺(0), 水=相(1)]
    // 子=0→水: state = SEASON_STATES.autumn[4] = 1(相) ✓
    // 寅=2→木: state = SEASON_STATES.autumn[0] = 4(死) ✓
    // 辰=4→土: state = SEASON_STATES.autumn[2] = 2(休) ✓
    // 午=6→火: state = SEASON_STATES.autumn[1] = 3(囚) ✓
    // 申=8→金: state = SEASON_STATES.autumn[3] = 0(旺) ✓
    // 戌=10→土: state = SEASON_STATES.autumn[2] = 2(休) ✓
    expect(results[0].stateCN).toBe('相');
    expect(results[1].stateCN).toBe('死');
    expect(results[2].stateCN).toBe('休');
    expect(results[3].stateCN).toBe('囚');
    expect(results[4].stateCN).toBe('旺');
    expect(results[5].stateCN).toBe('休');
  });
});
