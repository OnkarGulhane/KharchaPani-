"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getExpenses } from "@/lib/api/expenses";
import { getCategories } from "@/lib/api/categories";
import { Expense, ExpenseFilterParams } from "@/types/expense";

import ExpenseFilters from "@/components/expenses/ExpenseFilters";
import ExpenseList from "@/components/expenses/ExpenseList";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import QuickAddModal from "@/components/expenses/QuickAddModal";
import { VoiceExpenseModal } from "@/components/expenses/VoiceExpenseModal";
import { ReceiptScanModal } from "@/components/expenses/ReceiptScanModal";
import CategoryManager from "@/components/categories/CategoryManager";
import CurrencySelector from "@/components/common/CurrencySelector";

import { Plus, Tags, RefreshCw, Receipt, Sparkles, Camera, Mic } from "lucide-react";
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
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [quickAddInitialData, setQuickAddInitialData] = useState<any>(null);
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
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-extrabold text-xs rounded-xl shadow-md shadow-amber-500/10 active:scale-95 transition-all whitespace-nowrap min-h-[36px]"
            title="बोली खर्चा - Voice-to-Expense in Marathi, Hindi, or English"
          >
            <Mic className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>बोली खर्चा</span>
          </button>

          <button
            onClick={() => {
              setQuickAddInitialData(null);
              setIsQuickAddModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all whitespace-nowrap min-h-[36px]"
            title="Quick Add with Voice or Natural Language AI"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>AI Quick Add</span>
          </button>

          <button
            onClick={() => setIsReceiptModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-teal-500/20 active:scale-95 transition-all whitespace-nowrap min-h-[36px]"
            title="Scan Receipt with Multimodal Vision AI"
          >
            <Camera className="w-4 h-4 text-emerald-200" />
            <span>AI Scan Receipt</span>
          </button>

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
            className={`p-2 bg-gray-900/80 hover:bg-gray-800 border border-gray-700/80 text-gray-200 rounded-xl active:scale-95 transition-all shadow-sm flex items-center justify-center min-h-[36px] min-w-[36px] ${
              isRefreshing ? "cursor-wait opacity-80" : ""
            }`}
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <ExpenseFilters
        filters={filters}
        categories={categories}
        onChange={(newFilters) => setFilters(newFilters)}
        onReset={handleResetFilters}
      />

      {/* Expense List Table */}
      <ExpenseList
        paginatedData={paginatedExpenses}
        loading={loadingExpenses}
        onEdit={handleEditClick}
        onRefresh={handleRefreshAll}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />

      {/* Modals */}
      {isVoiceModalOpen && (
        <VoiceExpenseModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onExpenseCreated={handleRefreshAll}
          onOpenFullForm={(parsedData) => {
            setQuickAddInitialData(parsedData);
            setSelectedExpenseToEdit(null);
            setIsExpenseModalOpen(true);
          }}
        />
      )}
      {isReceiptModalOpen && (
        <ReceiptScanModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          onExpenseCreated={handleRefreshAll}
          onPreFillExpense={(parsedData) => {
            setQuickAddInitialData(parsedData);
            setSelectedExpenseToEdit(null);
            setIsExpenseModalOpen(true);
          }}
        />
      )}

      {isQuickAddModalOpen && (
        <QuickAddModal
          isOpen={isQuickAddModalOpen}
          onClose={() => setIsQuickAddModalOpen(false)}
          onSuccess={handleRefreshAll}
          onOpenFullFormWithData={(parsedData) => {
            setQuickAddInitialData(parsedData);
            setSelectedExpenseToEdit(null);
            setIsExpenseModalOpen(true);
          }}
        />
      )}

      {isExpenseModalOpen && (
        <ExpenseForm
          isOpen={isExpenseModalOpen}
          expenseToEdit={selectedExpenseToEdit}
          initialData={quickAddInitialData}
          onClose={() => {
            setIsExpenseModalOpen(false);
            setSelectedExpenseToEdit(null);
            setQuickAddInitialData(null);
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
