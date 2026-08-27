"use client";

import React from "react";
import { AverageSpend } from "@/types/dashboard";
import { Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

interface Props {
  avgSpend?: AverageSpend | null;
  loading: boolean;
}

export default function AverageSpendCard({ avgSpend, loading }: Props) {
  if (loading) {
    return <div className="h-40 glass-card rounded-2xl animate-pulse p-5" />;
  }

  const perDay = avgSpend?.average_daily_spend;
  const perWeek = avgSpend?.average_weekly_spend;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="glass-card p-5 rounded-2xl border border-gray-800/80 shadow-lg flex flex-col justify-between group hover:border-gray-700/80 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          Normalized Average Spend
        </span>
        <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
          <Calculator className="w-4 h-4" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-800/80">
        <div className="space-y-0.5">
          <span className="text-[11px] font-medium text-gray-400">Daily Average</span>
          <p className="text-xl font-extrabold text-white">
            ₹{formatCurrency(perDay, { maximumFractionDigits: 1 })}
          </p>
          <span className="text-[10px] text-gray-500">Per active day</span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[11px] font-medium text-gray-400">Weekly Average</span>
          <p className="text-xl font-extrabold text-white">
            ₹{formatCurrency(perWeek, { maximumFractionDigits: 1 })}
          </p>
          <span className="text-[10px] text-gray-500">7-day estimate</span>
        </div>
      </div>
    </motion.div>
  );
}
