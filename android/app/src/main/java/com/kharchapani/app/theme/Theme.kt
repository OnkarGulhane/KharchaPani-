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
    primary = NeonIndigo,
    onPrimary = TextPrimary,
    primaryContainer = PrimaryContainerIndigo,
    onPrimaryContainer = TextPrimary,
    inversePrimary = InversePrimary,
    secondary = ElectricEmerald,
    onSecondary = OnSecondaryEmerald,
    secondaryContainer = SecondaryContainerEmerald,
    onSecondaryContainer = TextPrimary,
    tertiary = VibrantViolet,
    onTertiary = OnTertiaryViolet,
    tertiaryContainer = TertiaryContainerViolet,
    onTertiaryContainer = TextPrimary,
    background = ObsidianCanvas,
    onBackground = TextOnSurface,
    surface = SurfaceElevated,
    onSurface = TextOnSurface,
    surfaceVariant = SurfaceContainerHigh,
    onSurfaceVariant = TextSecondary,
    surfaceTint = SurfaceTintIndigo,
    outline = TextMuted,
    outlineVariant = BorderGlass,
    error = CoralRose,
    onError = TextPrimary,
    errorContainer = ErrorContainerRose,
    onErrorContainer = ErrorSoft
)

private val LightColorScheme = lightColorScheme(
    primary = NeonIndigo,
    onPrimary = TextPrimary,
    primaryContainer = PrimaryFixed,
    onPrimaryContainer = TextPrimary,
    secondary = ElectricEmerald,
    onSecondary = TextPrimary,
    secondaryContainer = SecondaryFixed,
    onSecondaryContainer = OnSecondaryEmerald,
    tertiary = VibrantViolet,
    onTertiary = TextPrimary,
    background = LightBackground,
    onBackground = LightTextPrimary,
    surface = LightSurface,
    onSurface = LightTextPrimary,
    surfaceVariant = LightCardBorder,
    onSurfaceVariant = LightTextSecondary,
    error = CoralRose,
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
