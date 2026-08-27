"use client";

import React from "react";
import { Expense } from "@/types/expense";
import { PaginatedData } from "@/types/api";
import { deleteExpense } from "@/lib/api/expenses";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Edit2, Trash2, Calendar, CreditCard, ChevronLeft, ChevronRight, Receipt } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "@/lib/animations/variants";

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
  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete expense "${title}"?`)) return;
    try {
      await deleteExpense(id);
      toast.success(`Expense "${title}" deleted`);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete expense");
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 glass-card rounded-xl animate-pulse" />
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
      <div className="glass-panel p-12 rounded-2xl border border-gray-800 flex flex-col items-center justify-center text-center">
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
      <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-surface/80 uppercase text-[10px] text-gray-400 font-bold tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
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
                    className="hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div>
                        <span>{exp.title}</span>
                        {exp.notes && <p className="text-[11px] text-gray-400 font-normal">{exp.notes}</p>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {exp.category?.name || (exp as any).category_name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 font-mono">{exp.date}</td>
                    <td className="py-3.5 px-4 text-gray-400">{exp.payment_mode || "UPI"}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400 font-mono text-sm">
                      ₹{formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(exp)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/60 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id, exp.title)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
                className="p-4 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{exp.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {exp.category?.name || (exp as any).category_name || "Uncategorized"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {exp.date} • {exp.payment_mode || "UPI"}
                  </p>
                  {exp.notes && <p className="text-xs text-gray-500 italic">{exp.notes}</p>}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-emerald-400 font-mono text-sm">
                    ₹{formatCurrency(exp.amount)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(exp)}
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id, exp.title)}
                      className="p-1 text-gray-400 hover:text-red-400"
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
        <div className="flex items-center justify-between pt-2 px-1">
          <span className="text-xs text-gray-400">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} expenses
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-xl bg-surface border border-gray-800 text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-semibold text-gray-300">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={!paginatedData?.has_next}
              className="p-2 rounded-xl bg-surface border border-gray-800 text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
