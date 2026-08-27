"use client";

import React from "react";
import { BudgetStatus as BudgetStatusType } from "@/types/budget";
import { AlertTriangle, CheckCircle2, ShieldAlert, Target } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface Props {
  status?: BudgetStatusType | null;
  loading: boolean;
  onOpenBudgetModal: () => void;
}

export default function BudgetStatus({ status, loading, onOpenBudgetModal }: Props) {
  if (loading) {
    return <div className="h-32 glass-panel rounded-2xl animate-pulse mb-6" />;
  }

  if (!status || !status.amount_limit || status.amount_limit <= 0) {
    return (
      <div className="glass-panel p-5 rounded-2xl border border-gray-800 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">No Active Budget Goal</h4>
            <p className="text-xs text-gray-400">Set a monthly budget to track live spending limits.</p>
          </div>
        </div>
        <button
          onClick={onOpenBudgetModal}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-glow transition-all"
        >
          Set Goal
        </button>
      </div>
    );
  }

  const pct = Math.min(status.percentage_used || 0, 100);
  const statusConfig = {
    on_track: {
      label: "On Track",
      color: "bg-emerald-500 text-emerald-400 border-emerald-500/30",
      barColor: "bg-gradient-to-r from-emerald-500 to-teal-400",
      icon: CheckCircle2,
    },
    near_limit: {
      label: "Near Limit (≥80%)",
      color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      barColor: "bg-gradient-to-r from-amber-500 to-yellow-400",
      icon: AlertTriangle,
    },
    over_budget: {
      label: "Over Budget (≥100%)",
      color: "bg-red-500/15 text-red-400 border-red-500/30",
      barColor: "bg-gradient-to-r from-red-600 to-rose-500",
      icon: ShieldAlert,
    },
  };

  const currentStatus = statusConfig[status.status] || statusConfig.on_track;
  const StatusIcon = currentStatus.icon;

  const totalSpent = status.total_spent ?? 0;
  const amountLimit = status.amount_limit ?? 0;
  const remaining = status.remaining ?? 0;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-gray-800 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${currentStatus.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{currentStatus.label}</span>
          </div>
          <span className="text-xs text-gray-400">({status.period} limit)</span>
        </div>
        <button
          onClick={onOpenBudgetModal}
          className="text-xs font-medium text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
        >
          Edit Limit
        </button>
      </div>

      {/* Amounts */}
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <span className="text-xs text-gray-400">Spent: </span>
          <span className="text-sm font-bold text-white">₹{formatCurrency(totalSpent, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          <span className="text-xs text-gray-500"> / ₹{formatCurrency(amountLimit, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
        </div>
        <div>
          <span className="text-xs text-gray-400">Remaining: </span>
          <span className={`text-sm font-bold ${remaining < 0 ? "text-red-400" : "text-emerald-400"}`}>
            ₹{formatCurrency(remaining, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-surface rounded-full overflow-hidden p-0.5 border border-gray-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full rounded-full ${currentStatus.barColor}`}
        />
      </div>
    </div>
  );
}
