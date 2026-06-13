# 六爻 Android 增强 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) for syntax tracking.

**Goal:** 在不重写网页 UI 的前提下，通过增强 Android WebView 壳层，使六爻 App 获得接近原生的体验（视觉融入 Material You、桌面交互 Widget、触感/沉浸/下拉刷新等原生交互）。

**Architecture:** Bridge 桥接模式 —— WebView 通过 @JavascriptInterface 与 Kotlin 壳层双向通信。Widget 侧内置轻量摇卦引擎（Kotlin 实现），与网页 JS 算法对等，通过 SharedPreferences 与 App 共享卦象数据。所有新增功能不修改现有网页业务逻辑。

**Tech Stack:** Kotlin, AndroidX AppCompat, AndroidX SplashScreen, AndroidX Webkit, Android AppWidget, Material You (Monet), VibrationEffect

---

## File Structure

### 新建文件

| 文件 | 职责 |
|------|------|
| `app/.../HapticBridge.kt` | JS-Kotlin 振动桥 |
| `app/.../BridgeInterface.kt` | 统一 JS Bridge 接口 |
| `app/.../HexagramEngine.kt` | 摇卦引擎+64卦数据 |
| `app/.../LiuyaoWidgetProvider.kt` | 桌面交互组件 |
| `res/xml/liuyao_widget_info.xml` | Widget 配置 |
| `res/layout/widget_liuyao.xml` | Widget 布局 |
| `res/drawable/ic_liuyao_splash.xml` | 启动屏图标 |
| `res/drawable/ic_launcher_foreground.xml` | 桌面图标前景 |
| `res/values/colors.xml` | 颜色定义 |
| `res/values-night/colors.xml` | 深色颜色 |
| `res/values/strings.xml` | 字符串资源 |
| `res/drawable/widget_background.xml` | Widget 背景 |

### 修改文件

| 文件 | 变更 |
|------|------|
| `app/build.gradle.kts` | 添加 core-splashscreen |
| `AndroidManifest.xml` | 注册 Widget、SplashScreen 主题 |
| `res/values/themes.xml` | SplashScreen 主题 |
| `app/.../MainActivity.kt` | Bridge/EdgeToEdge/沉浸/下拉刷新/深色同步 |

---

### Task 1: 更新构建依赖

**Modify:** `app/build.gradle.kts`

- [ ] **添加 SplashScreen 依赖**

```kotlin
dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("androidx.webkit:webkit:1.8.0")
    implementation("androidx.core:core-splashscreen:1.0.1")
}
```

- [ ] **Commit**

```bash
git add app/build.gradle.kts
git commit -m "build: add core-splashscreen dependency"
```

---

### Task 2: 启动屏 (SplashScreen)

**Files:** Create `res/drawable/ic_liuyao_splash.xml`, Modify `res/values/themes.xml`, `AndroidManifest.xml`, `MainActivity.kt`

- [ ] **创建启动图标**

`app/src/main/res/drawable/ic_liuyao_splash.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp"
    android:viewportWidth="108" android:viewportHeight="108">
    <path android:fillColor="#FFFFFF"
        android:pathData="M30,54L78,54M54,30L54,78"
        android:strokeWidth="4" android:strokeColor="#FFFFFF"/>
</vector>
```

- [ ] **更新 themes.xml 添加 SplashScreen 主题**

`app/src/main/res/values/themes.xml`:

```xml
<resources>
    <style name="Theme.Liuyao" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:windowLightStatusBar">true</item>
    </style>
    <style name="Theme.Liuyao.Splash" parent="Theme.SplashScreen">
        <item name="windowSplashScreenBackground">@color/splash_background</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/ic_liuyao_splash</item>
        <item name="postSplashScreenTheme">@style/Theme.Liuyao</item>
    </style>
</resources>
```

- [ ] **添加颜色资源**

`app/src/main/res/values/colors.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="splash_background">#F2F2F7</color>
</resources>
```

`app/src/main/res/values-night/colors.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="splash_background">#1C1C1E</color>
</resources>
```

- [ ] **更新 AndroidManifest**

```xml
<application android:theme="@style/Theme.Liuyao.Splash" ...>
```

- [ ] **在 MainActivity 安装**

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    installSplashScreen()
    super.onCreate(savedInstanceState)
    // ...
}
```

- [ ] **Commit**

```
git add app/src/main/res/drawable/ic_liuyao_splash.xml \
       app/src/main/res/values/themes.xml \
       app/src/main/res/values/colors.xml \
       app/src/main/res/values-night/colors.xml \
       app/src/main/AndroidManifest.xml \
       app/src/main/java/com/liuyao/app/MainActivity.kt
git commit -m "feat: add SplashScreen with hexagram icon"
```

---

### Task 3: EdgeToEdge + 沉浸模式

**Modify:** `MainActivity.kt`

- [ ] **启用 EdgeToEdge**

```kotlin
import androidx.activity.enableEdgeToEdge

override fun onCreate(savedInstanceState: Bundle?) {
    installSplashScreen()
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    supportActionBar?.hide()
}
```

- [ ] **沉浸模式辅助方法**

```kotlin
private fun applyImmersive() {
    if (Build.VERSION.SDK_INT >= 30) {
        window.insetsController?.let {
            it.hide(WindowInsets.Type.systemBars())
            it.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
    } else {
        @Suppress("DEPRECATION")
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
            View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
            View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
            View.SYSTEM_UI_FLAG_FULLSCREEN
        )
    }
}

override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus) applyImmersive()
}
```

- [ ] **Commit**

```
git add app/src/main/java/com/liuyao/app/MainActivity.kt
git commit -m "feat: add EdgeToEdge and immersive reading mode"
```

---

### Task 4: 触感反馈 Bridge

**Create:** `app/src/main/java/com/liuyao/app/HapticBridge.kt`
**Modify:** `MainActivity.kt`, `assets/index.html`

- [ ] **HapticBridge.kt**

```kotlin
package com.liuyao.app

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.webkit.JavascriptInterface

class HapticBridge(private val context: Context) {

    @JavascriptInterface
    fun vibrate(pattern: String) {
        val vibrator: Vibrator = if (Build.VERSION.SDK_INT >= 31) {
            (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager)
                .defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
        val dur = when (pattern) {
            "coin" -> 30L; "click" -> 15L; "heavy" -> 60L; else -> 20L
        }
        vibrator.vibrate(VibrationEffect.createOneShot(dur, VibrationEffect.DEFAULT_AMPLITUDE))
    }
}
```

- [ ] **注册并在网页调用**

在 `MainActivity.onCreate` 中添加：

```kotlin
webView.addJavascriptInterface(HapticBridge(this), "Android")
```

在 `index.html` 的 `toss()` 中 `playCoin()` 后添加：

```javascript
if (typeof Android !== 'undefined') Android.vibrate('coin');
```

在 `showRd()` 中 `playHx()` 后添加：

```javascript
if (typeof Android !== 'undefined') Android.vibrate('heavy');
```

- [ ] **Commit**

```
git add app/src/main/java/com/liuyao/app/HapticBridge.kt \
       app/src/main/java/com/liuyao/app/MainActivity.kt \
       app/src/main/assets/index.html
git commit -m "feat: add haptic feedback bridge"
```

---

### Task 5: 深色模式双向同步

**Create:** `BridgeInterface.kt`
**Modify:** `MainActivity.kt`, `index.html`

- [ ] **BridgeInterface.kt**

```kotlin
package com.liuyao.app

import android.webkit.JavascriptInterface

class BridgeInterface(private val activity: MainActivity) {

    @JavascriptInterface
    fun onThemeChanged(theme: String) {
        activity.runOnUiThread {
            activity.updateSystemBarsForTheme(theme)
        }
    }
}
```

- [ ] **MainActivity 同步方法**

```kotlin
fun updateSystemBarsForTheme(theme: String) {
    val isDark = theme == "dark"
    if (Build.VERSION.SDK_INT >= 30) {
        window.decorView.windowInsetsController?.let {
            it.isAppearanceLightStatusBars = !isDark
            it.isAppearanceLightNavigationBars = !isDark
        }
    } else {
        @Suppress("DEPRECATION")
        window.decorView.systemUiVisibility = if (isDark)
            window.decorView.systemUiVisibility and View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR.inv()
        else
            window.decorView.systemUiVisibility or View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
    }
}

private fun syncThemeToWebView() {
    val isDark = (resources.configuration.uiMode and
        android.content.res.Configuration.UI_MODE_NIGHT_MASK) ==
        android.content.res.Configuration.UI_MODE_NIGHT_YES
    webView.evaluateJavascript(
        "document.documentElement.setAttribute('data-theme','${if(isDark)"dark" else "light"}')", null)
}

override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    syncThemeToWebView()
}
```

在 `onCreate` 中注册 BridgeInterface：

```kotlin
webView.addJavascriptInterface(BridgeInterface(this), "LiuyaoBridge")
```

在 `onPageFinished` 中调用：

```kotlin
override fun onPageFinished(view: WebView?, url: String?) {
    super.onPageFinished(view, url)
    syncThemeToWebView()
}
```

- [ ] **网页端通知**

在 `index.html` 的 `setTheme(t)` 函数中，设置 `data-theme` 后添加：

```javascript
if (typeof LiuyaoBridge !== 'undefined') LiuyaoBridge.onThemeChanged(t);
```

- [ ] **Commit**

```
git add app/src/main/java/com/liuyao/app/BridgeInterface.kt \
       app/src/main/java/com/liuyao/app/MainActivity.kt \
       app/src/main/assets/index.html
git commit -m "feat: add bidirectional dark mode sync"
```

---

### Task 6: 下拉刷新 (SwipeRefreshLayout)

**Modify:** `MainActivity.kt`

- [ ] **包裹 WebView 并设置刷新**

```kotlin
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

val swipeRefresh = SwipeRefreshLayout(this).apply {
    addView(webView, ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
    setOnRefreshListener {
        webView.evaluateJavascript("reset()", null)
        postDelayed({ isRefreshing = false }, 600)
    }
    // 系统取色
    val tv = TypedValue().also { theme.resolveAttribute(android.R.attr.colorPrimary, it, true) }
    setColorSchemeColors(tv.data)
}
setContentView(swipeRefresh)
```

- [ ] **Commit**

```
git add app/src/main/java/com/liuyao/app/MainActivity.kt
git commit -m "feat: add SwipeRefreshLayout pull-to-refresh"
```

---

### Task 7: Kotlin 摇卦引擎

**Create:** `HexagramEngine.kt`

- [ ] **数据模型 + 64卦精简数据 + 摇卦算法**

`app/src/main/java/com/liuyao/app/HexagramEngine.kt`:

```kotlin
package com.liuyao.app

import kotlin.random.Random
import org.json.JSONArray
import org.json.JSONObject

data class Hexagram(val number: Int, val name: String, val pinyin: String,
                    val symbol: String, val judgment: String, val upper: Int, val lower: Int)
data class HexagramResult(val lines: List<Int>, val hexagram: Hexagram,
                          val changingHexagram: Hexagram?)

object HexagramData {
    val list = listOf(
        Hexagram(1,"乾","qián","☰☰","天行健，君子以自强不息。",7,7),
        Hexagram(2,"坤","kūn","☷☷","地势坤，君子以厚德载物。",0,0),
        // 完整64卦数据（与网页 HX 数组一致，仅 name/symbol/judgment/upper/lower）
        Hexagram(3,"屯","zhūn","☵☳","云雷屯，君子以经纶。",2,4),
        Hexagram(4,"蒙","méng","☶☳","山下出泉，蒙。君子以果行育德。",1,4),
        // ... 64个完整条目
    )

    fun find(upper: Int, lower: Int) = list.find { it.upper == upper && it.lower == lower }
}

object HexagramEngine {
    fun toss(): HexagramResult {
        val lines = List(6) {
            (0..2).sumOf { if (Random.nextFloat() > 0.5f) 3 else 2 }
        }
        return computeResult(lines)
    }

    fun computeResult(lines: List<Int>): HexagramResult {
        val lb = lines.map { if (it == 7 || it == 9) 1 else 0 }
        val (lN, uN) = ((lb[2] shl 2)+(lb[1] shl 1)+lb[0]) to ((lb[5] shl 2)+(lb[4] shl 1)+lb[3])
        val hx = HexagramData.find(uN, lN)!!
        val hasCh = lines.any { it == 6 || it == 9 }
        val ch = if (hasCh) {
            val cb = lb.mapIndexed { i, b -> if (lines[i]==6||lines[i]==9) 1-b else b }
            val (clN, cuN) = ((cb[2] shl 2)+(cb[1] shl 1)+cb[0]) to ((cb[5] shl 2)+(cb[4] shl 1)+cb[3])
            HexagramData.find(cuN, clN)
        } else null
        return HexagramResult(lines, hx, ch)
    }

    fun toJson(r: HexagramResult) = JSONObject().apply {
        put("lines", JSONArray(r.lines))
        put("name", r.hexagram.name)
        put("symbol", r.hexagram.symbol)
        put("judgment", r.hexagram.judgment)
        r.changingHexagram?.let { ch ->
            put("changingName", ch.name)
            put("changingSymbol", ch.symbol)
        }
    }.toString()
}
```

- [ ] **Commit**

```
git add app/src/main/java/com/liuyao/app/HexagramEngine.kt
git commit -m "feat: add Kotlin hexagram engine"
```

---

### Task 8: Widget 布局与配置

- [ ] **widget_info.xml**

`app/src/main/res/xml/liuyao_widget_info.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="250dp" android:minHeight="120dp"
    android:resizeMode="horizontal|vertical" android:updatePeriodMillis="0"
    android:widgetCategory="home_screen"
    android:targetCellWidth="4" android:targetCellHeight="2" />
```

- [ ] **widget_liuyao.xml 布局**

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent" android:layout_height="match_parent"
    android:gravity="center" android:orientation="vertical"
    android:padding="16dp" android:background="@drawable/widget_background">
    <TextView android:id="@+id/widget_symbol" android:layout_width="wrap_content"
        android:layout_height="wrap_content" android:textSize="32sp"
        android:textStyle="bold" android:text="☰" />
    <TextView android:id="@+id/widget_name" android:layout_width="wrap_content"
        android:layout_height="wrap_content" android:textSize="18sp"
        android:textStyle="bold" android:layout_marginTop="4dp" android:text="乾" />
    <TextView android:id="@+id/widget_judgment" android:layout_width="match_parent"
        android:layout_height="wrap_content" android:textSize="13sp"
        android:gravity="center" android:maxLines="1" android:ellipsize="end"
        android:layout_marginTop="2dp" android:text="天行健，君子以自强不息。" />
    <Button android:id="@+id/widget_toss_button" android:layout_width="wrap_content"
        android:layout_height="36dp" android:layout_marginTop="8dp"
        android:text="再摇一卦" android:textSize="12sp"
        style="@style/Widget.Material3.Button.TonalButton" />
</LinearLayout>
```

- [ ] **Widget 背景、字符串资源**

同上法创建 drawable 背景（圆角矩形）和 strings.xml。

- [ ] **Commit**

```bash
git add app/src/main/res/xml/ app/src/main/res/layout/ app/src/main/res/drawable/ app/src/main/res/values/strings.xml
git commit -m "feat: add widget layout and config"
```

---

### Task 9: Widget Provider

**Create:** `LiuyaoWidgetProvider.kt`

- [ ] **完整 Provider**

```kotlin
package com.liuyao.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

class LiuyaoWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(ctx: Context, mgr: AppWidgetManager, ids: IntArray) {
        ids.forEach { updateWidget(ctx, mgr, it) }
    }

    override fun onReceive(ctx: Context, intent: Intent) {
        super.onReceive(ctx, intent)
        if (ACTION_TOSS == intent.action) {
            val id = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, INVALID_ID)
            if (id != INVALID_ID) {
                val result = HexagramEngine.toss()
                saveResult(ctx, result)
                updateWidget(ctx, AppWidgetManager.getInstance(ctx), id)
            }
        }
    }

    private fun updateWidget(ctx: Context, mgr: AppWidgetManager, id: Int) {
        val views = RemoteViews(ctx.packageName, R.layout.widget_liuyao)
        val prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val sym = prefs.getString(KEY_SYM, "☰") ?: "☰"
        val name = prefs.getString(KEY_NAME, "乾") ?: "乾"
        val jdg = prefs.getString(KEY_JDG, "") ?: ""
        views.setTextViewText(R.id.widget_symbol, sym)
        views.setTextViewText(R.id.widget_name, name)
        views.setTextViewText(R.id.widget_judgment, jdg)

        val tossIntent = Intent(ctx, LiuyaoWidgetProvider::class.java).apply {
            action = ACTION_TOSS
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id)
        }
        views.setOnClickPendingIntent(R.id.widget_toss_button,
            PendingIntent.getBroadcast(ctx, id, tossIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE))

        val openIntent = Intent(ctx, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        views.setOnClickPendingIntent(R.id.widget_symbol,
            PendingIntent.getActivity(ctx, id, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE))

        mgr.updateAppWidget(id, views)
    }

    companion object {
        const val ACTION_TOSS = "com.liuyao.app.ACTION_TOSS"
        private const val PREFS = "liuyao_widget"
        private const val KEY_SYM = "sym"
        private const val KEY_NAME = "name"
        private const val KEY_JDG = "jdg"
        private const val INVALID_ID = AppWidgetManager.INVALID_APPWIDGET_ID

        fun saveResult(ctx: Context, r: HexagramResult) {
            ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().apply {
                putString(KEY_SYM, r.hexagram.symbol)
                putString(KEY_NAME, r.hexagram.name)
                putString(KEY_JDG, r.hexagram.judgment)
                apply()
            }
        }
    }
}
```

- [ ] **Commit**

```
git add app/src/main/java/com/liuyao/app/LiuyaoWidgetProvider.kt
git commit -m "feat: add interactive widget provider"
```

---

### Task 10: App 图标 (Adaptive Icon)

- [ ] **创建前景/背景矢量、mipmap 配置**

同设计文档所述创建 `ic_launcher_foreground.xml`、`ic_launcher_background.xml`、`mipmap-anydpi-v26/ic_launcher.xml`。

- [ ] **更新 AndroidManifest 引用**

```xml
<application android:icon="@mipmap/ic_launcher"
    android:roundIcon="@mipmap/ic_launcher_round" ...>
```

- [ ] **Commit**

```
git add app/src/main/res/drawable/ic_launcher_* app/src/main/res/mipmap-anydpi-v26/ app/src/main/AndroidManifest.xml
git commit -m "feat: add adaptive app icon"
```

---

### Task 11: 集成与最终验证

- [ ] **AndroidManifest 注册 Widget**

```xml
<receiver android:name=".LiuyaoWidgetProvider" android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
        <action android:name="com.liuyao.app.ACTION_TOSS" />
    </intent-filter>
    <meta-data android:name="android.appwidget.provider"
        android:resource="@xml/liuyao_widget_info" />
</receiver>
```

- [ ] **Activity 添加 uiMode configChanges**

```xml
<activity android:configChanges="orientation|screenSize|screenLayout|keyboardHidden|uiMode" ...>
```

- [ ] **构建验证**

```bash
./gradlew assembleDebug
```

预期：BUILD SUCCESSFUL

- [ ] **最终提交**

```
git add -A && git commit -m "chore: final integration of Android native enhancements"
```

---

## Spec 覆盖检查

| Spec 需求 | 对应 Task |
|-----------|-----------|
| SplashScreen 启动屏 | Task 2 |
| EdgeToEdge + 沉浸模式 | Task 3 |
| 深色模式双向同步 | Task 5 |
| 触感反馈 (Haptic) | Task 4 |
| 下拉刷新 | Task 6 |
| 返回手势增强 | Task 3 (onBackPressed) |
| App 图标 | Task 10 |
| 桌面交互 Widget | Task 7(引擎)+8(布局)+9(Provider) |
| JS Bridge 接口 | Task 4+5 |
