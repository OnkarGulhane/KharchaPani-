"use client";

import React from "react";
import { PeriodType } from "@/types/dashboard";
import { Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  period: PeriodType;
  onChange: (period: PeriodType) => void;
}

export default function ReportPeriodSelector({ period, onChange }: Props) {
  const options: { type: PeriodType; label: string; icon: React.ElementType }[] = [
    { type: "day", label: "Today", icon: Calendar },
    { type: "week", label: "This Week", icon: CalendarDays },
    { type: "month", label: "This Month", icon: CalendarRange },
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-900/90 p-1 rounded-xl border border-gray-800 shadow-sm self-start md:self-auto">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = period === opt.type;
        return (
          <button
            key={opt.type}
            onClick={() => onChange(opt.type)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isActive ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activePeriodPill"
                className="absolute inset-0 bg-emerald-500 rounded-lg shadow-md shadow-emerald-500/20"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
              />
            )}
            <Icon className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
