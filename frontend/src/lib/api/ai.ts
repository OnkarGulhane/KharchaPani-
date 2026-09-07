import { apiFetch } from "./client";
import {
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
} from "@/types/ai";


/**
 * Parse natural language expense query using backend AI & NLP engine.
 */
export async function quickParseExpense(data: AIQuickParseRequest): Promise<AIQuickParseResponse> {
  return apiFetch<AIQuickParseResponse>("/ai/quick-parse", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Fetch personalized AI recommendations, financial health score, and spend velocity forecasts.
 */
export async function getAIRecommendations(): Promise<AIRecommendationsResponse> {
  return apiFetch<AIRecommendationsResponse>("/ai/recommendations");
}

/**
 * Scan a receipt or invoice image/PDF using Multimodal Vision AI.
 */
export async function scanReceipt(file: File): Promise<ReceiptScanResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<ReceiptScanResponse>("/ai/receipt-scan", {
    method: "POST",
    body: formData,
  });
}

/**
 * Ask Kharcha Guru AI Chatbot financial questions.
 */
export async function chatWithKharchaGuru(data: AIChatRequest): Promise<AIChatResponse> {
  return apiFetch<AIChatResponse>("/ai/chat", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Dispatch global event to open Kharcha Guru AI chat drawer.
 */
export function openKharchaGuru(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-kharcha-guru"));
  }
}

/**
 * Fetch detected recurring subscriptions and EMI obligations.
 */
export async function getSubscriptions(): Promise<SubscriptionsResponse> {
  return apiFetch<SubscriptionsResponse>("/ai/subscriptions");
}

/**
 * Simulate discretionary category spending cuts to achieve a target savings goal.
 */
export async function simulateSavingsGoal(data: SavingsGoalRequest): Promise<SavingsGoalResponse> {
  return apiFetch<SavingsGoalResponse>("/ai/savings-goal", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Forecast cash flow trajectory, daily burn rate, and Zero-Day runway.
 */
export async function getCashFlowForecast(data?: CashFlowForecastRequest): Promise<CashFlowForecastResponse> {
  return apiFetch<CashFlowForecastResponse>("/ai/cashflow-forecast", {
    method: "POST",
    body: JSON.stringify(data || {}),
  });
}

/**
 * Analyze tax deductions under Indian Income Tax 80C/80D/HRA and compare Old vs New Regime.
 */
export async function getTaxAdvice(data: TaxAdvisorRequest): Promise<TaxAdvisorResponse> {
  return apiFetch<TaxAdvisorResponse>("/ai/tax-advisor", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Parse voice audio or transcribed speech in Marathi, Hindi, or English.
 */
export async function parseVoiceExpense(
  audioBlob?: Blob,
  transcript?: string,
  language?: string
): Promise<VoiceExpenseResponse> {
  if (audioBlob) {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");
    if (transcript) formData.append("transcript", transcript);
    if (language) formData.append("language", language);
    return apiFetch<VoiceExpenseResponse>("/ai/voice-expense", {
      method: "POST",
      body: formData,
    });
  } else {
    const url = `/ai/voice-expense?transcript=${encodeURIComponent(transcript || "")}&language=${encodeURIComponent(language || "auto")}`;
    return apiFetch<VoiceExpenseResponse>(url, {
      method: "POST",
    });
  }
}

/**
 * Generate 'Spotify-Wrapped' style gamified monthly financial story cards.
 */
export async function getMoneyDigest(month?: number, year?: number): Promise<MoneyDigestResponse> {
  const params = new URLSearchParams();
  if (month) params.append("month", month.toString());
  if (year) params.append("year", year.toString());
  const queryStr = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<MoneyDigestResponse>(`/ai/money-digest${queryStr}`);
}

/**
 * Fetch 5-pillar comprehensive AI Financial Health Score & Action Plan.
 */
export async function getFinancialHealth(data?: FinancialHealthRequest): Promise<FinancialHealthResponse> {
  return apiFetch<FinancialHealthResponse>("/ai/financial-health", {
    method: "POST",
    body: JSON.stringify(data || {}),
  });
}

/**
 * Predict category-by-category burn velocity and budget exhaustion date.
 */
export async function getBudgetBurnForecast(data?: BudgetForecastRequest): Promise<BudgetForecastResponse> {
  return apiFetch<BudgetForecastResponse>("/ai/budget-forecast", {
    method: "POST",
    body: JSON.stringify(data || {}),
  });
}

/**
 * Perform emotional and psychological sentiment analysis on user expense descriptions.
 */
export async function getExpenseSentiment(days: number = 30): Promise<ExpenseSentimentResponse> {
  return apiFetch<ExpenseSentimentResponse>(`/ai/expense-sentiment?days=${days}`);
}


