# Keep WebView JavaScript interface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Kotlin data classes used with JSON
-keepclassmembers class com.liuyao.app.** {
    <fields>;
}
