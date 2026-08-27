"use client";

import React from "react";
import { AverageSpend } from "@/types/dashboard";
import { Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Props {
  avgSpend?: AverageSpend | null;
  loading: boolean;
}

export default function AverageSpendCard({ avgSpend, loading }: Props) {
  if (loading) {
    return <div className="h-32 glass-card rounded-2xl animate-pulse p-4" />;
  }

  const perDay = avgSpend?.average_daily_spend;
  const perWeek = avgSpend?.average_weekly_spend;

  return (
    <div className="glass-card p-5 rounded-2xl border border-gray-800 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Normalized Average Spend
        </span>
        <div className="p-2 rounded-xl bg-surface/60 border border-gray-700/40 text-emerald-400">
          <Calculator className="w-4 h-4" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-3 pt-2 border-t border-gray-800/60">
        <div>
          <span className="text-xs text-gray-400">Daily Avg</span>
          <p className="text-lg font-bold text-white mt-0.5">₹{formatCurrency(perDay, { maximumFractionDigits: 1 })}</p>
        </div>
        <div>
          <span className="text-xs text-gray-400">Weekly Avg</span>
          <p className="text-lg font-bold text-white mt-0.5">₹{formatCurrency(perWeek, { maximumFractionDigits: 1 })}</p>
        </div>
      </div>
    </div>
  );
}
