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
            val id = intent.getIntExtra(
                AppWidgetManager.EXTRA_APPWIDGET_ID,
                AppWidgetManager.INVALID_APPWIDGET_ID
            )
            if (id != AppWidgetManager.INVALID_APPWIDGET_ID) {
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
