export interface AIQuickParseRequest {
  text: string;
  reference_date?: string;
}

export interface AIQuickParseResponse {
  title: string;
  amount: number;
  date: string;
  category_id: number;
  category_name: string;
  payment_mode?: string;
  notes?: string;
  confidence: number;
  engine_used: "gemini" | "local_nlp" | string;
}

export interface RecommendationItem {
  category: string;
  type: "warning" | "tip" | "opportunity" | "achievement" | string;
  title: string;
  description: string;
  estimated_monthly_saving?: number;
}

export interface AIRecommendationsResponse {
  financial_health_score: number;
  health_status: "Excellent" | "Good" | "Fair" | "Attention Needed" | string;
  summary_text: string;
  projected_month_end_spend: number;
  budget_status_warning: string;
  top_overspending_category?: string | null;
  total_potential_savings: number;
  needs_percentage?: number;
  wants_percentage?: number;
  savings_percentage?: number;
  recommendations: RecommendationItem[];
  engine_used: "gemini" | "local_nlp" | string;
}

export interface ReceiptItem {
  item_name: string;
  quantity?: number;
  price: number;
}

export interface ReceiptScanResponse {
  merchant_name: string;
  amount: number;
  date: string;
  category_id: number;
  category_name: string;
  payment_mode?: string;
  tax_amount?: number | null;
  line_items: ReceiptItem[];
  notes?: string;
  confidence: number;
  engine_used: string;
}

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface MiniChartData {
  chart_type: "bar" | "pie" | "line" | string;
  labels: string[];
  values: number[];
  title?: string;
}

export interface AIChatRequest {
  message: string;
  history?: AIChatMessage[];
}

export interface AIChatResponse {
  reply: string;
  suggested_questions: string[];
  mini_chart?: MiniChartData | null;
  engine_used: string;
}

export interface SubscriptionItem {
  merchant_name: string;
  amount: number;
  frequency: string;
  category_name: string;
  last_payment_date?: string;
  estimated_next_date?: string;
  annual_cost: number;
  status: string;
}

export interface SubscriptionsResponse {
  total_monthly_recurring: number;
  total_annual_recurring: number;
  active_subscriptions_count: number;
  subscriptions: SubscriptionItem[];
  engine_used: string;
}

export interface CategoryCutPlan {
  category_name: string;
  current_monthly_spend: number;
  proposed_monthly_spend: number;
  monthly_savings: number;
  cut_percentage: number;
  action_tip: string;
}

export interface SavingsGoalRequest {
  goal_name: string;
  target_amount: number;
  target_months: number;
}

export interface SavingsGoalResponse {
  goal_name: string;
  target_amount: number;
  target_months: number;
  required_monthly_savings: number;
  current_discretionary_spend: number;
  feasibility_score: number;
  feasibility_status: string;
  category_cut_plans: CategoryCutPlan[];
  estimated_completion_months: number;
  ai_advice: string;
  engine_used: string;
}

export interface CashFlowForecastRequest {
  estimated_monthly_income?: number;
  salary_day_of_month?: number;
  current_liquid_balance?: number;
}

export interface DailyForecastPoint {
  date: string;
  day_of_month: number;
  projected_balance: number;
  projected_cumulative_spend: number;
  is_past: boolean;
}

export interface CashFlowForecastResponse {
  current_spend_to_date: number;
  days_elapsed: number;
  days_remaining: number;
  total_days_in_cycle: number;
  daily_burn_rate_current: number;
  daily_burn_rate_safe_target: number;
  projected_end_of_cycle_spend: number;
  zero_day_date?: string | null;
  runway_days_remaining: number;
  risk_level: "Safe" | "Moderate" | "Critical Danger" | "Thriving" | string;
  upcoming_recurring_obligations: number;
  daily_forecast_timeline: DailyForecastPoint[];
  ai_runway_verdict: string;
  engine_used: string;
}

export interface TaxAdvisorRequest {
  annual_income?: number;
  tax_year?: string;
}

export interface TaxDeductionItem {
  section: string;
  category: string;
  identified_amount: number;
  max_allowed_limit: number;
  eligible_deduction: number;
  items_detected: string[];
  action_to_maximize: string;
}

export interface TaxRegimeComparison {
  regime_name: string;
  gross_taxable_income: number;
  total_deductions_claimed: number;
  net_taxable_income: number;
  estimated_tax_payable: number;
  effective_tax_rate: number;
}

export interface TaxAdvisorResponse {
  recommended_regime: string;
  potential_tax_savings_with_recommended: number;
  total_detected_deductions: number;
  unclaimed_80c_headroom: number;
  unclaimed_80d_headroom: number;
  deductions_breakdown: TaxDeductionItem[];
  old_regime: TaxRegimeComparison;
  new_regime: TaxRegimeComparison;
  ai_tax_saving_tips: string[];
  engine_used: string;
}

export interface VoiceExpenseRequest {
  transcript?: string;
  language?: string;
  reference_date?: string;
}

export interface VoiceExpenseResponse {
  original_transcript: string;
  detected_language: string;
  title: string;
  amount: number;
  date: string;
  category_id: number;
  category_name: string;
  payment_mode?: string;
  notes?: string;
  confidence: number;
  engine_used: string;
}

export interface DigestStorySlide {
  slide_id: string;
  slide_type: "persona" | "win" | "leakage" | "peak_day" | "merchant_hero" | "manifesto" | string;
  title: string;
  subtitle: string;
  metric_value?: string | null;
  narrative: string;
  badge_icon: string;
  gradient_theme: "sunset" | "emerald" | "neon_purple" | "midnight" | "amber_gold" | string;
}

export interface MoneyDigestResponse {
  month_name: string;
  year: number;
  financial_persona_title: string;
  persona_description: string;
  persona_icon: string;
  total_spent_this_month: number;
  top_spending_day_of_week: string;
  biggest_savings_win: string;
  top_leakage_drain: string;
  favorite_merchant: string;
  slides: DigestStorySlide[];
  engine_used: string;
}

// ==========================================
// 11. AI Financial Health & Insights Types
// ==========================================
export interface HealthPillarScore {
  pillar_id: "savings" | "budget" | "debt" | "volatility" | "emergency" | string;
  title: string;
  score: number;
  max_score: number;
  status: "Excellent" | "Good" | "Fair" | "Critical" | string;
  summary: string;
  metric_label: string;
}

export interface FiftyThirtyTwentyBreakdown {
  needs_percentage: number;
  wants_percentage: number;
  savings_percentage: number;
  ideal_needs_percentage: number;
  ideal_wants_percentage: number;
  ideal_savings_percentage: number;
  gap_summary: string;
}

export interface HealthRiskFactor {
  severity: "low" | "medium" | "high" | "critical" | string;
  title: string;
  description: string;
  suggested_action: string;
}

export interface FinancialActionStep {
  priority: number;
  title: string;
  description: string;
  estimated_monthly_inr_impact: number;
  difficulty: "Easy" | "Moderate" | "Disciplined" | string;
}

export interface FinancialHealthRequest {
  monthly_income?: number;
  liquid_emergency_fund?: number;
}

export interface FinancialHealthResponse {
  overall_score: number;
  health_badge: string;
  headline_summary: string;
  peer_percentile: number;
  pillars: HealthPillarScore[];
  fifty_thirty_twenty: FiftyThirtyTwentyBreakdown;
  risk_factors: HealthRiskFactor[];
  action_plan: FinancialActionStep[];
  engine_used: string;
}

// ==========================================
// 12. Granular Budget Forecast & Burn Rate Types
// ==========================================
export interface CategoryBudgetForecastItem {
  category_id?: number;
  category_name: string;
  allocated_budget: number;
  spent_to_date: number;
  projected_end_of_month: number;
  daily_burn_rate: number;
  safe_daily_velocity: number;
  status: "On Track" | "At Risk" | "Breached" | "Unallocated" | string;
  exhaustion_day?: number | null;
  projected_excess_or_saving: number;
}

export interface BudgetForecastRequest {
  total_custom_budget?: number;
}

export interface BudgetForecastResponse {
  total_budget_allocated: number;
  current_total_spend: number;
  projected_total_month_end_spend: number;
  projected_spend_lower_bound: number;
  projected_spend_upper_bound: number;
  overall_burn_rate_current: number;
  overall_burn_rate_target: number;
  budget_exhaustion_date?: string | null;
  runway_status: "Safe" | "Tight Margin" | "Urgent Breach" | string;
  velocity_trend: "Accelerating" | "Decelerating" | "Stable" | string;
  category_forecasts: CategoryBudgetForecastItem[];
  ai_optimization_guardrails: string[];
  engine_used: string;
}

// ==========================================
// 13. Expense Sentiment & Emotional Spending Types
// ==========================================
export interface EmotionalExpenseItem {
  expense_title: string;
  amount: number;
  date: string;
  category_name: string;
  emotion_tag: "Impulse Craving" | "Stress Shopping" | "Social/FOMO" | "Mindful Value" | "Celebration" | "Obligatory" | string;
  mood_trigger: string;
  regret_risk: "Low" | "Medium" | "High" | string;
  sentiment_score: number;
}

export interface EmotionDistribution {
  mindful_value_pct: number;
  stress_relief_pct: number;
  social_fomo_pct: number;
  impulse_craving_pct: number;
  essential_neutral_pct: number;
}

export interface BehavioralNudge {
  nudge_title: string;
  target_trigger: string;
  actionable_hack: string;
  psychology_insight: string;
}

export interface ExpenseSentimentRequest {
  days_to_analyze?: number;
}

export interface ExpenseSentimentResponse {
  net_sentiment_score: number;
  sentiment_label: string;
  dominant_spending_emotion: string;
  impulse_buy_index: number;
  emotion_distribution: EmotionDistribution;
  flagged_emotional_expenses: EmotionalExpenseItem[];
  emotional_spending_heatmap_summary: string;
  behavioral_nudges: BehavioralNudge[];
  engine_used: string;
}


