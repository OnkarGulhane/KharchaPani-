"use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAIRecommendations } from "@/lib/api/ai";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  Trophy,
  RefreshCw,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  Bot,
  PiggyBank,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AIInsightsCard() {
  const queryClient = useQueryClient();
  const { formatAmount } = useCurrency();

  const {
    data: insights,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["ai-recommendations"],
    queryFn: getAIRecommendations,
    staleTime: 120000, // 2 minutes
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("AI Financial Insights refreshed! ✨");
    } catch {
      toast.error("Failed to refresh AI insights");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 70) return "text-teal-400 border-teal-500/30 bg-teal-500/10";
    if (score >= 50) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case "opportunity":
        return <Lightbulb className="w-4 h-4 text-indigo-400" />;
      case "achievement":
        return <Trophy className="w-4 h-4 text-amber-400" />;
      default:
        return <Target className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "warning":
        return "bg-rose-500/15 text-rose-300 border-rose-500/25";
      case "opportunity":
        return "bg-indigo-500/15 text-indigo-300 border-indigo-500/25";
      case "achievement":
        return "bg-amber-500/15 text-amber-300 border-amber-500/25";
      default:
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/25";
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl p-5 bg-[#0f172a]/90 border border-slate-800 shadow-xl backdrop-blur-md animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 bg-slate-800 rounded-md" />
          <div className="h-4 w-20 bg-slate-800 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="h-20 bg-slate-800/60 rounded-xl" />
          <div className="h-20 bg-slate-800/60 rounded-xl" />
          <div className="h-20 bg-slate-800/60 rounded-xl" />
        </div>
        <div className="h-24 bg-slate-800/40 rounded-xl" />
      </div>
    );
  }

  if (!insights) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl p-5 md:p-6 bg-gradient-to-br from-[#0f172a] via-[#111c35] to-[#0b1329] border border-indigo-500/25 shadow-2xl backdrop-blur-md space-y-5"
    >
      {/* Ambient Top Glow */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-extrabold text-white flex items-center gap-2">
              Kharcha AI Insights & Advice
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-amber-300" />
                {insights.engine_used === "gemini" ? "Gemini 1.5 Flash" : "Smart Local Engine"}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Personalized intelligence based on your real spending habits
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefetching}
          className={`self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-semibold shadow-sm transition active:scale-95 ${
            isRefetching ? "opacity-75 cursor-wait" : ""
          }`}
          title="Recalculate AI Recommendations"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefetching ? "animate-spin" : ""}`} />
          <span>{isRefetching ? "Analyzing..." : "Refresh Insights"}</span>
        </button>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
        {/* 1. Health Score */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Financial Health Score</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-white">{insights.financial_health_score}</span>
              <span className="text-xs font-semibold text-slate-500">/ 100</span>
            </div>
          </div>
          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getScoreColor(insights.financial_health_score)}`}>
            {insights.health_status}
          </span>
        </div>

        {/* 2. Month-End Forecast */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Projected Month-End Spend</p>
            <p className="text-lg font-black text-indigo-300 mt-0.5">
              {formatAmount(insights.projected_month_end_spend)}
            </p>
          </div>
          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
            insights.budget_status_warning === "On Track"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
              : insights.budget_status_warning === "Near Limit"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
              : "bg-rose-500/10 text-rose-400 border-rose-500/25"
          }`}>
            {insights.budget_status_warning}
          </span>
        </div>

        {/* 3. Potential Monthly Savings */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Potential Monthly Savings</p>
            <p className="text-lg font-black text-emerald-400 mt-0.5">
              {formatAmount(insights.total_potential_savings)}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Summary Narrative */}
      {insights.summary_text && (
        <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs sm:text-sm text-slate-200 leading-relaxed relative z-10 flex items-start gap-2.5">
          <Bot className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>{insights.summary_text}</span>
        </div>
      )}

      {/* Actionable Recommendations Grid */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <div className="space-y-2.5 relative z-10">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>Actionable Savings & Optimization Tips</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {insights.recommendations.map((rec, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 transition space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(rec.type)}
                    <h3 className="text-xs font-bold text-white line-clamp-1">{rec.title}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider shrink-0 ${getTypeBadge(rec.type)}`}>
                    {rec.category}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-normal">{rec.description}</p>

                {rec.estimated_monthly_saving && rec.estimated_monthly_saving > 0 && (
                  <div className="pt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Est. Saving: +{formatAmount(rec.estimated_monthly_saving)} / mo</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
