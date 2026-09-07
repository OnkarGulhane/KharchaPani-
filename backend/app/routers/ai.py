import calendar
from datetime import date
from decimal import Decimal
from typing import Optional
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.ai import (
    AIQuickParseRequest,
    AIQuickParseResponse,
    AIRecommendationsResponse,
    ReceiptScanResponse,
    AIChatRequest,
    AIChatResponse,
    SubscriptionsResponse,
    SavingsGoalRequest,
    SavingsGoalResponse,
    CashFlowForecastRequest,
    CashFlowForecastResponse,
    TaxAdvisorRequest,
    TaxAdvisorResponse,
    VoiceExpenseResponse,
    MoneyDigestResponse,
    FinancialHealthRequest,
    FinancialHealthResponse,
    BudgetForecastRequest,
    BudgetForecastResponse,
    ExpenseSentimentRequest,
    ExpenseSentimentResponse,
)
from app.schemas.response import APIResponse


from app.services.ai_service import AIService
from app.services.category_service import CategoryService
from app.services.dashboard_service import DashboardService
from app.services.expense_service import ExpenseService

router = APIRouter(prefix="/ai", tags=["AI Features"])


@router.post(
    "/quick-parse",
    response_model=APIResponse[AIQuickParseResponse],
    status_code=status.HTTP_200_OK,
)
async def quick_parse_expense(
    data: AIQuickParseRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Parse natural language expense query into structured expense fields using Gemini AI with offline Local NLP fallback.
    
    Strictly isolated to authenticated user's active categories.
    """
    categories = await CategoryService.get_categories(db, user_id=current_user.id)
    parsed = await AIService.parse_expense(
        text=data.text,
        categories=categories,
        reference_date=data.reference_date,
    )
    return APIResponse(
        data=parsed,
        message=f"Expense successfully parsed using {parsed.engine_used} engine ✨",
    )


def _build_category_breakdown(all_categories: list, pie_chart: list) -> list:
    spent_map = {
        getattr(item, "category_id", None): (item.category_name, float(item.amount), float(item.percentage))
        for item in (pie_chart or [])
        if getattr(item, "category_id", None) is not None
    }
    spent_name_map = {
        item.category_name.lower().strip(): (getattr(item, "category_id", 0), float(item.amount), float(item.percentage))
        for item in (pie_chart or [])
    }

    breakdown = []
    seen_ids = set()

    for cat in all_categories:
        seen_ids.add(cat.id)
        if cat.id in spent_map:
            _, amt, pct = spent_map[cat.id]
        elif cat.name.lower().strip() in spent_name_map:
            _, amt, pct = spent_name_map[cat.name.lower().strip()]
        else:
            amt, pct = 0.0, 0.0

        breakdown.append({
            "id": cat.id,
            "name": cat.name,
            "amount": amt,
            "percentage": pct,
        })

    for item in (pie_chart or []):
        c_id = getattr(item, "category_id", None)
        if c_id not in seen_ids:
            breakdown.append({
                "id": c_id or (len(breakdown) + 1),
                "name": item.category_name,
                "amount": float(item.amount),
                "percentage": float(item.percentage),
            })

    return breakdown


@router.get(
    "/recommendations",
    response_model=APIResponse[AIRecommendationsResponse],
    status_code=status.HTTP_200_OK,
)
async def get_ai_recommendations(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate personalized financial health score, spending velocity forecast, and actionable recommendations.
    
    Strictly derived from the authenticated user's real transaction history (Zero-Trust multi-tenant isolation).
    """
    today = date.today()
    days_in_month = calendar.monthrange(today.year, today.month)[1]

    # Fetch real user dashboard aggregates
    summary = await DashboardService.get_summary(db, period="month", user_id=current_user.id)
    charts = await DashboardService.get_charts(db, period="month", user_id=current_user.id)
    comparison = await DashboardService.get_comparison(db, user_id=current_user.id)
    all_categories = await CategoryService.get_categories(db, user_id=current_user.id)

    # Build privacy-safe aggregate statistical context
    budget_lim = None
    if summary.budget_status and summary.budget_status.total_budget and summary.budget_status.total_budget > 0:
        budget_lim = float(summary.budget_status.total_budget)

    category_breakdown = _build_category_breakdown(
        all_categories=all_categories,
        pie_chart=charts.pie_chart if hasattr(charts, "pie_chart") else [],
    )

    context = {
        "total_spent": float(summary.total_spent),
        "budget_limit": budget_lim,
        "days_elapsed": today.day,
        "days_in_month": days_in_month,
        "category_breakdown": category_breakdown,
        "mom_growth": float(comparison.percentage_change) if comparison else 0.0,
    }

    recommendations = await AIService.generate_recommendations(context)

    return APIResponse(
        data=recommendations,
        message="AI Financial Recommendations generated successfully ✨",
    )


@router.post(
    "/receipt-scan",
    response_model=APIResponse[ReceiptScanResponse],
    status_code=status.HTTP_200_OK,
)
async def scan_receipt(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Scan and parse a receipt/invoice image or PDF using Multimodal Vision AI.
    
    Auto-detects merchant, total, line items, and maps to the user's existing categories.
    """
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"]
    mime = file.content_type or "image/jpeg"
    if mime not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload JPEG, PNG, WebP, or PDF.",
        )

    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed limit (10MB).",
        )

    categories = await CategoryService.get_categories(db, user_id=current_user.id)
    scan_result = await AIService.scan_receipt(
        file_bytes=file_bytes,
        mime_type=mime,
        categories=categories,
        reference_date=date.today(),
    )

    return APIResponse(
        data=scan_result,
        message="Receipt scanned and structured successfully ✨",
    )


@router.post(
    "/chat",
    response_model=APIResponse[AIChatResponse],
    status_code=status.HTTP_200_OK,
)
async def chat_with_kharcha_guru(
    data: AIChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Interactive personal financial assistant ('Kharcha Guru') answering queries based on live transactions."""
    summary = await DashboardService.get_summary(db, period="month", user_id=current_user.id)
    charts = await DashboardService.get_charts(db, period="month", user_id=current_user.id)
    expenses_paginated = await ExpenseService.get_expenses(db, page=1, page_size=10, user_id=current_user.id)
    all_categories = await CategoryService.get_categories(db, user_id=current_user.id)

    budget_lim = None
    if summary.budget_status and summary.budget_status.total_budget and summary.budget_status.total_budget > 0:
        budget_lim = float(summary.budget_status.total_budget)

    category_breakdown = _build_category_breakdown(
        all_categories=all_categories,
        pie_chart=charts.pie_chart if hasattr(charts, "pie_chart") else [],
    )

    context = {
        "total_spent": float(summary.total_spent),
        "budget_limit": budget_lim,
        "category_breakdown": category_breakdown,
        "recent_expenses": [
            {
                "title": exp.title,
                "amount": float(exp.amount),
                "category": exp.category_name,
                "date": exp.date.isoformat(),
            }
            for exp in expenses_paginated.items
        ],
    }

    reply_response = await AIService.chat_query(
        message=data.message,
        history=data.history,
        context=context,
    )

    return APIResponse(
        data=reply_response,
        message="Kharcha Guru response generated ✨",
    )


@router.get(
    "/subscriptions",
    response_model=APIResponse[SubscriptionsResponse],
    status_code=status.HTTP_200_OK,
)
async def get_subscriptions(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Detect recurring subscriptions, streaming services, utilities, and EMI charges from user transactions."""
    expenses_paginated = await ExpenseService.get_expenses(db, page=1, page_size=100, user_id=current_user.id)
    raw_expenses = [
        {
            "title": exp.title,
            "amount": float(exp.amount),
            "date": exp.date.isoformat(),
            "category": exp.category_name,
        }
        for exp in expenses_paginated.items
    ]

    subs_response = await AIService.detect_subscriptions(raw_expenses)

    return APIResponse(
        data=subs_response,
        message="Recurring subscriptions analyzed ✨",
    )


@router.post(
    "/savings-goal",
    response_model=APIResponse[SavingsGoalResponse],
    status_code=status.HTTP_200_OK,
)
async def simulate_savings_goal(
    data: SavingsGoalRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Simulate a targeted savings goal, analyze discretionary spending cuts, and generate feasibility score."""
    charts = await DashboardService.get_charts(db, period="month", user_id=current_user.id)
    all_categories = await CategoryService.get_categories(db, user_id=current_user.id)
    category_breakdown = _build_category_breakdown(
        all_categories=all_categories,
        pie_chart=charts.pie_chart if hasattr(charts, "pie_chart") else [],
    )

    context = {
        "category_breakdown": category_breakdown,
    }

    result = await AIService.simulate_savings_goal(request=data, context=context)

    return APIResponse(
        data=result,
        message="Savings goal simulation completed ✨",
    )


@router.post(
    "/cashflow-forecast",
    response_model=APIResponse[CashFlowForecastResponse],
    status_code=status.HTTP_200_OK,
)
async def forecast_cashflow(
    data: CashFlowForecastRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Forecast month-end cash flow runway, daily burn safe target, and zero-day liquidity depletion date."""
    today = date.today()
    days_in_month = calendar.monthrange(today.year, today.month)[1]

    summary = await DashboardService.get_summary(db, period="month", user_id=current_user.id)
    expenses_paginated = await ExpenseService.get_expenses(db, page=1, page_size=100, user_id=current_user.id)
    subs = await AIService.detect_subscriptions([{"title": e.title, "amount": float(e.amount), "date": e.date.isoformat()} for e in expenses_paginated.items])

    budget_lim = None
    if summary.budget_status and summary.budget_status.total_budget and summary.budget_status.total_budget > 0:
        budget_lim = float(summary.budget_status.total_budget)

    context = {
        "total_spent": float(summary.total_spent),
        "budget_limit": budget_lim,
        "days_elapsed": today.day,
        "days_in_month": days_in_month,
        "upcoming_recurring": float(subs.total_monthly_recurring),
    }

    result = await AIService.forecast_cashflow(request=data, context=context)

    return APIResponse(
        data=result,
        message="Cash flow runway forecast generated ✨",
    )


@router.get(
    "/cashflow-forecast",
    response_model=APIResponse[CashFlowForecastResponse],
    status_code=status.HTTP_200_OK,
)
async def get_default_cashflow_forecast(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get default cash flow runway forecast without request payload."""
    return await forecast_cashflow(data=CashFlowForecastRequest(), current_user=current_user, db=db)


@router.post(
    "/tax-advisor",
    response_model=APIResponse[TaxAdvisorResponse],
    status_code=status.HTTP_200_OK,
)
async def advise_tax_regime(
    data: TaxAdvisorRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Analyze transaction history to identify Section 80C, 80D, and HRA deductions and recommend Old vs New Tax Regime."""
    expenses_paginated = await ExpenseService.get_expenses(db, page=1, page_size=100, user_id=current_user.id)
    charts = await DashboardService.get_charts(db, period="month", user_id=current_user.id)
    all_categories = await CategoryService.get_categories(db, user_id=current_user.id)
    category_breakdown = _build_category_breakdown(
        all_categories=all_categories,
        pie_chart=charts.pie_chart if hasattr(charts, "pie_chart") else [],
    )

    context = {
        "expenses": [
            {
                "title": exp.title,
                "amount": float(exp.amount),
                "category": exp.category_name,
                "date": exp.date.isoformat(),
            }
            for exp in expenses_paginated.items
        ],
        "category_breakdown": category_breakdown,
    }

    result = await AIService.advise_tax_regime(request=data, context=context)

    return APIResponse(
        data=result,
        message="Tax regime comparative analysis generated ✨",
    )


@router.post(
    "/voice-expense",
    response_model=APIResponse[VoiceExpenseResponse],
    status_code=status.HTTP_200_OK,
)
@router.post(
    "/voice-parse",
    response_model=APIResponse[VoiceExpenseResponse],
    status_code=status.HTTP_200_OK,
)
async def parse_voice_expense(
    file: Optional[UploadFile] = File(None),
    transcript: Optional[str] = None,
    language: Optional[str] = "auto",
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Parse recorded voice audio clips or transcribed speech text in Marathi, Hindi, or English ('बोली खर्चा')."""
    audio_bytes = None
    mime = None
    if file:
        audio_bytes = await file.read()
        mime = file.content_type or "audio/webm"

    categories = await CategoryService.get_categories(db, user_id=current_user.id)
    result = await AIService.parse_voice_expense(
        audio_bytes=audio_bytes,
        mime_type=mime,
        transcript=transcript,
        categories=categories,
        reference_date=date.today(),
    )

    return APIResponse(
        data=result,
        message=f"Voice expense parsed successfully in {result.detected_language} ✨",
    )


@router.get(
    "/money-digest",
    response_model=APIResponse[MoneyDigestResponse],
    status_code=status.HTTP_200_OK,
)
async def get_money_digest(
    period: str = "monthly",
    month: Optional[int] = None,
    year: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate dynamic Instagram/Spotify Wrapped-style personalized financial story digest."""
    today = date.today()
    target_month = month or today.month
    target_year = year or today.year

    summary = await DashboardService.get_summary(db, period="month", user_id=current_user.id)
    charts = await DashboardService.get_charts(db, period="month", user_id=current_user.id)
    comparison = await DashboardService.get_comparison(db, user_id=current_user.id)
    expenses_paginated = await ExpenseService.get_expenses(db, page=1, page_size=100, user_id=current_user.id)
    all_categories = await CategoryService.get_categories(db, user_id=current_user.id)
    category_breakdown = _build_category_breakdown(
        all_categories=all_categories,
        pie_chart=charts.pie_chart if hasattr(charts, "pie_chart") else [],
    )

    context = {
        "period": period,
        "month": target_month,
        "year": target_year,
        "total_spent": float(summary.total_spent),
        "category_breakdown": category_breakdown,
        "mom_growth": float(comparison.percentage_change) if comparison else 0.0,
        "expenses": [
            {
                "title": exp.title,
                "amount": float(exp.amount),
                "category": exp.category_name,
                "date": exp.date.isoformat(),
            }
            for exp in expenses_paginated.items
        ],
    }

    digest = await AIService.generate_money_digest(month=target_month, year=target_year, context=context)

    return APIResponse(
        data=digest,
        message="Money Digest stories generated ✨",
    )


@router.post(
    "/financial-health",
    response_model=APIResponse[FinancialHealthResponse],
    status_code=status.HTTP_200_OK,
)
async def calculate_financial_health(
    data: Optional[FinancialHealthRequest] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Compute scientific 0-100 financial health fitness score, 5-pillar breakdown, and 50/30/20 compliance."""
    today = date.today()
    days_in_month = calendar.monthrange(today.year, today.month)[1]

    summary = await DashboardService.get_summary(db, period="month", user_id=current_user.id)
    charts = await DashboardService.get_charts(db, period="month", user_id=current_user.id)
    expenses_paginated = await ExpenseService.get_expenses(db, page=1, page_size=100, user_id=current_user.id)
    subs = await AIService.detect_subscriptions([{"title": e.title, "amount": float(e.amount), "date": e.date.isoformat()} for e in expenses_paginated.items])
    all_categories = await CategoryService.get_categories(db, user_id=current_user.id)

    budget_lim = None
    if summary.budget_status and summary.budget_status.total_budget and summary.budget_status.total_budget > 0:
        budget_lim = float(summary.budget_status.total_budget)

    category_breakdown = _build_category_breakdown(
        all_categories=all_categories,
        pie_chart=charts.pie_chart if hasattr(charts, "pie_chart") else [],
    )

    context = {
        "total_spent": float(summary.total_spent),
        "budget_limit": budget_lim,
        "days_elapsed": today.day,
        "days_in_month": days_in_month,
        "upcoming_recurring": float(subs.total_monthly_recurring),
        "category_breakdown": category_breakdown,
    }

    req = data or FinancialHealthRequest()
    health = await AIService.calculate_financial_health(request=req, context=context)

    return APIResponse(
        data=health,
        message="Financial Health Score and Insights computed ✨",
    )


@router.get(
    "/financial-health",
    response_model=APIResponse[FinancialHealthResponse],
    status_code=status.HTTP_200_OK,
)
async def get_default_financial_health(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get default Financial Health Score without request payload."""
    return await calculate_financial_health(data=FinancialHealthRequest(), current_user=current_user, db=db)


@router.post(
    "/budget-forecast",
    response_model=APIResponse[BudgetForecastResponse],
    status_code=status.HTTP_200_OK,
)
async def forecast_budget_burn(
    data: Optional[BudgetForecastRequest] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Predict category-by-category burn rate velocity, budget exhaustion dates, and AI optimization guardrails."""
    today = date.today()
    days_in_month = calendar.monthrange(today.year, today.month)[1]

    summary = await DashboardService.get_summary(db, period="month", user_id=current_user.id)
    charts = await DashboardService.get_charts(db, period="month", user_id=current_user.id)
    all_categories = await CategoryService.get_categories(db, user_id=current_user.id)

    budget_lim = None
    if summary.budget_status and summary.budget_status.total_budget and summary.budget_status.total_budget > 0:
        budget_lim = float(summary.budget_status.total_budget)

    category_breakdown = _build_category_breakdown(
        all_categories=all_categories,
        pie_chart=charts.pie_chart if hasattr(charts, "pie_chart") else [],
    )

    context = {
        "total_spent": float(summary.total_spent),
        "budget_limit": budget_lim,
        "days_elapsed": today.day,
        "days_in_month": days_in_month,
        "category_breakdown": category_breakdown,
    }

    req = data or BudgetForecastRequest()
    forecast = await AIService.forecast_budget_burn(request=req, context=context)

    return APIResponse(
        data=forecast,
        message="Burn rate & budget forecast generated ✨",
    )


@router.get(
    "/budget-forecast",
    response_model=APIResponse[BudgetForecastResponse],
    status_code=status.HTTP_200_OK,
)
async def get_default_budget_forecast(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get default budget forecast without request payload."""
    return await forecast_budget_burn(data=BudgetForecastRequest(), current_user=current_user, db=db)


@router.get(
    "/expense-sentiment",
    response_model=APIResponse[ExpenseSentimentResponse],
    status_code=status.HTTP_200_OK,
)
@router.post(
    "/expense-sentiment",
    response_model=APIResponse[ExpenseSentimentResponse],
    status_code=status.HTTP_200_OK,
)
async def analyze_expense_sentiment(
    days: Optional[int] = 30,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Analyze psychological sentiment, emotional impulse drivers, and buyer remorse risk from expense descriptions."""
    expenses_paginated = await ExpenseService.get_expenses(db, page=1, page_size=100, user_id=current_user.id)

    context = {
        "recent_expenses": [
            {
                "title": exp.title,
                "amount": float(exp.amount),
                "category": exp.category_name,
                "date": exp.date.isoformat(),
            }
            for exp in expenses_paginated.items
        ],
    }

    req = ExpenseSentimentRequest(days_to_analyze=days or 30)
    sentiment = await AIService.analyze_expense_sentiment(request=req, context=context)

    return APIResponse(
        data=sentiment,
        message="Expense emotional sentiment analysis completed ✨",
    )


