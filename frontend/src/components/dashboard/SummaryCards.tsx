"use client";

import React from "react";
import { DashboardSummary } from "@/types/dashboard";
import { IndianRupee, Hash, Target } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface Props {
  summary?: DashboardSummary;
  loading: boolean;
}

export default function SummaryCards({ summary, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 glass-card rounded-2xl animate-pulse p-4" />
        ))}
      </div>
    );
  }

  const totalSpend = summary?.total_spent ?? 0;
  const count = summary?.recent_expenses?.length ?? 0;
  const budgetLimit = summary?.budget_status?.amount_limit;

  const cards = [
    {
      title: "Total Spend",
      value: `₹${formatCurrency(totalSpend)}`,
      subtitle: `${summary?.period || "month"} period total`,
      icon: IndianRupee,
      color: "from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30",
    },
    {
      title: "Recent Transactions",
      value: formatNumber(count),
      subtitle: "Expenses logged in period",
      icon: Hash,
      color: "from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/30",
    },
    {
      title: "Active Budget Goal",
      value: budgetLimit && budgetLimit > 0 ? `₹${formatCurrency(budgetLimit, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "Not Set",
      subtitle: budgetLimit && budgetLimit > 0 ? "Configured limit" : "Set goal in settings",
      icon: Target,
      color: "from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
            className={`glass-card p-5 rounded-2xl border bg-gradient-to-br ${card.color} flex flex-col justify-between relative overflow-hidden`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className="p-2 rounded-xl bg-surface/60 border border-gray-700/40">
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-2xl font-bold text-white tracking-tight">{card.value}</h3>
              <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
