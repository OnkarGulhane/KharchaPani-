package com.kharchapani.app.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Analytics
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Settings
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val icon: ImageVector? = null) {
    // Auth Routes
    object Login : Screen("login", "Login")
    object Register : Screen("register", "Register")

    // Main Tab Routes
    object Dashboard : Screen("dashboard", "Home", Icons.Default.Home)
    object Expenses : Screen("expenses", "Expenses", Icons.Default.AccountBalanceWallet)
    object VoiceExpense : Screen("voice_expense", "बोली खर्चा", Icons.Default.Mic)
    object KharchaGuru : Screen("kharcha_guru", "खर्चा Guru", Icons.Default.Psychology)
    object Analytics : Screen("analytics", "Analytics", Icons.Default.Analytics)
    object Settings : Screen("settings", "Settings", Icons.Default.Settings)
}

val BottomNavScreens = listOf(
    Screen.Dashboard,
    Screen.Expenses,
    Screen.VoiceExpense,
    Screen.KharchaGuru,
    Screen.Analytics
)
