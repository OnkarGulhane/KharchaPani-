package com.kharchapani.app.data.repository

import com.kharchapani.app.data.api.ApiClient
import com.kharchapani.app.data.api.NetworkErrorParser
import com.kharchapani.app.data.model.DashboardChartsResponse
import com.kharchapani.app.data.model.DashboardSummaryResponse
import com.kharchapani.app.data.model.MonthComparisonResponse

class DashboardRepository(private val apiClient: ApiClient) {

    suspend fun getSummary(period: String = "month"): Result<DashboardSummaryResponse> {
        return try {
            val response = apiClient.getApiService().getDashboardSummary(period)
            if (response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to load summary"))
            }
        } catch (e: Exception) {
            Result.failure(Exception(NetworkErrorParser.parse(e)))
        }
    }

    suspend fun getCharts(period: String = "month"): Result<DashboardChartsResponse> {
        return try {
            val response = apiClient.getApiService().getDashboardCharts(period)
            if (response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to load charts"))
            }
        } catch (e: Exception) {
            Result.failure(Exception(NetworkErrorParser.parse(e)))
        }
    }

    suspend fun getMonthComparison(): Result<MonthComparisonResponse> {
        return try {
            val response = apiClient.getApiService().getMonthComparison()
            if (response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to load comparison"))
            }
        } catch (e: Exception) {
            Result.failure(Exception(NetworkErrorParser.parse(e)))
        }
    }
}
