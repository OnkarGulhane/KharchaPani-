package com.kharchapani.app.data.repository

import com.kharchapani.app.data.api.ApiClient
import com.kharchapani.app.data.api.NetworkErrorParser
import com.kharchapani.app.data.model.CategoryResponse
import com.kharchapani.app.data.model.ExpenseCreate
import com.kharchapani.app.data.model.ExpenseResponse
import com.kharchapani.app.data.model.ExpenseUpdate

class ExpenseRepository(private val apiClient: ApiClient) {

    suspend fun getExpenses(
        page: Int = 1,
        pageSize: Int = 100,
        search: String? = null,
        categoryId: Int? = null
    ): Result<List<ExpenseResponse>> {
        return try {
            val response = apiClient.getApiService().getExpenses(page, pageSize, search, categoryId)
            Result.success(response.data?.items ?: emptyList())
        } catch (e: Exception) {
            Result.failure(Exception(NetworkErrorParser.parse(e)))
        }
    }

    suspend fun createExpense(request: ExpenseCreate): Result<ExpenseResponse> {
        return try {
            val response = apiClient.getApiService().createExpense(request)
            if (response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to create expense"))
            }
        } catch (e: Exception) {
            Result.failure(Exception(NetworkErrorParser.parse(e)))
        }
    }

    suspend fun updateExpense(id: Int, request: ExpenseUpdate): Result<ExpenseResponse> {
        return try {
            val response = apiClient.getApiService().updateExpense(id, request)
            if (response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to update expense"))
            }
        } catch (e: Exception) {
            Result.failure(Exception(NetworkErrorParser.parse(e)))
        }
    }

    suspend fun deleteExpense(id: Int): Result<Boolean> {
        return try {
            apiClient.getApiService().deleteExpense(id)
            Result.success(true)
        } catch (e: Exception) {
            Result.failure(Exception(NetworkErrorParser.parse(e)))
        }
    }

    suspend fun getCategories(): Result<List<CategoryResponse>> {
        return try {
            val response = apiClient.getApiService().getCategories()
            Result.success(response.data ?: emptyList())
        } catch (e: Exception) {
            Result.failure(Exception(NetworkErrorParser.parse(e)))
        }
    }
}
