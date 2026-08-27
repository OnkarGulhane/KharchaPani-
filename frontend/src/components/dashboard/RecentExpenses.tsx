"use client";

import React from "react";
import { Expense } from "@/types/expense";
import { ArrowRight, Receipt, CreditCard, Wallet, Banknote, Calendar } from "lucide-react";
import Link from "next/link";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { motion } from "framer-motion";

interface Props {
  expenses: Expense[];
  loading: boolean;
}

export default function RecentExpenses({ expenses, loading }: Props) {
  const { formatAmount } = useCurrency();

  if (loading) {
    return <div className="h-64 glass-panel rounded-2xl animate-pulse p-6" />;
  }

  const getPaymentIcon = (mode?: string | null) => {
    switch (mode?.toLowerCase()) {
      case "upi":
      case "online":
        return <Wallet className="w-3.5 h-3.5 text-emerald-400" />;
      case "card":
      case "credit":
      case "debit":
        return <CreditCard className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Banknote className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="glass-panel p-6 rounded-3xl border border-gray-800/90 shadow-2xl flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <span>Recent Transactions</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Latest expenses logged into your account</p>
        </div>
        <Link
          href="/expenses"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-800/90 hover:bg-gray-700/90 border border-gray-700/70 text-xs font-extrabold text-emerald-400 hover:text-emerald-300 transition-all group shadow-sm active:scale-95"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {!expenses || expenses.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-gray-800/60 border border-gray-700/60 flex items-center justify-center text-gray-500 mb-3 shadow-inner">
            <Receipt className="w-7 h-7" />
          </div>
          <p className="text-base font-bold text-gray-300">No Recent Expenses</p>
          <p className="text-xs text-gray-500 mt-1 max-w-xs">
            Start logging your purchases to see real-time transaction records.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {expenses.slice(0, 5).map((expense, idx) => {
            const catName = expense.category?.name || (expense as any).category_name || "Uncategorized";
            return (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800/80 hover:border-emerald-500/40 hover:bg-gray-800/50 transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-center justify-center text-emerald-300 text-xs font-extrabold uppercase shadow-sm group-hover:scale-105 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-all">
                    {catName.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-wide group-hover:text-emerald-300 transition-colors">
                      {expense.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                      <span className="font-semibold text-gray-300">{catName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        {expense.date}
                      </span>
                      {expense.payment_mode && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-[11px] uppercase font-bold text-gray-400">
                            {getPaymentIcon(expense.payment_mode)}
                            {expense.payment_mode}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold text-emerald-400 font-mono tracking-tight group-hover:text-emerald-300">
                    -{formatAmount(expense.amount)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
