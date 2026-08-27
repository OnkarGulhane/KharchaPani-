"use client";

import React, { useState } from "react";
import { BudgetStatus } from "@/types/budget";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { ShieldAlert, AlertTriangle, ArrowRight, X, Sparkles, BellRing } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThreeDTiltCard from "@/components/ui/ThreeDTiltCard";

interface Props {
  budgetStatus?: BudgetStatus | null;
  onOpenBudgetModal: () => void;
}

export default function BudgetAlertBanner({ budgetStatus, onOpenBudgetModal }: Props) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { formatAmount } = useCurrency();

  if (!budgetStatus || !budgetStatus.amount_limit || budgetStatus.amount_limit <= 0 || isDismissed) {
    return null;
  }

  const isOverBudget =
    budgetStatus.status === "over_budget" || (budgetStatus.percentage_used && budgetStatus.percentage_used >= 100);
  const isNearLimit =
    budgetStatus.status === "near_limit" ||
    (budgetStatus.percentage_used && budgetStatus.percentage_used >= 80 && budgetStatus.percentage_used < 100);

  if (!isOverBudget && !isNearLimit) {
    return null;
  }

  const overAmount = Math.max(0, (budgetStatus.total_spent || 0) - (budgetStatus.amount_limit || 0));

  return (
    <AnimatePresence>
      <ThreeDTiltCard intensity={6} glareOpacity={0.2} className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className={`relative p-5 rounded-3xl border overflow-hidden shadow-2xl ${
            isOverBudget
              ? "bg-gradient-to-r from-rose-950/80 via-red-900/50 to-gray-900/90 border-rose-500/50 shadow-[0_15px_40px_rgba(244,63,94,0.25)]"
              : "bg-gradient-to-r from-amber-950/80 via-yellow-900/40 to-gray-900/90 border-amber-500/50 shadow-[0_15px_40px_rgba(245,158,11,0.25)]"
          }`}
        >
          {/* Animated Ambient Pulsing Glow */}
          <motion.div
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
              isOverBudget ? "bg-rose-500/25" : "bg-amber-500/25"
            }`}
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5">
              <div
                className={`p-3 rounded-2xl border flex-shrink-0 shadow-lg ${
                  isOverBudget
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                }`}
              >
                {isOverBudget ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-rose-400" />
                    <span>
                      {isOverBudget
                        ? "⚠️ Critical Alert: Budget Limit Exceeded!"
                        : "⚠️ Caution: Approaching Budget Limit!"}
                    </span>
                  </h4>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                      isOverBudget
                        ? "bg-rose-500/30 text-rose-200 border-rose-400/50"
                        : "bg-amber-500/30 text-amber-200 border-amber-400/50"
                    }`}
                  >
                    {budgetStatus.percentage_used}% Used
                  </span>
                </div>

                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  {isOverBudget ? (
                    <>
                      You have exceeded your {budgetStatus.period} budget of{" "}
                      <span className="font-bold text-white font-mono">
                        {formatAmount(budgetStatus.amount_limit)}
                      </span>{" "}
                      by{" "}
                      <span className="font-extrabold text-rose-300 font-mono">
                        {formatAmount(overAmount)}
                      </span>
                      . (Total Spent:{" "}
                      <span className="font-bold text-white font-mono">
                        {formatAmount(budgetStatus.total_spent)}
                      </span>
                      )
                    </>
                  ) : (
                    <>
                      You have reached{" "}
                      <span className="font-bold text-amber-300">{budgetStatus.percentage_used}%</span>{" "}
                      of your {budgetStatus.period} spending limit (
                      <span className="font-bold text-white font-mono">
                        {formatAmount(budgetStatus.total_spent)}
                      </span>{" "}
                      / {formatAmount(budgetStatus.amount_limit)}).
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 self-start md:self-auto flex-shrink-0">
              <button
                onClick={onOpenBudgetModal}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold text-white shadow-lg active:scale-95 transition-all ${
                  isOverBudget
                    ? "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-600/30"
                    : "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 shadow-amber-600/30"
                }`}
              >
                <span>Adjust Budget</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsDismissed(true)}
                className="p-2 rounded-xl bg-gray-900/60 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-700/60 transition-colors"
                title="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </ThreeDTiltCard>
    </AnimatePresence>
  );
}
