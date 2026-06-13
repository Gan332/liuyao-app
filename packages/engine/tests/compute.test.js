import { describe, it, expect } from 'vitest';
import { computeHexagram, computeChangedHexagram } from '../src/compute.js';

describe('computeHexagram', () => {
  it('should find 乾为天 (all 7s = all yang)', () => {
    const result = computeHexagram([7, 7, 7, 7, 7, 7]);
    expect(result).toBeDefined();
    expect(result.zh).toBe('乾');
    expect(result.num).toBe(1);
  });

  it('should find 坤为地 (all 8s = all yin)', () => {
    const result = computeHexagram([8, 8, 8, 8, 8, 8]);
    expect(result).toBeDefined();
    expect(result.zh).toBe('坤');
    expect(result.num).toBe(2);
  });

  it('should handle mixed yin-yang (泰卦)', () => {
    // 下卦: 初7(阳) 二7(阳) 三7(阳) → 乾=7
    // 上卦: 四8(阴) 五8(阴) 上8(阴) → 坤=0
    // 地天泰
    const result = computeHexagram([7, 7, 7, 8, 8, 8]);
    expect(result).toBeDefined();
    expect(result.zh).toBe('泰');
  });

  it('should handle 革卦', () => {
    // 下卦: 初6(→阴),二(7→阳),三(8→阴) → 坎=2
    // 上卦: 四(9→阳),五(7→阳),上(8→阴) → 离=3
    // 火水未济... need 泽火革 (上兑下离, upper=6, lower=3)
    // 下離: 初=阳,二=阳,三=阴 → [1,1,0] → lN=3 (离)
    // 上兑: 四=阴,五=阳,上=阳 → [0,1,1] → uN=6 (兑)
    const result = computeHexagram([7, 7, 8, 8, 7, 7]);
    expect(result).toBeDefined();
    expect(result.zh).toBe('革');
  });
});

describe('computeChangedHexagram', () => {
  it('should produce 坤 when 乾 has all changing lines', () => {
    const result = computeChangedHexagram([9, 9, 9, 9, 9, 9]);
    expect(result).toBeDefined();
    expect(result.zh).toBe('坤');
  });

  it('should produce 乾 when 坤 has all changing lines', () => {
    const result = computeChangedHexagram([6, 6, 6, 6, 6, 6]);
    expect(result).toBeDefined();
    expect(result.zh).toBe('乾');
  });

  it('should return undefined when no changing lines', () => {
    const result = computeChangedHexagram([7, 8, 7, 8, 7, 8]);
    expect(result).toBeUndefined();
  });
});
