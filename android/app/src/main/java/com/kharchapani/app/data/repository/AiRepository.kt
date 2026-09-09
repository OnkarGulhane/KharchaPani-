package com.kharchapani.app.data.repository

import com.kharchapani.app.data.api.ApiClient
import com.kharchapani.app.data.api.NetworkErrorParser
import com.kharchapani.app.data.model.*

class AiRepository(private val apiClient: ApiClient) {

    suspend fun askKharchaGuru(request: AIChatRequest): Result<AIChatResponse> {
        return try {
            val response = apiClient.getApiService().askKharchaGuru(request)
            if (response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Kharcha Guru is unavailable"))
            }
        } catch (e: Exception) {
            Result.failure(Exception(NetworkErrorParser.parse(e)))
        }
    }

    suspend fun quickParseExpense(text: String, referenceDate: String? = null): Result<AIQuickParseResponse> {
        return try {
            val response = apiClient.getApiService().quickParseExpense(AIQuickParseRequest(text, referenceDate))
            if (response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Could not parse voice expense"))
            }
        } catch (e: Exception) {
            Result.failure(Exception(NetworkErrorParser.parse(e)))
        }
    }

    suspend fun getFinancialHealth(): Result<FinancialHealthResponse> {
        return try {
            val response = apiClient.getApiService().getFinancialHealth()
            if (response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to compute financial health"))
            }
        } catch (e: Exception) {
            Result.failure(Exception(NetworkErrorParser.parse(e)))
        }
    }

    suspend fun getExpenseSentiment(): Result<ExpenseSentimentResponse> {
        return try {
            val response = apiClient.getApiService().getExpenseSentiment()
            if (response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to compute sentiment"))
            }
        } catch (e: Exception) {
            Result.failure(Exception(NetworkErrorParser.parse(e)))
        }
    }

    suspend fun getBudgetForecast(): Result<BudgetForecastResponse> {
        return try {
            val response = apiClient.getApiService().getBudgetForecast()
            if (response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to compute forecast"))
            }
        } catch (e: Exception) {
            Result.failure(Exception(NetworkErrorParser.parse(e)))
        }
    }
}
