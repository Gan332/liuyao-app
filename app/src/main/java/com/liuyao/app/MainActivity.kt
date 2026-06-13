package com.liuyao.app
import androidx.core.splashscreen.SplashScreen
import android.content.res.Configuration
import android.graphics.Bitmap
import android.os.Build
import android.os.Bundle
import android.util.TypedValue
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity

import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefresh: SwipeRefreshLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        SplashScreen.installSplashScreen(this)
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        supportActionBar?.hide()

        webView = WebView(this)

        with(webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            loadWithOverviewMode = true
            useWideViewPort = true
            builtInZoomControls = false
            displayZoomControls = false
            setSupportMultipleWindows(false)
            cacheMode = android.webkit.WebSettings.LOAD_DEFAULT
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean = false

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                syncThemeToWebView()
                view?.postDelayed({ applyImmersive() }, 2000)
            }
        }

        webView.webChromeClient = WebChromeClient()
        webView.setOnLongClickListener { true } // 禁止长按选择

        // 注册 JS Bridge
        webView.addJavascriptInterface(HapticBridge(this), "Android")
        webView.addJavascriptInterface(BridgeInterface(this), "LiuyaoBridge")

        // SwipeRefreshLayout 包裹 WebView
        swipeRefresh = SwipeRefreshLayout(this).apply {
            addView(webView, FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            ))
            setOnRefreshListener {
                webView.evaluateJavascript("reset()", null)
                postDelayed({ isRefreshing = false }, 600)
            }
            val tv = TypedValue()
            theme.resolveAttribute(android.R.attr.colorPrimary, tv, true)
            setColorSchemeColors(tv.data)
        }
        setContentView(swipeRefresh)

        webView.loadUrl("file:///android_asset/index.html")
    }

    // ===== 沉浸模式 =====

    private fun applyImmersive() {
        if (Build.VERSION.SDK_INT >= 30) {
            window.insetsController?.let { controller ->
                controller.hide(WindowInsets.Type.systemBars())
                controller.systemBarsBehavior =
                    WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_FULLSCREEN
            )
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) applyImmersive()
    }

    // ===== 主题同步 =====

    fun updateSystemBarsForTheme(theme: String) {
        val isDark = theme == "dark"
        if (Build.VERSION.SDK_INT >= 30) {
            window.decorView.windowInsetsController?.let { controller ->
                controller.isAppearanceLightStatusBars = !isDark
                controller.isAppearanceLightNavigationBars = !isDark
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = if (isDark) {
                window.decorView.systemUiVisibility and
                    View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR.inv()
            } else {
                window.decorView.systemUiVisibility or
                    View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
            }
        }
    }

    private fun syncThemeToWebView() {
        val isDark = (resources.configuration.uiMode and
            Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES
        val theme = if (isDark) "dark" else "light"
        webView.evaluateJavascript(
            "document.documentElement.setAttribute('data-theme','$theme')", null
        )
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        syncThemeToWebView()
    }

    // ===== 返回键 =====

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
