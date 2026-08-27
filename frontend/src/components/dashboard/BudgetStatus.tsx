"use client";

import React from "react";
import { BudgetStatus as BudgetStatusType } from "@/types/budget";
import { AlertTriangle, CheckCircle2, ShieldAlert, Target, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import ThreeDTiltCard from "@/components/ui/ThreeDTiltCard";

interface Props {
  status?: BudgetStatusType | null;
  loading: boolean;
  onOpenBudgetModal: () => void;
}

export default function BudgetStatus({ status, loading, onOpenBudgetModal }: Props) {
  const { formatAmount } = useCurrency();

  if (loading) {
    return <div className="h-32 glass-panel rounded-2xl animate-pulse mb-6" />;
  }

  if (!status || !status.amount_limit || status.amount_limit <= 0) {
    return (
      <ThreeDTiltCard intensity={8} glareOpacity={0.15} className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-5 rounded-2xl border border-gray-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <span>No Active Budget Goal</span>
                <span className="text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Recommended
                </span>
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Set your spending target to unlock live visual health meters and budget warnings.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenBudgetModal}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
          >
            <span>Set Target Goal</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </motion.div>
      </ThreeDTiltCard>
    );
  }

  const pct = Math.min(status.percentage_used || 0, 100);
  const statusConfig = {
    on_track: {
      label: "On Track",
      badgeStyle: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]",
      barColor: "from-emerald-500 via-teal-400 to-emerald-400",
      glowColor: "shadow-emerald-500/30",
      icon: CheckCircle2,
    },
    near_limit: {
      label: "Near Limit (≥80%)",
      badgeStyle: "bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]",
      barColor: "from-amber-500 via-yellow-400 to-amber-400",
      glowColor: "shadow-amber-500/30",
      icon: AlertTriangle,
    },
    over_budget: {
      label: "Over Budget (≥100%)",
      badgeStyle: "bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]",
      barColor: "from-rose-600 via-red-500 to-rose-500",
      glowColor: "shadow-rose-500/30",
      icon: ShieldAlert,
    },
  };

  const currentStatus = statusConfig[status.status] || statusConfig.on_track;
  const StatusIcon = currentStatus.icon;

  const totalSpent = status.total_spent ?? 0;
  const amountLimit = status.amount_limit ?? 0;
  const remaining = status.remaining ?? 0;

  return (
    <ThreeDTiltCard intensity={6} glareOpacity={0.15} className="mb-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-panel p-5 rounded-2xl border border-gray-800/90 shadow-2xl relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${currentStatus.badgeStyle}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{currentStatus.label}</span>
            </div>
            <span className="text-xs text-gray-400 font-medium capitalize">
              ({status.period} Budget Cap)
            </span>
          </div>
          <button
            onClick={onOpenBudgetModal}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors self-start sm:self-auto flex items-center gap-1 group"
          >
            <span>Edit Budget Goal</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </button>
        </div>

        {/* Amounts Overview */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-3">
          <div>
            <span className="text-xs text-gray-400">Total Spent: </span>
            <span className="text-base font-extrabold text-white font-mono">
              {formatAmount(totalSpent, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              {" "}
              / {formatAmount(amountLimit, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ({status.percentage_used || 0}%)
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400">Remaining Balance: </span>
            <span className={`text-base font-extrabold font-mono ${remaining < 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {formatAmount(remaining, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* 3D Animated Dynamic Progress Gauge Track */}
        <div className="w-full h-4 bg-gray-950/90 rounded-full overflow-hidden p-0.5 border border-gray-800 shadow-inner relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className={`h-full rounded-full bg-gradient-to-r ${currentStatus.barColor} shadow-md relative`}
          >
            {/* Glossy top reflection */}
            <div className="absolute inset-x-0 top-0 h-[40%] bg-white/20 rounded-full" />
          </motion.div>
        </div>
      </motion.div>
    </ThreeDTiltCard>
  );
}
