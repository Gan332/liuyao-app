# 六爻 Android 增强设计

## 概述

以 Bridge 桥接模式增强现有 WebView 壳层，在不重写网页 UI 的前提下，让六爻占卜 App 在 Android 上获得接近原生的体验。

## 架构

```
WebView (现有六爻网页)
    ↕ @JavascriptInterface + evaluateJavascript()
Android 壳层 (MainActivity + 模块组件)
    ├── SplashScreen — AndroidX SplashScreen API
    ├── EdgeToEdge + MaterialYou — 系统栏沉浸 + 动态取色
    ├── HapticBridge — JS → Kotlin 振动桥
    ├── SwipeRefreshLayout — 下拉刷新
    ├── ImmersiveMode — 全屏阅读 (API 30+)
    ├── ThemeSync — 深色模式双向同步
    └── LiuyaoWidget — AppWidgetProvider 交互式桌面组件
```

## Part A — 视觉融入

### SplashScreen
- Android 12+ SplashScreen API via `androidx.core:core-splashscreen`
- 启动时在 `onCreate` 中 `installSplashScreen()`
- 图标：`@drawable/ic_liuyao_splash`（卦符矢量图，`䷀`）
- 图标自动跟随 Material You 取色
- 无缝过渡到网页 Loading 动画

### 系统栏
- 启用 `EdgeToEdge`（API 30+），状态栏/导航栏透明
- 网页通过 JS Bridge 通知壳层切换系统栏配色（深色/浅色）
- 不再使用 `setAlgorithmicDarkeningAllowed`，全面依赖网页自身深色样式

### 深色模式同步
- Kotlin 监听 `onConfigurationChanged` 或 `isNightModeActive()`
- 通过 `evaluateJavascript("document.documentElement.setAttribute('data-theme','dark')")` 同步
- 网页已有的 `matchMedia('prefers-color-scheme: dark')` 监听保持，双层保障

### App Icon
- Adaptive Icon：前景层卦符矢量图，背景层 Material You 纯色
- 生成 mdpi–xxxhdpi 各尺寸

## Part B — 桌面交互式 Widget

### 规格
- 尺寸：4×2 cells (cell_4x2)
- 支持 API 26+
- 使用 `AppWidgetProvider` + `RemoteViews`

### 布局 (widget_liuyao.xml)
```
┌──────────────────────────────────┐
│           ☰                      │  卦符（32sp，粗体）
│           乾                      │  卦名（18sp）
│    天行健 君子以自强不息          │  卦辞（13sp，单行）
│                                  │
│    [ 再摇一卦 ]                   │  Material 风格按钮
│    上次：坤卦 · 3分钟前           │  历史（11sp）
└──────────────────────────────────┘
```

### 交互流程
1. 用户点击「再摇一卦」→ PendingIntent → `onUpdate()` 触发
2. Kotlin 侧内置轻量摇卦逻辑：
   - `random(0,1)` × 3 → 求和得 6/7/8/9
   - 重复 6 次 → 卦象数组
   - 查内置 64 卦数据（卦名、卦符、卦辞）→ 更新 RemoteViews
3. 点击卦象区域 → PendingIntent → `startActivity()` 打开主界面
4. 爻变逻辑：如有老阴/老阳（6或9）则取变卦 → 显示变卦后的卦象

### 摇卦算法（Kotlin）
```kotlin
fun generateHexagram(): Hexagram {
    val lines = IntArray(6) {
        (0..2).sumOf { if (Random.nextFloat() > 0.5f) 3 else 2 }
    }
    return computeHexagram(lines)
}
```
与网页 JS 的 `detLine()`/`toss()` 逻辑完全一致，保证结果对等。

### 数据共享
- `SharedPreferences` 存储最近卦象 JSON
- Widget 写入 → App 启动时读取并同步显示
- JS Bridge 方法 `getWidgetHexagram()` 供网页读取

## Part C — 原生交互

### 触感反馈 (HapticBridge)
- `@JavascriptInterface fun vibrate(pattern: String)` — 接受 `"click"`, `"heavy"`, `"coin"` 等模式
- 网页调用示例：`Android.vibrate('coin')`
- Kotlin 侧映射到 `VibrationEffect`（API 26+），兜底老 API

### 过渡动画
- Activity 转场：系统默认 Material 淡入上升
- 点击 Widget → App：`ActivityOptions.makeSceneTransitionAnimation()` 或默认转场
- 网页内部过渡（起卦→解卦）：网页 CSS `.anim` 动画保持不变

### 全屏沉浸
- API 30+：`WindowInsetsControllerCompat` 隐藏导航栏，轻触边缘显示
- API 29-：`SYSTEM_UI_FLAG_IMMERSIVE_STICKY`
- 自动跟随手势导航/三键导航偏好

### 下拉刷新
- WebView 外层包裹 `SwipeRefreshLayout`
- 起卦阶段下拉 = 重置输入（调 `reset()`）
- 解卦阶段下拉 = 回到起卦界面（同前）
- 刷新指示器颜色：Material You 取色

### 返回手势
- 浮层/面板打开时：关闭浮层（如历史记录、备注）
- 解卦界面按返回：弹出 `MaterialAlertDialog` 确认「返回将丢失当前卦象？」
- 起卦界面按返回：退出 App（系统默认行为）

## 不需实现

以下明确不在此 spec 范围内，避免 scope creep：
- 网络功能 / 后端 / 云同步
- Google Play 发布配置
- 多语言（只支持中文）
- App 内购买
- 通知推送
- JS 侧功能新增（只加 bridge 接口，不改网页业务逻辑）
- 64 卦详细解卦数据重复存储（Widget 只存卦名+卦符+卦辞）

## 测试策略

- Widget 测试：`AppWidgetProviderTestCase` 或手动验证各 Android 版本
- Bridge 接口测试：手动测试 + 网页侧 console.log 输出验证
- 兼容性：API 26–35（覆盖当前 Android 主流版本）
- 机型：常规尺寸手机和平板（Widget 4×2 自适应）
