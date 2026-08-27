"use client";

import React, { useState, useEffect } from "react";
import { CategoryPieItem } from "@/types/dashboard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";
import { formatCurrency } from "@/lib/utils";
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
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading || !mounted) {
    return (
      <div className="h-80 glass-panel rounded-2xl animate-pulse p-6 flex flex-col justify-between">
        <div className="h-4 w-32 bg-gray-800 rounded-lg" />
        <div className="h-52 bg-gray-800/40 rounded-xl" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-80 glass-panel rounded-2xl p-6 border border-gray-800 flex flex-col items-center justify-center text-center"
      >
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3 shadow-inner">
          <PieIcon className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-gray-200">No Category Breakdown</p>
        <p className="text-xs text-gray-400 mt-1 max-w-xs">
          Log expenses across different categories to see your spending distribution.
        </p>
      </motion.div>
    );
  }

  const totalSpent = data.reduce((sum, item) => sum + (item.amount || 0), 0);

  // Active slice render function for smooth expanding hover
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 2}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ filter: "drop-shadow(0 0 10px rgba(16, 185, 129, 0.4))" }}
        />
      </g>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="glass-panel p-6 rounded-2xl border border-gray-800/90 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-gray-700/80 transition-all"
    >
      {/* Ambient background glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-wide">
              Spend by Category
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
              <Layers className="w-2.5 h-2.5" />
              {data.length} Categories
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Total: <span className="text-white font-semibold">₹{formatCurrency(totalSpent, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          </p>
        </div>
      </div>

      {/* Donut Chart with Centered Metric */}
      <div className="h-48 w-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={54}
              outerRadius={76}
              paddingAngle={4}
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
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.45}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as CategoryPieItem;
                  return (
                    <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                      <p className="font-bold text-white text-sm">{item.category_name}</p>
                      <p className="text-emerald-400 font-bold text-base">
                        ₹{formatCurrency(item.amount)}
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
          <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
            {activeIndex !== null && data[activeIndex]
              ? data[activeIndex].category_name
              : "Total"}
          </span>
          <span className="text-xs font-bold text-white mt-0.5">
            ₹
            {formatCurrency(
              activeIndex !== null && data[activeIndex]
                ? data[activeIndex].amount
                : totalSpent,
              { minimumFractionDigits: 0, maximumFractionDigits: 0 }
            )}
          </span>
        </div>
      </div>

      {/* Interactive Legend */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-800/80 max-h-24 overflow-y-auto pr-1">
        {data.map((item, idx) => {
          const isCurrentActive = activeIndex === idx;
          return (
            <motion.div
              key={item.category_id}
              whileHover={{ scale: 1.02 }}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`flex items-center gap-2 text-xs p-1.5 rounded-lg cursor-pointer transition-all ${
                isCurrentActive
                  ? "bg-gray-800/80 border border-gray-700 shadow-sm"
                  : "hover:bg-gray-800/40 border border-transparent"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span
                className={`truncate font-medium ${
                  isCurrentActive ? "text-white font-bold" : "text-gray-300"
                }`}
              >
                {item.category_name}
              </span>
              <span className="text-gray-400 font-mono text-[11px] ml-auto">
                {item.percentage}%
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
