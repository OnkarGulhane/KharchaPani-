package com.kharchapani.app

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.compose.rememberNavController
import com.kharchapani.app.theme.KharchaPaniTheme
import com.kharchapani.app.ui.navigation.AppNavHost
import com.kharchapani.app.viewmodel.AiViewModel
import com.kharchapani.app.viewmodel.AuthViewModel
import com.kharchapani.app.viewmodel.DashboardViewModel
import com.kharchapani.app.viewmodel.ExpenseViewModel

class MainActivity : ComponentActivity() {

    private val authViewModel: AuthViewModel by viewModels {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val app = application as KharchaPaniApp
                @Suppress("UNCHECKED_CAST")
                return AuthViewModel(app.authRepository, app.sessionManager) as T
            }
        }
    }

    private val dashboardViewModel: DashboardViewModel by viewModels {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val app = application as KharchaPaniApp
                @Suppress("UNCHECKED_CAST")
                return DashboardViewModel(app.dashboardRepository) as T
            }
        }
    }

    private val expenseViewModel: ExpenseViewModel by viewModels {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val app = application as KharchaPaniApp
                @Suppress("UNCHECKED_CAST")
                return ExpenseViewModel(app.expenseRepository) as T
            }
        }
    }

    private val aiViewModel: AiViewModel by viewModels {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val app = application as KharchaPaniApp
                @Suppress("UNCHECKED_CAST")
                return AiViewModel(app.aiRepository) as T
            }
        }
    }

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { _ ->
        // Permissions granted/handled
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Request runtime permissions for SMS and Audio
        val permissionsToRequest = mutableListOf(
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.RECEIVE_SMS,
            Manifest.permission.READ_SMS
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        val missingPermissions = permissionsToRequest.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (missingPermissions.isNotEmpty()) {
            requestPermissionLauncher.launch(missingPermissions.toTypedArray())
        }

        setContent {
            KharchaPaniTheme(darkTheme = true) {
                val navController = rememberNavController()
                AppNavHost(
                    navController = navController,
                    authViewModel = authViewModel,
                    dashboardViewModel = dashboardViewModel,
                    expenseViewModel = expenseViewModel,
                    aiViewModel = aiViewModel
                )
            }
        }
    }
}
