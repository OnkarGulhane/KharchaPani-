"use client";

import React from "react";
import { TopCategory } from "@/types/dashboard";
import { Trophy } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Props {
  categories: TopCategory[];
  loading: boolean;
}

export default function TopCategoriesList({ categories, loading }: Props) {
  if (loading) {
    return <div className="h-44 glass-card rounded-2xl animate-pulse p-4" />;
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="glass-card p-5 rounded-2xl border border-gray-800 flex flex-col items-center justify-center text-center">
        <p className="text-sm font-semibold text-gray-400">No Top Categories</p>
      </div>
    );
  }

  const maxSpend = Math.max(...categories.map((c) => c.total_amount || 0), 1);

  return (
    <div className="glass-card p-5 rounded-2xl border border-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-bold text-white">Top Spending Categories</h3>
      </div>

      <div className="space-y-3">
        {categories.map((cat, idx) => {
          const amt = cat.total_amount || 0;
          const pct = Math.round((amt / maxSpend) * 100);
          return (
            <div key={cat.category_id} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-gray-300 font-semibold">
                  #{idx + 1} {cat.category_name}
                </span>
                <span className="text-white font-bold">₹{formatCurrency(amt, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-gray-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
