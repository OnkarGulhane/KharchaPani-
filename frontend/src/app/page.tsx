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
import ExpenseForm from "@/components/expenses/ExpenseForm";
import BudgetForm from "@/components/budget/BudgetForm";
import CategoryManager from "@/components/categories/CategoryManager";
import CurrencySelector from "@/components/common/CurrencySelector";

import { Plus, Tags, RefreshCw, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodType>("month");
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
        queryClient.invalidateQueries(),
      ]);
      toast.success("Dashboard data refreshed! ✨");
    } catch (err: any) {
      toast.error("Failed to refresh dashboard");
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
              Live Analytics
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Real-time financial analytics, 3D timeline trends, and budget goals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <ReportPeriodSelector period={period} onChange={setPeriod} />

          {/* Currency Switcher in Header */}
          <CurrencySelector />

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="p-2.5 bg-gray-900/80 hover:bg-gray-800 border border-gray-700/80 text-gray-300 hover:text-white rounded-xl active:scale-95 transition-all shadow-sm"
            title="Manage Categories"
          >
            <Tags className="w-4 h-4" />
          </button>

          {/* Interactive Fixed Refresh Button */}
          <button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className={`p-2.5 bg-gray-900/80 hover:bg-gray-800 border border-gray-700/80 rounded-xl active:scale-95 transition-all shadow-sm ${
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

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart data={charts?.pie_chart || []} loading={loadingCharts} />
        <SpendTrendChart data={charts?.trend_chart || []} loading={loadingCharts} />
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MonthComparisonCard comparison={comparison} loading={loadingComparison} />
        <TopCategoriesList categories={topCategories || []} loading={loadingTopCat} />
        <AverageSpendCard avgSpend={averageSpend} loading={loadingAvgSpend} />
      </div>

      {/* Recent Transactions Snapshot */}
      <RecentExpenses expenses={summary?.recent_expenses || []} loading={loadingSummary} />

      {/* Modals */}
      {isExpenseModalOpen && (
        <ExpenseForm
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
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
