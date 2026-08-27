"use client";

import React from "react";
import { PeriodComparison } from "@/types/dashboard";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { motion } from "framer-motion";
import ThreeDTiltCard from "@/components/ui/ThreeDTiltCard";

interface Props {
  comparison?: PeriodComparison | null;
  loading: boolean;
}

export default function MonthComparisonCard({ comparison, loading }: Props) {
  const { formatAmount } = useCurrency();

  if (loading) {
    return <div className="h-44 glass-card rounded-2xl animate-pulse p-5" />;
  }

  const curr = comparison?.current_period_total ?? 0;
  const prev = comparison?.previous_period_total ?? 0;
  const pct = comparison?.percentage_change ?? 0;
  const isUp = comparison?.is_increase ?? false;

  return (
    <ThreeDTiltCard intensity={10} glareOpacity={0.15}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 rounded-2xl border border-gray-800/80 shadow-xl flex flex-col justify-between group hover:border-gray-700/80 transition-all duration-300 relative overflow-hidden h-full min-h-[160px]"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
            Period Comparison (MoM)
          </span>
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border shadow-sm ${
              isUp
                ? "bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]"
                : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            }`}
          >
            {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{pct > 0 ? `+${pct}%` : `${pct}%`}</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-extrabold text-white font-mono">
              {formatAmount(curr, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              vs prev {formatAmount(prev, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2 font-medium leading-relaxed">
            {isUp
              ? "⚠️ Spending increased compared to previous cycle."
              : "✨ Great pace! Spending is under control vs last cycle."}
          </p>
        </div>
      </motion.div>
    </ThreeDTiltCard>
  );
}
