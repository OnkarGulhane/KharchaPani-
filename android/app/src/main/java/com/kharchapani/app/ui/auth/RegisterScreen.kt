package com.kharchapani.app.ui.auth

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
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
fun RegisterScreen(
    authViewModel: AuthViewModel,
    onNavigateToLogin: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    var fullName by remember { mutableStateOf("") }
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
            val tokenCandidate = account?.idToken ?: account?.serverAuthCode
            if (!tokenCandidate.isNullOrBlank()) {
                authViewModel.loginWithGoogle(tokenCandidate)
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

    val cardShape = RoundedCornerShape(28.dp)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(ObsidianCanvas)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .shadow(24.dp, shape = cardShape, spotColor = NeonIndigo),
            shape = cardShape,
            colors = CardDefaults.cardColors(containerColor = SurfaceElevated),
            border = BorderStroke(1.dp, BorderGlass)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(28.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Create Account ✨",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.ExtraBold,
                    color = TextPrimary
                )
                Text(
                    text = "Join KharchaPani today",
                    style = MaterialTheme.typography.labelMedium,
                    color = SurfaceTintIndigo,
                    modifier = Modifier.padding(top = 4.dp, bottom = 20.dp)
                )

                // 1. Fast 1-Click Google Sign-Up (Pill Shape)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp)
                        .clip(RoundedCornerShape(percent = 50))
                        .background(SurfaceHighlight)
                        .border(1.dp, BorderGlass, RoundedCornerShape(percent = 50))
                        .clickable(enabled = uiState !is AuthUiState.Loading) {
                            coroutineScope.launch {
                                val credResult = GoogleAuthHelper.signInWithCredentialManager(context)
                                credResult.fold(
                                    onSuccess = { idToken ->
                                        authViewModel.loginWithGoogle(idToken)
                                    },
                                    onFailure = { error ->
                                        if (error.message?.contains("cancelled", ignoreCase = true) == true) {
                                            // Cancelled
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
                    contentAlignment = Alignment.Center
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
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold
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
                    HorizontalDivider(modifier = Modifier.weight(1f), color = SurfaceHighlight)
                    Text(
                        text = "OR EMAIL",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = TextMuted,
                        modifier = Modifier.padding(horizontal = 12.dp)
                    )
                    HorizontalDivider(modifier = Modifier.weight(1f), color = SurfaceHighlight)
                }

                // Full Name Input
                OutlinedTextField(
                    value = fullName,
                    onValueChange = { fullName = it },
                    label = { Text("Full Name", color = TextSecondary) },
                    leadingIcon = { Icon(Icons.Default.Person, contentDescription = "Name", tint = NeonIndigo) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = NeonIndigo,
                        unfocusedBorderColor = BorderGlass,
                        focusedContainerColor = SurfaceContainerLowest,
                        unfocusedContainerColor = SurfaceContainerLowest
                    ),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Email Input
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email Address", color = TextSecondary) },
                    leadingIcon = { Icon(Icons.Default.Email, contentDescription = "Email", tint = NeonIndigo) },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = NeonIndigo,
                        unfocusedBorderColor = BorderGlass,
                        focusedContainerColor = SurfaceContainerLowest,
                        unfocusedContainerColor = SurfaceContainerLowest
                    ),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Password Input
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Password", color = TextSecondary) },
                    leadingIcon = { Icon(Icons.Default.Lock, contentDescription = "Password", tint = NeonIndigo) },
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
                        focusedBorderColor = NeonIndigo,
                        unfocusedBorderColor = BorderGlass,
                        focusedContainerColor = SurfaceContainerLowest,
                        unfocusedContainerColor = SurfaceContainerLowest
                    ),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                )

                Text(
                    text = "🔒 Password must be at least 8 characters",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextMuted,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(start = 4.dp, top = 4.dp)
                )

                if (uiState is AuthUiState.Error) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = (uiState as AuthUiState.Error).message,
                        color = CoralRose,
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Medium
                    )
                } else if (uiState is AuthUiState.Success) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = (uiState as AuthUiState.Success).message,
                        color = ElectricEmerald,
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Medium
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                val isRegisterEnabled = uiState !is AuthUiState.Loading && email.isNotBlank() && password.length >= 8 && fullName.isNotBlank()
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp)
                        .clip(RoundedCornerShape(percent = 50))
                        .background(
                            if (isRegisterEnabled) {
                                Brush.horizontalGradient(listOf(NeonIndigo, VibrantViolet))
                            } else {
                                Brush.horizontalGradient(listOf(SurfaceHighlight, SurfaceHighlight))
                            }
                        )
                        .clickable(enabled = isRegisterEnabled) {
                            authViewModel.register(email, password, fullName)
                        },
                    contentAlignment = Alignment.Center
                ) {
                    if (uiState is AuthUiState.Loading) {
                        CircularProgressIndicator(color = TextPrimary, modifier = Modifier.size(24.dp))
                    } else {
                        Text(
                            text = "Register Account",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = if (isRegisterEnabled) TextPrimary else TextMuted
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                TextButton(onClick = onNavigateToLogin) {
                    Text(
                        text = "Already have an account? Login",
                        color = SurfaceTintIndigo,
                        style = MaterialTheme.typography.labelLarge
                    )
                }
            }
        }
    }
}
