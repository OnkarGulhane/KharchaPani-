package com.kharchapani.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kharchapani.app.data.model.DashboardChartsResponse
import com.kharchapani.app.data.model.DashboardSummaryResponse
import com.kharchapani.app.data.model.MonthComparisonResponse
import com.kharchapani.app.data.repository.DashboardRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class DashboardUiState {
    object Loading : DashboardUiState()
    data class Success(
        val summary: DashboardSummaryResponse,
        val charts: DashboardChartsResponse?,
        val comparison: MonthComparisonResponse?
    ) : DashboardUiState()
    data class Error(val message: String) : DashboardUiState()
}

class DashboardViewModel(
    private val dashboardRepository: DashboardRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<DashboardUiState>(DashboardUiState.Loading)
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    private val _selectedPeriod = MutableStateFlow("month")
    val selectedPeriod: StateFlow<String> = _selectedPeriod.asStateFlow()

    fun setPeriod(period: String) {
        if (_selectedPeriod.value != period) {
            _selectedPeriod.value = period
            loadDashboardData()
        }
    }

    fun loadDashboardData() {
        viewModelScope.launch {
            _uiState.value = DashboardUiState.Loading
            val period = _selectedPeriod.value

            val summaryResult = dashboardRepository.getSummary(period)
            if (summaryResult.isFailure) {
                _uiState.value = DashboardUiState.Error(
                    summaryResult.exceptionOrNull()?.message ?: "Failed to load dashboard"
                )
                return@launch
            }

            val summary = summaryResult.getOrNull()!!
            val charts = dashboardRepository.getCharts(period).getOrNull()
            val comparison = dashboardRepository.getMonthComparison().getOrNull()

            _uiState.value = DashboardUiState.Success(
                summary = summary,
                charts = charts,
                comparison = comparison
            )
        }
    }
}
