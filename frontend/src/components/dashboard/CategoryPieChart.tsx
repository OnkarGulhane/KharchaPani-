"use client";

import React, { useState, useEffect } from "react";
import { CategoryPieItem } from "@/types/dashboard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { motion } from "framer-motion";
import { PieChart as PieIcon, Layers } from "lucide-react";

interface Props {
  data: CategoryPieItem[];
  loading: boolean;
}

const COLORS = [
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#14b8a6", // Teal
];

export default function CategoryPieChart({ data, loading }: Props) {
  const { formatAmount } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading || !mounted) {
    return (
      <div className="h-96 glass-panel rounded-2xl animate-pulse p-6 flex flex-col justify-between">
        <div className="h-5 w-36 bg-gray-800 rounded-lg" />
        <div className="h-64 bg-gray-800/40 rounded-xl" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-96 glass-panel rounded-3xl p-6 border border-gray-800 flex flex-col items-center justify-center text-center relative overflow-hidden"
      >
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 mb-3 shadow-[0_0_25px_rgba(59,130,246,0.15)]">
          <PieIcon className="w-7 h-7" />
        </div>
        <p className="text-base font-bold text-white tracking-wide">No Category Breakdown</p>
        <p className="text-xs text-gray-400 mt-1 max-w-xs">
          Log expenses across different categories to see your spending distribution.
        </p>
      </motion.div>
    );
  }

  const totalSpent = data.reduce((sum, item) => sum + (item.amount || 0), 0);

  // Active slice render function for smooth expanding 3D hover
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 3}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ filter: "drop-shadow(0 0 14px rgba(16, 185, 129, 0.5))" }}
        />
      </g>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="glass-panel p-6 rounded-3xl border border-gray-800/90 shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-gray-700/80 transition-all duration-300"
    >
      {/* Ambient background glow */}
      <div className="absolute -top-28 -left-28 w-56 h-56 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3 sm:mb-4 z-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide flex items-center gap-2">
              <PieIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
              <span>Spend by Category</span>
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
              <Layers className="w-3 h-3" />
              {data.length} Categories
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Total Allocated: <span className="text-white font-bold font-mono">{formatAmount(totalSpent, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          </p>
        </div>
      </div>

      {/* Donut Chart with Centered Metric */}
      <div className="min-h-[200px] sm:min-h-[220px] h-52 sm:h-56 w-full relative flex items-center justify-center z-10">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={76}
              paddingAngle={3}
              dataKey="amount"
              nameKey="category_name"
              activeIndex={activeIndex !== null ? activeIndex : undefined}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              animationDuration={700}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="transition-all duration-300 cursor-pointer"
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as CategoryPieItem;
                  return (
                    <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/80 p-3 rounded-2xl shadow-2xl text-xs space-y-1">
                      <p className="font-extrabold text-white text-sm">{item.category_name}</p>
                      <p className="text-emerald-400 font-extrabold text-base font-mono">
                        {formatAmount(item.amount)}
                      </p>
                      <p className="text-gray-400 text-[11px]">
                        {item.percentage}% of total expenses
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 max-w-[90px] truncate text-center">
            {activeIndex !== null && data[activeIndex]
              ? data[activeIndex].category_name
              : "Total"}
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-white mt-0.5 font-mono">
            {formatAmount(
              activeIndex !== null && data[activeIndex]
                ? data[activeIndex].amount
                : totalSpent,
              { minimumFractionDigits: 0, maximumFractionDigits: 0 }
            )}
          </span>
        </div>
      </div>

      {/* Interactive Legend Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 mt-2 pt-3 border-t border-gray-800/80 max-h-28 overflow-y-auto pr-1 z-10 scrollbar-none sm:scrollbar-thin">
        {data.map((item, idx) => {
          const isCurrentActive = activeIndex === idx;
          return (
            <motion.div
              key={item.category_id}
              whileHover={{ scale: 1.02 }}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
              className={`flex items-center gap-2 text-xs p-1.5 sm:p-2 rounded-xl cursor-pointer transition-all duration-200 ${
                isCurrentActive
                  ? "bg-gray-800/90 border border-emerald-500/40 shadow-sm"
                  : "hover:bg-gray-800/40 border border-transparent"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-[0_0_8px_currentColor]"
                style={{ backgroundColor: COLORS[idx % COLORS.length], color: COLORS[idx % COLORS.length] }}
              />
              <span
                className={`truncate text-xs font-semibold ${
                  isCurrentActive ? "text-white font-bold" : "text-gray-300"
                }`}
              >
                {item.category_name}
              </span>
              <span className="text-gray-400 font-mono text-[11px] ml-auto font-bold flex-shrink-0">
                {item.percentage}%
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
