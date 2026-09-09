package com.kharchapani.app.ui.auth

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kharchapani.app.data.api.GoogleAuthHelper
import com.kharchapani.app.theme.*
import com.kharchapani.app.ui.components.GlassmorphicCard
import com.kharchapani.app.ui.components.ObsidianAtmosphere
import com.kharchapani.app.viewmodel.AuthUiState
import com.kharchapani.app.viewmodel.AuthViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    authViewModel: AuthViewModel,
    onNavigateToRegister: () -> Unit,
    onNavigateToSettings: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    val uiState by authViewModel.uiState.collectAsState()

    val googleSignInLauncher = androidx.activity.compose.rememberLauncherForActivityResult(
        contract = androidx.activity.result.contract.ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val task = com.google.android.gms.auth.api.signin.GoogleSignIn.getSignedInAccountFromIntent(result.data)
        try {
            val account = task.getResult(com.google.android.gms.common.api.ApiException::class.java)
            val token = account?.idToken ?: account?.serverAuthCode
            if (!token.isNullOrBlank()) {
                authViewModel.loginWithGoogle(token)
            } else {
                android.widget.Toast.makeText(context, "Could not retrieve Google token", android.widget.Toast.LENGTH_SHORT).show()
            }
        } catch (e: com.google.android.gms.common.api.ApiException) {
            if (e.statusCode != 12501 && e.statusCode != 16) {
                val msg = when (e.statusCode) {
                    12500 -> "Configuration error (12500): Check SHA-1 in Google Cloud Console."
                    10 -> "Developer Error (10): Google Cloud Console needs Android client ID."
                    else -> "Google Sign-In failed (${e.statusCode}): ${e.localizedMessage ?: "Please retry"}"
                }
                android.widget.Toast.makeText(context, msg, android.widget.Toast.LENGTH_LONG).show()
            }
        }
    }

    val cardShape = RoundedCornerShape(26.dp)

    ObsidianAtmosphere {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            contentAlignment = Alignment.Center
        ) {
            GlassmorphicCard(
                modifier = Modifier.fillMaxWidth(),
                shape = cardShape,
                backgroundColor = Color(0xF2181D2C),
                spotColor = Color(0x666366F1),
                elevation = 20.dp
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(26.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Glowing Brand Logo
                    Box(
                        modifier = Modifier
                            .size(60.dp)
                            .shadow(16.dp, shape = RoundedCornerShape(18.dp), spotColor = Color(0xFF8B5CF6))
                            .clip(RoundedCornerShape(18.dp))
                            .background(
                                Brush.linearGradient(
                                    listOf(Color(0xFF6366F1), Color(0xFF8B5CF6), Color(0xFFA855F7))
                                )
                            )
                            .border(BorderStroke(1.5.dp, Color(0x80FFFFFF)), RoundedCornerShape(18.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.AccountBalanceWallet,
                            contentDescription = "Logo",
                            tint = Color.White,
                            modifier = Modifier.size(32.dp)
                        )
                    }

                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "KharchaPani",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary,
                            letterSpacing = (-0.5).sp
                        )
                        Text(
                            text = "Obsidian Kinetic Finance Engine",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFFD0BCFF),
                            fontWeight = FontWeight.Medium
                        )
                    }

                    // Email Field
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Email Address") },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Rounded.Email,
                                contentDescription = "Email",
                                tint = Color(0xFFD0BCFF)
                            )
                        },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        singleLine = true,
                        shape = RoundedCornerShape(14.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = NeonIndigo,
                            unfocusedBorderColor = BorderGlass,
                            focusedContainerColor = Color(0xFF131722),
                            unfocusedContainerColor = Color(0xFF131722),
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedLabelColor = Color(0xFFD0BCFF),
                            unfocusedLabelColor = TextSecondary
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Password Field
                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("Password") },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Rounded.Lock,
                                contentDescription = "Password",
                                tint = Color(0xFFD0BCFF)
                            )
                        },
                        trailingIcon = {
                            IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                Icon(
                                    imageVector = if (passwordVisible) Icons.Rounded.Visibility else Icons.Rounded.VisibilityOff,
                                    contentDescription = "Toggle",
                                    tint = TextMuted
                                )
                            }
                        },
                        visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        singleLine = true,
                        shape = RoundedCornerShape(14.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = NeonIndigo,
                            unfocusedBorderColor = BorderGlass,
                            focusedContainerColor = Color(0xFF131722),
                            unfocusedContainerColor = Color(0xFF131722),
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedLabelColor = Color(0xFFD0BCFF),
                            unfocusedLabelColor = TextSecondary
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Error Message if any
                    if (uiState is AuthUiState.Error) {
                        Text(
                            text = (uiState as AuthUiState.Error).message,
                            color = CoralRose,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }

                    // Login Action Button with Gradient
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                            .shadow(12.dp, shape = RoundedCornerShape(14.dp), spotColor = Color(0xFF6366F1))
                            .clip(RoundedCornerShape(14.dp))
                            .background(
                                Brush.linearGradient(listOf(Color(0xFF6366F1), Color(0xFF8B5CF6)))
                            )
                            .clickable(enabled = uiState !is AuthUiState.Loading) {
                                authViewModel.login(email, password)
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        if (uiState is AuthUiState.Loading) {
                            CircularProgressIndicator(
                                color = Color.White,
                                modifier = Modifier.size(22.dp),
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text(
                                text = "Sign In",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }

                    // Google One-Tap Sign In
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color(0xFF222736))
                            .border(1.dp, BorderGlass, RoundedCornerShape(14.dp))
                            .clickable {
                                val intent = GoogleAuthHelper.getGoogleSignInClient(context).signInIntent
                                googleSignInLauncher.launch(intent)
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text(text = "G", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = Color(0xFF4285F4))
                            Text(
                                text = "Continue with Google",
                                style = MaterialTheme.typography.labelLarge,
                                fontWeight = FontWeight.SemiBold,
                                color = TextPrimary
                            )
                        }
                    }

                    // Server Config Link & Register Link
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Server Settings ⚙️",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color(0xFFD0BCFF),
                            modifier = Modifier.clickable { onNavigateToSettings() }
                        )

                        Text(
                            text = "Create Account →",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color(0xFF8B5CF6),
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.clickable { onNavigateToRegister() }
                        )
                    }
                }
            }
        }
    }
}
