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
import CategoryPieChart from "@/components/dashboard/CategoryPieChart";
import SpendTrendChart from "@/components/dashboard/SpendTrendChart";
import MonthComparisonCard from "@/components/dashboard/MonthComparisonCard";
import TopCategoriesList from "@/components/dashboard/TopCategoriesList";
import AverageSpendCard from "@/components/dashboard/AverageSpendCard";
import RecentExpenses from "@/components/dashboard/RecentExpenses";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import BudgetForm from "@/components/budget/BudgetForm";
import CategoryManager from "@/components/categories/CategoryManager";

import { Plus, Tags, RefreshCw, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 600);
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
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Overview
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
              <Sparkles className="w-3 h-3" />
              Live
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Real-time financial analytics, timeline trend breakdown, and budget goals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <ReportPeriodSelector period={period} onChange={setPeriod} />

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
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

          <button
            onClick={handleRefreshAll}
            className={`p-2.5 bg-gray-900/80 hover:bg-gray-800 border border-gray-700/80 text-gray-400 hover:text-white rounded-xl active:scale-95 transition-all shadow-sm ${
              isRefreshing ? "text-emerald-400" : ""
            }`}
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={summary} loading={loadingSummary} />

      {/* Live Budget Goal Banner */}
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
