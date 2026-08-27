"use client";

import React from "react";
import { BudgetStatus as BudgetStatusType } from "@/types/budget";
import { AlertTriangle, CheckCircle2, ShieldAlert, Target, ArrowUpRight } from "lucide-react";
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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="glass-panel p-5 rounded-2xl border border-gray-800/90 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden group"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300 shadow-inner">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">No Active Budget Goal</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Set your monthly spending target to enable live financial health tracking.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenBudgetModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <span>Set Target Goal</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    );
  }

  const pct = Math.min(status.percentage_used || 0, 100);
  const statusConfig = {
    on_track: {
      label: "On Track",
      badgeStyle: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      barColor: "from-emerald-500 to-teal-400",
      glowColor: "shadow-emerald-500/20",
      icon: CheckCircle2,
    },
    near_limit: {
      label: "Near Limit (≥80%)",
      badgeStyle: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      barColor: "from-amber-500 to-yellow-400",
      glowColor: "shadow-amber-500/20",
      icon: AlertTriangle,
    },
    over_budget: {
      label: "Over Budget (≥100%)",
      badgeStyle: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      barColor: "from-rose-600 to-red-500",
      glowColor: "shadow-rose-500/20",
      icon: ShieldAlert,
    },
  };

  const currentStatus = statusConfig[status.status] || statusConfig.on_track;
  const StatusIcon = currentStatus.icon;

  const totalSpent = status.total_spent ?? 0;
  const amountLimit = status.amount_limit ?? 0;
  const remaining = status.remaining ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-panel p-5 rounded-2xl border border-gray-800/90 mb-6 shadow-xl relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentStatus.badgeStyle} shadow-sm`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{currentStatus.label}</span>
          </div>
          <span className="text-xs text-gray-400 font-medium capitalize">
            ({status.period} Budget Limit)
          </span>
        </div>
        <button
          onClick={onOpenBudgetModal}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors self-start sm:self-auto"
        >
          Edit Budget Goal →
        </button>
      </div>

      {/* Amounts Overview */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2.5">
        <div>
          <span className="text-xs text-gray-400">Total Spent: </span>
          <span className="text-base font-extrabold text-white">
            ₹{formatCurrency(totalSpent, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
          <span className="text-xs text-gray-500">
            {" "}
            / ₹{formatCurrency(amountLimit, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ({status.percentage_used || 0}%)
          </span>
        </div>
        <div>
          <span className="text-xs text-gray-400">Remaining Balance: </span>
          <span className={`text-base font-extrabold ${remaining < 0 ? "text-rose-400" : "text-emerald-400"}`}>
            ₹{formatCurrency(remaining, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Animated Dynamic Progress Gauge */}
      <div className="w-full h-3.5 bg-gray-900/90 rounded-full overflow-hidden p-0.5 border border-gray-800 shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${currentStatus.barColor} shadow-md`}
        />
      </div>
    </motion.div>
  );
}
