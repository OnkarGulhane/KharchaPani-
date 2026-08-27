"use client";

import React from "react";
import { TopCategory } from "@/types/dashboard";
import { Trophy } from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { motion } from "framer-motion";
import ThreeDTiltCard from "@/components/ui/ThreeDTiltCard";

interface Props {
  categories: TopCategory[];
  loading: boolean;
}

export default function TopCategoriesList({ categories, loading }: Props) {
  const { formatAmount } = useCurrency();

  if (loading) {
    return <div className="h-44 glass-card rounded-2xl animate-pulse p-5" />;
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="glass-card p-5 rounded-2xl border border-gray-800 flex flex-col items-center justify-center text-center h-full min-h-[160px]">
        <Trophy className="w-6 h-6 text-gray-600 mb-2" />
        <p className="text-sm font-bold text-gray-400">No Top Categories</p>
        <p className="text-xs text-gray-500 mt-0.5">Rankings appear once expenses are logged.</p>
      </div>
    );
  }

  const maxSpend = Math.max(...categories.map((c) => c.total_amount || 0), 1);

  return (
    <ThreeDTiltCard intensity={10} glareOpacity={0.15}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 rounded-2xl border border-gray-800/80 shadow-xl flex flex-col justify-between group hover:border-gray-700/80 transition-all duration-300 h-full min-h-[160px]"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <Trophy className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
            Top Spending Categories
          </h3>
        </div>

        <div className="space-y-3">
          {categories.slice(0, 3).map((cat, idx) => {
            const amt = cat.total_amount || 0;
            const pct = Math.round((amt / maxSpend) * 100);
            return (
              <div key={cat.category_id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 font-bold flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gray-800 text-[10px] flex items-center justify-center font-bold text-emerald-400 border border-gray-700">
                      {idx + 1}
                    </span>
                    {cat.category_name}
                  </span>
                  <span className="text-white font-bold font-mono">
                    {formatAmount(amt, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-950 rounded-full overflow-hidden border border-gray-800/80 p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </ThreeDTiltCard>
  );
}
