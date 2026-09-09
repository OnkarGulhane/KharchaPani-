package com.kharchapani.app.data.repository

import com.kharchapani.app.data.api.ApiClient
import com.kharchapani.app.data.api.NetworkErrorParser
import com.kharchapani.app.data.model.LoginRequest
import com.kharchapani.app.data.model.RegisterRequest
import com.kharchapani.app.data.model.RegisterResponse
import com.kharchapani.app.data.model.TokenResponse
import com.kharchapani.app.data.preferences.SessionManager

class AuthRepository(
    private val apiClient: ApiClient,
    private val sessionManager: SessionManager
) {
    suspend fun login(request: LoginRequest): Result<TokenResponse> {
        return try {
            val response = apiClient.getApiService().login(request)
            if (response.data != null) {
                sessionManager.saveAuthTokens(
                    response.data.accessToken,
                    response.data.refreshToken,
                    response.data.user
                )
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Login failed"))
            }
        } catch (e: Exception) {
            Result.failure(Exception(NetworkErrorParser.parse(e)))
        }
    }

    suspend fun register(request: RegisterRequest): Result<RegisterResponse> {
        return try {
            val response = apiClient.getApiService().register(request)
            if (response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Registration failed"))
            }
        } catch (e: Exception) {
            Result.failure(Exception(NetworkErrorParser.parse(e)))
        }
    }

    suspend fun googleLogin(idToken: String): Result<TokenResponse> {
        return try {
            val response = apiClient.getApiService().googleLogin(com.kharchapani.app.data.model.GoogleAuthRequest(idToken))
            if (response.data != null) {
                sessionManager.saveAuthTokens(
                    response.data.accessToken,
                    response.data.refreshToken,
                    response.data.user
                )
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Google Sign-In failed"))
            }
        } catch (e: Exception) {
            Result.failure(Exception(NetworkErrorParser.parse(e)))
        }
    }

    fun logout() {
        sessionManager.logout()
    }
}
