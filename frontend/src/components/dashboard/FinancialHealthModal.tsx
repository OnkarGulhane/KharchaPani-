"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFinancialHealth } from "@/lib/api/ai";
import { FinancialHealthResponse } from "@/types/ai";
import {
  X,
  Sparkles,
  HeartPulse,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Target,
  ArrowRight,
  PieChart,
  HelpCircle,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FinancialHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FinancialHealthModal({ isOpen, onClose }: FinancialHealthModalProps) {
  const [income, setIncome] = useState<number>(50000);
  const [emergencyFund, setEmergencyFund] = useState<number>(120000);

  const { data, isLoading, error, refetch } = useQuery<FinancialHealthResponse>({
    queryKey: ["financial-health", income, emergencyFund],
    queryFn: () =>
      getFinancialHealth({
        monthly_income: income,
        liquid_emergency_fund: emergencyFund,
      }),
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 65) return "text-blue-400 border-blue-500/30 bg-blue-500/10";
    if (score >= 45) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  const getPillarColor = (status: string) => {
    switch (status) {
      case "Excellent":
        return "bg-emerald-500 text-emerald-300";
      case "Good":
        return "bg-blue-500 text-blue-300";
      case "Fair":
        return "bg-amber-500 text-amber-300";
      default:
        return "bg-rose-500 text-rose-300";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-gray-900 border border-emerald-500/30 rounded-3xl shadow-2xl shadow-emerald-500/10 overflow-hidden text-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800 bg-gradient-to-r from-gray-900 via-emerald-950/20 to-gray-900">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 shadow-inner">
                <HeartPulse className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black tracking-tight text-white">
                    AI Financial Health & Insights
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    5-Pillar Score
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Scientific 0-100 financial fitness score, 50/30/20 compliance, and tailored roadmap
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
            {/* Interactive Simulation Controls */}
            <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 flex items-center justify-between mb-1.5">
                  <span>Monthly Inflow / Income</span>
                  <span className="text-emerald-400 font-bold">₹{income.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={15000}
                  max={300000}
                  step={5000}
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 flex items-center justify-between mb-1.5">
                  <span>Liquid Emergency Fund (Cash / Bank)</span>
                  <span className="text-emerald-400 font-bold">₹{emergencyFund.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={1000000}
                  step={10000}
                  value={emergencyFund}
                  onChange={(e) => setEmergencyFund(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-sm font-semibold text-gray-400 animate-pulse">
                  Analyzing financial pillars and benchmark adherence...
                </p>
              </div>
            ) : error ? (
              <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                <p className="text-sm text-rose-300 mb-3">Failed to compute financial health.</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl"
                >
                  Retry
                </button>
              </div>
            ) : data ? (
              <>
                {/* Score Hero Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950/30 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
                  <div className="flex items-center gap-6">
                    <div className="relative flex items-center justify-center">
                      <div className="w-28 h-28 rounded-full border-4 border-emerald-500/20 flex flex-col items-center justify-center bg-gray-900/90 shadow-inner">
                        <span className="text-3xl font-black tracking-tight text-white">
                          {data.overall_score}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          / 100
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-black border ${getScoreColor(data.overall_score)}`}>
                          {data.health_badge}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          Top {100 - data.peer_percentile}% Peer Percentile
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 font-medium max-w-lg mt-1">
                        {data.headline_summary}
                      </p>
                    </div>
                  </div>

                  <div className="text-right hidden lg:block">
                    <span className="text-xs text-gray-400 block">AI Engine</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                      {data.engine_used} ✨
                    </span>
                  </div>
                </div>

                {/* 5 Core Pillars Grid */}
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    5 Core Financial Pillars
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.pillars.map((pillar) => (
                      <div
                        key={pillar.pillar_id}
                        className="p-4 rounded-2xl bg-gray-950/80 border border-gray-800 hover:border-gray-700 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-200">{pillar.title}</span>
                          <span className="text-xs font-black text-white">
                            {pillar.score}/{pillar.max_score}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getPillarColor(pillar.status).split(" ")[0]}`}
                            style={{ width: `${(pillar.score / pillar.max_score) * 100}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="text-gray-400">{pillar.metric_label}</span>
                          <span className={`font-bold ${getPillarColor(pillar.status).split(" ")[1]}`}>
                            {pillar.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed">{pillar.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 50/30/20 Rule Comparison */}
                <div className="p-5 rounded-2xl bg-gray-950/70 border border-gray-800 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-purple-400" />
                      50 / 30 / 20 Standard Rule Benchmark
                    </h3>
                    <span className="text-xs text-gray-400 font-medium">
                      {data.fifty_thirty_twenty.gap_summary}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                      <span className="text-xs text-gray-400 block mb-1">Needs (Ideal 50%)</span>
                      <span className="text-base font-black text-blue-400">
                        {data.fifty_thirty_twenty.needs_percentage}%
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                      <span className="text-xs text-gray-400 block mb-1">Wants (Ideal 30%)</span>
                      <span className="text-base font-black text-pink-400">
                        {data.fifty_thirty_twenty.wants_percentage}%
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                      <span className="text-xs text-gray-400 block mb-1">Savings (Ideal 20%)</span>
                      <span className="text-base font-black text-emerald-400">
                        {data.fifty_thirty_twenty.savings_percentage}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Risk Factors & Prioritized Action Plan */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Risks */}
                  <div className="p-5 rounded-2xl bg-gray-950/70 border border-gray-800 space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Detected Financial Vulnerabilities
                    </h3>
                    <div className="space-y-2.5">
                      {data.risk_factors.map((risk, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-gray-900/90 border border-gray-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-200">{risk.title}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-500/15 text-rose-300">
                              {risk.severity}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{risk.description}</p>
                          <p className="text-xs text-emerald-400/90 font-medium">
                            💡 Fix: {risk.suggested_action}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prioritized Action Plan */}
                  <div className="p-5 rounded-2xl bg-gray-950/70 border border-gray-800 space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Prioritized Action Roadmap
                    </h3>
                    <div className="space-y-2.5">
                      {data.action_plan.map((act) => (
                        <div key={act.priority} className="p-3 rounded-xl bg-gray-900/90 border border-gray-800 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-emerald-500 text-gray-950 text-[10px] font-black inline-flex items-center justify-center">
                                {act.priority}
                              </span>
                              {act.title}
                            </span>
                            <span className="text-xs font-bold text-emerald-400">
                              +₹{Number(act.estimated_monthly_inr_impact).toLocaleString()}/mo
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{act.description}</p>
                        </div>
                      ))}
                    </div>
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
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
