"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBudgetBurnForecast } from "@/lib/api/ai";
import { BudgetForecastResponse } from "@/types/ai";
import {
  X,
  Sparkles,
  Flame,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  ShieldAlert,
  Calendar,
  Layers,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BudgetBurnForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BudgetBurnForecastModal({ isOpen, onClose }: BudgetBurnForecastModalProps) {
  const [customBudget, setCustomBudget] = useState<number>(35000);

  const { data, isLoading, error, refetch } = useQuery<BudgetForecastResponse>({
    queryKey: ["budget-burn-forecast", customBudget],
    queryFn: () =>
      getBudgetBurnForecast({
        total_custom_budget: customBudget,
      }),
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Breached":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "At Risk":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-gray-900 border border-indigo-500/30 rounded-3xl shadow-2xl shadow-indigo-500/10 overflow-hidden text-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800 bg-gradient-to-r from-gray-900 via-indigo-950/20 to-gray-900">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 shadow-inner">
                <Flame className="w-6 h-6 text-indigo-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black tracking-tight text-white">
                    Burn Rate & Budget Forecast
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Predictive Velocity
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Real-time spending velocity (₹/day), budget breach dates, and category runway
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Custom Budget Slider */}
            <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-300">
                  Target Monthly Portfolio Budget
                </span>
                <span className="text-indigo-400 font-bold text-sm">
                  ₹{customBudget.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={10000}
                max={250000}
                step={5000}
                value={customBudget}
                onChange={(e) => setCustomBudget(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-sm font-semibold text-gray-400 animate-pulse">
                  Calculating burn velocity and category depletion dates...
                </p>
              </div>
            ) : error ? (
              <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                <p className="text-sm text-rose-300 mb-3">Failed to forecast budget burn.</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl"
                >
                  Retry
                </button>
              </div>
            ) : data ? (
              <>
                {/* Burn Rate & Runway Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-400" />
                      Current Burn Velocity
                    </span>
                    <div className="text-2xl font-black text-white">
                      ₹{Number(data.overall_burn_rate_current).toLocaleString()}
                      <span className="text-xs font-normal text-gray-400"> / day</span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Trend: <span className="font-bold text-indigo-400">{data.velocity_trend}</span>
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-emerald-400" />
                      Safe Target Velocity
                    </span>
                    <div className="text-2xl font-black text-emerald-400">
                      ₹{Number(data.overall_burn_rate_target).toLocaleString()}
                      <span className="text-xs font-normal text-gray-400"> / day</span>
                    </div>
                    <p className="text-[11px] text-gray-400">Recommended cap to finish in surplus</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-purple-400" />
                      Budget Exhaustion Date
                    </span>
                    <div className="text-xl font-black text-white">
                      {data.budget_exhaustion_date ? (
                        <span className="text-rose-400">{data.budget_exhaustion_date}</span>
                      ) : (
                        <span className="text-emerald-400">End of Month+</span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Status: <span className="font-bold text-white">{data.runway_status}</span>
                    </p>
                  </div>
                </div>

                {/* Extrapolation Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-gray-950 via-indigo-950/30 to-gray-950 border border-indigo-500/25 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide block mb-1">
                      Projected Month-End Spend (90% Confidence Interval)
                    </span>
                    <div className="text-2xl font-black text-white">
                      ₹{Number(data.projected_total_month_end_spend).toLocaleString()}
                      <span className="text-xs font-normal text-gray-400 ml-2">
                        (₹{Number(data.projected_spend_lower_bound).toLocaleString()} – ₹{Number(data.projected_spend_upper_bound).toLocaleString()})
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${data.projected_total_month_end_spend <= data.total_budget_allocated ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border-rose-500/30"}`}>
                    {data.projected_total_month_end_spend <= data.total_budget_allocated ? "On Track for Surplus ✨" : "Projected Deficit ⚠️"}
                  </span>
                </div>

                {/* Per-Category Forecast Grid */}
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-300 mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Category-by-Category Forecast
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.category_forecasts.map((cat, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{cat.category_name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getStatusBadge(cat.status)}`}>
                            {cat.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-2 rounded-lg bg-gray-900 border border-gray-800">
                            <span className="text-[10px] text-gray-400 block">Spent</span>
                            <span className="font-bold text-white">₹{Number(cat.spent_to_date).toLocaleString()}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-gray-900 border border-gray-800">
                            <span className="text-[10px] text-gray-400 block">Allocated</span>
                            <span className="font-bold text-indigo-300">₹{Number(cat.allocated_budget).toLocaleString()}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-gray-900 border border-gray-800">
                            <span className="text-[10px] text-gray-400 block">Projected</span>
                            <span className="font-bold text-amber-300">₹{Number(cat.projected_end_of_month).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                          <span>Burn: ₹{Number(cat.daily_burn_rate).toFixed(0)}/day</span>
                          <span>Safe Velocity: ₹{Number(cat.safe_daily_velocity).toFixed(0)}/day</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Optimization Guardrails */}
                <div className="p-5 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-2.5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    AI Optimization Guardrails
                  </h3>
                  <div className="space-y-2">
                    {data.ai_optimization_guardrails.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-300 bg-gray-900/60 p-2.5 rounded-xl border border-gray-800/80">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-800 bg-gray-950 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
