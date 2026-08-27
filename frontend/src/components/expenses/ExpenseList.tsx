"use client";

import React, { useState } from "react";
import { Expense } from "@/types/expense";
import { PaginatedData } from "@/types/api";
import { deleteExpense } from "@/lib/api/expenses";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { toast } from "sonner";
import { Edit2, Trash2, Calendar, CreditCard, ChevronLeft, ChevronRight, Receipt, Wallet, Banknote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "@/lib/animations/variants";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";

interface Props {
  paginatedData?: PaginatedData<Expense> | null;
  loading: boolean;
  onEdit: (expense: Expense) => void;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
}

export default function ExpenseList({
  paginatedData,
  loading,
  onEdit,
  onRefresh,
  onPageChange,
}: Props) {
  const { formatAmount } = useCurrency();
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteAction = async () => {
    if (!expenseToDelete) return;
    setIsDeleting(true);
    try {
      await deleteExpense(expenseToDelete.id);
      toast.success(`Expense "${expenseToDelete.title}" deleted!`);
      setExpenseToDelete(null);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete expense");
    } finally {
      setIsDeleting(false);
    }
  };

  const getPaymentIcon = (mode?: string | null) => {
    switch (mode?.toLowerCase()) {
      case "upi":
      case "online":
        return <Wallet className="w-3 h-3 text-emerald-400" />;
      case "card":
      case "credit":
      case "debit":
        return <CreditCard className="w-3 h-3 text-blue-400" />;
      default:
        return <Banknote className="w-3 h-3 text-amber-400" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 glass-card rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const items = paginatedData?.items || [];
  const total = paginatedData?.total || 0;
  const page = paginatedData?.page || 1;
  const pageSize = paginatedData?.page_size || 20;
  const totalPages = Math.ceil(total / pageSize);

  if (items.length === 0) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-gray-800 flex flex-col items-center justify-center text-center">
        <Receipt className="w-12 h-12 text-gray-600 mb-3" />
        <h4 className="text-base font-bold text-gray-300">No Expenses Found</h4>
        <p className="text-xs text-gray-500 mt-1 max-w-sm">
          No matching transactions recorded. Try adjusting your search query or filters, or log a new expense.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass-panel rounded-3xl border border-gray-800/90 shadow-xl overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 uppercase text-[10px] text-gray-400 font-extrabold tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-4 px-5">Title</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Payment</th>
                <th className="py-4 px-5 text-right">Amount</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              <AnimatePresence mode="popLayout">
                {items.map((exp) => (
                  <motion.tr
                    key={exp.id}
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="hover:bg-gray-800/40 transition-colors group"
                  >
                    <td className="py-4 px-5 font-bold text-white">
                      <div>
                        <span className="text-sm group-hover:text-emerald-300 transition-colors">{exp.title}</span>
                        {exp.notes && <p className="text-[11px] text-gray-400 font-normal mt-0.5">{exp.notes}</p>}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-sm">
                        {exp.category?.name || (exp as any).category_name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400 font-mono text-xs">{exp.date}</td>
                    <td className="py-4 px-4 text-gray-300">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                        {getPaymentIcon(exp.payment_mode)}
                        {exp.payment_mode || "UPI"}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right font-extrabold text-emerald-400 font-mono text-sm group-hover:text-emerald-300">
                      {formatAmount(exp.amount)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEdit(exp)}
                          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700/60 transition-all active:scale-95"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setExpenseToDelete(exp)}
                          className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/15 transition-all active:scale-95"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-gray-800">
          <AnimatePresence mode="popLayout">
            {items.map((exp) => (
              <motion.div
                key={exp.id}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-gray-800/30 transition-colors"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-white truncate max-w-[170px] xs:max-w-[220px] sm:max-w-none">{exp.title}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0 truncate max-w-[110px]">
                      {exp.category?.name || (exp as any).category_name || "Uncategorized"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5 flex-wrap">
                    <span>{exp.date}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 flex-shrink-0">
                      {getPaymentIcon(exp.payment_mode)}
                      {exp.payment_mode || "UPI"}
                    </span>
                  </p>
                  {exp.notes && <p className="text-xs text-gray-500 italic truncate max-w-[260px]">{exp.notes}</p>}
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="font-extrabold text-emerald-400 font-mono text-sm sm:text-base">
                    {formatAmount(exp.amount)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(exp)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                      title="Edit expense"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setExpenseToDelete(exp)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 px-1">
          <span className="text-xs text-gray-400 text-center sm:text-left">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} expenses
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-40 transition-colors active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-gray-300 font-mono px-2">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={!paginatedData?.has_next}
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-40 transition-colors active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3D Delete Confirmation Modal */}
      {expenseToDelete && (
        <ConfirmDeleteModal
          isOpen={!!expenseToDelete}
          title="Delete Expense Entry?"
          description="Are you sure you want to permanently delete this expense? This transaction will be removed from your timeline and spending analytics."
          itemDetails={`"${expenseToDelete.title}" — ${formatAmount(expenseToDelete.amount)} (${expenseToDelete.date})`}
          isDeleting={isDeleting}
          onConfirm={confirmDeleteAction}
          onCancel={() => setExpenseToDelete(null)}
        />
      )}
    </div>
  );
}
