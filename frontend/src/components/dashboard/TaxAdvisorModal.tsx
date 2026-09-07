"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTaxAdvice } from "@/lib/api/ai";
import { TaxAdvisorResponse } from "@/types/ai";
import {
  X,
  Sparkles,
  Calculator,
  ShieldCheck,
  TrendingDown,
  FileText,
  HeartPulse,
  Home,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TaxAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TaxAdvisorModal({ isOpen, onClose }: TaxAdvisorModalProps) {
  const [income, setIncome] = useState<number>(1200000);

  const { data, isLoading, error } = useQuery<TaxAdvisorResponse>({
    queryKey: ["tax-advisor", income],
    queryFn: () => getTaxAdvice({ annual_income: income, tax_year: "2024-25" }),
    enabled: isOpen,
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border border-emerald-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-emerald-500/10 text-white max-h-[90vh] overflow-y-auto custom-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-500/30">
                <Calculator className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Smart Indian Tax & Regime Advisor
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    FY 2024-25
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  AI analysis of Section 80C, 80D & HRA deductions with Old vs New Regime optimization.
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

          {/* Income Slider / Input */}
          <div className="mt-5 p-4 bg-gray-800/40 rounded-2xl border border-gray-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  Gross Annual Taxable Income (₹)
                </label>
                <span className="text-sm font-black text-emerald-400">
                  ₹{Number(income).toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min="300000"
                max="5000000"
                step="50000"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>₹3 Lakhs</span>
                <span>₹12 Lakhs</span>
                <span>₹25 Lakhs</span>
                <span>₹50 Lakhs</span>
              </div>
            </div>
          </div>

          {/* Content Body */}
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium animate-pulse">
                Auditing eligible tax deductions & calculating optimal tax regime... ✨
              </p>
            </div>
          ) : error || !data ? (
            <div className="py-12 text-center text-rose-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Unable to generate tax advice.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              {/* Recommended Regime Banner */}
              <div className="p-4 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Recommended Strategy
                    </div>
                    <div className="text-lg font-black text-white">
                      Opt for {data.recommended_regime}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400">Potential Tax Savings</span>
                  <div className="text-xl font-black text-emerald-400">
                    ₹{Number(data.potential_tax_savings_with_recommended).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Old vs New Regime Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Old Regime Card */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    data.recommended_regime === "Old Tax Regime"
                      ? "bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                      : "bg-gray-800/40 border-gray-700/50"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-gray-700/50">
                    <span className="text-xs font-bold text-gray-300">Old Tax Regime</span>
                    {data.recommended_regime === "Old Tax Regime" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        WINNER 🏆
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>Deductions Claimed:</span>
                      <span className="font-semibold text-white">
                        ₹{Number(data.old_regime.total_deductions_claimed).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Net Taxable Income:</span>
                      <span className="font-semibold text-white">
                        ₹{Number(data.old_regime.net_taxable_income).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400 pt-2 border-t border-gray-800">
                      <span className="font-bold text-gray-200">Est. Tax Payable:</span>
                      <span className="font-black text-sm text-white">
                        ₹{Number(data.old_regime.estimated_tax_payable).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500">
                      <span>Effective Tax Rate:</span>
                      <span>{data.old_regime.effective_tax_rate}%</span>
                    </div>
                  </div>
                </div>

                {/* New Regime Card */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    data.recommended_regime === "New Tax Regime"
                      ? "bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                      : "bg-gray-800/40 border-gray-700/50"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-gray-700/50">
                    <span className="text-xs font-bold text-gray-300">New Tax Regime</span>
                    {data.recommended_regime === "New Tax Regime" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        WINNER 🏆
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>Standard Deduction:</span>
                      <span className="font-semibold text-white">
                        ₹{Number(data.new_regime.total_deductions_claimed).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Net Taxable Income:</span>
                      <span className="font-semibold text-white">
                        ₹{Number(data.new_regime.net_taxable_income).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400 pt-2 border-t border-gray-800">
                      <span className="font-bold text-gray-200">Est. Tax Payable:</span>
                      <span className="font-black text-sm text-white">
                        ₹{Number(data.new_regime.estimated_tax_payable).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500">
                      <span>Effective Tax Rate:</span>
                      <span>{data.new_regime.effective_tax_rate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deductions Breakdown Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
                  Identified Tax Deductions & Headroom
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.deductions_breakdown.map((item) => (
                    <div
                      key={item.section}
                      className="p-3.5 bg-gray-800/50 rounded-2xl border border-gray-700/50 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-emerald-300">{item.section}</span>
                        <span className="text-[11px] text-gray-400 font-medium">
                          ₹{Number(item.eligible_deduction).toLocaleString("en-IN")} / ₹{Number(item.max_allowed_limit).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300 leading-relaxed mb-2">
                        {item.action_to_maximize}
                      </p>
                      {item.items_detected && item.items_detected.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.items_detected.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-gray-900/80 rounded-md text-[10px] text-gray-400"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Tips */}
              <div className="p-4 bg-gray-800/40 rounded-2xl border border-gray-700/50 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  AI Optimization Tips & Deadlines
                </div>
                <ul className="space-y-1.5 text-xs text-gray-300">
                  {data.ai_tax_saving_tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-5 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>Powered by {data?.engine_used === "gemini" ? "Google Gemini 1.5 Flash ✨" : "Indian Income Tax Engine ⚡"}</span>
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
