package com.kharchapani.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kharchapani.app.data.model.LoginRequest
import com.kharchapani.app.data.model.RegisterRequest
import com.kharchapani.app.data.preferences.SessionManager
import com.kharchapani.app.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class AuthUiState {
    object Idle : AuthUiState()
    object Loading : AuthUiState()
    data class Success(val message: String) : AuthUiState()
    data class Error(val message: String) : AuthUiState()
}

class AuthViewModel(
    private val authRepository: AuthRepository,
    private val sessionManager: SessionManager
) : ViewModel() {

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    val isLoggedIn = sessionManager.isLoggedIn
    val currentUser = sessionManager.currentUser

    fun login(email: String, pass: String) {
        val cleanEmail = email.trim().lowercase()
        val cleanPass = pass.trim()

        if (cleanEmail.isBlank() || cleanPass.isBlank()) {
            _uiState.value = AuthUiState.Error("Please enter both email and password")
            return
        }

        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            val result = authRepository.login(LoginRequest(cleanEmail, cleanPass))
            result.fold(
                onSuccess = {
                    _uiState.value = AuthUiState.Success("Welcome back, ${it.user.fullName ?: "User"}!")
                },
                onFailure = {
                    _uiState.value = AuthUiState.Error(it.message ?: "Invalid email or password")
                }
            )
        }
    }

    fun register(email: String, pass: String, fullName: String) {
        val cleanEmail = email.trim().lowercase()
        val cleanPass = pass.trim()
        val cleanName = fullName.trim()

        if (cleanName.isBlank() || cleanEmail.isBlank() || cleanPass.isBlank()) {
            _uiState.value = AuthUiState.Error("Please fill in all fields")
            return
        }

        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(cleanEmail).matches()) {
            _uiState.value = AuthUiState.Error("Please enter a valid email address")
            return
        }

        if (cleanPass.length < 8) {
            _uiState.value = AuthUiState.Error("Password must be at least 8 characters long")
            return
        }

        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            val result = authRepository.register(RegisterRequest(cleanEmail, cleanPass, cleanName))
            result.fold(
                onSuccess = {
                    // Instantly auto-login user so they go straight to Dashboard!
                    val loginResult = authRepository.login(LoginRequest(cleanEmail, cleanPass))
                    loginResult.fold(
                        onSuccess = { tokenResp ->
                            _uiState.value = AuthUiState.Success("Welcome to KharchaPani, ${tokenResp.user.fullName ?: cleanName}!")
                        },
                        onFailure = {
                            _uiState.value = AuthUiState.Success("Account created successfully! Please log in.")
                        }
                    )
                },
                onFailure = {
                    _uiState.value = AuthUiState.Error(it.message ?: "Registration failed")
                }
            )
        }
    }

    fun loginWithGoogle(idToken: String) {
        if (idToken.isBlank()) {
            _uiState.value = AuthUiState.Error("Invalid Google ID Token")
            return
        }

        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            val result = authRepository.googleLogin(idToken)
            result.fold(
                onSuccess = {
                    _uiState.value = AuthUiState.Success("Welcome, ${it.user.fullName ?: "User"}!")
                },
                onFailure = {
                    _uiState.value = AuthUiState.Error(it.message ?: "Google Sign-In failed")
                }
            )
        }
    }

    fun resetState() {
        _uiState.value = AuthUiState.Idle
    }

    fun logout() {
        authRepository.logout()
        _uiState.value = AuthUiState.Idle
    }
}
