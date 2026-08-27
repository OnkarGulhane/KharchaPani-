"use client";

import React from "react";
import { DashboardSummary } from "@/types/dashboard";
import { IndianRupee, Hash, Target, Sparkles } from "lucide-react";
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
          <div key={i} className="h-32 glass-card rounded-2xl animate-pulse p-5" />
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
      subtitle: `${summary?.period ? summary.period.toUpperCase() : "MONTH"} Period Total`,
      icon: IndianRupee,
      gradient: "from-emerald-500/20 via-emerald-600/10 to-transparent",
      accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      glow: "group-hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]",
    },
    {
      title: "Transactions Logged",
      value: formatNumber(count),
      subtitle: "Expenses in active period",
      icon: Hash,
      gradient: "from-blue-500/20 via-blue-600/10 to-transparent",
      accent: "text-blue-400 border-blue-500/30 bg-blue-500/10",
      glow: "group-hover:shadow-[0_0_25px_rgba(59,130,246,0.15)]",
    },
    {
      title: "Active Budget Goal",
      value:
        budgetLimit && budgetLimit > 0
          ? `₹${formatCurrency(budgetLimit, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
          : "Not Set",
      subtitle: budgetLimit && budgetLimit > 0 ? "Configured limit" : "Set goal in settings",
      icon: Target,
      gradient: "from-purple-500/20 via-purple-600/10 to-transparent",
      accent: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      glow: "group-hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            className={`glass-card p-5 rounded-2xl border border-gray-800/80 bg-gradient-to-br ${card.gradient} flex flex-col justify-between relative overflow-hidden group cursor-pointer ${card.glow} transition-all duration-300`}
          >
            {/* Top Row */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-xl border ${card.accent} shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                {card.value}
              </h3>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3 text-gray-500" />
                {card.subtitle}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
