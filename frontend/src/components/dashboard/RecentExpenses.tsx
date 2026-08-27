"use client";

import React from "react";
import { Expense } from "@/types/expense";
import { ArrowRight, Receipt } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Props {
  expenses: Expense[];
  loading: boolean;
}

export default function RecentExpenses({ expenses, loading }: Props) {
  if (loading) {
    return <div className="h-64 glass-panel rounded-2xl animate-pulse p-4" />;
  }

  return (
    <div className="glass-panel p-5 rounded-2xl border border-gray-800 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
        <Link
          href="/expenses"
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {!expenses || expenses.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <Receipt className="w-8 h-8 text-gray-600 mb-2" />
          <p className="text-sm font-semibold text-gray-400">No Recent Expenses</p>
          <p className="text-xs text-gray-500 mt-1">Start by adding an expense in the Expenses tab.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-gray-800/80 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold uppercase">
                  {(expense.category?.name || (expense as any).category_name || "EX").slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">{expense.title}</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {expense.category?.name || (expense as any).category_name || "Uncategorized"} • {expense.date}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                -₹{formatCurrency(expense.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
