"use client";

import React from "react";
import { AverageSpend } from "@/types/dashboard";
import { Calculator } from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { motion } from "framer-motion";
import ThreeDTiltCard from "@/components/ui/ThreeDTiltCard";

interface Props {
  avgSpend?: AverageSpend | null;
  loading: boolean;
}

export default function AverageSpendCard({ avgSpend, loading }: Props) {
  const { formatAmount } = useCurrency();

  if (loading) {
    return <div className="h-44 glass-card rounded-2xl animate-pulse p-5" />;
  }

  const perDay = avgSpend?.average_daily_spend;
  const perWeek = avgSpend?.average_weekly_spend;

  return (
    <ThreeDTiltCard intensity={10} glareOpacity={0.15}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 rounded-2xl border border-gray-800/80 shadow-xl flex flex-col justify-between group hover:border-gray-700/80 transition-all duration-300 h-full min-h-[160px]"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
            Normalized Average Spend
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <Calculator className="w-4 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-3 pt-3 border-t border-gray-800/80">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 block truncate">Daily Average</span>
            <p className="text-base sm:text-lg lg:text-xl font-extrabold text-white font-mono truncate">
              {formatAmount(perDay, { maximumFractionDigits: 1 })}
            </p>
            <span className="text-[9px] sm:text-[10px] text-emerald-400/80 font-medium block truncate">Per active cycle day</span>
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 block truncate">Weekly Pace</span>
            <p className="text-base sm:text-lg lg:text-xl font-extrabold text-white font-mono truncate">
              {formatAmount(perWeek, { maximumFractionDigits: 1 })}
            </p>
            <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium block truncate">7-day normalized</span>
          </div>
        </div>
      </motion.div>
    </ThreeDTiltCard>
  );
}
