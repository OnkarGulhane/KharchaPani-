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

import { Plus, Target, Tags, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodType>("month");
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

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

  const handleRefreshAll = () => {
    queryClient.invalidateQueries();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-gray-400 mt-1">Real-time spend analytics, charts, and budget status.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ReportPeriodSelector period={period} onChange={setPeriod} />

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="p-2 bg-surface hover:bg-gray-800 border border-gray-700 text-gray-300 rounded-xl transition-all"
            title="Manage Categories"
          >
            <Tags className="w-4 h-4" />
          </button>

          <button
            onClick={handleRefreshAll}
            className="p-2 bg-surface hover:bg-gray-800 border border-gray-700 text-gray-400 hover:text-white rounded-xl transition-all"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
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
    </div>
  );
}
