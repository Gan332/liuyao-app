package com.liuyao.app

import android.webkit.JavascriptInterface

class BridgeInterface(private val activity: MainActivity) {

    @JavascriptInterface
    fun onThemeChanged(theme: String) {
        activity.runOnUiThread {
            activity.updateSystemBarsForTheme(theme)
        }
    }

    @JavascriptInterface
    fun getWidgetHexagram(): String {
        val prefs = activity.getSharedPreferences("liuyao_widget", android.content.Context.MODE_PRIVATE)
        return prefs.getString("hexagram", "{}") ?: "{}"
    }
}
