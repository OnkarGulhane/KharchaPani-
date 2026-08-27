"use client";

import React from "react";
import { Expense } from "@/types/expense";
import { ArrowRight, Receipt, CreditCard, Wallet, Banknote } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

interface Props {
  expenses: Expense[];
  loading: boolean;
}

export default function RecentExpenses({ expenses, loading }: Props) {
  if (loading) {
    return <div className="h-64 glass-panel rounded-2xl animate-pulse p-6" />;
  }

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="glass-panel p-6 rounded-2xl border border-gray-800/90 shadow-xl flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">Recent Transactions</h3>
          <p className="text-xs text-gray-400 mt-0.5">Latest expenses logged into your account</p>
        </div>
        <Link
          href="/expenses"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/60 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-all group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {!expenses || expenses.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
          <div className="w-12 h-12 rounded-2xl bg-gray-800/60 border border-gray-700/60 flex items-center justify-center text-gray-500 mb-3 shadow-inner">
            <Receipt className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-gray-300">No Recent Expenses</p>
          <p className="text-xs text-gray-500 mt-1 max-w-xs">
            Start tracking by clicking "Add Expense" above.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {expenses.slice(0, 5).map((expense, idx) => {
            const catName = expense.category?.name || (expense as any).category_name || "Uncategorized";
            return (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                className="flex items-center justify-between p-3.5 rounded-xl bg-gray-900/50 border border-gray-800/80 hover:border-gray-700 hover:bg-gray-800/40 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/5 border border-emerald-500/25 flex items-center justify-center text-emerald-400 text-xs font-bold uppercase shadow-sm group-hover:scale-105 transition-transform">
                    {catName.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide group-hover:text-emerald-300 transition-colors">
                      {expense.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                      <span>{catName}</span>
                      <span>•</span>
                      <span>{expense.date}</span>
                      {expense.payment_mode && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold text-gray-400">
                            {getPaymentIcon(expense.payment_mode)}
                            {expense.payment_mode}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-sm font-bold text-emerald-400 font-mono tracking-tight group-hover:text-emerald-300">
                  -₹{formatCurrency(expense.amount)}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
