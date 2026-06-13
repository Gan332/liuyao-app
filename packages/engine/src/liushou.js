/**
 * 六兽（六神）模块
 * 根据日干推算每爻对应的神煞
 */

export const LIU_SHOU = [
  '青龙',  // 0 - 木
  '朱雀',  // 1 - 火
  '勾陈',  // 2 - 土
  '螣蛇',  // 3 - 土
  '白虎',  // 4 - 金
  '玄武',  // 5 - 水
];

/**
 * 日干对应的六兽起始索引
 * 甲乙日青龙起, 丙丁日朱雀起, 戊日勾陈起,
 * 己日螣蛇起, 庚辛日白虎起, 壬癸日玄武起
 */
const DAY_STEM_TO_FIRST_BEAST = [0, 0, 1, 1, 2, 3, 4, 4, 5, 5];

/**
 * 对六爻应用六兽
 * @param {number} dayStem - 日天干 0-9
 * @param {number} totalLines - 爻数（通常为6）
 * @returns {Array<{index:number, name:string}>}
 */
export function applyLiuShou(dayStem, totalLines = 6) {
  const first = DAY_STEM_TO_FIRST_BEAST[dayStem];
  return Array.from({ length: totalLines }, (_, i) => {
    const index = (first + i) % 6;
    return { index, name: LIU_SHOU[index] };
  });
}
