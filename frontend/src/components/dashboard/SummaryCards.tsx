"use client";

import React from "react";
import { DashboardSummary } from "@/types/dashboard";
import { Coins, Hash, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { formatNumber } from "@/lib/utils";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import ThreeDTiltCard from "@/components/ui/ThreeDTiltCard";

interface Props {
  summary?: DashboardSummary;
  loading: boolean;
}

export default function SummaryCards({ summary, loading }: Props) {
  const { formatAmount } = useCurrency();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 glass-card rounded-2xl animate-pulse p-5" />
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
      value: formatAmount(totalSpend),
      subtitle: `${summary?.period ? summary.period.toUpperCase() : "MONTH"} Period Total`,
      icon: Coins,
      gradient: "from-emerald-500/20 via-emerald-600/10 to-transparent",
      accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
      badge: "Active Cycle",
      badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
    {
      title: "Transactions Logged",
      value: formatNumber(count),
      subtitle: "Expenses in active period",
      icon: Hash,
      gradient: "from-blue-500/20 via-blue-600/10 to-transparent",
      accent: "text-blue-400 border-blue-500/30 bg-blue-500/15 shadow-[0_0_15px_rgba(59,130,246,0.2)]",
      badge: "Real-time",
      badgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    },
    {
      title: "Active Budget Goal",
      value:
        budgetLimit && budgetLimit > 0
          ? formatAmount(budgetLimit, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
          : "Not Set",
      subtitle: budgetLimit && budgetLimit > 0 ? "Target Spending Cap" : "Click to set monthly goal",
      icon: Target,
      gradient: "from-purple-500/20 via-purple-600/10 to-transparent",
      accent: "text-purple-400 border-purple-500/30 bg-purple-500/15 shadow-[0_0_15px_rgba(168,85,247,0.2)]",
      badge: budgetLimit && budgetLimit > 0 ? "Configured" : "Action Needed",
      badgeColor:
        budgetLimit && budgetLimit > 0
          ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
          : "bg-amber-500/15 text-amber-300 border-amber-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <ThreeDTiltCard key={card.title} intensity={14} glareOpacity={0.2}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className={`glass-card p-5 rounded-2xl border border-gray-800/80 bg-gradient-to-br ${card.gradient} flex flex-col justify-between relative overflow-hidden group cursor-pointer h-full min-h-[140px]`}
            >
              {/* Top Row */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                  <div className={`p-2.5 rounded-xl border ${card.accent} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="mt-4">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight group-hover:text-emerald-300 transition-colors font-mono">
                  {card.value}
                </h3>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                  {card.subtitle}
                </p>
              </div>
            </motion.div>
          </ThreeDTiltCard>
        );
      })}
    </div>
  );
}
