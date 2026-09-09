package com.kharchapani.app

import android.app.Application
import com.kharchapani.app.data.api.ApiClient
import com.kharchapani.app.data.preferences.SessionManager
import com.kharchapani.app.data.repository.AiRepository
import com.kharchapani.app.data.repository.AuthRepository
import com.kharchapani.app.data.repository.DashboardRepository
import com.kharchapani.app.data.repository.ExpenseRepository

class KharchaPaniApp : Application() {

    lateinit var sessionManager: SessionManager
        private set

    lateinit var apiClient: ApiClient
        private set

    lateinit var authRepository: AuthRepository
        private set

    lateinit var expenseRepository: ExpenseRepository
        private set

    lateinit var dashboardRepository: DashboardRepository
        private set

    lateinit var aiRepository: AiRepository
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        sessionManager = SessionManager(this)
        apiClient = ApiClient(sessionManager)
        authRepository = AuthRepository(apiClient, sessionManager)
        expenseRepository = ExpenseRepository(apiClient)
        dashboardRepository = DashboardRepository(apiClient)
        aiRepository = AiRepository(apiClient)
    }

    companion object {
        lateinit var instance: KharchaPaniApp
            private set
    }
}
