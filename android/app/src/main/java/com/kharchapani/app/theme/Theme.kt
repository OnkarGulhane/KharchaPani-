package com.kharchapani.app.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = Emerald500,
    onPrimary = ObsidianBlack,
    primaryContainer = Emerald600,
    onPrimaryContainer = TextPrimary,
    secondary = Emerald400,
    onSecondary = ObsidianBlack,
    tertiary = Cyan500,
    background = ObsidianBlack,
    onBackground = TextPrimary,
    surface = CardBackground,
    onSurface = TextPrimary,
    surfaceVariant = CardBorder,
    onSurfaceVariant = TextSecondary,
    error = Rose500,
    onError = TextPrimary
)

private val LightColorScheme = lightColorScheme(
    primary = Emerald600,
    onPrimary = TextPrimary,
    primaryContainer = Emerald400,
    onPrimaryContainer = ObsidianBlack,
    secondary = Blue500,
    onSecondary = TextPrimary,
    background = LightBackground,
    onBackground = LightTextPrimary,
    surface = LightSurface,
    onSurface = LightTextPrimary,
    surfaceVariant = LightCardBorder,
    onSurfaceVariant = LightTextSecondary,
    error = Rose500,
    onError = TextPrimary
)

@Composable
fun KharchaPaniTheme(
    darkTheme: Boolean = true, // Default to Obsidian Dark Mode for KharchaPani
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current

    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            window.navigationBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
