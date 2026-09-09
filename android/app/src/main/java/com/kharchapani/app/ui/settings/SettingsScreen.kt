package com.kharchapani.app.ui.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Dns
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kharchapani.app.data.preferences.SessionManager
import com.kharchapani.app.theme.*
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
                title = { Text("Settings & Device Config ⚙️", fontWeight = FontWeight.Bold, color = TextPrimary) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ObsidianBlack)
            )
        },
        containerColor = ObsidianBlack
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // User Profile Info Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = CardBackground),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(CardBorder))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Person, contentDescription = "Profile", tint = Emerald400, modifier = Modifier.size(32.dp))
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = currentUser?.fullName ?: "KharchaPani User",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = currentUser?.email ?: "user@example.com",
                            fontSize = 13.sp,
                            color = TextSecondary
                        )
                    }
                }
            }

            // Server Backend URL Configuration Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = CardBackground),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(CardBorder))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Dns, contentDescription = "Server", tint = Emerald400)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Backend Server URL", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                    }
                    Text(
                        text = "Choose a preset or enter a custom backend API endpoint:",
                        fontSize = 12.sp,
                        color = TextMuted,
                        modifier = Modifier.padding(vertical = 6.dp)
                    )

                    // Quick Preset Buttons
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                currentBaseUrl = SessionManager.RENDER_BASE_URL
                                sessionManager.setBaseUrl(SessionManager.RENDER_BASE_URL)
                                showUrlSavedToast = true
                            },
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.outlinedButtonColors(
                                containerColor = if (currentBaseUrl.contains("onrender.com")) Emerald500.copy(alpha = 0.15f) else Color.Transparent
                            ),
                            border = ButtonDefaults.outlinedButtonBorder.copy(
                                brush = androidx.compose.ui.graphics.SolidColor(if (currentBaseUrl.contains("onrender.com")) Emerald500 else CardBorder)
                            )
                        ) {
                            Text("☁️ Render API", fontSize = 12.sp, color = TextPrimary)
                        }

                        OutlinedButton(
                            onClick = {
                                currentBaseUrl = SessionManager.LOCAL_BASE_URL
                                sessionManager.setBaseUrl(SessionManager.LOCAL_BASE_URL)
                                showUrlSavedToast = true
                            },
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.outlinedButtonColors(
                                containerColor = if (currentBaseUrl.contains("10.242")) Emerald500.copy(alpha = 0.15f) else Color.Transparent
                            ),
                            border = ButtonDefaults.outlinedButtonBorder.copy(
                                brush = androidx.compose.ui.graphics.SolidColor(if (currentBaseUrl.contains("10.242")) Emerald500 else CardBorder)
                            )
                        ) {
                            Text("💻 Local Wi-Fi", fontSize = 12.sp, color = TextPrimary)
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    OutlinedTextField(
                        value = currentBaseUrl,
                        onValueChange = { currentBaseUrl = it },
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedBorderColor = Emerald500,
                            unfocusedBorderColor = CardBorder,
                            focusedContainerColor = ObsidianDark,
                            unfocusedContainerColor = ObsidianDark
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Button(
                        onClick = {
                            sessionManager.setBaseUrl(currentBaseUrl)
                            showUrlSavedToast = true
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Emerald500),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.align(Alignment.End)
                    ) {
                        Text("Save URL", color = ObsidianBlack, fontWeight = FontWeight.SemiBold)
                    }

                    if (showUrlSavedToast) {
                        Text(
                            text = "✓ Server URL updated successfully!",
                            color = Emerald400,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }
            }

            // Biometric Lock Toggle Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = CardBackground),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(CardBorder))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Fingerprint, contentDescription = "Biometric", tint = Emerald400)
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text("Biometric Security", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                            Text("Unlock app with Fingerprint / Face", fontSize = 12.sp, color = TextSecondary)
                        }
                    }
                    Switch(
                        checked = isBiometricOn,
                        onCheckedChange = {
                            isBiometricOn = it
                            sessionManager.setBiometricEnabled(it)
                        },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = ObsidianBlack,
                            checkedTrackColor = Emerald500,
                            uncheckedThumbColor = TextMuted,
                            uncheckedTrackColor = ObsidianDark
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            // Logout Button
            Button(
                onClick = {
                    authViewModel.logout()
                    onLogout()
                },
                colors = ButtonDefaults.buttonColors(containerColor = CardBackground),
                shape = RoundedCornerShape(14.dp),
                border = ButtonDefaults.outlinedButtonBorder.copy(brush = androidx.compose.ui.graphics.SolidColor(Rose500)),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Logout, contentDescription = "Logout", tint = Rose400)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Logout from Account", color = Rose400, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
