"use client";

import React from "react";
import { PeriodType } from "@/types/dashboard";
import { Calendar, CalendarDays, CalendarRange } from "lucide-react";

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
    <div className="flex items-center gap-1 bg-surface p-1.5 rounded-xl border border-gray-800 self-start md:self-auto">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = period === opt.type;
        return (
          <button
            key={opt.type}
            onClick={() => onChange(opt.type)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              isActive
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
