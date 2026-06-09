# 六爻占卜应用全面优化设计

> 日期: 2026-06-09
> 状态: 已批准
> 目标: 对 liuyao-app 进行全面优化，涵盖代码架构、专业占卜功能、UI/UX、构建系统与Android原生

---

## 1. 概述

六爻应用当前为单HTML文件 + Android WebView壳架构。本次优化目标是在保持Web版本与Android版本同步的前提下，将应用升级至专业水准。采用**分三阶段演进**的策略：

1. **第一阶段：模块化重构** — 拆单文件为模块化架构，引入Vite构建系统
2. **第二阶段：引擎分离** — 六爻核心逻辑独立为 `@liuyao/engine` 包
3. **第三阶段：专业功能增强** — 纳甲、六兽、世应、月建日建、旺相休囚死

---

## 2. 架构设计

### 2.1 总体目录结构

```
liuyao-repo/
├── packages/
│   ├── engine/                  # [阶段2] 六爻核心引擎
│   │   ├── src/
│   │   │   ├── index.js         # 公共API
│   │   │   ├── hexagram.js      # 64卦数据 + 查找
│   │   │   ├── compute.js       # 卦象计算 (本卦/变卦/互卦)
│   │   │   ├── nali.js          # 纳甲装卦
│   │   │   ├── liu兽.js          # 六兽
│   │   │   ├── shiying.js       # 世应
│   │   │   ├── yuechen.js       # 月建日建/爻辰/旺相休囚死
│   │   │   └── constants.js     # 常量定义
│   │   └── package.json
│   │
│   ├── web/                     # Web应用入口
│   │   ├── public/
│   │   │   └── index.html       # HTML模板
│   │   ├── src/
│   │   │   ├── css/
│   │   │   │   ├── base.css     # 基础样式/CSS变量
│   │   │   │   ├── layout.css   # 布局
│   │   │   │   ├── coin.css     # 铜钱动画
│   │   │   │   ├── reading.css  # 解卦展示
│   │   │   │   └── components.css # 通用组件
│   │   │   ├── js/
│   │   │   │   ├── app.js       # 应用入口与状态管理
│   │   │   │   ├── toss.js      # 摇卦交互
│   │   │   │   ├── manual.js    # 手动排盘
│   │   │   │   ├── reading.js   # 解卦展示（消费engine产物）
│   │   │   │   ├── history.js   # 历史记录
│   │   │   │   ├── theme.js     # 主题切换
│   │   │   │   ├── audio.js     # 音效
│   │   │   │   ├── storage.js   # 本地存储
│   │   │   │   └── ui.js        # 通用UI工具
│   │   │   └── assets/
│   │   ├── vite.config.js
│   │   └── package.json
│   │
│   └── android/                 # Android原生壳
│       ├── app/
│       │   ├── src/main/
│       │   │   ├── java/com/liuyao/app/
│       │   │   │   ├── MainActivity.kt
│       │   │   │   └── WebViewSetup.kt
│       │   │   ├── assets/        # 构建时从web复制
│       │   │   └── res/
│       │   └── build.gradle.kts
│       ├── build.gradle.kts
│       ├── settings.gradle.kts
│       └── gradle.properties
│
├── dist/                        # 构建输出
├── scripts/                     # 构建辅助脚本
├── liuyao.html                  # [阶段1] 单文件保留版本/入口
└── package.json                 # 根workspace配置
```

### 2.2 阶段一架构（模块化重构）

在阶段一中，保持单HTML输出，但源码结构已模块化：

**源码结构（packages/web/）：**
- 多个CSS文件通过 `@import` 合并
- 多个JS文件通过ESModule `import` 引用
- Vite构建输出为单个优化后的 `index.html`
- 所有现有功能保持不变，只重构组织方式

**构建流程：**
```
web/src/ (模块化源码)
  → vite build (打包、压缩、内联)
  → dist/index.html (优化后的单文件)
  → 复制到 android/app/src/main/assets/index.html
  → 复制到 repo根目录 liuyao.html (Web版本)
```

### 2.3 阶段二架构（引擎分离）

核心引擎独立为npm包，好处：
- Web和Android共享同一逻辑
- 可独立测试引擎逻辑
- 未来其他项目可复用
- 引擎不依赖DOM，可在Node.js/测试环境运行

引擎API设计：
```js
// 核心API
computeHexagram(lines: number[]): HexagramResult  // 计算本卦
computeChangedHexagram(lines: number[]): HexagramResult  // 计算变卦
computeMutualHexagram(lines: number[]): HexagramResult  // 互卦

// 专业功能（阶段三新增）
applyNajia(lines: number[], hexagram: HexagramResult): LineWithNajia[]
applyLiu兽(lines: number[], dayStem: number): LineWithLiu兽[]
applyShiYing(lines: number[], hexagram: HexagramResult): {shi: number, ying: number}
compute旺相休囚死(lines: number[], monthBranch: number): LineStatus[]
get月建日建(date: Date): {yearStemBranch, monthStemBranch, dayStemBranch}
```

---

## 3. 专业六爻功能详细设计

### 3.1 纳甲装卦

每个八经卦对应的干支：

| 经卦 | 内三爻（下卦） | 外三爻（上卦） |
|------|---------------|---------------|
| 乾 (☰) | 甲子、甲寅、甲辰 | 壬午、壬申、壬戌 |
| 坤 (☷) | 乙未、乙巳、乙卯 | 癸丑、癸亥、癸酉 |
| 震 (☳) | 庚子、庚寅、庚辰 | 庚午、庚申、庚戌 |
| 坎 (☵) | 戊寅、戊辰、戊午 | 戊申、戊戌、戊子 |
| 艮 (☶) | 丙辰、丙午、丙申 | 丙戌、丙子、丙寅 |
| 巽 (☴) | 辛丑、辛亥、辛酉 | 辛未、辛巳、辛卯 |
| 离 (☲) | 己卯、己丑、己亥 | 己酉、己未、己巳 |
| 兑 (☱) | 丁巳、丁卯、丁丑 | 丁酉、丁亥、丁未 |

**实现逻辑：**
- 根据upper/lower trigram索引查到对应干支数组
- 对六爻从下到上依次匹配干支

### 3.2 六兽（六神）

根据占卜日的**天干**（日建的天干部分）确定六兽起始和排列：

| 日天干 | 初爻 | 二爻 | 三爻 | 四爻 | 五爻 | 上爻 |
|--------|------|------|------|------|------|------|
| 甲/乙 | 青龙 | 朱雀 | 勾陈 | 腾蛇 | 白虎 | 玄武 |
| 丙/丁 | 朱雀 | 勾陈 | 腾蛇 | 白虎 | 玄武 | 青龙 |
| 戊/己 | 勾陈 | 腾蛇 | 白虎 | 玄武 | 青龙 | 朱雀 |
| 庚/辛 | 腾蛇 | 白虎 | 玄武 | 青龙 | 朱雀 | 勾陈 |
| 壬/癸 | 玄武 | 青龙 | 朱雀 | 勾陈 | 腾蛇 | 白虎 |

### 3.3 世应

根据卦在八宫中的位置确定世应位置：

规则：八纯卦世在第六爻，一世卦世在初爻，二世卦世在二爻，以此类推。
- 一世→世初爻，应四爻
- 二世→世二爻，应五爻
- 三世→世三爻，应上爻
- 四世→世四爻，应初爻
- 五世→世五爻，应二爻
- 游魂→世四爻，应初爻
- 归魂→世三爻，应上爻
- 八纯→世上爻，应三爻

**确定方法：** 根据本卦的八宫归属和世爻位置表匹配。需要建立从卦到八宫的映射。

**简化方案：** 对64卦建立世应位置映射表（世爻和应爻的爻位索引），这是最可靠的做法。

### 3.4 月建日建

使用**轻量方案**：从公历日期直接推算干支，不引入农历库。

**天干地支推算：**

日干支计算（已知基日算法）：
```js
// 以1900-01-01为基准（甲子日），对任意日期计算偏移
function getDayStemBranch(date) {
  const ref = new Date(1900, 0, 1)  // 1900-01-01 为甲子日
  const diff = Math.floor((date - ref) / 86400000)
  const stem = (diff + 10) % 10  // 甲=0
  const branch = (diff + 12) % 12  // 子=0
  return { stem, branch }
}
```

月建计算（以节气为界，结合年干）：
```js
// 月份从寅月开始（寅=2）
// 年干决定月干：甲己之年丙作首，乙庚之岁戊为头...
function getMonthStemBranch(yearStem, monthSolar) {
  // monthSolar: 1-12，其中1=寅月，2=卯月...
  const monthStem = (yearStem * 2 + monthSolar) % 10
  return { stem: monthStem, branch: (monthSolar + 1) % 12 }
}
```

年干支计算（以立春2月4日为界）：
```js
function getYearStemBranch(year, date) {
  const boundary = new Date(year, 1, 4)  // 立春约在2月4日
  const actualYear = date < boundary ? year - 1 : year
  const stem = (actualYear - 4) % 10
  const branch = (actualYear - 4) % 12
  return { stem, branch, year: actualYear }
}
```

**节气月份对照表（用于月建精确判断）：**

| 月份 | 节气 | 地支 |
|------|------|------|
| 正月 | 立春~惊蛰 | 寅 |
| 二月 | 惊蛰~清明 | 卯 |
| 三月 | 清明~立夏 | 辰 |
| 四月 | 立夏~芒种 | 巳 |
| 五月 | 芒种~小暑 | 午 |
| 六月 | 小暑~立秋 | 未 |
| 七月 | 立秋~白露 | 申 |
| 八月 | 白露~寒露 | 酉 |
| 九月 | 寒露~立冬 | 戌 |
| 十月 | 立冬~大雪 | 亥 |
| 十一月 | 大雪~小寒 | 子 |
| 十二月 | 小寒~立春 | 丑 |

### 3.5 旺相休囚死

五行在四季中的旺相休囚死状态：

| 季节 | 旺 | 相 | 休 | 囚 | 死 |
|------|----|----|----|----|----|
| 春（寅卯月） | 木 | 火 | 水 | 金 | 土 |
| 夏（巳午月） | 火 | 土 | 木 | 水 | 金 |
| 秋（申酉月） | 金 | 水 | 土 | 火 | 木 |
| 冬（亥子月） | 水 | 木 | 金 | 土 | 火 |
| 四季（辰戌丑未月） | 土 | 金 | 火 | 木 | 水 |

结合月建和日建，判断各爻的五行状态，影响吉凶判断。

### 3.6 用神分析（后续扩展）

在旺相休囚死的基础上，可根据问卦类别（事业、感情、财运等）确定用神：

| 类别 | 用神 |
|------|------|
| 事业/功名 | 官鬼 |
| 财运 | 妻财 |
| 感情/婚姻 | 官鬼（女）/ 妻财（男） |
| 健康/疾病 | 子孙 |
| 学业/考试 | 父母 |
| 出行 | 子孙 |
| 诉讼 | 官鬼 |

初始版本实现五行旺相判断，用神分析作为可选项标记为后续增强。

---

## 4. UI/UX 设计

### 4.1 色彩系统与主题

沿用现有iOS风格设计，新增专业元素配色：

| 元素 | 浅色 | 深色 | 含义 |
|------|------|------|------|
| 青龙 | #00A86B | #00C853 | 吉神 |
| 朱雀 | #FF6B35 | #FF8A50 | 是非 |
| 勾陈 | #8B7355 | #A0896B | 田土 |
| 腾蛇 | #9B59B6 | #BB8FCE | 虚惊 |
| 白虎 | #7F8C8D | #95A5A6 | 血光 |
| 玄武 | #2C3E50 | #34495E | 暗昧 |

### 4.2 解卦页面增强布局

```
┌─────────────────────────────────────┐
│  🔮 乾为天 · 第一卦                  │
│  📅 甲子年 丙寅月 戊午日              │ ← 月建日建卡片
├─────────────────────────────────────┤
│  ⬛ 本卦：乾为天    →    ▦ 变卦：坤为地 │ ← 卦变可视化
│     ▅▅▅▅▅              ▅▅ ▅▅         │
│     ▅▅▅▅▅              ▅▅ ▅▅         │
│     ▅▅▅▅▅  ───→        ▅▅ ▅▅         │
│     ▅▅▅▅▅              ▅▅ ▅▅         │
│     ▅▅▅▅▅              ▅▅ ▅▅         │
│     ▅▅▅▅▅              ▅▅ ▅▅         │
├─────────────────────────────────────┤
│  六爻                                                                          │
│  世 ▅▅▅▅▅ 壬戌 白虎   上爻 ○变 ▅▅ ▅▅  │ ← 每爻含纳甲+六兽+世应+变爻标记
│     ▅▅▅▅▅ 壬申 玄武   五爻            │
│  应 ▅▅▅▅▅ 壬午 腾蛇   四爻            │
│     ▅▅▅▅▅ 甲辰 勾陈   三爻            │
│     ▅▅▅▅▅ 甲寅 朱雀   二爻            │
│     ▅▅▅▅▅ 甲子 青龙   初爻            │
├─────────────────────────────────────┤
│  旺相分析                             │
│  青龙（初爻）：木旺于春              │ ← 五行生克分析
│  朱雀（二爻）：火相于春              │
│  ...                                 │
├─────────────────────────────────────┤
│  卦象解释                             │
│  天行健，君子以自强不息。              │
│  乾卦六阳纯刚，...                    │
├─────────────────────────────────────┤
│  📤 分享  📝 备注  💾 保存  🔄 再摇   │
└─────────────────────────────────────┘
```

### 4.3 动画交互

- **铜钱翻转**：保持现有flip动画，增加弹性缓动（cubic-bezier）
- **摇卦过程**：每得一爻，爻条从底部弹入，伴随音效和振动
- **解卦展示**：内容分段渐入（stagger animation）
- **卦变动画**：本卦到变卦的爻变过程以高亮闪烁展示
- **历史加载**：从历史恢复卦象时，逐爻还原动画

### 4.4 触觉反馈（Android）

在摇卦、成卦、按钮点击时触发：

```kotlin
// Android HapticFeedback
webView.setOnTouchListener { v, event ->
    if (event.action == MotionEvent.ACTION_DOWN) {
        v.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
    }
    false
}

// 或者通过JS接口触发：
class HapticBridge(private val context: Context) {
    @JavascriptInterface
    fun vibrate() {
        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        if (vibrator.hasVibrator()) {
            vibrator.vibrate(VibrationEffect.createOneShot(20, VibrationEffect.DEFAULT_AMPLITUDE))
        }
    }
}
```

---

## 5. 构建系统设计

### 5.1 Vite 配置

```js
// vite.config.js
import { defineConfig } from 'vite'
import { resolve } from 'path'
import htmlInline from 'vite-plugin-html-inline'  // 内联所有资源

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/index.html'),
      output: {
        // 单文件场景，内联所有资源
        inline: true
      }
    },
    // 压缩
    minify: 'terser',
    cssMinify: 'lightningcss',
    // 移除console
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
    }
  },
  plugins: [htmlInline()]
})
```

### 5.2 构建脚本

```json
// packages/web/package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:android": "vite build && cp ../../dist/index.html ../android/app/src/main/assets/index.html",
    "build:web": "vite build && cp ../../dist/index.html ../../liuyao.html",
    "build:all": "npm run build:android && npm run build:web"
  }
}
```

### 5.3 根工作空间

```json
// 根 package.json
{
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "build:web": "npm run build -w packages/web",
    "build:android": "cd packages/android && ./gradlew assembleRelease",
    "build:all": "npm run build:web && npm run build:android"
  }
}
```

---

## 6. Android 原生优化

### 6.1 构建优化

```kotlin
// app/build.gradle.kts
android {
    buildTypes {
        release {
            isMinifyEnabled = true          // 开启混淆
            isShrinkResources = true        // 资源压缩
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}
```

### 6.2 WebView 性能

```kotlin
// WebViewSetup.kt
fun setupWebViewPerformance(webView: WebView) {
    webView.settings.apply {
        cacheMode = WebSettings.LOAD_CACHE_ELSE_NETWORK  // 优先缓存
        databaseEnabled = true
        domStorageEnabled = true
        // 预加载
        mediaPlaybackRequiresUserGesture = false
        // 渲染加速
        setRenderPriority(RenderPriority.HIGH)  // 已废弃但兼容
    }
    
    // 硬件加速 (已在manifest中)
    webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
}
```

### 6.3 启动屏

- 使用 Android 12+ SplashScreen API
- 向下兼容到 API 24 使用自定义 splash
- 显示六爻图标 + "六爻 · 周易占卜" 文字

### 6.4 WebView → Native 桥接

```kotlin
// 添加JS接口用于触觉反馈
class LiuyoBridge(private val context: Context) {
    @JavascriptInterface
    fun hapticFeedback() {
        // 摇卦时触发触觉
    }
    
    @JavascriptInterface
    fun shareText(text: String) {
        // 调用原生分享
    }
}
```

---

## 7. 数据存储

### 7.1 存储现状
- 历史记录：localStorage (key: `liuyao_history`)
- 主题偏好：localStorage (key: `liuyao_theme`)

### 7.2 优化方案
- 增加版本控制（存储格式版本号，便于未来迁移）
- 增加备注更新时间戳
- 数据格式不变，保持向后兼容

### 7.3 历史记录增强字段
```js
{
  id: number,           // Date.now()
  lines: number[],      // 六爻值 [初,二,三,四,五,上]
  hexagram: { upper, lower },
  changingHexagram: { upper, lower } | null,
  note: string,
  tag: string,          // 标签 (事业/感情/财运/健康/学业/出行)
  ts: number,           // 时间戳
  date: string,         // 显示用日期
  hxName: string,
  hxSym: string,
  // 新增（阶段三）：
  yearStemBranch?: string,   // 年干支
  monthStemBranch?: string,  // 月干支
  dayStemBranch?: string,    // 日干支
  version: 2                 // 存储格式版本
}
```

---

## 8. 实施计划

### 第一阶段：模块化重构（预估1天）

1. 初始化项目结构 — 创建 packages/web, 配置Vite
2. 拆分CSS — 从内联style拆为多个CSS文件
3. 拆分JS模块 — 按功能拆分：app/toss/manual/reading/history/theme/audio/storage/ui
4. 验证构建产物 — 确保构建后的HTML在Android和Web上功能一致
5. 启用Android R8混淆 — 配置 proguard-rules.pro

### 第二阶段：引擎分离（预估1天）

1. 创建 packages/engine 结构
2. 抽取 hexagram.js（64卦数据）
3. 抽取 compute.js（卦象计算逻辑）
4. 创建 engine 的 package.json，编写API
5. Web应用改为消费 engine 包
6. 编写引擎单元测试

### 第三阶段：专业功能增强（预估2天）

1. 实现纳甲装卦模块
2. 实现六兽模块（含日干支推算）
3. 实现世应模块
4. 实现月建日建模块（含节气表）
5. 实现旺相休囚死模块
6. 解卦页面UI增强（展示专业信息）
7. 历史记录扩展（保存干支信息）

---

## 9. 各阶段交付物

| 阶段 | 交付物 |
|------|--------|
| 一 | 模块化源码 + Vite构建 + 混淆开启 + 功能完整性验证 |
| 二 | @liuyao/engine包 + 单元测试 + Web消费引擎 |
| 三 | 专业六爻功能 + 增强UI + 更新历史记录格式 |

---

## 10. 风险与注意事项

- **农历日期**：采用简化的节气查表法，精度足够占卜用途，但不支持非公历输入
- **向后兼容**：历史记录格式升级需兼容旧版数据（无干支字段时降级显示）
- **构建产物大小**：引入更多JS后注意控制体积（目标 < 80KB gzipped）
- **测试**：64卦的纳甲/世应/六兽结果需要有对照验证
- **Web与Android同步**：构建脚本确保两方产物一致
