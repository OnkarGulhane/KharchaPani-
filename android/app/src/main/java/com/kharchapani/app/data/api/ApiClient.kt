package com.kharchapani.app.data.api

import com.kharchapani.app.data.preferences.SessionManager
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

class ApiClient(private val sessionManager: SessionManager) {

    private var cachedBaseUrl: String? = null
    private var cachedApiService: ApiService? = null

    fun getApiService(): ApiService {
        val currentBaseUrl = sessionManager.getBaseUrl()
        if (cachedApiService != null && cachedBaseUrl == currentBaseUrl) {
            return cachedApiService!!
        }

        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val okHttpClient = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(sessionManager))
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(currentBaseUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        val service = retrofit.create(ApiService::class.java)
        cachedBaseUrl = currentBaseUrl
        cachedApiService = service
        return service
    }
}
