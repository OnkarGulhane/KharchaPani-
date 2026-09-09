package com.kharchapani.app.data.preferences

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.kharchapani.app.data.model.UserResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class SessionManager(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    private val gson = Gson()

    private val _isLoggedIn = MutableStateFlow(!getAccessToken().isNullOrEmpty())
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn.asStateFlow()

    private val _currentUser = MutableStateFlow(getUser())
    val currentUser: StateFlow<UserResponse?> = _currentUser.asStateFlow()

    fun saveAuthTokens(accessToken: String, refreshToken: String?, user: UserResponse?) {
        prefs.edit().apply {
            putString(KEY_ACCESS_TOKEN, accessToken)
            if (!refreshToken.isNullOrEmpty()) {
                putString(KEY_REFRESH_TOKEN, refreshToken)
            }
            if (user != null) {
                putString(KEY_USER_DATA, gson.toJson(user))
            }
            apply()
        }
        _isLoggedIn.value = true
        if (user != null) {
            _currentUser.value = user
        }
    }

    fun getAccessToken(): String? {
        return prefs.getString(KEY_ACCESS_TOKEN, null)
    }

    fun getRefreshToken(): String? {
        return prefs.getString(KEY_REFRESH_TOKEN, null)
    }

    fun getUser(): UserResponse? {
        val userJson = prefs.getString(KEY_USER_DATA, null) ?: return null
        return try {
            gson.fromJson(userJson, UserResponse::class.java)
        } catch (e: Exception) {
            null
        }
    }

    fun getBaseUrl(): String {
        val saved = prefs.getString(KEY_BASE_URL, null)
        if (saved.isNullOrEmpty() || saved.contains("10.242.") || saved.contains("localhost") || saved.contains("127.0.0.1")) {
            return RENDER_BASE_URL
        }
        return saved
    }

    fun setBaseUrl(url: String) {
        var cleanUrl = url.trim()
        if (!cleanUrl.endsWith("/")) {
            cleanUrl += "/"
        }
        if (!cleanUrl.endsWith("api/v1/")) {
            cleanUrl = if (cleanUrl.endsWith("api/v1")) "$cleanUrl/" else "${cleanUrl}api/v1/"
        }
        prefs.edit().putString(KEY_BASE_URL, cleanUrl).apply()
    }

    fun isBiometricEnabled(): Boolean {
        return prefs.getBoolean(KEY_BIOMETRIC_ENABLED, false)
    }

    fun setBiometricEnabled(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_BIOMETRIC_ENABLED, enabled).apply()
    }

    fun logout() {
        prefs.edit().apply {
            remove(KEY_ACCESS_TOKEN)
            remove(KEY_REFRESH_TOKEN)
            remove(KEY_USER_DATA)
            apply()
        }
        _isLoggedIn.value = false
        _currentUser.value = null
    }

    companion object {
        private const val PREFS_NAME = "kharchapani_secure_prefs"
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        private const val KEY_USER_DATA = "user_data"
        private const val KEY_BASE_URL = "custom_base_url"
        private const val KEY_BIOMETRIC_ENABLED = "biometric_enabled"

        // Preset Endpoints
        const val RENDER_BASE_URL = "https://kharchapani-0lon.onrender.com/api/v1/"
        const val LOCAL_BASE_URL = "http://10.242.204.233:8000/api/v1/"

        // Default host: Cloud Render Production API
        const val DEFAULT_BASE_URL = RENDER_BASE_URL
    }
}
