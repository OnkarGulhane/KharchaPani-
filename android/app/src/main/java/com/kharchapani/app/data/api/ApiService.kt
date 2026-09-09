package com.kharchapani.app.data.api

import com.kharchapani.app.data.model.*
import retrofit2.http.*

interface ApiService {

    // --- Authentication ---
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): ApiResponse<TokenResponse>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): ApiResponse<RegisterResponse>

    @POST("auth/google")
    suspend fun googleLogin(@Body request: GoogleAuthRequest): ApiResponse<TokenResponse>

    @POST("auth/refresh")
    suspend fun refreshToken(@Body request: RefreshTokenRequest): ApiResponse<RefreshTokenResponse>

    // --- Dashboard ---
    @GET("dashboard/summary")
    suspend fun getDashboardSummary(
        @Query("period") period: String = "month"
    ): ApiResponse<DashboardSummaryResponse>

    @GET("dashboard/charts")
    suspend fun getDashboardCharts(
        @Query("period") period: String = "month"
    ): ApiResponse<DashboardChartsResponse>

    @GET("dashboard/comparison")
    suspend fun getMonthComparison(): ApiResponse<MonthComparisonResponse>

    // --- Expenses ---
    @GET("expenses")
    suspend fun getExpenses(
        @Query("page") page: Int = 1,
        @Query("page_size") pageSize: Int = 100,
        @Query("search") search: String? = null,
        @Query("category_id") categoryId: Int? = null
    ): ApiResponse<PaginatedData<ExpenseResponse>>

    @POST("expenses")
    suspend fun createExpense(
        @Body request: ExpenseCreate
    ): ApiResponse<ExpenseResponse>

    @PUT("expenses/{id}")
    suspend fun updateExpense(
        @Path("id") id: Int,
        @Body request: ExpenseUpdate
    ): ApiResponse<ExpenseResponse>

    @DELETE("expenses/{id}")
    suspend fun deleteExpense(
        @Path("id") id: Int
    ): ApiResponse<Map<String, Any>>

    // --- Categories ---
    @GET("categories")
    suspend fun getCategories(): ApiResponse<List<CategoryResponse>>

    // --- AI Suite & Kharcha Guru ---
    @POST("ai/chat")
    suspend fun askKharchaGuru(
        @Body request: AIChatRequest
    ): ApiResponse<AIChatResponse>

    @POST("ai/quick-parse")
    suspend fun quickParseExpense(
        @Body request: AIQuickParseRequest
    ): ApiResponse<AIQuickParseResponse>

    @GET("ai/financial-health")
    suspend fun getFinancialHealth(): ApiResponse<FinancialHealthResponse>

    @GET("ai/expense-sentiment")
    suspend fun getExpenseSentiment(): ApiResponse<ExpenseSentimentResponse>

    @GET("ai/budget-forecast")
    suspend fun getBudgetForecast(): ApiResponse<BudgetForecastResponse>
}
