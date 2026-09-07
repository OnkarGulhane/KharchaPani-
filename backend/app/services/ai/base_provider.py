from abc import ABC, abstractmethod
from datetime import date
from decimal import Decimal
from typing import List, Optional, Dict, Any
from app.schemas.ai import (
    AIQuickParseResponse,
    AIRecommendationsResponse,
    ReceiptScanResponse,
    AIChatMessage,
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
from app.schemas.category import CategoryResponse


class BaseAIProvider(ABC):
    """Abstract Base Class for pluggable, provider-agnostic AI models (Gemini, Local NLP, OpenAI, Claude)."""

    @abstractmethod
    async def parse_expense(
        self,
        text: str,
        categories: List[CategoryResponse],
        reference_date: Optional[date] = None,
    ) -> AIQuickParseResponse:
        """Parse natural language text into a structured expense entry."""
        pass

    @abstractmethod
    async def generate_recommendations(
        self,
        context: Dict[str, Any],
    ) -> AIRecommendationsResponse:
        """Generate financial health insights, forecasts, and savings recommendations from real user data."""
        pass

    @abstractmethod
    async def scan_receipt(
        self,
        file_bytes: bytes,
        mime_type: str,
        categories: List[CategoryResponse],
        reference_date: Optional[date] = None,
    ) -> ReceiptScanResponse:
        """Extract structured expense information from a receipt image or document."""
        pass

    @abstractmethod
    async def chat_query(
        self,
        message: str,
        history: List[AIChatMessage],
        context: Dict[str, Any],
    ) -> AIChatResponse:
        """Process conversational natural language questions about personal finances."""
        pass

    @abstractmethod
    async def detect_subscriptions(
        self,
        expenses: List[Dict[str, Any]],
    ) -> SubscriptionsResponse:
        """Detect recurring subscriptions and EMI obligations from transaction history."""
        pass

    @abstractmethod
    async def simulate_savings_goal(
        self,
        request: SavingsGoalRequest,
        context: Dict[str, Any],
    ) -> SavingsGoalResponse:
        """Simulate category budget cut plans to achieve target savings goals."""
        pass

    @abstractmethod
    async def forecast_cashflow(
        self,
        request: CashFlowForecastRequest,
        context: Dict[str, Any],
    ) -> CashFlowForecastResponse:
        """Forecast end-of-month cash flow trajectory, daily burn rate, and Zero-Day runway."""
        pass

    @abstractmethod
    async def advise_tax_regime(
        self,
        request: TaxAdvisorRequest,
        context: Dict[str, Any],
    ) -> TaxAdvisorResponse:
        """Analyze tax-deductible expenses under Indian Income Tax sections (80C, 80D, HRA) and optimize Old vs New Regime."""
        pass

    @abstractmethod
    async def parse_voice_expense(
        self,
        audio_bytes: Optional[bytes],
        mime_type: Optional[str],
        transcript: Optional[str],
        categories: List[CategoryResponse],
        reference_date: Optional[date] = None,
    ) -> VoiceExpenseResponse:
        """Parse voice audio or transcript in Marathi, Hindi, or English into a structured expense."""
        pass

    @abstractmethod
    async def generate_money_digest(
        self,
        month: int,
        year: int,
        context: Dict[str, Any],
    ) -> MoneyDigestResponse:
        """Generate Spotify-Wrapped style gamified financial story cards and behavioral insights."""
        pass

    @abstractmethod
    async def calculate_financial_health(
        self,
        request: FinancialHealthRequest,
        context: Dict[str, Any],
    ) -> FinancialHealthResponse:
        """Calculate comprehensive 5-pillar Financial Health Index (0-100), 50/30/20 benchmark, and actionable steps."""
        pass

    @abstractmethod
    async def forecast_budget_burn(
        self,
        request: BudgetForecastRequest,
        context: Dict[str, Any],
    ) -> BudgetForecastResponse:
        """Compute category-by-category burn velocity, budget breach dates, and AI optimization guardrails."""
        pass

    @abstractmethod
    async def analyze_expense_sentiment(
        self,
        request: ExpenseSentimentRequest,
        context: Dict[str, Any],
    ) -> ExpenseSentimentResponse:
        """Perform psychological and emotional sentiment analysis on expense notes and behavioral patterns."""
        pass


