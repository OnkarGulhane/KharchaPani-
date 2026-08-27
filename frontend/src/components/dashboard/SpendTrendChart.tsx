"use client";

import React, { useState, useEffect } from "react";
import { SpendTrendItem } from "@/types/dashboard";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, TrendingUp, Sparkles } from "lucide-react";

interface Props {
  data: SpendTrendItem[];
  loading: boolean;
}

type ChartType = "bar" | "area";

export default function SpendTrendChart({ data, loading }: Props) {
  const [mounted, setMounted] = useState(false);
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading || !mounted) {
    return (
      <div className="h-80 glass-panel rounded-2xl animate-pulse p-6 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <div className="h-4 w-32 bg-gray-800 rounded-lg" />
          <div className="h-7 w-28 bg-gray-800 rounded-lg" />
        </div>
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
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
          <TrendingUp className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-gray-200">No Spending Trend Data</p>
        <p className="text-xs text-gray-400 mt-1 max-w-xs">
          Add your daily expenses to see automated timeline analytics and spending trends.
        </p>
      </motion.div>
    );
  }

  // Analytics on data
  const totalTrend = data.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const maxSpendItem = [...data].sort((a, b) => (b.amount || 0) - (a.amount || 0))[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-panel p-6 rounded-2xl border border-gray-800/90 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-gray-700/80 transition-all"
    >
      {/* Background ambient gradient glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title, Stats & Chart Type Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-wide">
              Spending Trend & Timeline
            </h3>
            {maxSpendItem && maxSpendItem.amount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-2.5 h-2.5" />
                Peak: ₹{formatCurrency(maxSpendItem.amount, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Total in period: <span className="text-emerald-400 font-semibold">₹{formatCurrency(totalTrend, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          </p>
        </div>

        {/* Interactive Toggle Switch */}
        <div className="flex items-center bg-gray-900/80 p-1 rounded-xl border border-gray-800 self-start sm:self-auto">
          <button
            onClick={() => setChartType("bar")}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              chartType === "bar" ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {chartType === "bar" && (
              <motion.div
                layoutId="activeChartType"
                className="absolute inset-0 bg-emerald-500/20 border border-emerald-500/40 rounded-lg shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <BarChart3 className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Bar Graph</span>
          </button>

          <button
            onClick={() => setChartType("area")}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              chartType === "area" ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {chartType === "area" && (
              <motion.div
                layoutId="activeChartType"
                className="absolute inset-0 bg-emerald-500/20 border border-emerald-500/40 rounded-lg shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <TrendingUp className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Area Trend</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-56 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart
              data={data}
              margin={{ top: 12, right: 10, left: -20, bottom: 0 }}
              onMouseMove={(state) => {
                if (state.isTooltipActive) {
                  setHoveredIndex(state.activeTooltipIndex ?? null);
                } else {
                  setHoveredIndex(null);
                }
              }}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <defs>
                <linearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="barGradientDefault" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#047857" stopOpacity={0.45} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.25}
                vertical={false}
              />

              <XAxis
                dataKey="label"
                stroke="#9ca3af"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#374151", opacity: 0.4 }}
                dy={6}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val}`}
              />

              <Tooltip
                cursor={{ fill: "rgba(255, 255, 255, 0.04)", radius: 8 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as SpendTrendItem;
                    return (
                      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                        <p className="text-gray-400 font-medium">{item.label}</p>
                        <p className="text-emerald-400 font-bold text-base">
                          ₹{formatCurrency(item.amount)}
                        </p>
                        {totalTrend > 0 && (
                          <p className="text-[10px] text-gray-400">
                            {((item.amount / totalTrend) * 100).toFixed(1)}% of total period
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Bar
                dataKey="amount"
                radius={[6, 6, 2, 2]}
                maxBarSize={48}
                animationDuration={600}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      hoveredIndex === index
                        ? "url(#barGradientActive)"
                        : "url(#barGradientDefault)"
                    }
                    className="transition-all duration-200 cursor-pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <AreaChart
              data={data}
              margin={{ top: 12, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.25}
                vertical={false}
              />

              <XAxis
                dataKey="label"
                stroke="#9ca3af"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#374151", opacity: 0.4 }}
                dy={6}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val}`}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as SpendTrendItem;
                    return (
                      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                        <p className="text-gray-400 font-medium">{item.label}</p>
                        <p className="text-emerald-400 font-bold text-base">
                          ₹{formatCurrency(item.amount)}
                        </p>
                        {totalTrend > 0 && (
                          <p className="text-[10px] text-gray-400">
                            {((item.amount / totalTrend) * 100).toFixed(1)}% of total period
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="monotone"
                dataKey="amount"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#areaGradient)"
                dot={{
                  r: 4.5,
                  fill: "#10b981",
                  stroke: "#064e3b",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 7,
                  fill: "#34d399",
                  stroke: "#ffffff",
                  strokeWidth: 2.5,
                }}
                animationDuration={700}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
