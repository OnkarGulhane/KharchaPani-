package com.kharchapani.app.ui.settings

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kharchapani.app.data.preferences.SessionManager
import com.kharchapani.app.theme.*
import com.kharchapani.app.ui.components.GlassmorphicCard
import com.kharchapani.app.ui.components.ObsidianAtmosphere
import com.kharchapani.app.viewmodel.AuthViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    sessionManager: SessionManager,
    authViewModel: AuthViewModel,
    onLogout: () -> Unit
) {
    val currentUser by authViewModel.currentUser.collectAsState()
    var currentBaseUrl by remember { mutableStateOf(sessionManager.getBaseUrl()) }
    var isBiometricOn by remember { mutableStateOf(sessionManager.isBiometricEnabled()) }
    var showUrlSavedToast by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .shadow(8.dp, shape = RoundedCornerShape(12.dp), spotColor = Color(0xFF8B5CF6))
                                .clip(RoundedCornerShape(12.dp))
                                .background(
                                    Brush.linearGradient(
                                        listOf(Color(0xFF6366F1), Color(0xFF8B5CF6))
                                    )
                                )
                                .border(BorderStroke(1.dp, Color(0x60FFFFFF)), RoundedCornerShape(12.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.Settings,
                                contentDescription = "Settings",
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "Settings & Config",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Text(
                                text = "System & Security Preferences",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color(0xFFD0BCFF),
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ObsidianCanvas)
            )
        },
        containerColor = ObsidianCanvas
    ) { paddingValues ->
        ObsidianAtmosphere(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // 1. User Profile Info Card
                GlassmorphicCard(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    backgroundColor = Color(0xF2181D2C),
                    spotColor = Color(0x406366F1),
                    elevation = 10.dp
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(18.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .shadow(8.dp, shape = CircleShape, spotColor = Color(0xFF8B5CF6))
                                .clip(CircleShape)
                                .background(
                                    Brush.linearGradient(listOf(Color(0xFF6366F1), Color(0xFF8B5CF6)))
                                )
                                .border(BorderStroke(1.5.dp, Color(0x80FFFFFF)), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = (currentUser?.fullName?.take(1) ?: "O").uppercase(),
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                        Spacer(modifier = Modifier.width(14.dp))
                        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                            Text(
                                text = currentUser?.fullName ?: "KharchaPani User",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Text(
                                text = currentUser?.email ?: "user@kharchapani.app",
                                style = MaterialTheme.typography.bodySmall,
                                color = Color(0xFFD0BCFF)
                            )
                        }
                    }
                }

                // 2. Server Backend URL Configuration Card
                GlassmorphicCard(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    backgroundColor = Color(0xF2181D2C),
                    spotColor = Color(0x336366F1),
                    elevation = 8.dp
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(18.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(34.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Color(0x336366F1)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Rounded.Dns,
                                    contentDescription = "Server",
                                    tint = Color(0xFFD0BCFF),
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                            Text(
                                text = "Backend Server API Endpoint",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        }

                        // Presets Row
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            listOf(
                                "Render Cloud" to "https://kharchapani-0lon.onrender.com/api/v1/",
                                "Local WiFi" to "http://192.168.1.100:8000/api/v1/"
                            ).forEach { (label, url) ->
                                val isSelected = currentBaseUrl == url
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(percent = 50))
                                        .background(
                                            if (isSelected) Color(0xFF3131C0) else Color(0xFF222736)
                                        )
                                        .border(
                                            1.dp,
                                            if (isSelected) Color(0xFF8B5CF6) else BorderGlass,
                                            RoundedCornerShape(percent = 50)
                                        )
                                        .clickable {
                                            currentBaseUrl = url
                                            sessionManager.setBaseUrl(url)
                                            showUrlSavedToast = true
                                        }
                                        .padding(vertical = 8.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = label,
                                        fontSize = 11.5.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                        color = if (isSelected) Color.White else Color(0xFFCBC3D7)
                                    )
                                }
                            }
                        }

                        // Custom URL Input
                        TextField(
                            value = currentBaseUrl,
                            onValueChange = {
                                currentBaseUrl = it
                                sessionManager.setBaseUrl(it)
                            },
                            singleLine = true,
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = Color(0xFF131722),
                                unfocusedContainerColor = Color(0xFF131722),
                                focusedIndicatorColor = Color.Transparent,
                                unfocusedIndicatorColor = Color.Transparent,
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary
                            ),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }

                // 3. Security & Biometrics Card
                GlassmorphicCard(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    backgroundColor = Color(0xF2181D2C),
                    spotColor = Color(0x3310B981),
                    elevation = 8.dp
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(18.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(34.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Color(0x3310B981)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Rounded.Fingerprint,
                                    contentDescription = "Biometric",
                                    tint = EmeraldMint,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                            Column {
                                Text(
                                    text = "Biometric App Lock",
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                                Text(
                                    text = "Require fingerprint to unlock app",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = TextSecondary,
                                    fontSize = 11.5.sp
                                )
                            }
                        }

                        Switch(
                            checked = isBiometricOn,
                            onCheckedChange = {
                                isBiometricOn = it
                                sessionManager.setBiometricEnabled(it)
                            },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = ElectricEmerald,
                                uncheckedThumbColor = TextMuted,
                                uncheckedTrackColor = Color(0xFF262A35)
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.weight(1f))

                // 4. Logout Action
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp)
                        .shadow(10.dp, shape = RoundedCornerShape(14.dp), spotColor = Color(0xFFF43F5E))
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color(0x33F43F5E))
                        .border(1.dp, Color(0x66F43F5E), RoundedCornerShape(14.dp))
                        .clickable {
                            authViewModel.logout()
                            onLogout()
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.Logout,
                            contentDescription = "Logout",
                            tint = CoralRose,
                            modifier = Modifier.size(18.dp)
                        )
                        Text(
                            text = "Sign Out from Account",
                            fontWeight = FontWeight.Bold,
                            color = CoralRose,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }
    }
}
