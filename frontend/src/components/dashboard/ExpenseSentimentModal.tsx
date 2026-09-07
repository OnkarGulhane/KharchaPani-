"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getExpenseSentiment } from "@/lib/api/ai";
import { ExpenseSentimentResponse } from "@/types/ai";
import {
  X,
  Sparkles,
  Brain,
  Smile,
  Frown,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Flame,
  Activity,
  Heart,
  Clock,
  Zap,
  TrendingDown,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ExpenseSentimentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExpenseSentimentModal({ isOpen, onClose }: ExpenseSentimentModalProps) {
  const [days, setDays] = useState<number>(30);

  const { data, isLoading, error, refetch } = useQuery<ExpenseSentimentResponse>({
    queryKey: ["expense-sentiment", days],
    queryFn: () => getExpenseSentiment(days),
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const getRemorseBadge = (risk: string) => {
    const lower = risk.toLowerCase();
    if (lower.includes("high") || lower.includes("🔴")) {
      return "bg-rose-500/20 text-rose-300 border-rose-500/30";
    }
    if (lower.includes("med") || lower.includes("🟡")) {
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    }
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  };

  const getEmotionTagBadge = (tag: string) => {
    const lower = tag.toLowerCase();
    if (lower.includes("craving") || lower.includes("impulse") || lower.includes("food") || lower.includes("pizza")) {
      return "bg-orange-500/20 text-orange-300 border-orange-500/30";
    }
    if (lower.includes("stress") || lower.includes("retail") || lower.includes("shopping")) {
      return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    }
    if (lower.includes("social") || lower.includes("fomo") || lower.includes("party") || lower.includes("beer")) {
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
    if (lower.includes("celebrat") || lower.includes("treat") || lower.includes("gift")) {
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    }
    if (lower.includes("mindful") || lower.includes("value") || lower.includes("health") || lower.includes("wellness")) {
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    }
    return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-gray-900 border border-pink-500/30 rounded-3xl shadow-2xl shadow-pink-500/10 overflow-hidden text-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800 bg-gradient-to-r from-gray-900 via-pink-950/20 to-gray-900">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-pink-500/20 border border-pink-500/30 shadow-inner">
                <Brain className="w-6 h-6 text-pink-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                    Expense Sentiment & Emotional Spending 🧠
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    Psychology AI ✨
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Understand emotional triggers, retail therapy impulses, and buyer remorse patterns 🛍️
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
            {/* Days Filter Pills */}
            <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-gray-950/70 border border-gray-800 rounded-2xl">
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-pink-400" />
                Analysis Horizon:
              </span>
              <div className="flex items-center gap-2">
                {[14, 30, 60, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      days === d
                        ? "bg-pink-500 text-white shadow-md shadow-pink-500/20"
                        : "bg-gray-900 text-gray-400 hover:text-white"
                    }`}
                  >
                    Last {d} Days
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
                <p className="text-sm font-semibold text-gray-400 animate-pulse">
                  Analyzing emotional triggers and spending psychology... 🧠💭
                </p>
              </div>
            ) : error ? (
              <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                <p className="text-sm text-rose-300 mb-3">Failed to analyze expense sentiment.</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl"
                >
                  Retry 🔄
                </button>
              </div>
            ) : data ? (
              <>
                {/* Hero Sentiment Gauge Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-950 via-gray-900 to-pink-950/30 border border-pink-500/30 space-y-2 shadow-lg">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-pink-400" />
                      Net Spending Sentiment 💖
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-white">
                        {data.sentiment_label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300">
                      Primary Motivation: <span className="font-bold text-pink-300">{data.dominant_spending_emotion}</span>
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950/30 border border-orange-500/30 space-y-2 shadow-lg">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-400" />
                      Impulse Buy Index 🔥
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">
                        {data.impulse_buy_index}%
                      </span>
                      <span className="text-xs text-gray-400">of discretionary transactions</span>
                    </div>
                    <p className="text-xs text-gray-300">
                      {data.impulse_buy_index > 30
                        ? "⚠️ High emotional impulse spending detected"
                        : "✨ Healthy mindful spending control"}
                    </p>
                  </div>
                </div>

                {/* Emotion Distribution Chips */}
                <div className="p-5 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-pink-400" />
                    Emotional Driver Breakdown 📊
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
                    <div className="p-3 rounded-xl bg-gray-900 border border-gray-800/80 hover:border-emerald-500/30 transition-all">
                      <span className="text-xs font-semibold text-gray-300 block mb-1">🌱 Mindful</span>
                      <span className="text-base font-black text-emerald-400">{data.emotion_distribution.mindful_value_pct}%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-900 border border-gray-800/80 hover:border-purple-500/30 transition-all">
                      <span className="text-xs font-semibold text-gray-300 block mb-1">🛍️ Stress</span>
                      <span className="text-base font-black text-purple-400">{data.emotion_distribution.stress_relief_pct}%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-900 border border-gray-800/80 hover:border-blue-500/30 transition-all">
                      <span className="text-xs font-semibold text-gray-300 block mb-1">🍻 Social/FOMO</span>
                      <span className="text-base font-black text-blue-400">{data.emotion_distribution.social_fomo_pct}%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-900 border border-gray-800/80 hover:border-orange-500/30 transition-all">
                      <span className="text-xs font-semibold text-gray-300 block mb-1">🍕 Impulse</span>
                      <span className="text-base font-black text-orange-400">{data.emotion_distribution.impulse_craving_pct}%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-900 border border-gray-800/80 hover:border-gray-500/30 transition-all">
                      <span className="text-xs font-semibold text-gray-300 block mb-1">🧾 Essential</span>
                      <span className="text-base font-black text-gray-300">{data.emotion_distribution.essential_neutral_pct}%</span>
                    </div>
                  </div>
                </div>

                {/* Emotional Spending Heatmap Summary Callout */}
                {data.emotional_spending_heatmap_summary && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-gray-950 to-pink-950/40 border border-purple-500/30 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-300">
                        Peak Emotional Spending Window 🌙
                      </h4>
                      <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                        {data.emotional_spending_heatmap_summary}
                      </p>
                    </div>
                  </div>
                )}

                {/* Flagged Emotional Expenses */}
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-300 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    Flagged Emotional Transactions ⚡
                  </h3>
                  <div className="space-y-2">
                    {data.flagged_emotional_expenses.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-gray-950/60 border border-gray-800 text-center">
                        <p className="text-xs text-emerald-400 font-semibold">
                          🎉 No high-remorse emotional expenses flagged in this period! Keep it up!
                        </p>
                      </div>
                    ) : (
                      data.flagged_emotional_expenses.map((exp, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-gray-950/80 border border-gray-800 hover:border-gray-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-white">{exp.expense_title}</span>
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase border ${getEmotionTagBadge(exp.emotion_tag)}`}>
                                {exp.emotion_tag}
                              </span>
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getRemorseBadge(exp.regret_risk)}`}>
                                Remorse: {exp.regret_risk}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">
                              🎯 Trigger: <span className="text-gray-300">{exp.mood_trigger}</span>
                            </p>
                          </div>

                          <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                            <span className="text-sm font-black text-white">
                              ₹{Number(exp.amount).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-gray-500">📅 {exp.date}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Behavioral CBT Nudges */}
                <div className="p-5 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-pink-400 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-pink-400" />
                    Behavioral Psychology Nudges & Hacks 💡
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.behavioral_nudges.map((nudge, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-gray-900/90 border border-gray-800/90 space-y-2 shadow-inner">
                        <span className="text-xs font-bold text-pink-300 block">{nudge.nudge_title}</span>
                        <p className="text-xs text-gray-300 font-medium leading-relaxed">
                          💡 <span className="text-pink-200/90 font-semibold">Hack:</span> {nudge.actionable_hack.replace(/^💡\s*/, "")}
                        </p>
                        <p className="text-[11px] text-gray-400 italic leading-relaxed">
                          🧠 <span className="text-gray-300 font-semibold">Science:</span> {nudge.psychology_insight.replace(/^🧠\s*/, "")}
                        </p>
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
              Close ✖️
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

