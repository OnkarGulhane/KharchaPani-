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

import { Plus, Tags, RefreshCw } from "lucide-react";

export default function ExpensesPage() {
  const queryClient = useQueryClient();

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

  const handleRefreshAll = () => {
    queryClient.invalidateQueries();
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Expenses & Categories
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Log transactions, search, filter, and manage custom categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Expense</span>
          </button>

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-gray-800 border border-gray-700 text-gray-200 font-semibold text-xs rounded-xl transition-all"
          >
            <Tags className="w-4 h-4 text-emerald-400" />
            <span>Manage Categories</span>
          </button>

          <button
            onClick={handleRefreshAll}
            className="p-2.5 bg-surface hover:bg-gray-800 border border-gray-700 text-gray-400 hover:text-white rounded-xl transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
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
    </div>
  );
}
