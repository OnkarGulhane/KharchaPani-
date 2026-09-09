package com.kharchapani.app.ui.navigation

import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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

    val navShape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp)

    // Animated multi-layer halo expansion for center Voice AI orb
    val infiniteTransition = rememberInfiniteTransition(label = "voice_halo_anim")
    val haloScale1 by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.28f,
        animationSpec = infiniteRepeatable(
            animation = tween(1600, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "halo_scale1"
    )
    val haloAlpha1 by infiniteTransition.animateFloat(
        initialValue = 0.45f,
        targetValue = 0.1f,
        animationSpec = infiniteRepeatable(
            animation = tween(1600, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "halo_alpha1"
    )

    val haloScale2 by infiniteTransition.animateFloat(
        initialValue = 1.05f,
        targetValue = 1.16f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "halo_scale2"
    )

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(96.dp)
    ) {
        // Ambient glass background glow behind nav bar
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .height(76.dp)
                .background(
                    Brush.verticalGradient(
                        listOf(Color.Transparent, Color(0xB30B0F19))
                    )
                )
        )

        // Main Glassmorphic Navigation Dock Surface
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .height(76.dp)
                .shadow(32.dp, shape = navShape, ambientColor = Color(0x88000000), spotColor = Color(0x996366F1))
                .clip(navShape)
                .background(
                    Brush.verticalGradient(
                        listOf(
                            Color(0xF2161B28),
                            Color(0xFA0F131D)
                        )
                    )
                )
                .border(
                    BorderStroke(
                        1.dp,
                        Brush.verticalGradient(
                            listOf(
                                Color(0x40FFFFFF),
                                Color(0x10FFFFFF)
                            )
                        )
                    ),
                    navShape
                )
                .padding(horizontal = 12.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(bottom = 6.dp),
                horizontalArrangement = Arrangement.SpaceAround,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // 1. Home Tab
                NavItem(
                    icon = Icons.Rounded.Home,
                    label = "Home",
                    isSelected = currentRoute == Screen.Dashboard.route,
                    onClick = {
                        if (currentRoute != Screen.Dashboard.route) {
                            navController.navigate(Screen.Dashboard.route) {
                                popUpTo(navController.graph.startDestinationId) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    }
                )

                // 2. Ledger Tab
                NavItem(
                    icon = Icons.Rounded.AccountBalanceWallet,
                    label = "Ledger",
                    isSelected = currentRoute == Screen.Expenses.route,
                    onClick = {
                        if (currentRoute != Screen.Expenses.route) {
                            navController.navigate(Screen.Expenses.route) {
                                popUpTo(navController.graph.startDestinationId) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    }
                )

                // Placeholder space for the elevated center Voice AI orb
                Spacer(modifier = Modifier.width(64.dp))

                // 4. Guru AI Tab (Modern Sparkle / Intelligence symbol)
                NavItem(
                    icon = Icons.Rounded.AutoAwesome,
                    label = "Guru AI",
                    isSelected = currentRoute == Screen.KharchaGuru.route,
                    onClick = {
                        if (currentRoute != Screen.KharchaGuru.route) {
                            navController.navigate(Screen.KharchaGuru.route) {
                                popUpTo(navController.graph.startDestinationId) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    }
                )

                // 5. Analytics Tab (Insights icon)
                NavItem(
                    icon = Icons.Rounded.Insights,
                    label = "Analytics",
                    isSelected = currentRoute == Screen.Analytics.route,
                    onClick = {
                        if (currentRoute != Screen.Analytics.route) {
                            navController.navigate(Screen.Analytics.route) {
                                popUpTo(navController.graph.startDestinationId) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    }
                )
            }
        }

        // Center Elevated Floating Voice AI Sonic Orb
        Box(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .offset(y = 2.dp),
            contentAlignment = Alignment.Center
        ) {
            // Layer 1: Outer Wide Pulsing Halo
            Box(
                modifier = Modifier
                    .size(76.dp)
                    .scale(haloScale1)
                    .background(
                        Brush.radialGradient(
                            listOf(
                                Color(0xFF8B5CF6).copy(alpha = haloAlpha1),
                                Color(0xFF6366F1).copy(alpha = haloAlpha1 * 0.5f),
                                Color.Transparent
                            )
                        ),
                        CircleShape
                    )
            )

            // Layer 2: Mid Focused Glowing Ring
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .scale(haloScale2)
                    .background(
                        Brush.radialGradient(
                            listOf(
                                Color(0x666366F1),
                                Color(0x228B5CF6),
                                Color.Transparent
                            )
                        ),
                        CircleShape
                    )
            )

            // Layer 3: Main Radiant Orb Button
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .shadow(22.dp, shape = CircleShape, spotColor = Color(0xFFA855F7), ambientColor = Color(0xFF6366F1))
                    .clip(CircleShape)
                    .background(
                        Brush.linearGradient(
                            listOf(
                                Color(0xFF6366F1),
                                Color(0xFF8B5CF6),
                                Color(0xFFA855F7)
                            )
                        )
                    )
                    .border(
                        BorderStroke(
                            2.dp,
                            Brush.verticalGradient(
                                listOf(
                                    Color(0x99FFFFFF),
                                    Color(0x28FFFFFF)
                                )
                            )
                        ),
                        CircleShape
                    )
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null
                    ) { onVoiceClick() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Rounded.Mic,
                    contentDescription = "बोली खर्चा (Voice AI)",
                    tint = Color.White,
                    modifier = Modifier.size(26.dp)
                )
            }
        }
    }
}

@Composable
private fun NavItem(
    icon: ImageVector,
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) { onClick() }
            .padding(horizontal = 8.dp, vertical = 2.dp)
    ) {
        // Glowing squircle container for active icon
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(14.dp))
                .background(
                    if (isSelected) {
                        Brush.linearGradient(
                            listOf(Color(0x4D6366F1), Color(0x4D8B5CF6))
                        )
                    } else {
                        Brush.linearGradient(
                            listOf(Color.Transparent, Color.Transparent)
                        )
                    }
                )
                .border(
                    if (isSelected) BorderStroke(1.dp, Color(0x40D0BCFF)) else BorderStroke(0.dp, Color.Transparent),
                    RoundedCornerShape(14.dp)
                )
                .padding(horizontal = 14.dp, vertical = 5.dp),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = if (isSelected) Color(0xFFFFFFFF) else Color(0xFF8B92A5),
                modifier = Modifier.size(23.dp)
            )
        }

        Spacer(modifier = Modifier.height(2.dp))

        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = if (isSelected) Color(0xFFD0BCFF) else Color(0xFF8B92A5),
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
            fontSize = 10.5.sp,
            letterSpacing = 0.2.sp
        )

        // Active glowing pill line
        Box(
            modifier = Modifier
                .padding(top = 2.dp)
                .size(width = if (isSelected) 16.dp else 0.dp, height = 2.5.dp)
                .clip(RoundedCornerShape(percent = 50))
                .background(
                    if (isSelected) {
                        Brush.linearGradient(listOf(Color(0xFF6366F1), Color(0xFF8B5CF6)))
                    } else {
                        Brush.linearGradient(listOf(Color.Transparent, Color.Transparent))
                    }
                )
        )
    }
}
