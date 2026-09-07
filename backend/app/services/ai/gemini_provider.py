import base64
import json
import logging
from datetime import date
from decimal import Decimal
from typing import List, Optional, Dict, Any
import httpx

from app.core.config import settings
from app.schemas.ai import (
    AIQuickParseResponse,
    AIRecommendationsResponse,
    RecommendationItem,
    ReceiptScanResponse,
    ReceiptItem,
    AIChatMessage,
    AIChatResponse,
    MiniChartData,
    SubscriptionItem,
    SubscriptionsResponse,
    SavingsGoalRequest,
    SavingsGoalResponse,
    CategoryCutPlan,
    CashFlowForecastRequest,
    DailyForecastPoint,
    CashFlowForecastResponse,
    TaxAdvisorRequest,
    TaxDeductionItem,
    TaxRegimeComparison,
    TaxAdvisorResponse,
    VoiceExpenseResponse,
    DigestStorySlide,
    MoneyDigestResponse,
    FinancialHealthRequest,
    FinancialHealthResponse,
    HealthPillarScore,
    FiftyThirtyTwentyBreakdown,
    HealthRiskFactor,
    FinancialActionStep,
    BudgetForecastRequest,
    BudgetForecastResponse,
    CategoryBudgetForecastItem,
    ExpenseSentimentRequest,
    ExpenseSentimentResponse,
    EmotionalExpenseItem,
    EmotionDistribution,
    BehavioralNudge,
)
from app.schemas.category import CategoryResponse
from app.services.ai.base_provider import BaseAIProvider
from app.services.ai.local_provider import LocalNLPAIProvider



logger = logging.getLogger("app.ai.gemini_provider")


class GeminiAIProvider(BaseAIProvider):
    """Google Gemini 1.5 Flash Provider using async REST calls with JSON mode and Multimodal Vision."""

    def __init__(self):
        self.local_fallback = LocalNLPAIProvider()

    async def parse_expense(
        self,
        text: str,
        categories: List[CategoryResponse],
        reference_date: Optional[date] = None,
    ) -> AIQuickParseResponse:
        ref_date = reference_date or date.today()
        if not settings.GEMINI_API_KEY or not settings.GEMINI_API_KEY.strip():
            return await self.local_fallback.parse_expense(text, categories, ref_date)

        cat_list_str = json.dumps([{"id": c.id, "name": c.name} for c in categories])
        prompt = (
            f"You are the financial AI parser for KharchaPani personal expense tracker.\n"
            f"Reference Date: {ref_date.isoformat()} (Today)\n"
            f"Available User Categories: {cat_list_str}\n\n"
            f"Parse the following expense sentence into a clean JSON object:\n"
            f"Sentence: \"{text}\"\n\n"
            f"Instructions:\n"
            f"1. Extract 'title' (e.g. 'Uber Ride', 'Dmart Groceries', 'Coffee').\n"
            f"2. Extract numeric positive 'amount'.\n"
            f"3. Compute 'date' in YYYY-MM-DD format (resolve terms like 'yesterday', 'today', 'kal', 'last Friday' relative to Reference Date; cannot be future).\n"
            f"4. Select the best matching 'category_id' and 'category_name' from the provided categories list.\n"
            f"5. Detect 'payment_mode' ('UPI', 'Cash', 'Card', 'Net Banking', 'Wallet').\n"
            f"6. Provide 'notes' with brief context.\n"
            f"7. Return ONLY valid JSON with no markdown formatting.\n"
            f"Schema:\n"
            f'{{"title": "string", "amount": number, "date": "YYYY-MM-DD", "category_id": integer, "category_name": "string", "payment_mode": "string", "notes": "string", "confidence": 0.95}}'
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json",
            },
        }

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        content_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                        parsed_json = json.loads(content_text.strip())

                        matched_cat_id = parsed_json.get("category_id")
                        cat_map = {c.id: c.name for c in categories}
                        if matched_cat_id not in cat_map:
                            matched_cat_id = categories[0].id if categories else 1
                            matched_cat_name = cat_map.get(matched_cat_id, "Other")
                        else:
                            matched_cat_name = cat_map[matched_cat_id]

                        parsed_d = date.fromisoformat(parsed_json.get("date", ref_date.isoformat()))
                        if parsed_d > ref_date:
                            parsed_d = ref_date

                        amt = Decimal(str(parsed_json.get("amount", 100.0)))
                        if amt <= 0:
                            amt = Decimal("100.00")

                        return AIQuickParseResponse(
                            title=str(parsed_json.get("title", "Expense")).title()[:100],
                            amount=amt,
                            date=parsed_d,
                            category_id=matched_cat_id,
                            category_name=matched_cat_name,
                            payment_mode=str(parsed_json.get("payment_mode", "UPI")),
                            notes=str(parsed_json.get("notes", f"Quick Add: {text}")),
                            confidence=float(parsed_json.get("confidence", 0.95)),
                            engine_used="gemini",
                        )
        except Exception as e:
            logger.warning(f"Gemini API parse failed ({e}); falling back to LocalNLPAIProvider")

        return await self.local_fallback.parse_expense(text, categories, ref_date)

    async def generate_recommendations(
        self,
        context: Dict[str, Any],
    ) -> AIRecommendationsResponse:
        if not settings.GEMINI_API_KEY or not settings.GEMINI_API_KEY.strip():
            return await self.local_fallback.generate_recommendations(context)

        total_spent = float(context.get("total_spent", 0.0))
        budget_limit = float(context.get("budget_limit", 0.0)) if context.get("budget_limit") else "None"
        days_elapsed = context.get("days_elapsed", 1)
        days_in_month = context.get("days_in_month", 30)
        categories_data = context.get("category_breakdown", [])
        mom_growth = context.get("mom_growth", 0.0)

        prompt = (
            f"You are the expert personal financial AI advisor for KharchaPani.\n"
            f"Current Month Progress: Day {days_elapsed} of {days_in_month} days.\n"
            f"Total Spent So Far: ₹{total_spent:,.2f}\n"
            f"Monthly Budget Limit: ₹{budget_limit}\n"
            f"Month-over-Month Spend Growth: {mom_growth}%\n"
            f"Category Breakdown:\n{json.dumps(categories_data, indent=2)}\n\n"
            f"Generate a financial intelligence report adhering strictly to this JSON schema:\n"
            f"{{\n"
            f'  "financial_health_score": integer (0 to 100 based on budget discipline and spending pace),\n'
            f'  "health_status": "Excellent" | "Good" | "Fair" | "Attention Needed",\n'
            f'  "summary_text": "A clear, motivational 2-sentence executive financial summary",\n'
            f'  "projected_month_end_spend": number (projected total by end of month based on daily velocity),\n'
            f'  "budget_status_warning": "On Track" | "Near Limit" | "Exceeded Budget" | "No Budget Set",\n'
            f'  "top_overspending_category": "Name of category with highest concentration or risk" or null,\n'
            f'  "total_potential_savings": number (sum of potential monthly savings from recommendations),\n'
            f'  "needs_percentage": number (estimated % for needs like rent/groceries),\n'
            f'  "wants_percentage": number (estimated % for wants like dining/shopping),\n'
            f'  "savings_percentage": number (estimated % remaining for savings),\n'
            f'  "recommendations": [\n'
            f'    {{\n'
            f'      "category": "string",\n'
            f'      "type": "warning" | "tip" | "opportunity" | "achievement",\n'
            f'      "title": "Short punchy title (max 5 words)",\n'
            f'      "description": "Concrete personalized advice",\n'
            f'      "estimated_monthly_saving": number\n'
            f'    }}\n'
            f'  ]\n'
            f"}}\n"
            f"Return ONLY valid JSON with 3 to 4 actionable recommendations."
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json",
            },
        }

        try:
            async with httpx.AsyncClient(timeout=9.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        content_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                        parsed_json = json.loads(content_text.strip())

                        recs = [
                            RecommendationItem(
                                category=str(r.get("category", "General")),
                                type=str(r.get("type", "tip")),
                                title=str(r.get("title", "Optimization Tip")),
                                description=str(r.get("description", "")),
                                estimated_monthly_saving=Decimal(str(r.get("estimated_monthly_saving", 0.0))),
                            )
                            for r in parsed_json.get("recommendations", [])
                        ]

                        return AIRecommendationsResponse(
                            financial_health_score=int(parsed_json.get("financial_health_score", 80)),
                            health_status=str(parsed_json.get("health_status", "Good")),
                            summary_text=str(parsed_json.get("summary_text", "")),
                            projected_month_end_spend=Decimal(str(parsed_json.get("projected_month_end_spend", total_spent))),
                            budget_status_warning=str(parsed_json.get("budget_status_warning", "On Track")),
                            top_overspending_category=parsed_json.get("top_overspending_category"),
                            total_potential_savings=Decimal(str(parsed_json.get("total_potential_savings", 0.0))),
                            needs_percentage=float(parsed_json.get("needs_percentage", 50.0)),
                            wants_percentage=float(parsed_json.get("wants_percentage", 30.0)),
                            savings_percentage=float(parsed_json.get("savings_percentage", 20.0)),
                            recommendations=recs,
                            engine_used="gemini",
                        )
        except Exception as e:
            logger.warning(f"Gemini API recommendation failed ({e}); falling back to LocalNLPAIProvider")

        return await self.local_fallback.generate_recommendations(context)

    async def scan_receipt(
        self,
        file_bytes: bytes,
        mime_type: str,
        categories: List[CategoryResponse],
        reference_date: Optional[date] = None,
    ) -> ReceiptScanResponse:
        ref_date = reference_date or date.today()
        if not settings.GEMINI_API_KEY or not settings.GEMINI_API_KEY.strip():
            return await self.local_fallback.scan_receipt(file_bytes, mime_type, categories, ref_date)

        cat_list_str = json.dumps([{"id": c.id, "name": c.name} for c in categories])
        prompt = (
            f"You are the multimodal receipt and invoice scanner for KharchaPani.\n"
            f"Reference Date: {ref_date.isoformat()}\n"
            f"Available User Categories: {cat_list_str}\n\n"
            f"Extract all receipt/bill information from the image into this strict JSON schema:\n"
            f"{{\n"
            f'  "merchant_name": "string (Store or merchant name)",\n'
            f'  "amount": number (Total bill amount),\n'
            f'  "date": "YYYY-MM-DD",\n'
            f'  "category_id": integer (best matching from available categories),\n'
            f'  "category_name": "string",\n'
            f'  "payment_mode": "Card" | "UPI" | "Cash" | "Net Banking",\n'
            f'  "tax_amount": number or null,\n'
            f'  "line_items": [\n'
            f'    {{"item_name": "string", "quantity": number, "price": number}}\n'
            f'  ],\n'
            f'  "notes": "Short summary of items bought",\n'
            f'  "confidence": 0.95\n'
            f"}}\n"
            f"Return ONLY valid JSON."
        )

        b64_img = base64.b64encode(file_bytes).decode("utf-8")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": b64_img,
                        }
                    }
                ]
            }],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json",
            },
        }

        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        content_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                        parsed_json = json.loads(content_text.strip())

                        matched_cat_id = parsed_json.get("category_id")
                        cat_map = {c.id: c.name for c in categories}
                        if matched_cat_id not in cat_map:
                            matched_cat_id = categories[0].id if categories else 1
                            matched_cat_name = cat_map.get(matched_cat_id, "Other")
                        else:
                            matched_cat_name = cat_map[matched_cat_id]

                        line_items = [
                            ReceiptItem(
                                item_name=str(li.get("item_name", "Item")),
                                quantity=float(li.get("quantity", 1.0)),
                                price=Decimal(str(li.get("price", 0.0))),
                            )
                            for li in parsed_json.get("line_items", [])
                        ]

                        return ReceiptScanResponse(
                            merchant_name=str(parsed_json.get("merchant_name", "Receipt")).title()[:100],
                            amount=Decimal(str(parsed_json.get("amount", 100.0))),
                            date=date.fromisoformat(parsed_json.get("date", ref_date.isoformat())),
                            category_id=matched_cat_id,
                            category_name=matched_cat_name,
                            payment_mode=str(parsed_json.get("payment_mode", "Card")),
                            tax_amount=Decimal(str(parsed_json.get("tax_amount"))) if parsed_json.get("tax_amount") else None,
                            line_items=line_items,
                            notes=str(parsed_json.get("notes", "Scanned Receipt")),
                            confidence=float(parsed_json.get("confidence", 0.95)),
                            engine_used="gemini",
                        )
        except Exception as e:
            logger.warning(f"Gemini Receipt Scan failed ({e}); falling back to LocalNLPAIProvider")

        return await self.local_fallback.scan_receipt(file_bytes, mime_type, categories, ref_date)

    async def chat_query(
        self,
        message: str,
        history: List[AIChatMessage],
        context: Dict[str, Any],
    ) -> AIChatResponse:
        if not settings.GEMINI_API_KEY or not settings.GEMINI_API_KEY.strip():
            return await self.local_fallback.chat_query(message, history, context)

        total_spent = float(context.get("total_spent", 0.0))
        budget_limit = float(context.get("budget_limit", 0.0)) if context.get("budget_limit") else "None"
        categories_data = context.get("category_breakdown", [])
        recent_expenses = context.get("recent_expenses", [])

        # Build prompt
        system_instruction = (
            "You are 'Kharcha Guru', an ultra-smart, friendly, and practical personal finance AI assistant for KharchaPani.\n"
            f"Live User Context:\n"
            f"- Month-to-date Total Spend: ₹{total_spent:,.2f}\n"
            f"- Monthly Budget Limit: ₹{budget_limit}\n"
            f"- Category Breakdown: {json.dumps(categories_data)}\n"
            f"- Recent 10 Transactions: {json.dumps(recent_expenses[:10])}\n\n"
            "Instructions:\n"
            "1. Answer questions clearly and concisely with markdown formatting (bullet points, bold highlights, INR ₹ symbols).\n"
            "2. If user writes in Marathi or Hinglish, reply naturally in matching language/tone while keeping financial terms crisp.\n"
            "3. If relevant, include 2-3 short follow-up suggested question chips.\n"
            "4. Return strict JSON schema:\n"
            "{\n"
            '  "reply": "Markdown formatted answer",\n'
            '  "suggested_questions": ["Question 1", "Question 2"]\n'
            "}"
        )

        history_parts = [{"text": system_instruction}]
        for h in history[-4:]:
            history_parts.append({"text": f"{h.role.title()}: {h.content}"})
        history_parts.append({"text": f"User: {message}"})

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": history_parts}],
            "generationConfig": {
                "temperature": 0.3,
                "responseMimeType": "application/json",
            },
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        content_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                        parsed_json = json.loads(content_text.strip())

                        return AIChatResponse(
                            reply=str(parsed_json.get("reply", "")),
                            suggested_questions=parsed_json.get("suggested_questions", []),
                            engine_used="gemini",
                        )
        except Exception as e:
            logger.warning(f"Gemini Chat failed ({e}); falling back to LocalNLPAIProvider")

        return await self.local_fallback.chat_query(message, history, context)

    async def detect_subscriptions(
        self,
        expenses: List[Dict[str, Any]],
    ) -> SubscriptionsResponse:
        # Use local deterministic detection combined with Gemini model tagging
        return await self.local_fallback.detect_subscriptions(expenses)

    async def simulate_savings_goal(
        self,
        request: SavingsGoalRequest,
        context: Dict[str, Any],
    ) -> SavingsGoalResponse:
        if not settings.GEMINI_API_KEY or not settings.GEMINI_API_KEY.strip():
            return await self.local_fallback.simulate_savings_goal(request, context)

        target_amt = float(request.target_amount)
        target_months = request.target_months
        category_breakdown = context.get("category_breakdown", [])

        prompt = (
            f"You are the financial goal optimizer for KharchaPani.\n"
            f"Goal: '{request.goal_name}' of ₹{target_amt:,.2f} in {target_months} months.\n"
            f"Required Monthly Savings: ₹{(target_amt/target_months):,.2f}/month.\n"
            f"User Spending Categories:\n{json.dumps(category_breakdown, indent=2)}\n\n"
            f"Generate a customized discretionary spending cut plan in this JSON schema:\n"
            f"{{\n"
            f'  "feasibility_score": integer (0 to 100),\n'
            f'  "feasibility_status": "Highly Feasible" | "Achievable with Focus" | "Challenging",\n'
            f'  "estimated_completion_months": number,\n'
            f'  "ai_advice": "Motivational strategic guidance",\n'
            f'  "category_cut_plans": [\n'
            f'    {{\n'
            f'      "category_name": "string",\n'
            f'      "current_monthly_spend": number,\n'
            f'      "proposed_monthly_spend": number,\n'
            f'      "monthly_savings": number,\n'
            f'      "cut_percentage": number,\n'
            f'      "action_tip": "Specific actionable behavioral change"\n'
            f'    }}\n'
            f'  ]\n'
            f"}}\n"
            f"Return ONLY valid JSON."
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json",
            },
        }

        try:
            async with httpx.AsyncClient(timeout=9.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        content_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                        parsed_json = json.loads(content_text.strip())

                        cut_plans = [
                            CategoryCutPlan(
                                category_name=str(cp.get("category_name", "General")),
                                current_monthly_spend=Decimal(str(cp.get("current_monthly_spend", 0.0))),
                                proposed_monthly_spend=Decimal(str(cp.get("proposed_monthly_spend", 0.0))),
                                monthly_savings=Decimal(str(cp.get("monthly_savings", 0.0))),
                                cut_percentage=float(cp.get("cut_percentage", 20.0)),
                                action_tip=str(cp.get("action_tip", "")),
                            )
                            for cp in parsed_json.get("category_cut_plans", [])
                        ]

                        return SavingsGoalResponse(
                            goal_name=request.goal_name,
                            target_amount=request.target_amount,
                            target_months=request.target_months,
                            required_monthly_savings=Decimal(str(target_amt / target_months)).quantize(Decimal("0.01")),
                            current_discretionary_spend=Decimal(str(sum(float(cp.current_monthly_spend) for cp in cut_plans))),
                            feasibility_score=int(parsed_json.get("feasibility_score", 85)),
                            feasibility_status=str(parsed_json.get("feasibility_status", "Achievable")),
                            category_cut_plans=cut_plans,
                            estimated_completion_months=float(parsed_json.get("estimated_completion_months", target_months)),
                            ai_advice=str(parsed_json.get("ai_advice", "")),
                            engine_used="gemini",
                        )
        except Exception as e:
            logger.warning(f"Gemini Savings Goal failed ({e}); falling back to LocalNLPAIProvider")

        return await self.local_fallback.simulate_savings_goal(request, context)

    async def forecast_cashflow(
        self,
        request: CashFlowForecastRequest,
        context: Dict[str, Any],
    ) -> CashFlowForecastResponse:
        if not settings.GEMINI_API_KEY or not settings.GEMINI_API_KEY.strip():
            return await self.local_fallback.forecast_cashflow(request, context)

        total_spent = float(context.get("total_spent", 0.0))
        days_elapsed = int(context.get("days_elapsed", 1))
        days_in_month = int(context.get("days_in_month", 30))
        budget_limit = float(context.get("budget_limit", 0.0)) if context.get("budget_limit") else None
        income = float(request.estimated_monthly_income) if request.estimated_monthly_income else (budget_limit or max(total_spent * 1.3, 35000.0))
        liquid_bal = float(request.current_liquid_balance) if request.current_liquid_balance is not None else max(income - total_spent, 0.0)

        prompt = (
            f"You are the Predictive Cash Flow & Runway Engine for KharchaPani.\n"
            f"Monthly Inflow/Income: ₹{income:,.2f}\n"
            f"Total Spent so far: ₹{total_spent:,.2f}\n"
            f"Days Elapsed: {days_elapsed} / {days_in_month}\n"
            f"Current Liquid Balance: ₹{liquid_bal:,.2f}\n"
            f"Category Breakdown: {json.dumps(context.get('category_breakdown', []))}\n\n"
            f"Generate a financial runway forecast JSON with exact structure:\n"
            f"{{\n"
            f"  \"daily_burn_rate_current\": float,\n"
            f"  \"daily_burn_rate_safe_target\": float,\n"
            f"  \"projected_end_of_cycle_spend\": float,\n"
            f"  \"zero_day_date\": \"YYYY-MM-DD\" or null (date when liquid balance reaches 0 if burn rate continues),\n"
            f"  \"runway_days_remaining\": int (number of days current balance will last at current burn rate),\n"
            f"  \"risk_level\": \"Safe\" | \"Moderate\" | \"Critical Danger\" | \"Thriving\",\n"
            f"  \"ai_runway_verdict\": \"Short executive analysis of burn rate with crisp advice on surviving until next salary\"\n"
            f"}}\n"
            f"Return ONLY valid JSON."
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json",
            },
        }

        try:
            async with httpx.AsyncClient(timeout=9.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        content_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                        parsed_json = json.loads(content_text.strip())

                        # Compute local timeline curve
                        local_resp = await self.local_fallback.forecast_cashflow(request, context)
                        return CashFlowForecastResponse(
                            current_spend_to_date=Decimal(str(total_spent)).quantize(Decimal("0.01")),
                            days_elapsed=days_elapsed,
                            days_remaining=max(days_in_month - days_elapsed, 0),
                            total_days_in_cycle=days_in_month,
                            daily_burn_rate_current=Decimal(str(parsed_json.get("daily_burn_rate_current", local_resp.daily_burn_rate_current))),
                            daily_burn_rate_safe_target=Decimal(str(parsed_json.get("daily_burn_rate_safe_target", local_resp.daily_burn_rate_safe_target))),
                            projected_end_of_cycle_spend=Decimal(str(parsed_json.get("projected_end_of_cycle_spend", local_resp.projected_end_of_cycle_spend))),
                            zero_day_date=parsed_json.get("zero_day_date") or local_resp.zero_day_date,
                            runway_days_remaining=int(parsed_json.get("runway_days_remaining", local_resp.runway_days_remaining)),
                            risk_level=str(parsed_json.get("risk_level", local_resp.risk_level)),
                            upcoming_recurring_obligations=local_resp.upcoming_recurring_obligations,
                            daily_forecast_timeline=local_resp.daily_forecast_timeline,
                            ai_runway_verdict=str(parsed_json.get("ai_runway_verdict", local_resp.ai_runway_verdict)),
                            engine_used="gemini",
                        )
        except Exception as e:
            logger.warning(f"Gemini Cash Flow forecast failed ({e}); falling back to LocalNLPAIProvider")

        return await self.local_fallback.forecast_cashflow(request, context)

    async def advise_tax_regime(
        self,
        request: TaxAdvisorRequest,
        context: Dict[str, Any],
    ) -> TaxAdvisorResponse:
        if not settings.GEMINI_API_KEY or not settings.GEMINI_API_KEY.strip():
            return await self.local_fallback.advise_tax_regime(request, context)

        gross_income = float(request.annual_income or Decimal("1200000.00"))
        expenses_sample = context.get("expenses", [])[:40]

        prompt = (
            f"You are the Senior Indian Income Tax & Optimization Advisor for KharchaPani.\n"
            f"Annual Taxable Income: ₹{gross_income:,.2f}\n"
            f"Tax Year: {request.tax_year or '2024-25'} (FY 2024-25 / AY 2025-26 Indian Income Tax slabs)\n"
            f"Sample User Transactions: {json.dumps(expenses_sample)}\n\n"
            f"Perform Old vs New Tax Regime calculations and optimize Section 80C, 80D, and HRA deductions.\n"
            f"Return a strict JSON object:\n"
            f"{{\n"
            f"  \"recommended_regime\": \"New Tax Regime\" or \"Old Tax Regime\",\n"
            f"  \"potential_tax_savings_with_recommended\": float,\n"
            f"  \"ai_tax_saving_tips\": [\"string tips in English with clear Indian rupee figures and Marathi friendly context\"],\n"
            f"  \"expert_verdict\": \"Short summary of why this regime was chosen\"\n"
            f"}}\n"
            f"Return ONLY valid JSON."
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json",
            },
        }

        try:
            async with httpx.AsyncClient(timeout=9.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        content_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                        parsed_json = json.loads(content_text.strip())

                        # Combine with deterministic tax calculations
                        local_resp = await self.local_fallback.advise_tax_regime(request, context)
                        rec_regime = str(parsed_json.get("recommended_regime", local_resp.recommended_regime))
                        savings = Decimal(str(parsed_json.get("potential_tax_savings_with_recommended", local_resp.potential_tax_savings_with_recommended)))
                        tips = parsed_json.get("ai_tax_saving_tips", local_resp.ai_tax_saving_tips)

                        return TaxAdvisorResponse(
                            recommended_regime=rec_regime,
                            potential_tax_savings_with_recommended=savings,
                            total_detected_deductions=local_resp.total_detected_deductions,
                            unclaimed_80c_headroom=local_resp.unclaimed_80c_headroom,
                            unclaimed_80d_headroom=local_resp.unclaimed_80d_headroom,
                            deductions_breakdown=local_resp.deductions_breakdown,
                            old_regime=local_resp.old_regime,
                            new_regime=local_resp.new_regime,
                            ai_tax_saving_tips=tips,
                            engine_used="gemini",
                        )
        except Exception as e:
            logger.warning(f"Gemini Tax Advisor failed ({e}); falling back to LocalNLPAIProvider")

        return await self.local_fallback.advise_tax_regime(request, context)

    async def parse_voice_expense(
        self,
        audio_bytes: Optional[bytes],
        mime_type: Optional[str],
        transcript: Optional[str],
        categories: List[CategoryResponse],
        reference_date: Optional[date] = None,
    ) -> VoiceExpenseResponse:
        ref_date = reference_date or date.today()
        if not settings.GEMINI_API_KEY or not settings.GEMINI_API_KEY.strip():
            return await self.local_fallback.parse_voice_expense(audio_bytes, mime_type, transcript, categories, ref_date)

        cat_list_str = json.dumps([{"id": c.id, "name": c.name} for c in categories])
        category_map = {c.id: c.name for c in categories}
        fallback_cat_id = categories[0].id if categories else 1

        prompt = (
            f"You are the Multi-Lingual Voice Expense Assistant ('बोली खर्चा') for KharchaPani.\n"
            f"Reference Date: {ref_date.isoformat()} (Today)\n"
            f"Available Categories: {cat_list_str}\n\n"
            f"Input can be in Marathi (e.g. 'काल भाजी मंडई मध्ये ४५० रुपये कॅश दिले'), Hindi (e.g. 'दोस्तों के साथ खाना खाया १५०० रुपये गूगल पे से'), or English.\n"
            f"Extract expense details into strict JSON:\n"
            f"{{\n"
            f"  \"original_transcript\": \"Exact text transcribed from speech in original language\",\n"
            f"  \"detected_language\": \"Marathi\" | \"Hindi\" | \"English\",\n"
            f"  \"title\": \"Clean expense title/merchant\",\n"
            f"  \"amount\": float,\n"
            f"  \"date\": \"YYYY-MM-DD\" (resolve relative days like 'काल'/'yesterday' relative to Reference Date),\n"
            f"  \"category_id\": int,\n"
            f"  \"category_name\": \"string\",\n"
            f"  \"payment_mode\": \"Cash\" | \"UPI\" | \"Card\" | \"Net Banking\",\n"
            f"  \"notes\": \"string or null\"\n"
            f"}}\n"
            f"Return ONLY valid JSON."
        )

        parts: List[Dict[str, Any]] = [{"text": prompt}]
        if audio_bytes:
            b64_data = base64.b64encode(audio_bytes).decode("utf-8")
            parts.append({
                "inlineData": {
                    "mimeType": mime_type or "audio/webm",
                    "data": b64_data,
                }
            })
        elif transcript:
            parts.append({"text": f"User Voice Transcript: \"{transcript}\""})

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": parts}],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json",
            },
        }

        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        content_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                        parsed_json = json.loads(content_text.strip())

                        cid = int(parsed_json.get("category_id", fallback_cat_id))
                        cname = category_map.get(cid, parsed_json.get("category_name", "General"))
                        exp_date = ref_date
                        try:
                            if parsed_json.get("date"):
                                exp_date = date.fromisoformat(str(parsed_json.get("date")))
                        except Exception:
                            exp_date = ref_date

                        return VoiceExpenseResponse(
                            original_transcript=str(parsed_json.get("original_transcript", transcript or "Voice Audio")),
                            detected_language=str(parsed_json.get("detected_language", "Marathi")),
                            title=str(parsed_json.get("title", "Voice Expense")),
                            amount=Decimal(str(parsed_json.get("amount", 100.0))).quantize(Decimal("0.01")),
                            date=exp_date,
                            category_id=cid,
                            category_name=cname,
                            payment_mode=str(parsed_json.get("payment_mode", "Cash")),
                            notes=parsed_json.get("notes"),
                            confidence=0.98,
                            engine_used="gemini",
                        )
        except Exception as e:
            logger.warning(f"Gemini Voice Expense failed ({e}); falling back to LocalNLPAIProvider")

        return await self.local_fallback.parse_voice_expense(audio_bytes, mime_type, transcript, categories, ref_date)

    async def generate_money_digest(
        self,
        month: int,
        year: int,
        context: Dict[str, Any],
    ) -> MoneyDigestResponse:
        if not settings.GEMINI_API_KEY or not settings.GEMINI_API_KEY.strip():
            return await self.local_fallback.generate_money_digest(month, year, context)

        month_names = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        m_name = month_names[month] if 1 <= month <= 12 else "Current Month"
        total_spent = float(context.get("total_spent", 0.0))

        prompt = (
            f"You are the Creative Director of 'KharchaPani Wrapped' — a gamified, Spotify-Wrapped style monthly financial digest.\n"
            f"Month: {m_name} {year}\n"
            f"Total Spent: ₹{total_spent:,.2f}\n"
            f"Category Breakdown: {json.dumps(context.get('category_breakdown', []))}\n"
            f"Recent Expenses: {json.dumps(context.get('recent_expenses', [])[:30])}\n\n"
            f"Create a vibrant, funny, engaging 5-slide behavioral story with personality badges and actionable wisdom.\n"
            f"Return JSON strictly matching this schema:\n"
            f"{{\n"
            f"  \"financial_persona_title\": \"e.g. The Strategic Zen Saver / The Weekend Foodie Maverick\",\n"
            f"  \"persona_description\": \"2-sentence humorous & insightful summary of their financial personality\",\n"
            f"  \"persona_icon\": \"shield-check\" | \"utensils\" | \"shopping-bag\" | \"sparkles\" | \"flame\" | \"trophy\",\n"
            f"  \"top_spending_day_of_week\": \"e.g. Saturday (41% of discretionary)\",\n"
            f"  \"biggest_savings_win\": \"string highlighting their best discipline achievement\",\n"
            f"  \"top_leakage_drain\": \"string identifying small money leakages (e.g. small ₹50 UPI chai/snack runs)\",\n"
            f"  \"favorite_merchant\": \"string\",\n"
            f"  \"slides\": [\n"
            f"    {{\n"
            f"      \"slide_id\": \"slide-1\",\n"
            f"      \"slide_type\": \"persona\",\n"
            f"      \"title\": \"Your Financial Persona\",\n"
            f"      \"subtitle\": \"Monthly Behavioral Wrap\",\n"
            f"      \"metric_value\": \"Persona Name\",\n"
            f"      \"narrative\": \"Story narrative for slide 1\",\n"
            f"      \"badge_icon\": \"shield-check\",\n"
            f"      \"gradient_theme\": \"sunset\"\n"
            f"    }},\n"
            f"    {{\n"
            f"      \"slide_id\": \"slide-2\",\n"
            f"      \"slide_type\": \"peak_day\",\n"
            f"      \"title\": \"Peak Spending Velocity\",\n"
            f"      \"subtitle\": \"Weekly Rhythm\",\n"
            f"      \"metric_value\": \"Saturday\",\n"
            f"      \"narrative\": \"Story narrative for slide 2\",\n"
            f"      \"badge_icon\": \"flame\",\n"
            f"      \"gradient_theme\": \"midnight\"\n"
            f"    }},\n"
            f"    {{\n"
            f"      \"slide_id\": \"slide-3\",\n"
            f"      \"slide_type\": \"win\",\n"
            f"      \"title\": \"Biggest Victory 🏆\",\n"
            f"      \"subtitle\": \"Discipline Highlight\",\n"
            f"      \"metric_value\": \"Savings Milestone\",\n"
            f"      \"narrative\": \"Story narrative for slide 3\",\n"
            f"      \"badge_icon\": \"trophy\",\n"
            f"      \"gradient_theme\": \"emerald\"\n"
            f"    }},\n"
            f"    {{\n"
            f"      \"slide_id\": \"slide-4\",\n"
            f"      \"slide_type\": \"leakage\",\n"
            f"      \"title\": \"Stealth Leakage 🔍\",\n"
            f"      \"subtitle\": \"Micro-Expense Audit\",\n"
            f"      \"metric_value\": \"Micro-Spends\",\n"
            f"      \"narrative\": \"Story narrative for slide 4\",\n"
            f"      \"badge_icon\": \"zap\",\n"
            f"      \"gradient_theme\": \"neon_purple\"\n"
            f"    }},\n"
            f"    {{\n"
            f"      \"slide_id\": \"slide-5\",\n"
            f"      \"slide_type\": \"manifesto\",\n"
            f"      \"title\": \"Next Month Manifesto 🚀\",\n"
            f"      \"subtitle\": \"Growth Action Plan\",\n"
            f"      \"metric_value\": \"Target: +20% Savings\",\n"
            f"      \"narrative\": \"Story narrative for slide 5\",\n"
            f"      \"badge_icon\": \"sparkles\",\n"
            f"      \"gradient_theme\": \"amber_gold\"\n"
            f"    }}\n"
            f"  ]\n"
            f"}}\n"
            f"Return ONLY valid JSON."
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.4,
                "responseMimeType": "application/json",
            },
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        content_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                        parsed_json = json.loads(content_text.strip())

                        slides = [
                            DigestStorySlide(
                                slide_id=str(s.get("slide_id", f"slide-{i+1}")),
                                slide_type=str(s.get("slide_type", "persona")),
                                title=str(s.get("title", "")),
                                subtitle=str(s.get("subtitle", "")),
                                metric_value=s.get("metric_value"),
                                narrative=str(s.get("narrative", "")),
                                badge_icon=str(s.get("badge_icon", "sparkles")),
                                gradient_theme=str(s.get("gradient_theme", "sunset")),
                            )
                            for i, s in enumerate(parsed_json.get("slides", []))
                        ]

                        return MoneyDigestResponse(
                            month_name=m_name,
                            year=year,
                            financial_persona_title=str(parsed_json.get("financial_persona_title", "The Strategic Saver")),
                            persona_description=str(parsed_json.get("persona_description", "")),
                            persona_icon=str(parsed_json.get("persona_icon", "sparkles")),
                            total_spent_this_month=Decimal(str(total_spent)).quantize(Decimal("0.01")),
                            top_spending_day_of_week=str(parsed_json.get("top_spending_day_of_week", "Saturday")),
                            biggest_savings_win=str(parsed_json.get("biggest_savings_win", "Controlled discretionary budget")),
                            top_leakage_drain=str(parsed_json.get("top_leakage_drain", "Small micro-spends")),
                            favorite_merchant=str(parsed_json.get("favorite_merchant", "General")),
                            slides=slides,
                            engine_used="gemini",
                        )
        except Exception as e:
            logger.warning(f"Gemini Money Digest failed ({e}); falling back to LocalNLPAIProvider")

        return await self.local_fallback.generate_money_digest(month, year, context)

    async def calculate_financial_health(
        self,
        request: FinancialHealthRequest,
        context: Dict[str, Any],
    ) -> FinancialHealthResponse:
        if not settings.GEMINI_API_KEY or not settings.GEMINI_API_KEY.strip():
            return await self.local_fallback.calculate_financial_health(request, context)

        total_spent = float(context.get("total_spent", 0.0))
        budget_limit = float(context.get("budget_limit", 0.0)) if context.get("budget_limit") else None
        upcoming_recurring = float(context.get("upcoming_recurring", 0.0))
        monthly_income = float(request.monthly_income) if request.monthly_income else (budget_limit * 1.3 if budget_limit else total_spent * 1.4 if total_spent > 0 else 50000.0)
        budget_str = f"₹{budget_limit:,.2f}" if budget_limit else "Not Set"

        prompt = (
            f"You are KharchaPani's Chief Financial Health AI Specialist.\n"
            f"Evaluate the user's comprehensive financial health score (0-100), 5 pillars (each scored 0-20), 50-30-20 rule compliance, risk factors, and prioritized action plan.\n"
            f"User Financial Stats:\n"
            f"- Estimated Monthly Income: ₹{monthly_income:,.2f}\n"
            f"- Spent This Month: ₹{total_spent:,.2f}\n"
            f"- Monthly Budget: {budget_str}\n"
            f"- Fixed Monthly Subscriptions / Commitments: ₹{upcoming_recurring:,.2f}\n"
            f"- Categories Breakdown: {json.dumps(context.get('category_breakdown', []))}\n\n"

            f"Return JSON adhering precisely to this structure:\n"
            f"{{\n"
            f"  \"overall_score\": 82,\n"
            f"  \"health_badge\": \"Financial Master\",\n"
            f"  \"headline_summary\": \"Solid spending discipline with strong liquid retention.\",\n"
            f"  \"peer_percentile\": 78,\n"
            f"  \"pillars\": [\n"
            f"    {{\n"
            f"      \"pillar_id\": \"savings\",\n"
            f"      \"title\": \"Savings Discipline\",\n"
            f"      \"score\": 17,\n"
            f"      \"max_score\": 20,\n"
            f"      \"status\": \"Excellent\",\n"
            f"      \"summary\": \"You retain ~30% of income.\",\n"
            f"      \"metric_label\": \"Savings Rate: 30%\"\n"
            f"    }},\n"
            f"    {{\n"
            f"      \"pillar_id\": \"budget\",\n"
            f"      \"title\": \"Budget Adherence\",\n"
            f"      \"score\": 16,\n"
            f"      \"max_score\": 20,\n"
            f"      \"status\": \"Good\",\n"
            f"      \"summary\": \"Spending pace is well calibrated.\",\n"
            f"      \"metric_label\": \"Burn Adherence: 80%\"\n"
            f"    }},\n"
            f"    {{\n"
            f"      \"pillar_id\": \"debt\",\n"
            f"      \"title\": \"Fixed Obligations\",\n"
            f"      \"score\": 18,\n"
            f"      \"max_score\": 20,\n"
            f"      \"status\": \"Excellent\",\n"
            f"      \"summary\": \"Fixed subscriptions are under 20% of income.\",\n"
            f"      \"metric_label\": \"Fixed Burden: 15%\"\n"
            f"    }},\n"
            f"    {{\n"
            f"      \"pillar_id\": \"volatility\",\n"
            f"      \"title\": \"Spending Volatility\",\n"
            f"      \"score\": 15,\n"
            f"      \"max_score\": 20,\n"
            f"      \"status\": \"Good\",\n"
            f"      \"summary\": \"Low variance in day-to-day spending.\",\n"
            f"      \"metric_label\": \"Low Volatility\"\n"
            f"    }},\n"
            f"    {{\n"
            f"      \"pillar_id\": \"emergency\",\n"
            f"      \"title\": \"Emergency Cushion\",\n"
            f"      \"score\": 16,\n"
            f"      \"max_score\": 20,\n"
            f"      \"status\": \"Good\",\n"
            f"      \"summary\": \"3+ months runway available.\",\n"
            f"      \"metric_label\": \"3.2 Months Cushion\"\n"
            f"    }}\n"
            f"  ],\n"
            f"  \"fifty_thirty_twenty\": {{\n"
            f"    \"needs_percentage\": 48.0,\n"
            f"    \"wants_percentage\": 28.0,\n"
            f"    \"savings_percentage\": 24.0,\n"
            f"    \"ideal_needs_percentage\": 50.0,\n"
            f"    \"ideal_wants_percentage\": 30.0,\n"
            f"    \"ideal_savings_percentage\": 20.0,\n"
            f"    \"gap_summary\": \"Needs (48%) and Wants (28%) are well within the 50/30/20 standard benchmark.\"\n"
            f"  }},\n"
            f"  \"risk_factors\": [\n"
            f"    {{\n"
            f"      \"severity\": \"low\",\n"
            f"      \"title\": \"Weekend Splurge Risk\",\n"
            f"      \"description\": \"Discretionary dining spikes on weekends.\",\n"
            f"      \"suggested_action\": \"Pre-budget social weekend dinners.\"\n"
            f"    }}\n"
            f"  ],\n"
            f"  \"action_plan\": [\n"
            f"    {{\n"
            f"      \"priority\": 1,\n"
            f"      \"title\": \"Automate 20% Direct Inflow Savings\",\n"
            f"      \"description\": \"Schedule an auto-debit SIP on salary day.\",\n"
            f"      \"estimated_monthly_inr_impact\": 5000.0,\n"
            f"      \"difficulty\": \"Easy\"\n"
            f"    }}\n"
            f"  ]\n"
            f"}}\n"
            f"Return ONLY valid JSON."
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.3,
                "responseMimeType": "application/json",
            },
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        content_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                        pj = json.loads(content_text.strip())

                        pillars = [
                            HealthPillarScore(
                                pillar_id=str(p.get("pillar_id", "savings")),
                                title=str(p.get("title", "Pillar")),
                                score=int(p.get("score", 15)),
                                max_score=20,
                                status=str(p.get("status", "Good")),
                                summary=str(p.get("summary", "")),
                                metric_label=str(p.get("metric_label", "")),
                            )
                            for p in pj.get("pillars", [])
                        ]

                        f_data = pj.get("fifty_thirty_twenty", {})
                        fifty_thirty_twenty = FiftyThirtyTwentyBreakdown(
                            needs_percentage=float(f_data.get("needs_percentage", 50.0)),
                            wants_percentage=float(f_data.get("wants_percentage", 30.0)),
                            savings_percentage=float(f_data.get("savings_percentage", 20.0)),
                            ideal_needs_percentage=50.0,
                            ideal_wants_percentage=30.0,
                            ideal_savings_percentage=20.0,
                            gap_summary=str(f_data.get("gap_summary", "Healthy benchmark")),
                        )

                        risk_factors = [
                            HealthRiskFactor(
                                severity=str(r.get("severity", "low")),
                                title=str(r.get("title", "Risk")),
                                description=str(r.get("description", "")),
                                suggested_action=str(r.get("suggested_action", "")),
                            )
                            for r in pj.get("risk_factors", [])
                        ]

                        action_plan = [
                            FinancialActionStep(
                                priority=int(a.get("priority", 1)),
                                title=str(a.get("title", "Action")),
                                description=str(a.get("description", "")),
                                estimated_monthly_inr_impact=Decimal(str(a.get("estimated_monthly_inr_impact", 0.0))),
                                difficulty=str(a.get("difficulty", "Easy")),
                            )
                            for a in pj.get("action_plan", [])
                        ]

                        return FinancialHealthResponse(
                            overall_score=int(pj.get("overall_score", 75)),
                            health_badge=str(pj.get("health_badge", "Steady Navigator")),
                            headline_summary=str(pj.get("headline_summary", "Balanced money management.")),
                            peer_percentile=int(pj.get("peer_percentile", 70)),
                            pillars=pillars,
                            fifty_thirty_twenty=fifty_thirty_twenty,
                            risk_factors=risk_factors,
                            action_plan=action_plan,
                            engine_used="gemini",
                        )
        except Exception as e:
            logger.warning(f"Gemini calculate_financial_health failed ({e}); falling back to LocalNLPAIProvider")

        return await self.local_fallback.calculate_financial_health(request, context)

    async def forecast_budget_burn(
        self,
        request: BudgetForecastRequest,
        context: Dict[str, Any],
    ) -> BudgetForecastResponse:
        if not settings.GEMINI_API_KEY or not settings.GEMINI_API_KEY.strip():
            return await self.local_fallback.forecast_budget_burn(request, context)

        # Gemini assisted optimization guardrails
        fallback_resp = await self.local_fallback.forecast_budget_burn(request, context)

        prompt = (
            f"You are KharchaPani's AI Budget & Burn Rate Strategist.\n"
            f"Review this computed budget velocity forecast and generate 3 sharp, actionable optimization guardrails for the Indian salaried/freelancer context:\n"
            f"- Total Budget: ₹{fallback_resp.total_budget_allocated:,.2f}\n"
            f"- Current Spend: ₹{fallback_resp.current_total_spend:,.2f}\n"
            f"- Projected Spend: ₹{fallback_resp.projected_total_month_end_spend:,.2f}\n"
            f"- Daily Burn Rate: ₹{fallback_resp.overall_burn_rate_current:,.2f}/day\n"
            f"- Safe Target Velocity: ₹{fallback_resp.overall_burn_rate_target:,.2f}/day\n"
            f"- Runway Status: {fallback_resp.runway_status}\n\n"
            f"Return ONLY a JSON array of 3 strings:\n"
            f"[\n"
            f"  \"Keep daily discretionary spends strictly below ₹{fallback_resp.overall_burn_rate_target:,.0f} to avoid end-of-month budget deficit.\",\n"
            f"  \"Reallocate surplus headroom from utilities to dining.\",\n"
            f"  \"Lock in weekend spending limits before Friday night.\"\n"
            f"]"
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.3,
                "responseMimeType": "application/json",
            },
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        content_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                        guardrails = json.loads(content_text.strip())
                        if isinstance(guardrails, list) and guardrails:
                            fallback_resp.ai_optimization_guardrails = [str(g) for g in guardrails]
                            fallback_resp.engine_used = "gemini"
                            return fallback_resp
        except Exception as e:
            logger.warning(f"Gemini forecast_budget_burn guardrails failed ({e})")

        return fallback_resp

    async def analyze_expense_sentiment(
        self,
        request: ExpenseSentimentRequest,
        context: Dict[str, Any],
    ) -> ExpenseSentimentResponse:
        if not settings.GEMINI_API_KEY or not settings.GEMINI_API_KEY.strip():
            return await self.local_fallback.analyze_expense_sentiment(request, context)

        expenses = context.get("recent_expenses", [])
        if not expenses:
            return await self.local_fallback.analyze_expense_sentiment(request, context)

        prompt = (
            f"You are KharchaPani's Behavioral Financial Psychologist.\n"
            f"Analyze the psychological sentiment, emotional triggers, and impulsive tendencies behind the user's recent expense notes:\n"
            f"Expenses:\n{json.dumps(expenses[:30])}\n\n"
            f"Include expressive, vibrant contextual emojis in all labels, emotion tags (e.g. '🍕 Impulse Craving', '🛍️ Stress Shopping', '🍻 Social/FOMO', '🌱 Mindful Value', '🎉 Celebration', '🧾 Obligatory'), regret risks ('🔴 High', '🟡 Medium', '🟢 Low'), dominant emotions, and behavioral nudge titles.\n\n"
            f"Return JSON adhering strictly to this schema:\n"
            f"{{\n"
            f"  \"net_sentiment_score\": 0.35,\n"
            f"  \"sentiment_label\": \"✨ Mindful & Balanced\",\n"
            f"  \"dominant_spending_emotion\": \"🌱 Mindful & Value-Driven\",\n"
            f"  \"impulse_buy_index\": 24.5,\n"
            f"  \"emotion_distribution\": {{\n"
            f"    \"mindful_value_pct\": 45.0,\n"
            f"    \"stress_relief_pct\": 15.0,\n"
            f"    \"social_fomo_pct\": 12.0,\n"
            f"    \"impulse_craving_pct\": 10.0,\n"
            f"    \"essential_neutral_pct\": 18.0\n"
            f"  }},\n"
            f"  \"flagged_emotional_expenses\": [\n"
            f"    {{\n"
            f"      \"expense_title\": \"Late Night Pizza\",\n"
            f"      \"amount\": 650.0,\n"
            f"      \"date\": \"2026-09-05\",\n"
            f"      \"category_name\": \"Food & Dining\",\n"
            f"      \"emotion_tag\": \"🍕 Impulse Craving\",\n"
            f"      \"mood_trigger\": \"🤤 Late night comfort food order\",\n"
            f"      \"regret_risk\": \"🔴 High\",\n"
            f"      \"sentiment_score\": -0.5\n"
            f"    }}\n"
            f"  ],\n"
            f"  \"emotional_spending_heatmap_summary\": \"🕒 Peak emotional spending clusters around Friday nights (8 PM - 11 PM) 🌙\",\n"
            f"  \"behavioral_nudges\": [\n"
            f"    {{\n"
            f"      \"nudge_title\": \"🛡️ The 48-Hour Tech Cooling Rule\",\n"
            f"      \"target_trigger\": \"🛒 E-commerce flash deals\",\n"
            f"      \"actionable_hack\": \"Move items to cart wishlist and wait 48 hours.\",\n"
            f"      \"psychology_insight\": \"🧠 Dopamine anticipation fades after 48 hours, curbing 70% of impulse buys.\"\n"
            f"    }}\n"
            f"  ]\n"
            f"}}\n"
            f"Return ONLY valid JSON."
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.4,
                "responseMimeType": "application/json",
            },
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        content_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                        pj = json.loads(content_text.strip())

                        e_dist = pj.get("emotion_distribution", {})
                        dist = EmotionDistribution(
                            mindful_value_pct=float(e_dist.get("mindful_value_pct", 40.0)),
                            stress_relief_pct=float(e_dist.get("stress_relief_pct", 15.0)),
                            social_fomo_pct=float(e_dist.get("social_fomo_pct", 15.0)),
                            impulse_craving_pct=float(e_dist.get("impulse_craving_pct", 10.0)),
                            essential_neutral_pct=float(e_dist.get("essential_neutral_pct", 20.0)),
                        )

                        flagged = [
                            EmotionalExpenseItem(
                                expense_title=str(e.get("expense_title", "Expense")),
                                amount=Decimal(str(e.get("amount", 0.0))),
                                date=str(e.get("date", date.today().isoformat())),
                                category_name=str(e.get("category_name", "General")),
                                emotion_tag=str(e.get("emotion_tag", "Impulse Craving")),
                                mood_trigger=str(e.get("mood_trigger", "Impulse")),
                                regret_risk=str(e.get("regret_risk", "Low")),
                                sentiment_score=float(e.get("sentiment_score", 0.0)),
                            )
                            for e in pj.get("flagged_emotional_expenses", [])
                        ]

                        nudges = [
                            BehavioralNudge(
                                nudge_title=str(n.get("nudge_title", "Nudge")),
                                target_trigger=str(n.get("target_trigger", "Habit")),
                                actionable_hack=str(n.get("actionable_hack", "")),
                                psychology_insight=str(n.get("psychology_insight", "")),
                            )
                            for n in pj.get("behavioral_nudges", [])
                        ]

                        return ExpenseSentimentResponse(
                            net_sentiment_score=float(pj.get("net_sentiment_score", 0.2)),
                            sentiment_label=str(pj.get("sentiment_label", "Mindful & Balanced")),
                            dominant_spending_emotion=str(pj.get("dominant_spending_emotion", "Mindful & Value-Driven")),
                            impulse_buy_index=float(pj.get("impulse_buy_index", 20.0)),
                            emotion_distribution=dist,
                            flagged_emotional_expenses=flagged,
                            emotional_spending_heatmap_summary=str(pj.get("emotional_spending_heatmap_summary", "Balanced spending habits.")),
                            behavioral_nudges=nudges,
                            engine_used="gemini",
                        )
        except Exception as e:
            logger.warning(f"Gemini analyze_expense_sentiment failed ({e}); falling back to LocalNLPAIProvider")

        return await self.local_fallback.analyze_expense_sentiment(request, context)


