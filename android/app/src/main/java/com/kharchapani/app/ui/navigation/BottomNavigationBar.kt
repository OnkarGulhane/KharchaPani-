package com.kharchapani.app.ui.navigation

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.navigation.compose.currentBackStackEntryAsState
import com.kharchapani.app.theme.*

@Composable
fun BottomNavigationBar(
    navController: NavController,
    onVoiceClick: () -> Unit
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    NavigationBar(
        modifier = Modifier
            .fillMaxWidth()
            .height(72.dp)
            .shadow(16.dp)
            .clip(RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)),
        containerColor = CardBackground,
        tonalElevation = 8.dp
    ) {
        BottomNavScreens.forEach { screen ->
            val isSelected = currentRoute == screen.route
            val isVoiceTab = screen == Screen.VoiceExpense
            val isGuruTab = screen == Screen.KharchaGuru

            val iconColor by animateColorAsState(
                targetValue = when {
                    isVoiceTab -> Emerald400
                    isGuruTab && isSelected -> Purple500
                    isSelected -> Emerald500
                    else -> TextMuted
                },
                label = "iconColor"
            )

            NavigationBarItem(
                selected = isSelected,
                onClick = {
                    if (isVoiceTab) {
                        onVoiceClick()
                    } else if (currentRoute != screen.route) {
                        navController.navigate(screen.route) {
                            popUpTo(Screen.Dashboard.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                },
                icon = {
                    screen.icon?.let { icon ->
                        Icon(
                            imageVector = icon,
                            contentDescription = screen.title,
                            tint = iconColor
                        )
                    }
                },
                label = {
                    Text(
                        text = screen.title,
                        style = MaterialTheme.typography.labelSmall,
                        color = if (isSelected) Emerald400 else TextMuted
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    indicatorColor = when {
                        isVoiceTab -> EmeraldGlow
                        isGuruTab -> Color(0x33A855F7)
                        else -> EmeraldGlow
                    }
                )
            )
        }
    }
}
