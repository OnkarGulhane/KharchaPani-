package com.kharchapani.app.ui.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import com.kharchapani.app.KharchaPaniApp
import com.kharchapani.app.theme.ObsidianCanvas
import com.kharchapani.app.ui.analytics.AnalyticsScreen
import com.kharchapani.app.ui.auth.LoginScreen
import com.kharchapani.app.ui.auth.RegisterScreen
import com.kharchapani.app.ui.dashboard.DashboardScreen
import com.kharchapani.app.ui.expenses.AddExpenseSheet
import com.kharchapani.app.ui.expenses.ExpenseListScreen
import com.kharchapani.app.ui.expenses.VoiceExpenseDialog
import com.kharchapani.app.ui.guru.KharchaGuruScreen
import com.kharchapani.app.ui.settings.SettingsScreen
import com.kharchapani.app.viewmodel.AiViewModel
import com.kharchapani.app.viewmodel.AuthViewModel
import com.kharchapani.app.viewmodel.DashboardViewModel
import com.kharchapani.app.viewmodel.ExpenseViewModel

@Composable
fun AppNavHost(
    navController: NavHostController,
    authViewModel: AuthViewModel,
    dashboardViewModel: DashboardViewModel,
    expenseViewModel: ExpenseViewModel,
    aiViewModel: AiViewModel
) {
    val isLoggedIn by authViewModel.isLoggedIn.collectAsState()
    val currentUser by authViewModel.currentUser.collectAsState()

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    var showAddExpenseSheet by remember { mutableStateOf(false) }
    var showVoiceDialog by remember { mutableStateOf(false) }

    val isAuthScreen = currentRoute == Screen.Login.route || currentRoute == Screen.Register.route

    // Reactively navigate when login state changes
    LaunchedEffect(isLoggedIn) {
        if (isLoggedIn) {
            if (currentRoute == Screen.Login.route || currentRoute == Screen.Register.route || currentRoute == null) {
                navController.navigate(Screen.Dashboard.route) {
                    popUpTo(0) { inclusive = true }
                }
            }
        } else {
            if (currentRoute != null && !isAuthScreen && currentRoute != Screen.Settings.route) {
                navController.navigate(Screen.Login.route) {
                    popUpTo(0) { inclusive = true }
                }
            }
        }
    }

    Scaffold(
        bottomBar = {
            if (isLoggedIn && !isAuthScreen) {
                BottomNavigationBar(
                    navController = navController,
                    onVoiceClick = { showVoiceDialog = true }
                )
            }
        },
        containerColor = ObsidianCanvas
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = if (isLoggedIn && !isAuthScreen) paddingValues.calculateBottomPadding() else 0.dp)
        ) {
            NavHost(
                navController = navController,
                startDestination = if (isLoggedIn) Screen.Dashboard.route else Screen.Login.route
            ) {
                // Auth Routes
                composable(Screen.Login.route) {
                    LoginScreen(
                        authViewModel = authViewModel,
                        onNavigateToRegister = {
                            authViewModel.resetState()
                            navController.navigate(Screen.Register.route)
                        },
                        onNavigateToSettings = { navController.navigate(Screen.Settings.route) }
                    )
                }

                composable(Screen.Register.route) {
                    RegisterScreen(
                        authViewModel = authViewModel,
                        onNavigateToLogin = {
                            authViewModel.resetState()
                            navController.popBackStack()
                        }
                    )
                }

                // Main App Routes
                composable(Screen.Dashboard.route) {
                    DashboardScreen(
                        dashboardViewModel = dashboardViewModel,
                        userName = currentUser?.fullName,
                        onAddExpenseClick = { showAddExpenseSheet = true },
                        onVoiceExpenseClick = { showVoiceDialog = true },
                        onGuruClick = { navController.navigate(Screen.KharchaGuru.route) },
                        onSettingsClick = { navController.navigate(Screen.Settings.route) },
                        onViewAllExpenses = { navController.navigate(Screen.Expenses.route) }
                    )
                }

                composable(Screen.Expenses.route) {
                    ExpenseListScreen(
                        expenseViewModel = expenseViewModel,
                        onAddExpenseClick = { showAddExpenseSheet = true }
                    )
                }

                composable(Screen.KharchaGuru.route) {
                    KharchaGuruScreen(aiViewModel = aiViewModel)
                }

                composable(Screen.Analytics.route) {
                    AnalyticsScreen(aiViewModel = aiViewModel)
                }

                composable(Screen.Settings.route) {
                    SettingsScreen(
                        sessionManager = KharchaPaniApp.instance.sessionManager,
                        authViewModel = authViewModel,
                        onLogout = {
                            navController.navigate(Screen.Login.route) {
                                popUpTo(0) { inclusive = true }
                            }
                        }
                    )
                }
            }

            // Global Modal Bottom Sheet for Add Expense
            if (showAddExpenseSheet) {
                AddExpenseSheet(
                    expenseViewModel = expenseViewModel,
                    onDismiss = {
                        showAddExpenseSheet = false
                        dashboardViewModel.loadDashboardData()
                    }
                )
            }

            // Global Voice Expense Dialog (बोली खर्चा)
            if (showVoiceDialog) {
                VoiceExpenseDialog(
                    aiViewModel = aiViewModel,
                    expenseViewModel = expenseViewModel,
                    onDismiss = {
                        showVoiceDialog = false
                        dashboardViewModel.loadDashboardData()
                    }
                )
            }
        }
    }
}
