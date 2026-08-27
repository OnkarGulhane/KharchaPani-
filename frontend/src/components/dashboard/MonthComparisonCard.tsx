"use client";

import React from "react";
import { PeriodComparison } from "@/types/dashboard";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Props {
  comparison?: PeriodComparison | null;
  loading: boolean;
}

export default function MonthComparisonCard({ comparison, loading }: Props) {
  if (loading) {
    return <div className="h-32 glass-card rounded-2xl animate-pulse p-4" />;
  }

  const curr = comparison?.current_period_total ?? 0;
  const prev = comparison?.previous_period_total ?? 0;
  const pct = comparison?.percentage_change ?? 0;
  const isUp = comparison?.is_increase ?? false;

  return (
    <div className="glass-card p-5 rounded-2xl border border-gray-800 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Period Comparison (MoM)
        </span>
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
            isUp
              ? "bg-red-500/10 text-red-400 border-red-500/20"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          }`}
        >
          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{pct > 0 ? `+${pct}%` : `${pct}%`}</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-white">₹{formatCurrency(curr, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          <span className="text-xs text-gray-400">vs prev ₹{formatCurrency(prev, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {isUp ? "Spend increased compared to previous period" : "Great! Spend decreased compared to previous period"}
        </p>
      </div>
    </div>
  );
}
