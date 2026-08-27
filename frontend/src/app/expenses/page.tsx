"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getExpenses } from "@/lib/api/expenses";
import { getCategories } from "@/lib/api/categories";
import { Expense, ExpenseFilterParams } from "@/types/expense";

import ExpenseFilters from "@/components/expenses/ExpenseFilters";
import ExpenseList from "@/components/expenses/ExpenseList";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import CategoryManager from "@/components/categories/CategoryManager";
import CurrencySelector from "@/components/common/CurrencySelector";

import { Plus, Tags, RefreshCw, Receipt } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [filters, setFilters] = useState<ExpenseFilterParams>({
    page: 1,
    page_size: 20,
    sort_by: "date",
    order: "desc",
  });

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedExpenseToEdit, setSelectedExpenseToEdit] = useState<Expense | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const {
    data: paginatedExpenses,
    isLoading: loadingExpenses,
    refetch: refetchExpenses,
  } = useQuery({
    queryKey: ["expenses", filters],
    queryFn: () => getExpenses(filters),
  });

  const handleRefreshAll = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchExpenses(),
        queryClient.invalidateQueries({ queryKey: ["expenses"] }),
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
      ]);
      toast.success("Expense records refreshed! ✨");
    } catch {
      toast.error("Failed to refresh expenses");
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      page_size: 20,
      sort_by: "date",
      order: "desc",
    });
  };

  const handleEditClick = (expense: Expense) => {
    setSelectedExpenseToEdit(expense);
    setIsExpenseModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedExpenseToEdit(null);
    setIsExpenseModalOpen(true);
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
              Expenses & Categories
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              <Receipt className="w-3.5 h-3.5" />
              Transactions
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Log transactions, search, filter, and manage custom categories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <div className="hidden md:block">
            <CurrencySelector />
          </div>

          <button
            onClick={handleCreateClick}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all whitespace-nowrap min-h-[36px]"
          >
            <Plus className="w-4 h-4" />
            <span>Log Expense</span>
          </button>

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-gray-900/80 hover:bg-gray-800 border border-gray-700/80 text-gray-200 font-extrabold text-xs rounded-xl active:scale-95 transition-all shadow-sm whitespace-nowrap min-h-[36px]"
          >
            <Tags className="w-4 h-4 text-emerald-400" />
            <span>Categories</span>
          </button>

          <button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className={`p-2 sm:p-2.5 bg-gray-900/80 hover:bg-gray-800 border border-gray-700/80 rounded-xl active:scale-95 transition-all shadow-sm flex-shrink-0 ${
              isRefreshing
                ? "text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-wait"
                : "text-gray-400 hover:text-white"
            }`}
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Multi-Filters Bar */}
      <ExpenseFilters
        filters={filters}
        categories={categories}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Expense List */}
      <ExpenseList
        paginatedData={paginatedExpenses}
        loading={loadingExpenses}
        onEdit={handleEditClick}
        onRefresh={handleRefreshAll}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />

      {/* Modals */}
      {isExpenseModalOpen && (
        <ExpenseForm
          isOpen={isExpenseModalOpen}
          expenseToEdit={selectedExpenseToEdit}
          onClose={() => {
            setIsExpenseModalOpen(false);
            setSelectedExpenseToEdit(null);
          }}
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
