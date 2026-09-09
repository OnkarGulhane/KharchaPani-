package com.kharchapani.app.data.model

import com.google.gson.annotations.SerializedName

data class BudgetStatusResponse(
    @SerializedName("id") val id: Int? = null,
    @SerializedName("limit_amount") val limitAmount: Double = 0.0,
    @SerializedName("spent_amount") val spentAmount: Double = 0.0,
    @SerializedName("remaining_amount") val remainingAmount: Double = 0.0,
    @SerializedName("percentage_used") val percentageUsed: Double = 0.0,
    @SerializedName("is_exceeded") val isExceeded: Boolean = false
)

data class DashboardSummaryResponse(
    @SerializedName("period") val period: String,
    @SerializedName("total_spent") val totalSpent: Double,
    @SerializedName("recent_expenses") val recentExpenses: List<ExpenseResponse> = emptyList(),
    @SerializedName("budget_status") val budgetStatus: BudgetStatusResponse? = null
)

data class CategoryChartData(
    @SerializedName("category_id") val categoryId: Int,
    @SerializedName("category_name") val categoryName: String,
    @SerializedName("amount") val amount: Double,
    @SerializedName("percentage") val percentage: Double
)

data class TrendChartData(
    @SerializedName("label") val label: String,
    @SerializedName("amount") val amount: Double
)

data class DashboardChartsResponse(
    @SerializedName("pie_chart") val pieChart: List<CategoryChartData> = emptyList(),
    @SerializedName("trend_chart") val trendChart: List<TrendChartData> = emptyList()
)

data class MonthComparisonResponse(
    @SerializedName("period") val period: String = "month",
    @SerializedName("current_period_total") val currentPeriodTotal: Double,
    @SerializedName("previous_period_total") val previousPeriodTotal: Double,
    @SerializedName("percentage_change") val percentageChange: Double,
    @SerializedName("is_increase") val isIncrease: Boolean
)
