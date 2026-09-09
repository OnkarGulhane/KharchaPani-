package com.kharchapani.app.ui.auth

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(ObsidianBlack)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = CardBackground),
            border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(CardBorder))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(28.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Brand Header
                Text(
                    text = "💸 KharchaPani",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = Emerald400
                )
                Text(
                    text = "Smart AI Expense & Wealth Engine",
                    fontSize = 13.sp,
                    color = TextSecondary,
                    modifier = Modifier.padding(top = 4.dp, bottom = 20.dp)
                )

                // 1. Fast 1-Click Google Sign-In
                OutlinedButton(
                    onClick = {
                        coroutineScope.launch {
                            val credResult = GoogleAuthHelper.signInWithCredentialManager(context)
                            credResult.fold(
                                onSuccess = { idToken ->
                                    authViewModel.loginWithGoogle(idToken)
                                },
                                onFailure = { error ->
                                    if (error.message?.contains("cancelled", ignoreCase = true) == true) {
                                        // Cancelled by user
                                    } else {
                                        val client = GoogleAuthHelper.getGoogleSignInClient(context)
                                        client.signOut().addOnCompleteListener {
                                            googleSignInLauncher.launch(client.signInIntent)
                                        }
                                    }
                                }
                            )
                        }
                    },
                    enabled = uiState !is AuthUiState.Loading,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.outlinedButtonColors(containerColor = ObsidianDark),
                    border = BorderStroke(1.dp, CardBorder)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "🌐",
                            fontSize = 18.sp,
                            modifier = Modifier.padding(end = 10.dp)
                        )
                        Text(
                            text = "Continue with Google",
                            color = TextPrimary,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                // 2. Subtle Divider
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    HorizontalDivider(modifier = Modifier.weight(1f), color = CardBorder)
                    Text(
                        text = "OR EMAIL",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextSecondary,
                        modifier = Modifier.padding(horizontal = 10.dp)
                    )
                    HorizontalDivider(modifier = Modifier.weight(1f), color = CardBorder)
                }

                // Email Input
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email Address", color = TextSecondary) },
                    leadingIcon = { Icon(Icons.Default.Email, contentDescription = "Email", tint = Emerald500) },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = Emerald500,
                        unfocusedBorderColor = CardBorder,
                        focusedContainerColor = ObsidianDark,
                        unfocusedContainerColor = ObsidianDark
                    ),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Password Input
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Password", color = TextSecondary) },
                    leadingIcon = { Icon(Icons.Default.Lock, contentDescription = "Password", tint = Emerald500) },
                    trailingIcon = {
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(
                                imageVector = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = "Toggle Password",
                                tint = TextSecondary
                            )
                        }
                    },
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = Emerald500,
                        unfocusedBorderColor = CardBorder,
                        focusedContainerColor = ObsidianDark,
                        unfocusedContainerColor = ObsidianDark
                    ),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                )

                // Error Banner
                if (uiState is AuthUiState.Error) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = (uiState as AuthUiState.Error).message,
                        color = Rose400,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Submit Login Button
                Button(
                    onClick = { authViewModel.login(email, password) },
                    enabled = uiState !is AuthUiState.Loading,
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald500),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp)
                ) {
                    if (uiState is AuthUiState.Loading) {
                        CircularProgressIndicator(color = ObsidianBlack, modifier = Modifier.size(24.dp))
                    } else {
                        Text(
                            text = "Login to KharchaPani",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = ObsidianBlack
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Register Link
                TextButton(onClick = onNavigateToRegister) {
                    Text(
                        text = "Don't have an account? Sign Up",
                        color = Emerald400,
                        fontSize = 14.sp
                    )
                }

                // Server Config Link
                TextButton(onClick = onNavigateToSettings) {
                    Text(
                        text = "⚙️ Configure Server IP / URL",
                        color = TextMuted,
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}
