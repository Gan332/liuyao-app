export const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
export const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

// 节气界限（天干地支月从节气开始）
const SOLAR_TERMS = [
  { month: 2, day: 4 },   // 立春（寅月）
  { month: 3, day: 6 },   // 惊蛰（卯月）
  { month: 4, day: 5 },   // 清明（辰月）
  { month: 5, day: 6 },   // 立夏（巳月）
  { month: 6, day: 6 },   // 芒种（午月）
  { month: 7, day: 7 },   // 小暑（未月）
  { month: 8, day: 7 },   // 立秋（申月）
  { month: 9, day: 8 },   // 白露（酉月）
  { month: 10, day: 8 },  // 寒露（戌月）
  { month: 11, day: 7 },  // 立冬（亥月）
  { month: 12, day: 7 },  // 大雪（子月）
  { month: 1, day: 6 },   // 小寒（丑月）
];

/**
 * 获取日天干地支
 * 以1900-01-01（甲子日）为基准
 */
export function getDayStemBranch(date) {
  const ref = new Date(1900, 0, 1);
  const diff = Math.floor((date.getTime() - ref.getTime()) / 86400000);
  const stem = ((diff % 10) + 10) % 10;
  const branch = ((diff % 12) + 12) % 12;
  return { stem, branch };
}

/**
 * 获取年天干地支（以立春为界）
 */
export function getYearStemBranch(date) {
  const year = date.getFullYear();
  const boundary = new Date(year, 1, 4);
  const actualYear = date < boundary ? year - 1 : year;
  const stem = ((actualYear - 4) % 10 + 10) % 10;
  const branch = ((actualYear - 4) % 12 + 12) % 12;
  return { stem, branch, year: actualYear };
}

/**
 * 获取某年某节气对应的具体日期
 */
function getSolarTermDate(year, termIndex) {
  const t = SOLAR_TERMS[termIndex];
  let y = year;
  let m = t.month;
  let d = t.day;
  if (termIndex === 11) { // 小寒在次年1月
    y = year + 1;
    m = 1;
    d = 6;
  }
  return new Date(y, m - 1, d);
}

/**
 * 获取月天干地支
 * @param {number} yearStem - 年天干 0-9
 * @param {Date} date - 当前日期
 */
export function getMonthStemBranch(yearStem, date) {
  const year = date.getFullYear();
  let monthBranch = 2; // 默认寅月

  for (let i = SOLAR_TERMS.length - 1; i >= 0; i--) {
    const termDate = getSolarTermDate(year, i);
    if (date >= termDate) {
      monthBranch = (i + 2) % 12;
      break;
    }
  }

  const branchOffset = ((monthBranch - 2) % 12 + 12) % 12;
  const monthStem = ((yearStem * 2 + 2 + branchOffset) % 10 + 10) % 10;

  return { stem: monthStem, branch: monthBranch };
}

/**
 * 获取年月日干支
 */
export function getFullDateStemBranch(date) {
  const year = getYearStemBranch(date);
  const month = getMonthStemBranch(year.stem, date);
  const day = getDayStemBranch(date);
  return {
    year,
    month,
    day,
    formatted: {
      year: STEMS[year.stem] + BRANCHES[year.branch],
      month: STEMS[month.stem] + BRANCHES[month.branch],
      day: STEMS[day.stem] + BRANCHES[day.branch]
    }
  };
}
