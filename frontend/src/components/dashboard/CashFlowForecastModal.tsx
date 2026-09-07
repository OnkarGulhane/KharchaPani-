"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCashFlowForecast } from "@/lib/api/ai";
import { CashFlowForecastResponse } from "@/types/ai";
import {
  X,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Wallet,
  Zap,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CashFlowForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CashFlowForecastModal({ isOpen, onClose }: CashFlowForecastModalProps) {
  const [income, setIncome] = useState<number>(45000);
  const [liquidBalance, setLiquidBalance] = useState<number | undefined>(undefined);

  const { data, isLoading, error, refetch } = useQuery<CashFlowForecastResponse>({
    queryKey: ["cashflow-forecast", income, liquidBalance],
    queryFn: () =>
      getCashFlowForecast({
        estimated_monthly_income: income,
        current_liquid_balance: liquidBalance,
      }),
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Critical Danger":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "Moderate":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "Thriving":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      default:
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "Critical Danger":
        return <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />;
      case "Moderate":
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case "Thriving":
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border border-purple-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-purple-500/10 text-white max-h-[90vh] overflow-y-auto custom-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl border border-purple-500/30">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Predictive Cash Flow & Runway
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Time-Series AI
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Real-time spending velocity forecast & Zero-Day cash depletion modeling.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/80 transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls / Custom Inflow Input */}
          <div className="mt-5 p-4 bg-gray-800/40 rounded-2xl border border-gray-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-1/2">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 mb-1.5">
                <Wallet className="w-3.5 h-3.5 text-purple-400" />
                Monthly Inflow / Salary Baseline (₹)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5000"
                  step="1000"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="w-full sm:w-1/2">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Current Bank Balance (₹ Optional)
              </label>
              <input
                type="number"
                placeholder="Auto-calculated from budget"
                value={liquidBalance !== undefined ? liquidBalance : ""}
                onChange={(e) => setLiquidBalance(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Main Body Content */}
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium animate-pulse">
                Analyzing transaction velocity and computing runway timeline... ✨
              </p>
            </div>
          ) : error || !data ? (
            <div className="py-12 text-center text-rose-400">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Unable to compute cash flow forecast.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              {/* Stat Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* 1. Risk / Runway Badge Card */}
                <div className="p-4 bg-gray-800/60 rounded-2xl border border-gray-700/60 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">Runway Status</span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black border ${getRiskColor(
                        data.risk_level
                      )}`}
                    >
                      {getRiskIcon(data.risk_level)}
                      {data.risk_level}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-white">
                      {data.runway_days_remaining} Days Left
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {data.zero_day_date ? (
                        <span className="text-rose-400 font-bold">
                          Zero-Day: {new Date(data.zero_day_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">Survives through salary day</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Daily Burn Rate Card */}
                <div className="p-4 bg-gray-800/60 rounded-2xl border border-gray-700/60 flex flex-col justify-between">
                  <span className="text-xs text-gray-400 font-medium">Daily Burn Velocity</span>
                  <div className="mt-2">
                    <div className="text-2xl font-black text-white">
                      ₹{Number(data.daily_burn_rate_current).toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-gray-400">/day</span>
                    </div>
                    <div className="text-xs text-indigo-300 font-medium mt-0.5">
                      Safe Target: ₹{Number(data.daily_burn_rate_safe_target).toLocaleString("en-IN")}/day
                    </div>
                  </div>
                </div>

                {/* 3. Projected Month-End Spend */}
                <div className="p-4 bg-gray-800/60 rounded-2xl border border-gray-700/60 flex flex-col justify-between">
                  <span className="text-xs text-gray-400 font-medium">Projected EOM Spend</span>
                  <div className="mt-2">
                    <div className="text-2xl font-black text-purple-300">
                      ₹{Number(data.projected_end_of_cycle_spend).toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Spent to date: ₹{Number(data.current_spend_to_date).toLocaleString("en-IN")} ({data.days_elapsed}/{data.total_days_in_cycle} days)
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Runway Verdict Alert */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  data.risk_level === "Critical Danger"
                    ? "bg-rose-950/40 border-rose-500/40 text-rose-200"
                    : data.risk_level === "Moderate"
                    ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
                    : "bg-purple-950/40 border-purple-500/40 text-purple-200"
                }`}
              >
                <Zap className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-300 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    AI Runway Strategy Verdict
                  </h4>
                  <p className="text-xs sm:text-sm mt-1 leading-relaxed text-gray-200">
                    {data.ai_runway_verdict}
                  </p>
                </div>
              </div>

              {/* Interactive Timeline Trajectory Chart */}
              <div className="p-4 bg-gray-800/40 rounded-2xl border border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                      30-Day Cash Trajectory & Burn Down
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      Past Days
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400/50" />
                      Projected
                    </span>
                  </div>
                </div>

                {/* Timeline Visual Bars */}
                <div className="h-32 flex items-end gap-1 pt-4 pb-1 overflow-x-auto custom-scrollbar">
                  {data.daily_forecast_timeline.map((point) => {
                    const maxBal = Math.max(...data.daily_forecast_timeline.map((p) => p.projected_balance), 1);
                    const heightPct = Math.max((point.projected_balance / maxBal) * 100, 6);
                    const isZeroDay = data.zero_day_date && point.date === data.zero_day_date;

                    return (
                      <div
                        key={point.date}
                        className="flex-1 min-w-[14px] flex flex-col items-center gap-1 group relative"
                      >
                        {/* Tooltip on Hover */}
                        <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all bg-gray-900 border border-gray-700 text-white text-[10px] px-2 py-1 rounded-lg shadow-xl z-20 whitespace-nowrap pointer-events-none">
                          Day {point.day_of_month}: ₹{Number(point.projected_balance).toLocaleString("en-IN")}
                        </div>

                        {/* Bar */}
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full rounded-t-sm transition-all duration-300 ${
                            isZeroDay
                              ? "bg-rose-500 shadow-lg shadow-rose-500/50 animate-bounce"
                              : point.is_past
                              ? "bg-gradient-to-t from-indigo-700 to-indigo-500"
                              : "bg-gradient-to-t from-purple-800/60 to-purple-500/60"
                          }`}
                        />
                        <span
                          className={`text-[9px] ${
                            isZeroDay
                              ? "font-black text-rose-400"
                              : point.is_past
                              ? "text-gray-400 font-semibold"
                              : "text-gray-600"
                          }`}
                        >
                          {point.day_of_month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-5 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>Powered by {data?.engine_used === "gemini" ? "Google Gemini 1.5 Flash ✨" : "Local Time-Series NLP ⚡"}</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-xl transition-all active:scale-95"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
