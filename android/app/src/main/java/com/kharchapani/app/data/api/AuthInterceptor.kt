package com.kharchapani.app.data.api

import com.google.gson.Gson
import com.kharchapani.app.data.model.ApiResponse
import com.kharchapani.app.data.model.RefreshTokenRequest
import com.kharchapani.app.data.model.RefreshTokenResponse
import com.kharchapani.app.data.preferences.SessionManager
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response

class AuthInterceptor(
    private val sessionManager: SessionManager
) : Interceptor {

    private val gson = Gson()

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val accessToken = sessionManager.getAccessToken()

        val requestBuilder = originalRequest.newBuilder()
            .header("Accept", "application/json")

        if (!accessToken.isNullOrEmpty() && originalRequest.header("Authorization") == null) {
            requestBuilder.header("Authorization", "Bearer $accessToken")
        }

        var response = chain.proceed(requestBuilder.build())

        // If 401 Unauthorized on an authenticated request, attempt silent token refresh
        if (response.code == 401 && !originalRequest.url.encodedPath.contains("/auth/") && !accessToken.isNullOrEmpty()) {
            response.close()
            val refreshToken = sessionManager.getRefreshToken()
            if (!refreshToken.isNullOrEmpty()) {
                val newAccessToken = performTokenRefresh(refreshToken)
                if (!newAccessToken.isNullOrEmpty()) {
                    sessionManager.saveAuthTokens(newAccessToken, refreshToken, sessionManager.getUser())
                    val retryRequest = originalRequest.newBuilder()
                        .header("Authorization", "Bearer $newAccessToken")
                        .build()
                    response = chain.proceed(retryRequest)
                } else {
                    sessionManager.logout()
                }
            } else {
                sessionManager.logout()
            }
        }

        return response
    }

    private fun performTokenRefresh(refreshToken: String): String? {
        return try {
            val refreshUrl = sessionManager.getBaseUrl() + "auth/refresh"
            val body = gson.toJson(RefreshTokenRequest(refreshToken))
                .toRequestBody("application/json".toMediaTypeOrNull())

            val request = Request.Builder()
                .url(refreshUrl)
                .post(body)
                .build()

            val client = OkHttpClient.Builder().build()
            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val parsed = gson.fromJson(responseBody, RefreshWrapper::class.java)
                parsed.data?.accessToken
            } else {
                null
            }
        } catch (e: Exception) {
            null
        }
    }

    private class RefreshWrapper(val data: RefreshTokenResponse?)
}
