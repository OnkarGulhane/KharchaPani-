"use client";

import React from "react";
import { TopCategory } from "@/types/dashboard";
import { Trophy } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

interface Props {
  categories: TopCategory[];
  loading: boolean;
}

export default function TopCategoriesList({ categories, loading }: Props) {
  if (loading) {
    return <div className="h-40 glass-card rounded-2xl animate-pulse p-5" />;
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="glass-card p-5 rounded-2xl border border-gray-800 flex flex-col items-center justify-center text-center">
        <Trophy className="w-6 h-6 text-gray-600 mb-2" />
        <p className="text-sm font-semibold text-gray-400">No Top Categories</p>
        <p className="text-xs text-gray-500 mt-0.5">Rankings will appear once expenses are logged.</p>
      </div>
    );
  }

  const maxSpend = Math.max(...categories.map((c) => c.total_amount || 0), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="glass-card p-5 rounded-2xl border border-gray-800/80 shadow-lg flex flex-col justify-between group hover:border-gray-700/80 transition-all duration-300"
    >
      <div className="flex items-center gap-2 mb-3.5">
        <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
          <Trophy className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
          Top Spending Categories
        </h3>
      </div>

      <div className="space-y-3">
        {categories.slice(0, 3).map((cat, idx) => {
          const amt = cat.total_amount || 0;
          const pct = Math.round((amt / maxSpend) * 100);
          return (
            <div key={cat.category_id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-gray-800 text-[10px] flex items-center justify-center font-bold text-gray-400">
                    {idx + 1}
                  </span>
                  {cat.category_name}
                </span>
                <span className="text-white font-bold font-mono">
                  ₹{formatCurrency(amt, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800/80">
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
  );
}
