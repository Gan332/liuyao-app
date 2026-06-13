import { STEMS, BRANCHES } from './chineseCalendar.js';

/**
 * 纳甲装卦数据
 * 每个卦对应的天干地支索引对（内卦3爻 + 外卦3爻）
 * 按 trigram index 0-7 排列：坤艮坎离震巽兑乾
 *
 * 乾坤内外天干不同，其余卦内外天干相同但地支分排
 */
export const NAJIA_DATA = [
  // 坤(0) — 内乙外癸
  { inner: [{ s: 1, b: 7 }, { s: 1, b: 5 }, { s: 1, b: 3 }],
    outer: [{ s: 9, b: 1 }, { s: 9, b: 11 }, { s: 9, b: 9 }] },
  // 艮(1) — 全丙
  { inner: [{ s: 2, b: 4 }, { s: 2, b: 6 }, { s: 2, b: 8 }],
    outer: [{ s: 2, b: 10 }, { s: 2, b: 0 }, { s: 2, b: 2 }] },
  // 坎(2) — 全戊
  { inner: [{ s: 4, b: 2 }, { s: 4, b: 4 }, { s: 4, b: 6 }],
    outer: [{ s: 4, b: 8 }, { s: 4, b: 10 }, { s: 4, b: 0 }] },
  // 离(3) — 全己
  { inner: [{ s: 5, b: 3 }, { s: 5, b: 1 }, { s: 5, b: 11 }],
    outer: [{ s: 5, b: 9 }, { s: 5, b: 7 }, { s: 5, b: 5 }] },
  // 震(4) — 全庚
  { inner: [{ s: 6, b: 0 }, { s: 6, b: 2 }, { s: 6, b: 4 }],
    outer: [{ s: 6, b: 6 }, { s: 6, b: 8 }, { s: 6, b: 10 }] },
  // 巽(5) — 全辛
  { inner: [{ s: 7, b: 1 }, { s: 7, b: 11 }, { s: 7, b: 9 }],
    outer: [{ s: 7, b: 7 }, { s: 7, b: 5 }, { s: 7, b: 3 }] },
  // 兑(6) — 全丁
  { inner: [{ s: 3, b: 5 }, { s: 3, b: 3 }, { s: 3, b: 1 }],
    outer: [{ s: 3, b: 7 }, { s: 3, b: 9 }, { s: 3, b: 11 }] },
  // 乾(7) — 内甲外壬
  { inner: [{ s: 0, b: 0 }, { s: 0, b: 2 }, { s: 0, b: 4 }],
    outer: [{ s: 8, b: 6 }, { s: 8, b: 8 }, { s: 8, b: 10 }] },
];

/**
 * 对六爻进行纳甲装卦
 * @param {number[]} lines - 6个爻值 7/8/9/6
 * @param {object} hexagram - 卦象对象（含 upper/lower trigram 索引）
 * @returns {Array<{value:number, stem:number, branch:number, stemCN:string, branchCN:string}>}
 */
export function applyNajia(lines, hexagram) {
  const lowerData = NAJIA_DATA[hexagram.lower];
  const upperData = NAJIA_DATA[hexagram.upper];

  return lines.map((value, i) => {
    const n = i < 3 ? lowerData.inner[i] : upperData.outer[i - 3];
    return {
      value,
      stem: n.s,
      branch: n.b,
      stemCN: STEMS[n.s],
      branchCN: BRANCHES[n.b],
    };
  });
}
