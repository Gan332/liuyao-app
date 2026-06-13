/**
 * 旺相休囚死模块
 * 五行在四季中的旺衰状态分析
 */

// 五行：0木 1火 2土 3金 4水
export const WUXING = ['木', '火', '土', '金', '水'];

// 地支对应的五行索引
export const BRANCH_WUXING = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];

// 旺相休囚死状态
export const WX_STATES = ['旺', '相', '休', '囚', '死'];

/**
 * 四季对应的五行旺气索引
 * 春木旺、夏火旺、四季土旺、秋金旺、冬水旺
 */
const SEASON_WANG = {
  spring: 0,    // 木
  summer: 1,    // 火
  autumn: 3,    // 金
  winter: 4,    // 水
  quarter: 2,   // 土（四季）
};

/**
 * 根据月份确定季节
 * @param {number} monthBranch - 月支 0-11
 * @returns {string} season key
 */
export function getSeason(monthBranch) {
  switch (monthBranch) {
    case 2: case 3: return 'spring';
    case 5: case 6: return 'summer';
    case 8: case 9: return 'autumn';
    case 11: case 0: return 'winter';
    default: return 'quarter'; // 辰戌丑未
  }
}

/**
 * 各季节中五行的状态表 [木, 火, 土, 金, 水]
 * 每个值对应 WX_STATES 索引: 0旺 1相 2休 3囚 4死
 */
const SEASON_STATES = {
  spring:  [0, 1, 4, 3, 2],
  summer:  [2, 0, 1, 4, 3],
  autumn:  [4, 3, 2, 0, 1],
  winter:  [1, 4, 3, 2, 0],
  quarter: [3, 2, 0, 1, 4],
};

/**
 * 分析指定五行在给定季节的状态
 * @param {number} wuxingIndex - 五行索引 0-4
 * @param {number} monthBranch - 月支 0-11
 * @returns {{state: number, stateCN: string, wuxingCN: string}}
 */
export function analyzeWangXiang(wuxingIndex, monthBranch) {
  const season = getSeason(monthBranch);
  const state = SEASON_STATES[season][wuxingIndex];
  return {
    state,
    stateCN: WX_STATES[state],
    wuxingCN: WUXING[wuxingIndex],
  };
}

/**
 * 分析六爻中每爻五行的旺相休囚死状态
 * @param {Array<{branch: number}>} najiaLines - 纳甲后的每爻数据（含 branch 属性）
 * @param {number} monthBranch - 月支索引 0-11
 * @returns {Array<{branch: number, wuxing: number, wuxingCN: string, state: number, stateCN: string}>}
 */
export function analyzeAllLines(najiaLines, monthBranch) {
  return najiaLines.map(line => {
    const wuxingIdx = BRANCH_WUXING[line.branch];
    const analysis = analyzeWangXiang(wuxingIdx, monthBranch);
    return {
      branch: line.branch,
      wuxing: wuxingIdx,
      wuxingCN: analysis.wuxingCN,
      state: analysis.state,
      stateCN: analysis.stateCN,
    };
  });
}
