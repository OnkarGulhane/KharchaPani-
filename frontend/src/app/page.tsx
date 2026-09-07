"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PeriodType } from "@/types/dashboard";
import {
  getDashboardSummary,
  getDashboardCharts,
  getPeriodComparison,
  getTopCategories,
  getAverageSpend,
} from "@/lib/api/dashboard";

import ReportPeriodSelector from "@/components/dashboard/ReportPeriodSelector";
import SummaryCards from "@/components/dashboard/SummaryCards";
import BudgetStatus from "@/components/dashboard/BudgetStatus";
import BudgetAlertBanner from "@/components/dashboard/BudgetAlertBanner";
import CategoryPieChart from "@/components/dashboard/CategoryPieChart";
import SpendTrendChart from "@/components/dashboard/SpendTrendChart";
import MonthComparisonCard from "@/components/dashboard/MonthComparisonCard";
import TopCategoriesList from "@/components/dashboard/TopCategoriesList";
import AverageSpendCard from "@/components/dashboard/AverageSpendCard";
import RecentExpenses from "@/components/dashboard/RecentExpenses";
import AIInsightsCard from "@/components/dashboard/AIInsightsCard";
import { SubscriptionsCard } from "@/components/dashboard/SubscriptionsCard";
import { SavingsGoalSimulator } from "@/components/dashboard/SavingsGoalSimulator";
import { CashFlowForecastModal } from "@/components/dashboard/CashFlowForecastModal";
import { TaxAdvisorModal } from "@/components/dashboard/TaxAdvisorModal";
import { MoneyDigestModal } from "@/components/dashboard/MoneyDigestModal";
import { FinancialHealthModal } from "@/components/dashboard/FinancialHealthModal";
import { BudgetBurnForecastModal } from "@/components/dashboard/BudgetBurnForecastModal";
import { ExpenseSentimentModal } from "@/components/dashboard/ExpenseSentimentModal";
import { VoiceExpenseModal } from "@/components/expenses/VoiceExpenseModal";
import { ReceiptScanModal } from "@/components/expenses/ReceiptScanModal";
import { openKharchaGuru } from "@/lib/api/ai";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import QuickAddModal from "@/components/expenses/QuickAddModal";
import BudgetForm from "@/components/budget/BudgetForm";
import CategoryManager from "@/components/categories/CategoryManager";
import CurrencySelector from "@/components/common/CurrencySelector";
import { usePWA } from "@/hooks/usePWA";

import {
  Plus,
  Tags,
  RefreshCw,
  Sparkles,
  Smartphone,
  Target,
  Camera,
  Zap,
  Mic,
  Calculator,
  TrendingUp,
  Headphones,
  HeartPulse,
  Flame,
  Brain,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";


export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodType>("month");
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isCashFlowModalOpen, setIsCashFlowModalOpen] = useState(false);
  const [isTaxAdvisorModalOpen, setIsTaxAdvisorModalOpen] = useState(false);
  const [isMoneyDigestModalOpen, setIsMoneyDigestModalOpen] = useState(false);
  const [isFinancialHealthModalOpen, setIsFinancialHealthModalOpen] = useState(false);
  const [isBudgetBurnModalOpen, setIsBudgetBurnModalOpen] = useState(false);
  const [isExpenseSentimentModalOpen, setIsExpenseSentimentModalOpen] = useState(false);
  const [expenseInitialData, setExpenseInitialData] = useState<any>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isInstalled, setShowInstallModal } = usePWA();



  const queryClient = useQueryClient();

  const { data: summary, isLoading: loadingSummary, refetch: refetchSummary } = useQuery({
    queryKey: ["dashboard-summary", period],
    queryFn: () => getDashboardSummary(period),
  });

  const { data: charts, isLoading: loadingCharts, refetch: refetchCharts } = useQuery({
    queryKey: ["dashboard-charts", period],
    queryFn: () => getDashboardCharts(period),
  });

  const { data: comparison, isLoading: loadingComparison, refetch: refetchComparison } = useQuery({
    queryKey: ["dashboard-comparison", period],
    queryFn: () => getPeriodComparison(period),
  });

  const { data: topCategories, isLoading: loadingTopCat, refetch: refetchTopCat } = useQuery({
    queryKey: ["dashboard-top-categories", period],
    queryFn: () => getTopCategories(period, 5),
  });

  const { data: averageSpend, isLoading: loadingAvgSpend, refetch: refetchAvgSpend } = useQuery({
    queryKey: ["dashboard-average-spend", period],
    queryFn: () => getAverageSpend(period),
  });

  // Complete Parallel Refetch on Refresh Button
  const handleRefreshAll = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchSummary(),
        refetchCharts(),
        refetchComparison(),
        refetchTopCat(),
        refetchAvgSpend(),
        queryClient.invalidateQueries({ queryKey: ["ai-recommendations"] }),
        queryClient.invalidateQueries({ queryKey: ["expenses"] }),
      ]);
      toast.success("Dashboard data & AI analytics refreshed! ✨");
    } catch {
      toast.error("Failed to refresh dashboard data");
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Overview
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Live Analytics & AI
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Real-time financial analytics, AI advice, and smart budget goals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <ReportPeriodSelector period={period} onChange={setPeriod} />

          {/* Currency Switcher in Header */}
          <div className="hidden md:block">
            <CurrencySelector />
          </div>

          {!isInstalled && (
            <button
              onClick={() => setShowInstallModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all"
              title="Install Kharcha Pani App on your Mobile Phone"
            >
              <Smartphone className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>📱 Install</span>
            </button>
          )}

          <button
            onClick={() => setIsFinancialHealthModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all"
            title="AI Financial Health Score & 5-Pillar Insights"
          >
            <HeartPulse className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Health Score</span>
          </button>

          <button
            onClick={() => setIsBudgetBurnModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all"
            title="Burn Rate & Category Budget Forecast"
          >
            <Flame className="w-4 h-4 text-indigo-400" />
            <span>Budget Forecast</span>
          </button>

          <button
            onClick={() => setIsExpenseSentimentModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all"
            title="Psychological Sentiment & Emotional Impulse Analysis"
          >
            <Brain className="w-4 h-4 text-pink-400" />
            <span>Expense Sentiment</span>
          </button>

          <button
            onClick={() => setIsMoneyDigestModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all"
            title="View Monthly Wrapped Story Cards"
          >
            <Headphones className="w-4 h-4 text-pink-400" />
            <span>Monthly Wrap</span>
          </button>


          <button
            onClick={() => setIsTaxAdvisorModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all"
            title="Indian Income Tax 80C/80D Advisor"
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Tax Advisor</span>
          </button>

          <button
            onClick={() => setIsCashFlowModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all"
            title="Predictive Cash Flow & Zero-Day Runway"
          >
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Cash Runway</span>
          </button>

          <button
            onClick={() => openKharchaGuru()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-purple-600/20 hover:from-violet-600/30 hover:to-purple-600/30 border border-violet-500/40 text-violet-300 font-extrabold text-xs rounded-xl shadow-sm active:scale-95 transition-all"
            title="Ask Kharcha Guru AI Financial Advisor"
          >
            <span className="text-sm">🤖</span>
            <span>Ask Guru</span>
          </button>

          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all"
            title="बोली खर्चा - Speak in Marathi, Hindi, or English"
          >
            <Mic className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>बोली खर्चा</span>
          </button>

          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all"
            title="Simulate Savings Goal with AI"
          >
            <Target className="w-4 h-4 text-purple-400" />
            <span>AI Goal Planner</span>
          </button>

          <button
            onClick={() => setIsReceiptModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all"
            title="Scan Receipt with Vision AI"
          >
            <Camera className="w-4 h-4 text-teal-400" />
            <span>Scan Bill</span>
          </button>

          <button
            onClick={() => {
              setExpenseInitialData(null);
              setIsQuickAddModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all whitespace-nowrap min-h-[36px]"
            title="Quick Add with Natural Language AI"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>AI Quick Add</span>
          </button>

          <button
            onClick={() => {
              setExpenseInitialData(null);
              setIsExpenseModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all whitespace-nowrap min-h-[36px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="p-2 sm:p-2.5 bg-gray-900/80 hover:bg-gray-800 border border-gray-700/80 text-gray-300 hover:text-white rounded-xl active:scale-95 transition-all shadow-sm flex-shrink-0"
            title="Manage Categories"
          >
            <Tags className="w-4 h-4" />
          </button>

          {/* Interactive Fixed Refresh Button */}
          <button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className={`p-2 sm:p-2.5 bg-gray-900/80 hover:bg-gray-800 border border-gray-700/80 rounded-xl active:scale-95 transition-all shadow-sm flex-shrink-0 ${
              isRefreshing
                ? "text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-wait"
                : "text-gray-400 hover:text-white"
            }`}
            title="Refresh All Dashboard Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile Quick Voice & AI Action Banner */}
      <div className="md:hidden glass-panel p-3.5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Mic className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-black text-white">बोली खर्चा & Guru AI</h3>
            <p className="text-[10px] text-amber-200/80 truncate">मराठी, हिंदी किंवा इंग्रजीत बोला</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs shadow-md shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-1"
          >
            <span>बोला 🎙️</span>
          </button>
          <button
            onClick={() => openKharchaGuru()}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-xs shadow-md shadow-indigo-500/25 active:scale-95 transition-all flex items-center gap-1"
            title="Ask Kharcha Guru AI"
          >
            <span>Guru 🤖</span>
          </button>
          <button
            onClick={() => {
              setExpenseInitialData(null);
              setIsQuickAddModalOpen(true);
            }}
            className="p-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs"
            title="AI Quick Add"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Critical Over-Budget Alert Banner */}
      <BudgetAlertBanner
        budgetStatus={summary?.budget_status}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
      />

      {/* Summary Cards */}
      <SummaryCards summary={summary} loading={loadingSummary} />

      {/* Live Budget Goal Status */}
      <BudgetStatus
        status={summary?.budget_status}
        loading={loadingSummary}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
      />

      {/* AI Financial Intelligence & Actionable Recommendations */}
      <AIInsightsCard />

      {/* Recurring Subscriptions & EMI Section */}
      <SubscriptionsCard />

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <CategoryPieChart data={charts?.pie_chart || []} loading={loadingCharts} />
        <SpendTrendChart data={charts?.trend_chart || []} loading={loadingCharts} />
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <MonthComparisonCard comparison={comparison} loading={loadingComparison} />
        <TopCategoriesList categories={topCategories || []} loading={loadingTopCat} />
        <div className="sm:col-span-2 lg:col-span-1">
          <AverageSpendCard avgSpend={averageSpend} loading={loadingAvgSpend} />
        </div>
      </div>

      {/* Recent Transactions Snapshot */}
      <RecentExpenses expenses={summary?.recent_expenses || []} loading={loadingSummary} />

      {/* Modals */}
      {isVoiceModalOpen && (
        <VoiceExpenseModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onExpenseCreated={handleRefreshAll}
          onOpenFullForm={(parsedData) => {
            setExpenseInitialData(parsedData);
            setIsExpenseModalOpen(true);
          }}
        />
      )}

      {isCashFlowModalOpen && (
        <CashFlowForecastModal
          isOpen={isCashFlowModalOpen}
          onClose={() => setIsCashFlowModalOpen(false)}
        />
      )}

      {isTaxAdvisorModalOpen && (
        <TaxAdvisorModal
          isOpen={isTaxAdvisorModalOpen}
          onClose={() => setIsTaxAdvisorModalOpen(false)}
        />
      )}

      {isMoneyDigestModalOpen && (
        <MoneyDigestModal
          isOpen={isMoneyDigestModalOpen}
          onClose={() => setIsMoneyDigestModalOpen(false)}
        />
      )}

      {isFinancialHealthModalOpen && (
        <FinancialHealthModal
          isOpen={isFinancialHealthModalOpen}
          onClose={() => setIsFinancialHealthModalOpen(false)}
        />
      )}

      {isBudgetBurnModalOpen && (
        <BudgetBurnForecastModal
          isOpen={isBudgetBurnModalOpen}
          onClose={() => setIsBudgetBurnModalOpen(false)}
        />
      )}

      {isExpenseSentimentModalOpen && (
        <ExpenseSentimentModal
          isOpen={isExpenseSentimentModalOpen}
          onClose={() => setIsExpenseSentimentModalOpen(false)}
        />
      )}


      {isReceiptModalOpen && (
        <ReceiptScanModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          onExpenseCreated={handleRefreshAll}
          onPreFillExpense={(parsedData) => {
            setExpenseInitialData(parsedData);
            setIsExpenseModalOpen(true);
          }}
        />
      )}

      {isGoalModalOpen && (
        <SavingsGoalSimulator
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
        />
      )}

      {isQuickAddModalOpen && (
        <QuickAddModal
          isOpen={isQuickAddModalOpen}
          onClose={() => setIsQuickAddModalOpen(false)}
          onSuccess={handleRefreshAll}
          onOpenFullFormWithData={(parsedData) => {
            setExpenseInitialData(parsedData);
            setIsExpenseModalOpen(true);
          }}
        />
      )}

      {isExpenseModalOpen && (
        <ExpenseForm
          isOpen={isExpenseModalOpen}
          initialData={expenseInitialData}
          onClose={() => {
            setIsExpenseModalOpen(false);
            setExpenseInitialData(null);
          }}
          onSuccess={handleRefreshAll}
        />
      )}

      {isBudgetModalOpen && (
        <BudgetForm
          isOpen={isBudgetModalOpen}
          onClose={() => setIsBudgetModalOpen(false)}
          onSuccess={handleRefreshAll}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryManager
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSuccess={handleRefreshAll}
        />
      )}
    </motion.div>
  );
}

