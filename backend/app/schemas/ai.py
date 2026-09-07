from datetime import date as date_type
from decimal import Decimal
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator, ConfigDict


# ==========================================
# 1. Quick Parse Schemas
# ==========================================
class AIQuickParseRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=500, description="Natural language expense query or sentence")
    reference_date: Optional[date_type] = Field(None, description="Optional reference date for relative terms like yesterday/today")

    @field_validator("text")
    @classmethod
    def strip_text(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Input text cannot be empty")
        return cleaned


class AIQuickParseResponse(BaseModel):
    title: str = Field(..., description="Parsed expense title or merchant name")
    amount: Decimal = Field(..., description="Parsed positive numeric amount")
    date: date_type = Field(..., description="Parsed expense date")
    category_id: int = Field(..., description="Matched category ID")
    category_name: str = Field(..., description="Matched category name")
    payment_mode: Optional[str] = Field("UPI", description="Payment mode e.g. Cash, UPI, Card, Net Banking")
    notes: Optional[str] = Field(None, description="Additional context or notes")
    confidence: float = Field(1.0, ge=0.0, le=1.0, description="Confidence score")
    engine_used: str = Field("local_nlp", description="Engine used for parsing: gemini or local_nlp")

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 2. Recommendations & Insights Schemas
# ==========================================
class RecommendationItem(BaseModel):
    category: str = Field(..., description="Category related to recommendation")
    type: str = Field("tip", description="Type: warning, tip, opportunity, achievement")
    title: str = Field(..., description="Short recommendation title")
    description: str = Field(..., description="Detailed actionable advice")
    estimated_monthly_saving: Optional[Decimal] = Field(Decimal("0.00"), description="Potential monthly savings amount")

    model_config = ConfigDict(from_attributes=True)


class AIRecommendationsResponse(BaseModel):
    financial_health_score: int = Field(..., ge=0, le=100, description="Health score out of 100")
    health_status: str = Field("Good", description="Rating: Excellent, Good, Fair, Attention Needed")
    summary_text: str = Field(..., description="High-level financial summary and spend overview")
    projected_month_end_spend: Decimal = Field(..., description="Estimated spend by end of month")
    budget_status_warning: str = Field(..., description="Status: On Track, Near Limit, Exceeded, No Budget")
    top_overspending_category: Optional[str] = Field(None, description="Category with highest spend or acceleration")
    total_potential_savings: Decimal = Field(Decimal("0.00"), description="Total sum of estimated savings")
    needs_percentage: float = Field(50.0, description="50/30/20 Rule - Needs percentage")
    wants_percentage: float = Field(30.0, description="50/30/20 Rule - Wants percentage")
    savings_percentage: float = Field(20.0, description="50/30/20 Rule - Savings percentage")
    recommendations: List[RecommendationItem] = Field(default_factory=list, description="Actionable financial tips")
    engine_used: str = Field("gemini", description="AI Provider used: gemini or local_nlp")

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 3. Smart Receipt & Bill Scanner Schemas
# ==========================================
class ReceiptItem(BaseModel):
    item_name: str = Field(..., description="Name of the line item")
    quantity: Optional[float] = Field(1.0, description="Quantity purchased")
    price: Decimal = Field(..., description="Price of the line item")

    model_config = ConfigDict(from_attributes=True)


class ReceiptScanResponse(BaseModel):
    merchant_name: str = Field(..., description="Store or merchant name")
    amount: Decimal = Field(..., description="Total bill amount")
    date: date_type = Field(..., description="Receipt date")
    category_id: int = Field(..., description="Auto-mapped category ID")
    category_name: str = Field(..., description="Auto-mapped category name")
    payment_mode: Optional[str] = Field("Card", description="Payment method detected on bill")
    tax_amount: Optional[Decimal] = Field(None, description="Extracted GST or tax amount")
    line_items: List[ReceiptItem] = Field(default_factory=list, description="Itemized breakdown")
    notes: Optional[str] = Field(None, description="Additional context or receipt summary")
    confidence: float = Field(0.95, ge=0.0, le=1.0, description="Confidence score")
    engine_used: str = Field("gemini", description="Vision engine used")

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 4. Kharcha Guru AI Chatbot Schemas
# ==========================================
class AIChatMessage(BaseModel):
    role: str = Field("user", description="Message role: user or assistant")
    content: str = Field(..., description="Message text content")


class MiniChartData(BaseModel):
    chart_type: str = Field("bar", description="bar, pie, or line")
    labels: List[str] = Field(default_factory=list, description="X-axis labels or category names")
    values: List[float] = Field(default_factory=list, description="Numerical values")
    title: Optional[str] = Field(None, description="Chart title")

    model_config = ConfigDict(from_attributes=True)


class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="User question or query")
    history: List[AIChatMessage] = Field(default_factory=list, description="Previous conversation turns")

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Message cannot be blank")
        return cleaned


class AIChatResponse(BaseModel):
    reply: str = Field(..., description="Markdown-formatted intelligent response")
    suggested_questions: List[str] = Field(default_factory=list, description="Next suggested question chips")
    mini_chart: Optional[MiniChartData] = Field(None, description="Optional embedded mini-chart data")
    engine_used: str = Field("gemini", description="AI Provider used")

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 5. Recurring Subscriptions & EMI Schemas
# ==========================================
class SubscriptionItem(BaseModel):
    merchant_name: str = Field(..., description="Subscription or recurring merchant name")
    amount: Decimal = Field(..., description="Recurring amount")
    frequency: str = Field("Monthly", description="Frequency: Monthly, Weekly, Yearly")
    category_name: str = Field("Entertainment", description="Expense category")
    last_payment_date: Optional[date_type] = Field(None, description="Most recent payment date")
    estimated_next_date: Optional[date_type] = Field(None, description="Estimated next renewal date")
    annual_cost: Decimal = Field(..., description="Projected annual expenditure")
    status: str = Field("Active", description="Status: Active, Potential Duplicate, Expiring")

    model_config = ConfigDict(from_attributes=True)


class SubscriptionsResponse(BaseModel):
    total_monthly_recurring: Decimal = Field(Decimal("0.00"), description="Total monthly recurring amount")
    total_annual_recurring: Decimal = Field(Decimal("0.00"), description="Total yearly recurring cost")
    active_subscriptions_count: int = Field(0, description="Number of detected active subscriptions")
    subscriptions: List[SubscriptionItem] = Field(default_factory=list, description="List of detected subscriptions")
    engine_used: str = Field("gemini", description="Analysis engine used")

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 6. Goal-Based Savings Simulator Schemas
# ==========================================
class CategoryCutPlan(BaseModel):
    category_name: str = Field(..., description="Discretionary category name")
    current_monthly_spend: Decimal = Field(..., description="Current monthly baseline spend")
    proposed_monthly_spend: Decimal = Field(..., description="Target monthly spend after cut")
    monthly_savings: Decimal = Field(..., description="Amount saved per month in this category")
    cut_percentage: float = Field(..., description="Percentage reduction recommended")
    action_tip: str = Field(..., description="Actionable tip for achieving the reduction")

    model_config = ConfigDict(from_attributes=True)


class SavingsGoalRequest(BaseModel):
    goal_name: str = Field(..., min_length=1, max_length=100, description="Name of the savings goal e.g. iPhone, Goa Trip, Laptop")
    target_amount: Decimal = Field(..., gt=0, description="Target savings amount in INR")
    target_months: int = Field(..., ge=1, le=120, description="Target timeline in months")


class SavingsGoalResponse(BaseModel):
    goal_name: str = Field(..., description="Goal name")
    target_amount: Decimal = Field(..., description="Target amount")
    target_months: int = Field(..., description="Timeline in months")
    required_monthly_savings: Decimal = Field(..., description="Required savings per month")
    current_discretionary_spend: Decimal = Field(..., description="Current discretionary spending pool")
    feasibility_score: int = Field(..., ge=0, le=100, description="Feasibility rating (0-100)")
    feasibility_status: str = Field("Achievable", description="Status: Highly Feasible, Achievable, Challenging, Unrealistic")
    category_cut_plans: List[CategoryCutPlan] = Field(default_factory=list, description="Step-by-step category cut strategy")
    estimated_completion_months: float = Field(..., description="Realistic months to achieve goal under plan")
    ai_advice: str = Field(..., description="Executive motivational guidance")
    engine_used: str = Field("gemini", description="AI Provider used")

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 7. Predictive Cash Flow & Runway Forecaster Schemas
# ==========================================
class CashFlowForecastRequest(BaseModel):
    estimated_monthly_income: Optional[Decimal] = Field(None, gt=0, description="Estimated monthly salary / inflow")
    salary_day_of_month: Optional[int] = Field(1, ge=1, le=31, description="Day of month when salary is credited")
    current_liquid_balance: Optional[Decimal] = Field(None, ge=0, description="Current bank balance / cash in hand")


class DailyForecastPoint(BaseModel):
    date: str = Field(..., description="Date string YYYY-MM-DD")
    day_of_month: int = Field(..., description="Day number of current month")
    projected_balance: Decimal = Field(..., description="Projected remaining balance")
    projected_cumulative_spend: Decimal = Field(..., description="Projected cumulative expenditure")
    is_past: bool = Field(False, description="Whether this day is already in the past")

    model_config = ConfigDict(from_attributes=True)


class CashFlowForecastResponse(BaseModel):
    current_spend_to_date: Decimal = Field(..., description="Total spent so far this month")
    days_elapsed: int = Field(..., description="Days passed in current cycle")
    days_remaining: int = Field(..., description="Days left until next salary/cycle")
    total_days_in_cycle: int = Field(..., description="Total days in cycle")
    daily_burn_rate_current: Decimal = Field(..., description="Average daily spend to date")
    daily_burn_rate_safe_target: Decimal = Field(..., description="Recommended maximum daily spend to avoid running out of funds")
    projected_end_of_cycle_spend: Decimal = Field(..., description="Extrapolated total month spend")
    zero_day_date: Optional[str] = Field(None, description="Date when funds hit zero, if burn rate is unsustainable")
    runway_days_remaining: int = Field(..., description="Days until funds deplete (or days left in cycle)")
    risk_level: str = Field("Safe", description="Safe, Moderate, Critical Danger, or Thriving")
    upcoming_recurring_obligations: Decimal = Field(Decimal("0.00"), description="Sum of expected upcoming subscriptions/bills")
    daily_forecast_timeline: List[DailyForecastPoint] = Field(default_factory=list, description="Timeline projection curve")
    ai_runway_verdict: str = Field(..., description="Predictive financial survival analysis and recommendations")
    engine_used: str = Field("gemini", description="AI Provider used")

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 8. Smart Indian Tax & Regime Optimization Schemas
# ==========================================
class TaxAdvisorRequest(BaseModel):
    annual_income: Optional[Decimal] = Field(Decimal("1200000.00"), gt=0, description="Gross annual taxable income in INR")
    tax_year: Optional[str] = Field("2024-25", description="Assessment/Financial year")


class TaxDeductionItem(BaseModel):
    section: str = Field(..., description="Tax section code e.g. 80C, 80D, 80GG/HRA, 80E, Standard Deduction")
    category: str = Field(..., description="Category name or description")
    identified_amount: Decimal = Field(..., description="Total expenses detected in this tax bucket")
    max_allowed_limit: Decimal = Field(..., description="Statutory limit under Indian Income Tax Act")
    eligible_deduction: Decimal = Field(..., description="Effective deduction amount applied")
    items_detected: List[str] = Field(default_factory=list, description="Sample expense titles identified")
    action_to_maximize: str = Field(..., description="Advice on how to max out this section")

    model_config = ConfigDict(from_attributes=True)


class TaxRegimeComparison(BaseModel):
    regime_name: str = Field(..., description="Old Tax Regime vs New Tax Regime")
    gross_taxable_income: Decimal = Field(..., description="Total income before deductions")
    total_deductions_claimed: Decimal = Field(..., description="Total eligible deductions subtracted")
    net_taxable_income: Decimal = Field(..., description="Net taxable income")
    estimated_tax_payable: Decimal = Field(..., description="Estimated tax liability (incl cess)")
    effective_tax_rate: float = Field(..., description="Effective tax rate percentage")

    model_config = ConfigDict(from_attributes=True)


class TaxAdvisorResponse(BaseModel):
    recommended_regime: str = Field(..., description="Old Tax Regime or New Tax Regime")
    potential_tax_savings_with_recommended: Decimal = Field(..., description="Net INR saved choosing the recommended regime")
    total_detected_deductions: Decimal = Field(..., description="Sum of all identified deductions")
    unclaimed_80c_headroom: Decimal = Field(Decimal("0.00"), description="Remaining limit in Section 80C")
    unclaimed_80d_headroom: Decimal = Field(Decimal("0.00"), description="Remaining limit in Section 80D")
    deductions_breakdown: List[TaxDeductionItem] = Field(default_factory=list, description="Section-by-section breakdown")
    old_regime: TaxRegimeComparison = Field(..., description="Old regime tax liability calculation")
    new_regime: TaxRegimeComparison = Field(..., description="New regime tax liability calculation")
    ai_tax_saving_tips: List[str] = Field(default_factory=list, description="Actionable tax-saving strategies")
    engine_used: str = Field("gemini", description="AI Provider used")

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 9. Multi-Lingual Voice Expense Schemas ("बोली खर्चा")
# ==========================================
class VoiceExpenseRequest(BaseModel):
    transcript: Optional[str] = Field(None, max_length=1000, description="Speech-to-text transcript if processed in browser")
    language: Optional[str] = Field("auto", description="Spoken language: mr (Marathi), hi (Hindi), en (English), or auto")
    reference_date: Optional[date_type] = Field(None, description="Reference date for relative date terms")


class VoiceExpenseResponse(BaseModel):
    original_transcript: str = Field(..., description="Transcribed audio or input voice text")
    detected_language: str = Field("Marathi", description="Detected language e.g. Marathi, Hindi, English")
    title: str = Field(..., description="Extracted expense description or merchant")
    amount: Decimal = Field(..., description="Parsed expense amount in INR")
    date: date_type = Field(..., description="Parsed expense date")
    category_id: int = Field(..., description="Auto-mapped category ID")
    category_name: str = Field(..., description="Auto-mapped category name")
    payment_mode: Optional[str] = Field("Cash", description="Detected payment method: Cash, UPI, Card, Net Banking")
    notes: Optional[str] = Field(None, description="Extracted notes or context")
    confidence: float = Field(0.95, ge=0.0, le=1.0, description="Parsing confidence score")
    engine_used: str = Field("gemini", description="Engine used")

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 10. "Spotify-Wrapped" Monthly Money Digest Schemas
# ==========================================
class DigestStorySlide(BaseModel):
    slide_id: str = Field(..., description="Unique slide identifier")
    slide_type: str = Field(..., description="persona, win, leakage, peak_day, merchant_hero, or manifesto")
    title: str = Field(..., description="Slide headline")
    subtitle: str = Field(..., description="Slide sub-headline or tagline")
    metric_value: Optional[str] = Field(None, description="Highlighted metric e.g. '₹4,520' or 'Saturday'")
    narrative: str = Field(..., description="Engaging story narrative")
    badge_icon: str = Field("sparkles", description="Lucide icon name e.g. trophy, zap, flame, coffee, shield")
    gradient_theme: str = Field("sunset", description="Theme name: sunset, emerald, neon_purple, midnight, amber_gold")

    model_config = ConfigDict(from_attributes=True)


class MoneyDigestResponse(BaseModel):
    month_name: str = Field(..., description="Month name e.g. September")
    year: int = Field(..., description="Year e.g. 2026")
    financial_persona_title: str = Field(..., description="Persona title e.g. The Strategic Zen Saver")
    persona_description: str = Field(..., description="Persona summary description")
    persona_icon: str = Field("sparkles", description="Persona icon name")
    total_spent_this_month: Decimal = Field(..., description="Total spent in this month")
    top_spending_day_of_week: str = Field(..., description="Peak spending day with %")
    biggest_savings_win: str = Field(..., description="Highlighted savings victory")
    top_leakage_drain: str = Field(..., description="Identified unnecessary spend leakage")
    favorite_merchant: str = Field(..., description="Most frequented merchant/vendor")
    slides: List[DigestStorySlide] = Field(default_factory=list, description="Spotify-Wrapped story slides")
    engine_used: str = Field("gemini", description="AI Provider used")

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 11. AI Financial Health & Insights Schemas
# ==========================================
class HealthPillarScore(BaseModel):
    pillar_id: str = Field(..., description="savings, budget, debt, volatility, or emergency")
    title: str = Field(..., description="Pillar display title e.g. 'Savings Discipline'")
    score: int = Field(..., ge=0, le=20, description="Score out of 20")
    max_score: int = Field(20, description="Max possible score for pillar")
    status: str = Field("Good", description="Rating: Excellent, Good, Fair, Critical")
    summary: str = Field(..., description="Brief insight on this pillar")
    metric_label: str = Field(..., description="e.g. 'Savings Margin: 32%' or 'Burn Adherence: 88%'")

    model_config = ConfigDict(from_attributes=True)


class FiftyThirtyTwentyBreakdown(BaseModel):
    needs_percentage: float = Field(..., description="Current Needs %")
    wants_percentage: float = Field(..., description="Current Wants %")
    savings_percentage: float = Field(..., description="Current Savings %")
    ideal_needs_percentage: float = Field(50.0, description="Ideal Needs % (50%)")
    ideal_wants_percentage: float = Field(30.0, description="Ideal Wants % (30%)")
    ideal_savings_percentage: float = Field(20.0, description="Ideal Savings % (20%)")
    gap_summary: str = Field(..., description="Assessment of alignment with 50/30/20 benchmark")

    model_config = ConfigDict(from_attributes=True)


class HealthRiskFactor(BaseModel):
    severity: str = Field("low", description="low, medium, high, or critical")
    title: str = Field(..., description="Risk headline e.g. 'Weekend Discretionary Surge'")
    description: str = Field(..., description="Detailed explanation of the risk factor")
    suggested_action: str = Field(..., description="Preventative recommendation")

    model_config = ConfigDict(from_attributes=True)


class FinancialActionStep(BaseModel):
    priority: int = Field(..., ge=1, le=5, description="1 is highest priority")
    title: str = Field(..., description="Action title")
    description: str = Field(..., description="How to execute this step")
    estimated_monthly_inr_impact: Decimal = Field(Decimal("0.00"), description="Estimated ₹ savings or growth per month")
    difficulty: str = Field("Easy", description="Easy, Moderate, or Disciplined")

    model_config = ConfigDict(from_attributes=True)


class FinancialHealthRequest(BaseModel):
    monthly_income: Optional[Decimal] = Field(None, gt=0, description="Optional monthly income in INR for precise debt/savings ratios")
    liquid_emergency_fund: Optional[Decimal] = Field(None, ge=0, description="Optional emergency cash/bank balance")


class FinancialHealthResponse(BaseModel):
    overall_score: int = Field(..., ge=0, le=100, description="Comprehensive Financial Health Score (0-100)")
    health_badge: str = Field("Steady Navigator", description="Financial Master, Steady Navigator, Financially Strained, Critical Alert")
    headline_summary: str = Field(..., description="Executive AI assessment of user financial health")
    peer_percentile: int = Field(..., ge=1, le=99, description="Estimated percentile vs average Indian demographic")
    pillars: List[HealthPillarScore] = Field(default_factory=list, description="5 core pillar scores out of 20 each")
    fifty_thirty_twenty: FiftyThirtyTwentyBreakdown = Field(..., description="50/30/20 standard benchmark comparison")
    risk_factors: List[HealthRiskFactor] = Field(default_factory=list, description="Identified financial risk vulnerabilities")
    action_plan: List[FinancialActionStep] = Field(default_factory=list, description="Prioritized roadmap of actions")
    engine_used: str = Field("gemini", description="AI Provider used")

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 12. Granular Budget Forecast & Burn Rate Schemas
# ==========================================
class CategoryBudgetForecastItem(BaseModel):
    category_id: Optional[int] = Field(None, description="Category ID")
    category_name: str = Field(..., description="Category name")
    allocated_budget: Decimal = Field(..., description="Budget allocated in INR")
    spent_to_date: Decimal = Field(..., description="Total spent in category so far")
    projected_end_of_month: Decimal = Field(..., description="Projected spend by end of month")
    daily_burn_rate: Decimal = Field(..., description="Current daily spend velocity in ₹/day")
    safe_daily_velocity: Decimal = Field(..., description="Target daily spend to not exceed budget")
    status: str = Field("On Track", description="On Track, At Risk, Breached, or Unallocated")
    exhaustion_day: Optional[int] = Field(None, description="Projected day of month when budget hits limit")
    projected_excess_or_saving: Decimal = Field(Decimal("0.00"), description="Positive indicates saving under budget, negative indicates breach")

    model_config = ConfigDict(from_attributes=True)


class BudgetForecastRequest(BaseModel):
    total_custom_budget: Optional[Decimal] = Field(None, gt=0, description="Optional override for total monthly budget")


class BudgetForecastResponse(BaseModel):
    total_budget_allocated: Decimal = Field(..., description="Total monthly budget")
    current_total_spend: Decimal = Field(..., description="Total spent to date")
    projected_total_month_end_spend: Decimal = Field(..., description="Statistical projected total spend")
    projected_spend_lower_bound: Decimal = Field(..., description="Lower bound (90% confidence interval)")
    projected_spend_upper_bound: Decimal = Field(..., description="Upper bound (90% confidence interval)")
    overall_burn_rate_current: Decimal = Field(..., description="Current burn rate in ₹/day")
    overall_burn_rate_target: Decimal = Field(..., description="Safe target burn rate in ₹/day")
    budget_exhaustion_date: Optional[str] = Field(None, description="Projected date when total budget is exhausted (e.g. '2026-09-22')")
    runway_status: str = Field("On Track", description="Safe, Tight Margin, Urgent Breach")
    velocity_trend: str = Field("Stable", description="Accelerating, Decelerating, Stable")
    category_forecasts: List[CategoryBudgetForecastItem] = Field(default_factory=list, description="Per-category budget forecasts")
    ai_optimization_guardrails: List[str] = Field(default_factory=list, description="AI recommendations to stay within budget")
    engine_used: str = Field("gemini", description="AI Provider used")

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 13. Expense Sentiment & Emotional Spending Schemas
# ==========================================
class EmotionalExpenseItem(BaseModel):
    expense_title: str = Field(..., description="Expense title or merchant")
    amount: Decimal = Field(..., description="Expense amount in INR")
    date: str = Field(..., description="Expense date YYYY-MM-DD")
    category_name: str = Field(..., description="Category name")
    emotion_tag: str = Field(..., description="Impulse Craving, Stress Shopping, Social/FOMO, Mindful Value, Celebration, Obligatory")
    mood_trigger: str = Field(..., description="Identified psychological trigger e.g. 'Late night takeaway' or 'Tech retail therapy'")
    regret_risk: str = Field("Low", description="Low, Medium, High risk of buyer's remorse")
    sentiment_score: float = Field(0.0, ge=-1.0, le=1.0, description="Score from -1.0 (Guilt/Stress) to +1.0 (Joy/Value)")

    model_config = ConfigDict(from_attributes=True)


class EmotionDistribution(BaseModel):
    mindful_value_pct: float = Field(..., description="% of expenses driven by conscious value/joy")
    stress_relief_pct: float = Field(..., description="% of expenses tied to stress or emotional soothing")
    social_fomo_pct: float = Field(..., description="% of expenses driven by social peer pressure/FOMO")
    impulse_craving_pct: float = Field(..., description="% of expenses driven by sudden impulse")
    essential_neutral_pct: float = Field(..., description="% of expenses that are routine/neutral necessities")

    model_config = ConfigDict(from_attributes=True)


class BehavioralNudge(BaseModel):
    nudge_title: str = Field(..., description="Behavioral tip title e.g. 'The 48-Hour Tech Cooling Rule'")
    target_trigger: str = Field(..., description="Target trigger addressed e.g. 'Late-night Swiggy/Zomato orders'")
    actionable_hack: str = Field(..., description="Actionable psychological nudge to curb emotional spend")
    psychology_insight: str = Field(..., description="Why this habit forms and how to rewire it")

    model_config = ConfigDict(from_attributes=True)


class ExpenseSentimentRequest(BaseModel):
    days_to_analyze: Optional[int] = Field(30, ge=7, le=180, description="Number of days to analyze")


class ExpenseSentimentResponse(BaseModel):
    net_sentiment_score: float = Field(..., ge=-1.0, le=1.0, description="Overall spending sentiment (-1.0 to +1.0)")
    sentiment_label: str = Field("Mindful & Balanced", description="Mindful & Balanced, Stress Heavy, High Impulse Alert, Celebratory")
    dominant_spending_emotion: str = Field(..., description="Primary psychological driver behind recent expenses")
    impulse_buy_index: float = Field(..., ge=0.0, le=100.0, description="Percentage of spending tagged as impulse/emotional")
    emotion_distribution: EmotionDistribution = Field(..., description="Psychological emotion percentage breakdown")
    flagged_emotional_expenses: List[EmotionalExpenseItem] = Field(default_factory=list, description="Top identified emotional or impulse transactions")
    emotional_spending_heatmap_summary: str = Field(..., description="Weekly and time-of-day behavioral pattern summary")
    behavioral_nudges: List[BehavioralNudge] = Field(default_factory=list, description="Tailored psychological habits & nudges")
    engine_used: str = Field("gemini", description="AI Provider used")

    model_config = ConfigDict(from_attributes=True)

