import logging
from datetime import date
from typing import List, Optional, Dict, Any, Type

from app.core.config import settings
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
from app.services.ai.base_provider import BaseAIProvider
from app.services.ai.gemini_provider import GeminiAIProvider
from app.services.ai.local_provider import LocalNLPAIProvider


logger = logging.getLogger("app.ai_service")


class AIService:
    """Decoupled Provider Factory & Strategy Manager for AI Financial Intelligence.
    
    Adheres strictly to the Strategy Pattern:
    - Gemini 1.5 Flash (active default)
    - Local NLP Heuristic Engine (100% offline fallback)
    - Future pluggable strategies: Groq, OpenAI, Anthropic, Ollama
    Adding or switching AI models requires ZERO changes to existing routers or business logic.
    """

    # Strategy Registry mapping provider name -> Provider Class
    _registry: Dict[str, Type[BaseAIProvider]] = {
        "gemini": GeminiAIProvider,
        "local_nlp": LocalNLPAIProvider,
    }

    @classmethod
    def register_provider(cls, name: str, provider_cls: Type[BaseAIProvider]) -> None:
        """Register a new AI provider strategy dynamically at runtime."""
        cls._registry[name.lower().strip()] = provider_cls
        logger.info(f"Registered AI strategy provider '{name}'")

    @classmethod
    def get_provider(cls) -> BaseAIProvider:
        """Factory method resolving the active provider strategy based on AI_PROVIDER environment setting."""
        provider_name = (settings.AI_PROVIDER or "gemini").lower().strip()
        provider_cls = cls._registry.get(provider_name)

        if provider_cls:
            return provider_cls()

        logger.warning(
            f"Configured AI_PROVIDER '{provider_name}' is not in registry; "
            f"falling back to GeminiAIProvider with Local NLP fallback."
        )
        return GeminiAIProvider()

    @classmethod
    async def parse_expense(
        cls,
        text: str,
        categories: List[CategoryResponse],
        reference_date: Optional[date] = None,
    ) -> AIQuickParseResponse:
        """Parse natural language expense entry using active AI Strategy."""
        provider = cls.get_provider()
        return await provider.parse_expense(text, categories, reference_date)

    @classmethod
    async def generate_recommendations(
        cls,
        context: Dict[str, Any],
    ) -> AIRecommendationsResponse:
        """Generate financial health score, forecasts, and actionable savings recommendations using active AI Strategy."""
        provider = cls.get_provider()
        return await provider.generate_recommendations(context)

    @classmethod
    async def scan_receipt(
        cls,
        file_bytes: bytes,
        mime_type: str,
        categories: List[CategoryResponse],
        reference_date: Optional[date] = None,
    ) -> ReceiptScanResponse:
        """Extract structured receipt and invoice data using active AI Strategy."""
        provider = cls.get_provider()
        return await provider.scan_receipt(file_bytes, mime_type, categories, reference_date)

    @classmethod
    async def chat_query(
        cls,
        message: str,
        history: List[AIChatMessage],
        context: Dict[str, Any],
    ) -> AIChatResponse:
        """Process conversational natural language questions about personal finances."""
        provider = cls.get_provider()
        return await provider.chat_query(message, history, context)

    @classmethod
    async def detect_subscriptions(
        cls,
        expenses: List[Dict[str, Any]],
    ) -> SubscriptionsResponse:
        """Detect recurring subscriptions and bills from transaction history."""
        provider = cls.get_provider()
        return await provider.detect_subscriptions(expenses)

    @classmethod
    async def simulate_savings_goal(
        cls,
        request: SavingsGoalRequest,
        context: Dict[str, Any],
    ) -> SavingsGoalResponse:
        """Simulate category budget cut plans for target savings goals."""
        provider = cls.get_provider()
        return await provider.simulate_savings_goal(request, context)

    @classmethod
    async def forecast_cashflow(
        cls,
        request: CashFlowForecastRequest,
        context: Dict[str, Any],
    ) -> CashFlowForecastResponse:
        """Forecast cash flow trajectory, daily burn rate, and Zero-Day runway."""
        provider = cls.get_provider()
        return await provider.forecast_cashflow(request, context)

    @classmethod
    async def advise_tax_regime(
        cls,
        request: TaxAdvisorRequest,
        context: Dict[str, Any],
    ) -> TaxAdvisorResponse:
        """Analyze Indian tax deductions under 80C/80D/HRA and optimize Old vs New Tax Regime."""
        provider = cls.get_provider()
        return await provider.advise_tax_regime(request, context)

    @classmethod
    async def parse_voice_expense(
        cls,
        audio_bytes: Optional[bytes],
        mime_type: Optional[str],
        transcript: Optional[str],
        categories: List[CategoryResponse],
        reference_date: Optional[date] = None,
    ) -> VoiceExpenseResponse:
        """Parse voice audio or transcript in Marathi, Hindi, or English into structured expense."""
        provider = cls.get_provider()
        return await provider.parse_voice_expense(audio_bytes, mime_type, transcript, categories, reference_date)

    @classmethod
    async def generate_money_digest(
        cls,
        month: int,
        year: int,
        context: Dict[str, Any],
    ) -> MoneyDigestResponse:
        """Generate Spotify-Wrapped style monthly financial digest."""
        provider = cls.get_provider()
        return await provider.generate_money_digest(month, year, context)

    @classmethod
    async def calculate_financial_health(
        cls,
        request: FinancialHealthRequest,
        context: Dict[str, Any],
    ) -> FinancialHealthResponse:
        """Calculate 5-pillar Financial Health Score (0-100), 50/30/20 breakdown, and prioritized action plan."""
        provider = cls.get_provider()
        return await provider.calculate_financial_health(request, context)

    @classmethod
    async def forecast_budget_burn(
        cls,
        request: BudgetForecastRequest,
        context: Dict[str, Any],
    ) -> BudgetForecastResponse:
        """Forecast per-category burn rate velocity, budget exhaustion dates, and optimization guardrails."""
        provider = cls.get_provider()
        return await provider.forecast_budget_burn(request, context)

    @classmethod
    async def analyze_expense_sentiment(
        cls,
        request: ExpenseSentimentRequest,
        context: Dict[str, Any],
    ) -> ExpenseSentimentResponse:
        """Perform psychological and emotional sentiment analysis on expense notes."""
        provider = cls.get_provider()
        return await provider.analyze_expense_sentiment(request, context)


