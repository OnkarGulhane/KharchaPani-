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
  LabelList,
} from "recharts";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Layers,
  Calendar,
  Zap,
} from "lucide-react";

interface Props {
  data: SpendTrendItem[];
  loading: boolean;
}

type ChartViewMode = "3d-pillars" | "bar" | "area";

// Date formatting helper for clean labels like "27 Aug", "Wed 27", "Today"
function formatChartDate(rawDate: string): { display: string; sub: string; full: string } {
  if (!rawDate) return { display: "", sub: "", full: "" };

  const parsed = new Date(rawDate);
  if (isNaN(parsed.getTime())) {
    return { display: rawDate, sub: "", full: rawDate };
  }

  const today = new Date();
  const isToday =
    parsed.getDate() === today.getDate() &&
    parsed.getMonth() === today.getMonth() &&
    parsed.getFullYear() === today.getFullYear();

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const dayOfWeek = days[parsed.getDay()];
  const monthName = months[parsed.getMonth()];
  const dayNum = parsed.getDate();

  return {
    display: isToday ? "Today" : `${dayNum} ${monthName}`,
    sub: dayOfWeek,
    full: `${dayOfWeek}, ${dayNum} ${monthName} ${parsed.getFullYear()}`,
  };
}

export default function SpendTrendChart({ data, loading }: Props) {
  const { currency, formatAmount } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ChartViewMode>("3d-pillars");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading || !mounted) {
    return (
      <div className="h-96 glass-panel rounded-2xl animate-pulse p-6 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <div className="h-5 w-40 bg-gray-800 rounded-lg" />
          <div className="h-8 w-44 bg-gray-800 rounded-xl" />
        </div>
        <div className="h-64 bg-gray-800/40 rounded-xl" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-96 glass-panel rounded-2xl p-6 border border-gray-800 flex flex-col items-center justify-center text-center relative overflow-hidden"
      >
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
          <TrendingUp className="w-7 h-7" />
        </div>
        <p className="text-base font-bold text-white tracking-wide">No Spending Timeline Data</p>
        <p className="text-xs text-gray-400 mt-1 max-w-sm">
          Add your daily expenses to see 3D visual bar pillars, expense trends, and analytics.
        </p>
      </motion.div>
    );
  }

  // Pre-process & format data
  const formattedData = data.map((item, idx) => {
    const dates = formatChartDate(item.label);
    return {
      ...item,
      amount: Number(item.amount) || 0,
      formattedLabel: dates.display,
      subLabel: dates.sub,
      fullDate: dates.full,
      index: idx,
    };
  });

  const totalTrend = formattedData.reduce((acc, curr) => acc + curr.amount, 0);
  const maxAmount = Math.max(...formattedData.map((d) => d.amount), 1);
  const maxItem = formattedData.find((d) => d.amount === maxAmount);
  const avgDaily = formattedData.length > 0 ? totalTrend / formattedData.length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-panel p-6 rounded-3xl border border-gray-800/90 shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-gray-700/80 transition-all duration-300"
    >
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute -top-28 -right-28 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 -left-28 w-56 h-56 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title, Stats & Visual Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 z-10">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide flex items-center gap-2 truncate">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
              <span>Spending Trend & Analytics</span>
            </h3>
            {maxItem && maxItem.amount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Peak: {formatAmount(maxItem.amount, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
            <span>Period Total:</span>
            <span className="text-emerald-400 font-bold font-mono text-xs sm:text-sm">
              {formatAmount(totalTrend, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-gray-600">•</span>
            <span>Avg/Day:</span>
            <span className="text-gray-300 font-mono text-xs">
              {formatAmount(avgDaily, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </p>
        </div>

        {/* 3-Way Mode Switcher: 3D Pillars | Pro Bar | Area Wave */}
        <div className="flex items-center bg-gray-900/90 p-1 rounded-2xl border border-gray-800/90 self-start sm:self-auto overflow-x-auto max-w-full scrollbar-none shadow-inner flex-shrink-0">
          <button
            onClick={() => setViewMode("3d-pillars")}
            className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
              viewMode === "3d-pillars" ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {viewMode === "3d-pillars" && (
              <motion.div
                layoutId="activeChartView"
                className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-teal-500/20 border border-emerald-500/50 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
              />
            )}
            <Layers className="w-3.5 h-3.5 relative z-10 text-emerald-400 flex-shrink-0" />
            <span className="relative z-10">3D Pillars</span>
          </button>

          <button
            onClick={() => setViewMode("bar")}
            className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
              viewMode === "bar" ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {viewMode === "bar" && (
              <motion.div
                layoutId="activeChartView"
                className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-teal-500/20 border border-emerald-500/50 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
              />
            )}
            <BarChart3 className="w-3.5 h-3.5 relative z-10 flex-shrink-0" />
            <span className="relative z-10">Bar Chart</span>
          </button>

          <button
            onClick={() => setViewMode("area")}
            className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
              viewMode === "area" ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {viewMode === "area" && (
              <motion.div
                layoutId="activeChartView"
                className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-teal-500/20 border border-emerald-500/50 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
              />
            )}
            <TrendingUp className="w-3.5 h-3.5 relative z-10 flex-shrink-0" />
            <span className="relative z-10">Area Wave</span>
          </button>
        </div>
      </div>

      {/* Main Visual Display Area */}
      <div className="min-h-[260px] h-64 w-full relative z-10 flex flex-col justify-end overflow-hidden">
        <AnimatePresence mode="wait">
          {/* MODE 1: 3D MICRO-INTERACTIVE GLASS PILLARS */}
          {viewMode === "3d-pillars" && (
            <motion.div
              key="3d-pillars"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full flex flex-col justify-end overflow-x-auto overflow-y-hidden pb-1 scrollbar-none sm:scrollbar-thin"
            >
              {/* Pillar Columns Track with Horizontal Touch Scroll Support */}
              <div
                className="flex-1 flex items-end justify-between sm:justify-around gap-2 px-1 pt-6 pb-2 min-w-full"
                style={{
                  minWidth: formattedData.length > 6 ? `${formattedData.length * 54}px` : "100%",
                }}
              >
                {formattedData.map((item, idx) => {
                  const isHovered = hoveredIndex === idx;
                  const heightPercent = Math.max(
                    Math.round((item.amount / maxAmount) * 82),
                    item.amount > 0 ? 12 : 4
                  );
                  const isPeak = maxItem && maxItem.amount === item.amount && item.amount > 0;

                  return (
                    <div
                      key={`pillar-${idx}`}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => setHoveredIndex(hoveredIndex === idx ? null : idx)}
                      className="flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer group/pillar min-w-[44px] max-w-[64px]"
                    >
                      {/* Floating Amount Badge Above Pillar */}
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{
                          opacity: isHovered || isPeak ? 1 : 0.85,
                          y: isHovered ? -8 : 0,
                          scale: isHovered ? 1.08 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                        className={`mb-2 px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-extrabold font-mono tracking-tight transition-all duration-200 truncate max-w-full ${
                          isHovered
                            ? "bg-emerald-400 text-gray-950 shadow-[0_0_15px_rgba(52,211,153,0.8)] scale-105 z-30"
                            : isPeak
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                            : "bg-gray-800/80 text-gray-300 border border-gray-700/60"
                        }`}
                      >
                        {formatAmount(item.amount, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </motion.div>

                      {/* 3D Pillar Cylinder Structure */}
                      <div
                        className="w-full flex flex-col items-center justify-end relative"
                        style={{ height: `${heightPercent}%` }}
                      >
                        {/* 3D Glowing Cap (Top Ellipse) */}
                        <div
                          className={`w-full h-3 rounded-full z-20 transition-all duration-300 ${
                            isHovered
                              ? "bg-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.9)]"
                              : "pillar-cap"
                          }`}
                        />

                        {/* 3D Cylinder Shaft / Body */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "100%" }}
                          transition={{ duration: 0.5, delay: idx * 0.04, ease: "easeOut" }}
                          className={`w-full -mt-1.5 rounded-b-xl transition-all duration-300 ${
                            isHovered ? "pillar-body-active" : "pillar-body"
                          }`}
                        />

                        {/* Base Shadow & Reflection */}
                        <div
                          className={`w-full h-2 rounded-full -mt-1 transition-all ${
                            isHovered
                              ? "bg-emerald-500/30 blur-sm shadow-[0_4px_12px_rgba(16,185,129,0.5)]"
                              : "bg-black/40 blur-[2px]"
                          }`}
                        />
                      </div>

                      {/* Date Label Below Pillar */}
                      <div className="mt-2 text-center select-none">
                        <p
                          className={`text-[10px] sm:text-[11px] font-bold transition-colors ${
                            isHovered ? "text-emerald-300" : "text-gray-300"
                          }`}
                        >
                          {item.formattedLabel}
                        </p>
                        {item.subLabel && (
                          <p className="text-[8px] sm:text-[9px] text-gray-500 font-medium">
                            {item.subLabel}
                          </p>
                        )}
                      </div>

                      {/* Hover Info Tooltip Popup */}
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="absolute bottom-20 z-40 bg-gray-950/95 backdrop-blur-2xl border border-emerald-500/40 p-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.2)] text-xs min-w-[140px] pointer-events-none"
                        >
                          <div className="flex items-center gap-1.5 text-gray-400 font-medium text-[11px] mb-1">
                            <Calendar className="w-3 h-3 text-emerald-400" />
                            <span>{item.fullDate}</span>
                          </div>
                          <p className="text-emerald-400 font-extrabold text-sm sm:text-base font-mono">
                            {formatAmount(item.amount)}
                          </p>
                          {totalTrend > 0 && (
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {((item.amount / totalTrend) * 100).toFixed(1)}% of total period
                            </p>
                          )}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* MODE 2: ENHANCED PRO RECHARTS BAR CHART */}
          {viewMode === "bar" && (
            <motion.div
              key="bar-chart"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={formattedData}
                  margin={{ top: 24, right: 10, left: 0, bottom: 0 }}
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
                    <linearGradient id="rechartsBarActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.9} />
                    </linearGradient>
                    <linearGradient id="rechartsBarDefault" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#047857" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    opacity={0.3}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="formattedLabel"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#374151", opacity: 0.5 }}
                    dy={6}
                  />

                  <YAxis
                    stroke="#9ca3af"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${currency.symbol}${val > 999 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    width={38}
                  />

                  <Tooltip
                    cursor={{ fill: "rgba(16, 185, 129, 0.06)", radius: 8 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/80 p-3 rounded-2xl shadow-2xl text-xs space-y-1">
                            <p className="text-gray-400 font-medium">{item.fullDate || item.label}</p>
                            <p className="text-emerald-400 font-extrabold text-base font-mono">
                              {formatAmount(item.amount)}
                            </p>
                            {totalTrend > 0 && (
                              <p className="text-[10px] text-gray-400">
                                {((item.amount / totalTrend) * 100).toFixed(1)}% of period total
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
                    radius={[8, 8, 3, 3]}
                    maxBarSize={48}
                    minPointSize={10}
                    animationDuration={600}
                    fill="#10b981"
                  >
                    {formattedData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          hoveredIndex === index
                            ? "url(#rechartsBarActive)"
                            : "url(#rechartsBarDefault)"
                        }
                        className="transition-all duration-200 cursor-pointer"
                      />
                    ))}
                    <LabelList
                      dataKey="amount"
                      position="top"
                      formatter={(val: number) => (val > 0 ? formatAmount(val, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "")}
                      style={{
                        fill: "#34d399",
                        fontSize: "10px",
                        fontWeight: 700,
                        fontFamily: "monospace",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* MODE 3: AREA NEON WAVE */}
          {viewMode === "area" && (
            <motion.div
              key="area-chart"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={formattedData}
                  margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="areaGlowGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    opacity={0.3}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="formattedLabel"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#374151", opacity: 0.5 }}
                    dy={6}
                  />

                  <YAxis
                    stroke="#9ca3af"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${currency.symbol}${val > 999 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    width={38}
                  />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/80 p-3 rounded-2xl shadow-2xl text-xs space-y-1">
                            <p className="text-gray-400 font-medium">{item.fullDate || item.label}</p>
                            <p className="text-emerald-400 font-extrabold text-base font-mono">
                              {formatAmount(item.amount)}
                            </p>
                            {totalTrend > 0 && (
                              <p className="text-[10px] text-gray-400">
                                {((item.amount / totalTrend) * 100).toFixed(1)}% of period total
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
                    strokeWidth={3.5}
                    fillOpacity={1}
                    fill="url(#areaGlowGradient)"
                    dot={{
                      r: 4,
                      fill: "#10b981",
                      stroke: "#064e3b",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 7,
                      fill: "#34d399",
                      stroke: "#ffffff",
                      strokeWidth: 3,
                    }}
                    animationDuration={700}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info & Quick Hint */}
      <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400 flex-wrap gap-2">
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>Interactive 3D timeline</span>
        </span>
        <div className="flex items-center gap-2">
          {viewMode === "3d-pillars" && formattedData.length > 6 && (
            <span className="text-[10px] text-emerald-400/90 font-medium sm:hidden bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              ← Swipe pillars →
            </span>
          )}
          <span className="text-gray-500 font-medium font-mono text-[10px] sm:text-[11px]">
            {formattedData.length} point{formattedData.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
