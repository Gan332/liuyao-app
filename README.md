# 六爻 · 周易占卜 Android App

将六爻占卜网页打包为 Android 应用，通过 GitHub Actions 自动构建 APK。

## 快速开始

### 1. 推送到 GitHub

```bash
cd /path/to/liuyao-android
git init
git add .
git commit -m "初始化六爻 Android 应用"
git remote add origin https://github.com/你的用户名/liuyao-android.git
git push -u origin main
```

### 2. 触发构建

推送后 GitHub Actions 自动构建 Debug APK。也可在 Actions 页面手动触发：
- 进入 GitHub 仓库 → Actions → **Build Android APK** → **Run workflow**
- 选择 `debug`（默认）或 `release`

### 3. 下载 APK

构建完成后，APK 文件在 Actions 页面的 **Artifacts** 中下载。

## 本地构建（需要 Android Studio）

```bash
cd liuyao-android
./gradlew assembleDebug
```

APK 生成在 `app/build/outputs/apk/debug/`

## Release 构建

发布版需配置签名：
1. 生成 keystore：`keytool -genkey -v -keystore app/keystore.jks -alias release -keyalg RSA -keysize 2048 -validity 10000`
2. Base64 编码：`base64 -i app/keystore.jks`
3. 在 GitHub 仓库 Settings → Secrets 中添加 `KEYSTORE_BASE64`
4. 填写 `app/keystore.properties`（参考模板）

## 项目结构

```
liuyao-android/
├── .github/workflows/build-android.yml  # GitHub Actions 构建配置
├── app/
│   ├── build.gradle.kts                 # 模块构建配置
│   └── src/main/
│       ├── AndroidManifest.xml          # 应用清单
│       ├── assets/index.html            # 六爻网页（优化版）
│       ├── java/com/liuyao/app/
│       │   └── MainActivity.kt         # WebView 主界面
│       └── res/values/themes.xml       # 主题配置
├── build.gradle.kts                     # 项目构建配置
├── settings.gradle.kts                  # 项目设置
└── gradle/wrapper/
    └── gradle-wrapper.properties        # Gradle 版本配置
```
