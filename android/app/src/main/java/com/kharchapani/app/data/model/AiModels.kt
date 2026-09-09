package com.kharchapani.app.data.model

import com.google.gson.annotations.SerializedName

// ==========================================
// 1. Kharcha Guru AI Chatbot Models
// ==========================================
data class ChatMessage(
    @SerializedName("role") val role: String = "user", // "user" or "assistant"
    @SerializedName("content") val content: String = "",
    val timestamp: Long = System.currentTimeMillis()
)

data class MiniChartData(
    @SerializedName("chart_type") val chartType: String = "bar",
    @SerializedName("labels") val labels: List<String> = emptyList(),
    @SerializedName("values") val values: List<Double> = emptyList(),
    @SerializedName("title") val title: String? = null
)

data class AIChatRequest(
    @SerializedName("message") val message: String,
    @SerializedName("history") val history: List<ChatMessage> = emptyList()
)

data class AIChatResponse(
    @SerializedName("reply") val reply: String? = null,
    @SerializedName("suggested_questions") val suggestedQuestions: List<String> = emptyList(),
    @SerializedName("mini_chart") val miniChart: MiniChartData? = null,
    @SerializedName("engine_used") val engineUsed: String? = "gemini",
    // Compatibility fields
    @SerializedName("response") val legacyResponse: String? = null,
    @SerializedName("quick_replies") val legacyQuickReplies: List<String> = emptyList(),
    @SerializedName("suggested_action") val suggestedAction: String? = null
) {
    val response: String get() = reply ?: legacyResponse ?: ""
    val quickReplies: List<String> get() = if (suggestedQuestions.isNotEmpty()) suggestedQuestions else legacyQuickReplies
}

// ==========================================
// 2. बोली खर्चा / AI Quick Parse Models
// ==========================================
data class AIQuickParseRequest(
    @SerializedName("text") val text: String,
    @SerializedName("reference_date") val referenceDate: String? = null
)

data class AIQuickParseResponse(
    @SerializedName("title") val title: String? = null,
    @SerializedName("amount") val amount: Double? = null,
    @SerializedName("date") val date: String? = null,
    @SerializedName("category_id") val categoryId: Int? = null,
    @SerializedName("category_name") val categoryName: String? = null,
    @SerializedName("payment_mode") val paymentMode: String? = "UPI",
    @SerializedName("notes") val notes: String? = null,
    @SerializedName("confidence") val confidence: Double? = 0.95,
    @SerializedName("engine_used") val engineUsed: String? = "gemini",
    // Compatibility fields
    @SerializedName("description") val legacyDescription: String? = null,
    @SerializedName("category") val legacyCategory: String? = null,
    @SerializedName("payment_method") val legacyPaymentMethod: String? = null
) {
    val description: String get() = title ?: legacyDescription ?: notes ?: ""
    val category: String get() = categoryName ?: legacyCategory ?: "General"
    val paymentMethod: String get() = paymentMode ?: legacyPaymentMethod ?: "UPI"
}

// ==========================================
// 3. AI Financial Health Suite (0-100)
// ==========================================
data class HealthPillarScore(
    @SerializedName("pillar_id") val pillarId: String = "",
    @SerializedName("title") val title: String = "",
    @SerializedName("score") val score: Int = 0,
    @SerializedName("max_score") val maxScore: Int = 20,
    @SerializedName("status") val status: String = "Good",
    @SerializedName("summary") val summary: String = "",
    @SerializedName("metric_label") val metricLabel: String = ""
)

data class FiftyThirtyTwentyBreakdown(
    @SerializedName("needs_percentage") val needsPercentage: Double = 50.0,
    @SerializedName("wants_percentage") val wantsPercentage: Double = 30.0,
    @SerializedName("savings_percentage") val savingsPercentage: Double = 20.0,
    @SerializedName("ideal_needs_percentage") val idealNeedsPercentage: Double = 50.0,
    @SerializedName("ideal_wants_percentage") val idealWantsPercentage: Double = 30.0,
    @SerializedName("ideal_savings_percentage") val idealSavingsPercentage: Double = 20.0,
    @SerializedName("gap_summary") val gapSummary: String = ""
)

data class HealthRiskFactor(
    @SerializedName("severity") val severity: String = "low",
    @SerializedName("title") val title: String = "",
    @SerializedName("description") val description: String = "",
    @SerializedName("suggested_action") val suggestedAction: String = ""
)

data class FinancialActionStep(
    @SerializedName("priority") val priority: Int = 1,
    @SerializedName("title") val title: String = "",
    @SerializedName("description") val description: String = "",
    @SerializedName("estimated_monthly_inr_impact") val estimatedMonthlyInrImpact: Double = 0.0,
    @SerializedName("difficulty") val difficulty: String = "Easy"
)

data class FinancialHealthMetric(
    @SerializedName("name") val name: String = "",
    @SerializedName("score") val score: Int = 0,
    @SerializedName("weight") val weight: Double = 1.0,
    @SerializedName("status") val status: String = "Good",
    @SerializedName("advice") val advice: String = ""
)

data class FinancialHealthResponse(
    @SerializedName("overall_score") val overallScore: Int = 0,
    @SerializedName("health_badge") val healthBadge: String? = null,
    @SerializedName("headline_summary") val headlineSummary: String? = null,
    @SerializedName("peer_percentile") val peerPercentile: Int? = null,
    @SerializedName("pillars") val pillars: List<HealthPillarScore> = emptyList(),
    @SerializedName("fifty_thirty_twenty") val fiftyThirtyTwenty: FiftyThirtyTwentyBreakdown? = null,
    @SerializedName("risk_factors") val riskFactors: List<HealthRiskFactor> = emptyList(),
    @SerializedName("action_plan") val actionPlan: List<FinancialActionStep> = emptyList(),
    @SerializedName("engine_used") val engineUsed: String? = "gemini",
    // Compatibility fields
    @SerializedName("score") val legacyScore: Int? = null,
    @SerializedName("grade") val legacyGrade: String? = null,
    @SerializedName("summary") val legacySummary: String? = null,
    @SerializedName("metrics") val metrics: List<FinancialHealthMetric> = emptyList(),
    @SerializedName("key_strengths") val keyStrengths: List<String> = emptyList(),
    @SerializedName("improvements") val improvements: List<String> = emptyList()
) {
    val score: Int get() = if (overallScore > 0) overallScore else (legacyScore ?: 78)
    val grade: String get() = healthBadge ?: legacyGrade ?: "A-"
    val summary: String get() = headlineSummary ?: legacySummary ?: "Your financial health is stable."
}

// ==========================================
// 4. Expense Sentiment & Remorse CBT
// ==========================================
data class EmotionalExpenseItem(
    @SerializedName("expense_title") val expenseTitle: String = "",
    @SerializedName("amount") val amount: Double = 0.0,
    @SerializedName("date") val date: String = "",
    @SerializedName("category_name") val categoryName: String = "",
    @SerializedName("emotion_tag") val emotionTag: String = "",
    @SerializedName("mood_trigger") val moodTrigger: String = "",
    @SerializedName("regret_risk") val regretRisk: String = "Low",
    @SerializedName("sentiment_score") val sentimentScore: Double = 0.0
)

data class EmotionDistribution(
    @SerializedName("mindful_value_pct") val mindfulValuePct: Double = 0.0,
    @SerializedName("stress_relief_pct") val stressReliefPct: Double = 0.0,
    @SerializedName("social_fomo_pct") val socialFomoPct: Double = 0.0,
    @SerializedName("impulse_craving_pct") val impulseCravingPct: Double = 0.0,
    @SerializedName("essential_neutral_pct") val essentialNeutralPct: Double = 0.0
)

data class BehavioralNudge(
    @SerializedName("nudge_title") val nudgeTitle: String = "",
    @SerializedName("target_trigger") val targetTrigger: String = "",
    @SerializedName("actionable_hack") val actionableHack: String = "",
    @SerializedName("psychology_insight") val psychologyInsight: String = ""
)

data class EmotionDetail(
    @SerializedName("emotion") val emotion: String = "",
    @SerializedName("percentage") val percentage: Double = 0.0,
    @SerializedName("amount") val amount: Double = 0.0
)

data class ExpenseSentimentResponse(
    @SerializedName("net_sentiment_score") val netSentimentScore: Double = 0.0,
    @SerializedName("sentiment_label") val sentimentLabel: String? = null,
    @SerializedName("dominant_spending_emotion") val dominantSpendingEmotion: String? = null,
    @SerializedName("impulse_buy_index") val impulseBuyIndex: Double = 0.0,
    @SerializedName("emotion_distribution") val emotionDistribution: EmotionDistribution? = null,
    @SerializedName("flagged_emotional_expenses") val flaggedEmotionalExpenses: List<EmotionalExpenseItem> = emptyList(),
    @SerializedName("emotional_spending_heatmap_summary") val emotionalSpendingHeatmapSummary: String? = null,
    @SerializedName("behavioral_nudges") val behavioralNudges: List<BehavioralNudge> = emptyList(),
    @SerializedName("engine_used") val engineUsed: String? = "gemini",
    // Compatibility fields
    @SerializedName("dominant_emotion") val legacyDominantEmotion: String? = null,
    @SerializedName("remorse_risk") val legacyRemorseRisk: String? = null,
    @SerializedName("impulsive_spend_total") val impulsiveSpendTotal: Double = 0.0,
    @SerializedName("breakdown") val breakdown: List<EmotionDetail> = emptyList(),
    @SerializedName("cbt_advice") val cbtAdvice: String? = null
) {
    val dominantEmotion: String get() = dominantSpendingEmotion ?: legacyDominantEmotion ?: "Joyful / Intentional 😊"
    val remorseRisk: String get() = sentimentLabel ?: legacyRemorseRisk ?: "Low"
}

// ==========================================
// 5. Budget Burn Rate & Velocity Forecaster
// ==========================================
data class CategoryBudgetForecastItem(
    @SerializedName("category_id") val categoryId: Int? = null,
    @SerializedName("category_name") val categoryName: String = "",
    @SerializedName("allocated_budget") val allocatedBudget: Double = 0.0,
    @SerializedName("spent_to_date") val spentToDate: Double = 0.0,
    @SerializedName("projected_end_of_month") val projectedEndOfMonth: Double = 0.0,
    @SerializedName("daily_burn_rate") val dailyBurnRate: Double = 0.0,
    @SerializedName("safe_daily_velocity") val safeDailyVelocity: Double = 0.0,
    @SerializedName("status") val status: String = "On Track",
    @SerializedName("exhaustion_day") val exhaustionDay: Int? = null,
    @SerializedName("projected_excess_or_saving") val projectedExcessOrSaving: Double = 0.0
)

data class BudgetForecastResponse(
    @SerializedName("total_budget_allocated") val totalBudgetAllocated: Double = 0.0,
    @SerializedName("current_total_spend") val currentTotalSpend: Double = 0.0,
    @SerializedName("projected_total_month_end_spend") val projectedTotalMonthEndSpend: Double = 0.0,
    @SerializedName("projected_spend_lower_bound") val projectedSpendLowerBound: Double = 0.0,
    @SerializedName("projected_spend_upper_bound") val projectedSpendUpperBound: Double = 0.0,
    @SerializedName("overall_burn_rate_current") val overallBurnRateCurrent: Double = 0.0,
    @SerializedName("overall_burn_rate_target") val overallBurnRateTarget: Double = 0.0,
    @SerializedName("budget_exhaustion_date") val budgetExhaustionDate: String? = null,
    @SerializedName("runway_status") val runwayStatus: String? = null,
    @SerializedName("velocity_trend") val velocityTrend: String? = null,
    @SerializedName("category_forecasts") val categoryForecasts: List<CategoryBudgetForecastItem> = emptyList(),
    @SerializedName("ai_optimization_guardrails") val aiOptimizationGuardrails: List<String> = emptyList(),
    @SerializedName("engine_used") val engineUsed: String? = "gemini",
    // Compatibility fields
    @SerializedName("current_daily_burn") val legacyDailyBurn: Double? = null,
    @SerializedName("safe_daily_limit") val legacySafeDailyLimit: Double? = null,
    @SerializedName("budget_exhaustion_day") val legacyExhaustionDay: Int? = null,
    @SerializedName("risk_level") val legacyRiskLevel: String? = null
) {
    val currentDailyBurn: Double get() = if (overallBurnRateCurrent > 0) overallBurnRateCurrent else (legacyDailyBurn ?: 0.0)
    val safeDailyLimit: Double get() = if (overallBurnRateTarget > 0) overallBurnRateTarget else (legacySafeDailyLimit ?: 0.0)
    val projectedMonthEndSpend: Double get() = projectedTotalMonthEndSpend
    val riskLevel: String get() = runwayStatus ?: legacyRiskLevel ?: "Safe"
}
